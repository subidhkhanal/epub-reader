/** @format */

import React, { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition, NavItem, Location, Contents } from "epubjs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";
import {
  saveUserData,
  loadUserData,
  saveHighlight,
  loadHighlights,
  saveBookmark,
  loadBookmarks,
} from "../utils/firebaseFunctions";

interface EpubReaderProps {
  fileUrl: string; // The URL to the EPUB file
}

const EpubReader: React.FC<EpubReaderProps> = ({ fileUrl }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [user] = useAuthState(auth);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedCFIRange, setSelectedCFIRange] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{ cfi: string; excerpt: string }>
  >([]);

  const bookId = fileUrl.split("/").pop(); // Extract the file name from the URL to use as the book ID

  useEffect(() => {
    if (fileUrl && viewerRef.current && user) {
      const loadBook = async () => {
        try {
          const loadedBook = ePub(fileUrl);
          const userData = await loadUserData(user.uid, bookId);
          const userBookmarks = await loadBookmarks(user.uid, bookId);
          const highlights = await loadHighlights(user.uid, bookId);

          //@ts-ignore
          const loadedRendition = loadedBook.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: "scrolled",
          });

          setRendition(loadedRendition);

          if (userData?.location) {
            await loadedRendition.display(userData.location);
          } else {
            await loadedRendition.display();
          }

          setBook(loadedBook);
          setBookmarks(userBookmarks);

          const nav = await loadedBook.loaded.navigation;
          setToc(nav.toc);

          // Apply existing highlights
          highlights?.forEach((highlight: any) => {
            loadedRendition.annotations.add(
              "highlight",
              highlight.cfiRange,
              {},
              () => {},
              "highlight",
              { fill: "yellow" }
            );
          });

          // Capture both cfiRange and text during selection
          //@ts-ignore
          loadedRendition.on("selected", (cfiRange, contents) => {
            const text = contents.window.getSelection()?.toString();
            if (cfiRange && text && text.trim()) {
              setHighlightedText(text);
              setSelectedCFIRange(cfiRange);
            } else {
              console.warn("Selection was invalid or empty:", {
                cfiRange,
                text,
              });
              setHighlightedText(null);
              setSelectedCFIRange(null);
            }
          });

          loadedRendition.on("relocated", (location: Location) => {
            const cfi = location.start.cfi;
            saveUserData(user.uid, bookId, { location: cfi });
            setSelectedCFIRange(cfi);
          });
        } catch (error) {
          console.error("Error loading book or user data:", error);
        }
      };

      loadBook();

      return () => {
        if (rendition) {
          rendition.destroy();
        }
      };
    }
  }, [fileUrl, user]);

  // Function to add a bookmark
  const addBookmark = async () => {
    if (selectedCFIRange && user) {
      try {
        await saveBookmark(user.uid, bookId, selectedCFIRange);
        setBookmarks((prev) => [...prev, selectedCFIRange]);
      } catch (error) {
        console.error("Error saving bookmark:", error);
      }
    }
  };

  // Function to go to a bookmark
  const goToBookmark = (cfi: string) => {
    if (rendition) {
      rendition.display(cfi);
    }
  };

  // Function to add a highlight
  const addHighlight = async () => {
    if (highlightedText && selectedCFIRange && user) {
      const highlight = {
        cfiRange: selectedCFIRange,
        text: highlightedText,
        note: note.trim() || "",
      };

      try {
        console.log("Saving highlight:", highlight);
        await saveHighlight(user.uid, bookId, highlight);
        rendition?.annotations.add(
          "highlight",
          selectedCFIRange,
          {},
          () => {},
          "highlight",
          { fill: "yellow" }
        );
        setHighlightedText(null);
        setNote("");
        setSelectedCFIRange(null);
      } catch (error) {
        console.error("Error saving highlight:", error);
      }
    } else {
      console.warn("Invalid highlight data: cfiRange or text is missing");
    }
  };

  // Function to search within the book
  const handleSearch = async () => {
    if (searchTerm && rendition && book) {
      const results: Array<{ cfi: string; excerpt: string }> = [];
      //@ts-ignore

      const spineItems = book.spine.items;

      for (let item of spineItems) {
        // Display the spine item (chapter)
        await rendition.display(item.href);

        // Get the document content
        //@ts-ignore

        const content = rendition.currentLocation().start;
        //@ts-ignore
        const contents = rendition.manager?.views?.[0]?.contents;
        const bodyText = contents?.document?.body?.textContent || "";

        // Search within the content
        const regex = new RegExp(searchTerm, "gi");
        let match;
        while ((match = regex.exec(bodyText)) !== null) {
          //@ts-ignore
          const cfi = rendition.currentLocation().start.cfi;
          const excerpt = bodyText.substring(
            match.index - 30,
            match.index + 70
          );
          results.push({ cfi, excerpt });
        }
      }

      setSearchResults(results);
    }
  };

  const goToSearchResult = (cfi: string) => {
    if (rendition) {
      rendition.display(cfi);
    }
  };

  const goToNextChapter = () => {
    if (rendition && toc.length > 0) {
      const nextIndex = currentChapterIndex + 1;
      if (nextIndex < toc.length) {
        rendition.display(toc[nextIndex].href);
        setCurrentChapterIndex(nextIndex);
      }
    }
  };

  const goToPreviousChapter = () => {
    if (rendition && toc.length > 0) {
      const prevIndex = currentChapterIndex - 1;
      if (prevIndex >= 0) {
        rendition.display(toc[prevIndex].href);
        setCurrentChapterIndex(prevIndex);
      }
    }
  };

  const goToLocation = (href: string, index: number) => {
    if (rendition) {
      rendition.display(href);
      setCurrentChapterIndex(index);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      <div id="toc-container">
        <ul>
          {toc.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => goToLocation(item.href, index)}
                className={currentChapterIndex === index ? "active" : ""}
              >
                {item.label}
              </button>
            </li>
          ))}
          {bookmarks.map((bookmark, index) => (
            <li key={`bookmark-${index}`}>
              <button onClick={() => goToBookmark(bookmark)}>
                Bookmark {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div id="viewer-container" style={{ flex: 1 }}>
        <div id="viewer" ref={viewerRef} />
        <button
          id="prev-chapter"
          className="navigation-button"
          onClick={goToPreviousChapter}
        >
          {"<"}
        </button>
        <button
          id="next-chapter"
          className="navigation-button"
          onClick={goToNextChapter}
        >
          {">"}
        </button>
        <button
          onClick={addBookmark}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Bookmark
        </button>
        <div style={{ position: "absolute", top: "10px", left: "10px" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              marginLeft: "5px",
              padding: "5px 10px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>
        {highlightedText && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              background: "white",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              style={{ width: "200px", height: "100px" }}
            />
            <button onClick={addHighlight} style={{ marginTop: "10px" }}>
              Add Highlight
            </button>
          </div>
        )}
        {searchResults.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              backgroundColor: "#fff",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              maxHeight: "200px",
              overflowY: "scroll",
            }}
          >
            <ul>
              {searchResults.map((result, index) => (
                <li key={index}>
                  <button
                    onClick={() => goToSearchResult(result.cfi)}
                    style={{
                      textAlign: "left",
                      border: "none",
                      backgroundColor: "transparent",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                  >
                    {result.excerpt}...
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpubReader;

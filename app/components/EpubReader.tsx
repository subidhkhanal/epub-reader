/** @format */

import React, { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition, NavItem, Location } from "epubjs";
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
import { useParams } from "next/navigation";

interface EpubReaderProps {
  fileUrl: string; // The URL to the EPUB file
  onChapterChange: (chapter: string) => void; // Callback for chapter change
  onProgressChange: (progress: number) => void; // Callback for progress change
}

const EpubReader: React.FC<EpubReaderProps> = ({
  fileUrl,
  onChapterChange,
  onProgressChange,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const tocContainerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [user] = useAuthState(auth);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedCFIRange, setSelectedCFIRange] = useState<string | null>(null);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    Array<{ cfi: string; excerpt: string }>
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { slug } = useParams();
  const bookId = slug;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tocContainerRef.current &&
        !tocContainerRef.current.contains(event.target as Node) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

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
            flow: "paginated", // Use paginated flow
            spread: "auto", // Enable two-column layout if applicable
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

          const currentLocation = loadedRendition.currentLocation();
          //@ts-ignore

          if (currentLocation && currentLocation.start) {
            //@ts-ignore
            const currentChapterHref = currentLocation.start.href;
            const chapterIndex = nav.toc.findIndex(
              (chapter) => chapter.href === currentChapterHref
            );
            if (chapterIndex !== -1) {
              setCurrentChapterIndex(chapterIndex);
              onChapterChange(nav.toc[chapterIndex]?.label || "Chapter");
            }
          }

          highlights?.forEach((highlight: any) => {
            loadedRendition.annotations.add(
              "highlight",
              highlight.cfiRange,
              {},
              () => {},
              "highlight",
              { fill: highlight.color }
            );
          });
          //@ts-ignore

          loadedRendition.on("selected", (cfiRange, contents) => {
            const text = contents.window.getSelection()?.toString();
            if (cfiRange && text && text.trim()) {
              setHighlightedText(text);
              setSelectedCFIRange(cfiRange);

              const range = contents.window.getSelection()?.getRangeAt(0);
              if (range) {
                const rect = range.getBoundingClientRect();
                setHighlightMenuPosition({
                  top: rect.top + window.scrollY - 50,
                  left: rect.left + window.scrollX,
                });
              }
            } else {
              setHighlightedText(null);
              setSelectedCFIRange(null);
              setHighlightMenuPosition(null);
            }
          });

          loadedRendition.on("relocated", (location: Location) => {
            const cfi = location.start.cfi;
            saveUserData(user.uid, bookId, { location: cfi });
            setSelectedCFIRange(cfi);

            const chapterHref = location.start.href;
            const chapterIndex = toc.findIndex(
              (chapter) => chapter.href === chapterHref
            );
            if (chapterIndex !== -1) {
              setCurrentChapterIndex(chapterIndex);
              onChapterChange(toc[chapterIndex]?.label || "Chapter");
            }

            //@ts-ignore
            // Calculate the reading progress
            const total = loadedBook.locations.total;
            const currentProgress = (location.start.displayed.page + 1) / total;
            onProgressChange(currentProgress * 100);
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

  const goToBookmark = (cfi: string) => {
    if (rendition) {
      rendition.display(cfi);
    }
  };

  const addHighlight = async (color: string) => {
    if (highlightedText && selectedCFIRange && user) {
      const highlight = {
        cfiRange: selectedCFIRange,
        text: highlightedText,
        note: note.trim() || "",
        color: color,
      };

      try {
        await saveHighlight(user.uid, bookId, highlight);
        rendition?.annotations.add(
          "highlight",
          selectedCFIRange,
          {},
          () => {},
          "highlight",
          { fill: color }
        );
        setHighlightedText(null);
        setSelectedCFIRange(null);
        setHighlightMenuPosition(null);
      } catch (error) {
        console.error("Error saving highlight:", error);
      }
    }
  };

  const handleSearch = async () => {
    if (searchTerm && rendition && book) {
      const results: Array<{ cfi: string; excerpt: string }> = [];
      //@ts-ignore

      const spineItems = book.spine.items;

      for (let item of spineItems) {
        await rendition.display(item.href);
        //@ts-ignore

        const contents = rendition.manager?.views?.[0]?.contents;
        const bodyText = contents?.document?.body?.textContent || "";

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

  const goToNextChapter = async () => {
    if (rendition && toc.length > 0) {
      const nextIndex = currentChapterIndex + 1;
      if (nextIndex < toc.length) {
        await rendition.display(toc[nextIndex].href);
        setCurrentChapterIndex(nextIndex);
        onChapterChange(toc[nextIndex]?.label || "Chapter");
      }
    }
  };

  const goToPreviousChapter = async () => {
    if (rendition && toc.length > 0) {
      const prevIndex = currentChapterIndex - 1;
      if (prevIndex >= 0) {
        await rendition.display(toc[prevIndex].href);
        setCurrentChapterIndex(prevIndex);
        onChapterChange(toc[prevIndex]?.label || "Chapter");
      }
    }
  };

  const goToLocation = async (href: string, index: number) => {
    if (rendition) {
      try {
        await rendition.display(href);
        setCurrentChapterIndex(index);
        onChapterChange(toc[index]?.label || "Chapter");
      } catch (error) {
        console.error("Error navigating to chapter:", error);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: "flex", height: "95vh", position: "relative" }}>
      <button
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 998,
          padding: "10px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        TOC
      </button>
      <div
        id="toc-container"
        ref={tocContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: isSidebarOpen ? 0 : "-300px",
          width: "300px",
          height: "100%",
          backgroundColor: "#f4f4f4",
          boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.3)",
          transition: "left 0.3s ease",
          zIndex: 999,
          overflowY: "auto",
        }}
      >
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
        <div className="navigation-button-container">
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
        </div>
        {highlightMenuPosition && (
          <div
            style={{
              position: "absolute",
              top: highlightMenuPosition.top,
              left: highlightMenuPosition.left,
              background: "white",
              padding: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              display: "flex",
              gap: "5px",
              zIndex: 1000,
            }}
          >
            <button
              onClick={() => addHighlight("yellow")}
              style={{
                backgroundColor: "yellow",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => addHighlight("pink")}
              style={{
                backgroundColor: "pink",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => addHighlight("lightgreen")}
              style={{
                backgroundColor: "lightgreen",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => addHighlight("lightblue")}
              style={{
                backgroundColor: "lightblue",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => addHighlight("purple")}
              style={{
                backgroundColor: "purple",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            />
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

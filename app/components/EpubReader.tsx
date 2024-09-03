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

  const goToNextPage = async () => {
    if (rendition) {
      await rendition.next(); // Navigate to the next page
    }
  };

  const goToPreviousPage = async () => {
    if (rendition) {
      await rendition.prev(); // Navigate to the previous page
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
    <div className="flex h-[95vh] relative">
      <div
        id="toc-container"
        ref={tocContainerRef}
        className={`absolute top-0 bg-gray-200 shadow-lg transition-all duration-300 z-[999] overflow-y-auto ${
          isSidebarOpen ? "left-0" : "-left-[300px]"
        }`}
        style={{ width: "300px", height: "100%" }}
      >
        <ul className="list-none p-0 m-0">
          {toc.map((item, index) => (
            <li key={item.id} className="m-0">
              <button
                onClick={() => goToLocation(item.href, index)}
                className={`w-full text-left p-[10px] ${
                  currentChapterIndex === index ? "font-bold bg-gray-300" : ""
                } hover:bg-gray-300 focus:bg-gray-300`}
              >
                {item.label}
              </button>
            </li>
          ))}
          {bookmarks.map((bookmark, index) => (
            <li key={`bookmark-${index}`} className="m-0">
              <button
                onClick={() => goToBookmark(bookmark)}
                className="w-full text-left p-[10px] hover:bg-gray-300 focus:bg-gray-300"
              >
                Bookmark {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 relative flex h-full overflow-hidden">
        <div
          className="w-[50px] flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity duration-300"
          onClick={goToPreviousPage}
        >
          <button className="absolute left-2.5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border-none rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg hover:shadow-xl transition-all duration-300">
            &#10094; {/* Stylized arrow for a modern look */}
          </button>
        </div>

        <div id="viewer" ref={viewerRef} className="flex-1 h-full p-[20px]" />
        <div
          className="w-[50px] flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity duration-300"
          onClick={goToNextPage}
        >
          <button className="absolute right-2.5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border-none rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg hover:shadow-xl transition-all duration-300">
            &#10095; {/* Stylized arrow for a modern look */}
          </button>
        </div>

        {highlightMenuPosition && (
          <div
            className="absolute p-[5px] border border-solid border-gray-300 rounded-[5px] flex gap-[5px] z-[1000]"
            style={{
              backgroundColor: "white",
            }}
          >
            <button
              onClick={() => addHighlight("yellow")}
              className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
              style={{
                backgroundColor: "yellow",
              }}
            />
            <button
              onClick={() => addHighlight("pink")}
              className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
              style={{
                backgroundColor: "pink",
              }}
            />
            <button
              onClick={() => addHighlight("lightgreen")}
              className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
              style={{
                backgroundColor: "lightgreen",
              }}
            />
            <button
              onClick={() => addHighlight("lightblue")}
              className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
              style={{
                backgroundColor: "lightblue",
              }}
            />
            <button
              onClick={() => addHighlight("purple")}
              className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
              style={{
                backgroundColor: "purple",
              }}
            />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="absolute bottom-[10px] left-[10px] bg-white p-[10px] border border-solid border-gray-300 rounded-[5px] max-h-[200px] overflow-y-scroll">
            <ul className="list-none p-0 m-0">
              {searchResults.map((result, index) => (
                <li key={index} className="m-0">
                  <button
                    onClick={() => goToSearchResult(result.cfi)}
                    className="text-left bg-transparent p-[5px] w-full border-none cursor-pointer hover:bg-gray-300"
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

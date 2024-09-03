/** @format */

import React, { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition, Location } from "epubjs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";
import {
  saveUserData,
  loadUserData,
  loadHighlights,
} from "../utils/firebaseFunctions";
import { useParams } from "next/navigation";
import HighlightMenu from "./HighlightMenu"; // Import the HighlightMenu component

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
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [user] = useAuthState(auth);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [selectedCFIRange, setSelectedCFIRange] = useState<string | null>(null);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const { slug } = useParams();
  const bookId = slug;

  useEffect(() => {
    if (fileUrl && viewerRef.current && user) {
      const loadBook = async () => {
        try {
          const loadedBook = ePub(fileUrl);
          const userData = await loadUserData(user.uid, bookId);
          const highlights = await loadHighlights(user.uid, bookId);
          //@ts-ignore
          const loadedRendition = loadedBook.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: "paginated", // Use paginated flow
            spread: "auto", // Enable two-column layout if applicable
          });

          setRendition(loadedRendition);

          // Set the font family, font size, and line spacing here
          loadedRendition.themes.default({
            body: {
              "font-family": "georgia", // Replace with your desired font family
              "font-size": "18px !important", // Adjust font size here
              "line-height": "1.75 !important", // Adjust line spacing here (1.5x to 1.6x the font size)
            },
          });

          if (userData?.location) {
            await loadedRendition.display(userData.location);
          } else {
            await loadedRendition.display();
          }

          setBook(loadedBook);

          const currentLocation = loadedRendition.currentLocation();
          //@ts-ignore

          if (currentLocation && currentLocation.start) {
            //@ts-ignore
            const currentChapterHref = currentLocation.start.href;
            onChapterChange(currentChapterHref || "Chapter");
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

  return (
    <div className="flex h-[95vh] relative">
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
          <HighlightMenu
            position={highlightMenuPosition}
            selectedCFIRange={selectedCFIRange}
            highlightedText={highlightedText}
            //@ts-ignore
            userId={user.uid}
            //@ts-ignore
            bookId={bookId}
            rendition={rendition}
            closeMenu={() => setHighlightMenuPosition(null)} // Close the menu after adding a highlight
          />
        )}
      </div>
    </div>
  );
};

export default EpubReader;

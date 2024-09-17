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
import TOC from "@/app/components/epub/TOC"; // Import the TOC component

interface EpubReaderProps {
  fileUrl: string; // The URL to the EPUB file
  onChapterChange: (chapter: string) => void; // Callback for chapter change
  isTOCVisible: boolean; // State to manage TOC visibility
  // toggleTOC: () => void; // Function to toggle TOC
  setNavbarVisible: (isVisible: boolean) => void; // Function to control Navbar visibility
  isDarkTheme: boolean; // Dark mode toggle
  isNavbarVisible: boolean;
  isnavbarActive: boolean;
  setIsTOCVisible: (isTOCVisible: boolean) => void;
  currentFlow: string;
}

const EpubReader: React.FC<EpubReaderProps> = ({
  fileUrl,
  onChapterChange,
  isDarkTheme,
  isTOCVisible,
  // toggleTOC,
  setNavbarVisible,
  isNavbarVisible,
  isnavbarActive,
  setIsTOCVisible,
  currentFlow,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [user] = useAuthState(auth);
  //@ts-ignore
  const [chapters, setChapters] = useState<TocElement[]>([]); // Chapters from the Table of Contents
  const { slug } = useParams();
  const bookId = slug;
  //@ts-ignore
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false); // New state for highlight menu
  const [currentChapterHref, setCurrentChapterHref] = useState<string | null>(
    null
  );
  // Ref to store the latest value of isTOCVisible
  const isTOCVisibleRef = useRef(isTOCVisible);
  const isHighlightMenuOpenRef = useRef(isTOCVisible);

  useEffect(() => {
    // Destroy the existing rendition before reinitializing
    if (rendition) {
      rendition.destroy();
    }

    if (fileUrl && viewerRef.current && user) {
      const loadBook = async () => {
        try {
          const loadedBook = ePub(fileUrl);
          const userData = await loadUserData(user.uid, bookId);
          const highlights = await loadHighlights(user.uid, bookId);

          // Clear the previous content
          if (viewerRef.current) {
            viewerRef.current.innerHTML = "";
          }

          //@ts-ignore
          const loadedRendition = loadedBook.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: currentFlow, // flow determined through the navbar button
            spread: "auto", // Enable two-column layout if applicable
          });

          setRendition(loadedRendition);

          // Set the font family, font size, and line spacing here
          loadedRendition.themes.default({
            body: {
              "font-family": "Georgia, serif", // Continue with Georgia for a comfortable reading experience
              "font-size": "18px !important", // Keep font size
              "line-height": "1.75 !important", // Keep line-height for readability
              "background-color": isDarkTheme ? "#1c1c28" : "#f4f4f9", // Softer dark mode background
              color: isDarkTheme ? "#d1d5db" : "#333333", // Softer text color for dark mode
              padding: "20px", // Add padding for comfortable spacing
            },
            ".epub-container": {
              "overflow-x": "hidden", // Hide horizontal overflow for the body element
            },
          });

          if (userData?.location) {
            await loadedRendition.display(userData.location);
          } else {
            await loadedRendition.display();
          }

          setBook(loadedBook);

          // Load Table of Contents (TOC)
          const toc = await loadedBook.loaded.navigation;
          setChapters(toc.toc);

          const currentLocation = loadedRendition.currentLocation();
          //@ts-ignore

          if (currentLocation && currentLocation.start) {
            //@ts-ignore
            const currentChapterHref = currentLocation.start.href;
            onChapterChange(currentChapterHref || "Chapter");
          }

          // Handle user highlights
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

          loadedRendition.on("relocated", (location: Location) => {
            const cfi = location.start.cfi;
            saveUserData(user.uid, bookId, { location: cfi });

            // Set current chapter href based on the current location
            const currentChapterHref = location.start.href;
            setCurrentChapterHref(currentChapterHref); // Track the current chapter
            onChapterChange(currentChapterHref || "Chapter");
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
  }, [fileUrl, user, isDarkTheme, currentFlow]);

  // This function will manage when the Navbar is shown/hidden
  const toggleNavbarVisibility = () => {
    //@ts-ignore
    setNavbarVisible((prevState) => !prevState); // Show the Navbar
  };

  // Move to the selected chapter
  const handleChapterSelect = (chapterHref: string) => {
    if (rendition) {
      rendition.display(chapterHref);
      onChapterChange(chapterHref);
    }
  };

  // Handle text selection
  const handleSelection = () => {
    setIsTextSelected(true); // Flag that text is selected
    setIsHighlightMenuOpen(true); // Open the highlight menu
  };

  // Keep the ref updated with the latest isTOCVisible state value
  useEffect(() => {
    isTOCVisibleRef.current = isTOCVisible;
  }, [isTOCVisible]);

  // Keep the ref updated with the latest isHighlightMenuOpen state value
  useEffect(() => {
    isHighlightMenuOpenRef.current = isHighlightMenuOpen;
  }, [isHighlightMenuOpen]);

  // Handle arrow key, mouse wheel events and navbar visibility for navigation inside the iframe using ePub.js events
  useEffect(() => {
    if (rendition) {
      //Handles arrow keys
      rendition.on("keyup", (event: KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === " ") {
          goToNextPage();
        } else if (event.key === "ArrowLeft") {
          goToPreviousPage();
        }
      });

      //Give page change when wheels changes from the mouse if flow is paginated
      if (currentFlow === "paginated") {
        rendition.on("rendered", () => {
          // Get the content from the currently rendered section
          const contents = rendition.getContents();

          //@ts-ignore
          if (contents && contents.length > 0) {
            //@ts-ignore
            const iframeDocument = contents[0].document; // Get the document from the first content item

            iframeDocument.addEventListener("wheel", (event: WheelEvent) => {
              if (event.deltaY > 0) {
                goToNextPage();
              } else if (event.deltaY < 0) {
                goToPreviousPage();
              }
            });
          }
        });
      }

      // Attach rendition event listeners for selection and mouse clicks
      rendition.on("selected", handleSelection);
      let isMouseDown = false;
      let mouseDownTarget: EventTarget | null = null;
      let mouseMoved = false;
      rendition.on("mousedown", (event: MouseEvent) => {
        isMouseDown = true;
        mouseDownTarget = event.target; // Store the element where mousedown happened
        mouseMoved = false; // Reset mouseMoved to false
      });

      rendition.on("mousemove", (event: MouseEvent) => {
        mouseMoved = true; // Set mouseMoved to true if the mouse moves
      });

      rendition.on("mouseup", (event: MouseEvent) => {
        // Check if the mouse was pressed and released on the same element, and no dragging occurred
        if (isMouseDown && event.target === mouseDownTarget && !mouseMoved) {
          // console.log("navbar");
          if (!isTOCVisibleRef.current && !isHighlightMenuOpenRef.current) {
            // console.log("navbar inside");
            //@ts-ignore
            setNavbarVisible((prevState) => !prevState); // Invert the current navbar visibility
            // console.log("inside if", isTOCVisible);
          } else {
            setIsTOCVisible(false);
          }
        }
        isMouseDown = false; // Reset the state after mouseup
        mouseDownTarget = null; // Reset the target
      });
      // Cleanup event listeners on unmount
      return () => {
        rendition.off("keyup", KeyboardEvent);
        rendition.off("selected", handleSelection);
        rendition.off("mousedown", MouseEvent);
        rendition.off("mousemove", MouseEvent);
        rendition.off("mouseup", MouseEvent);
      };
    }
  }, [rendition, isHighlightMenuOpen]);

  // Handle key press events which happen between iframe(epub.js) and arrow ui
  useEffect(() => {
    if (!isnavbarActive) {
      const handleKeys = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === " ") {
          goToNextPage();
        }
        if (event.key === "ArrowLeft") {
          goToPreviousPage();
        }
      };

      // Attach the event listener
      document.addEventListener("keydown", handleKeys);

      // Cleanup function to remove the event listener
      return () => {
        document.removeEventListener("keydown", handleKeys);
      };
    }
  });

  // Handle mouse wheel events which happen between iframe(epub.js) and arrow ui if flow is paginated
  useEffect(() => {
    if (currentFlow === "paginated") {
      const handleWheels = (event: WheelEvent) => {
        if (event.deltaY < 0) {
          goToNextPage();
        }
        if (event.deltaY > 0) {
          goToPreviousPage();
        }
      };
      document.addEventListener("wheel", handleWheels);

      // Cleanup function to remove the event listener
      return () => {
        document.removeEventListener("wheel", handleWheels);
      };
    }
  });

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
    <div
      className={`flex h-[95vh] relative transition-colors duration-300 ${
        isDarkTheme ? "bg-[#1c1c28] text-white" : "bg-[#f4f4f9] text-black"
      }`}
    >
      <div className="flex-1 relative flex h-full overflow-hidden">
        {/* EPUB Viewer */}
        {currentFlow === "paginated" ? (
          <div
            className="w-[50px] flex items-center justify-center opacity-100 hover:opacity-100 cursor-pointer transition-opacity duration-300"
            onClick={goToPreviousPage}
          >
            <button
              className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${
                isDarkTheme
                  ? "bg-gray-800 hover:bg-gray-700 text-[#d1d5db]"
                  : "bg-gradient-to-r from-[#f4f4f9] to-[#fafafa] hover:from-[#fafafa] hover:to-[#f4f4f9] text-[#333333]"
              } border-none rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              &#10094; {/* Stylized arrow for a modern look */}
            </button>
          </div>
        ) : (
          " "
        )}
        <div
          id="viewer"
          ref={viewerRef}
          className={`flex-1 h-full ${
            currentFlow === "paginated" ? "p-[20px]" : ""
          }`}
          onClick={toggleNavbarVisibility}
        />
        {currentFlow === "paginated" ? (
          <div
            className="w-[50px] flex items-center justify-center opacity-100 hover:opacity-100 cursor-pointer transition-opacity duration-300"
            onClick={goToNextPage}
          >
            <button
              className={`absolute right-2.5 top-1/2 transform -translate-y-1/2 ${
                isDarkTheme
                  ? "bg-gray-800 hover:bg-gray-700 text-[#d1d5db]"
                  : "bg-gradient-to-r from-[#f4f4f9] to-[#fafafa] hover:from-[#fafafa] hover:to-[#f4f4f9] text-[#333333]" // Softer light mode styles
              } border-none rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              &#10095; {/* Stylized arrow for a modern look */}
            </button>
          </div>
        ) : (
          " "
        )}

        {rendition && user && (
          <HighlightMenu
            rendition={rendition}
            userId={user.uid}
            //@ts-ignore
            bookId={bookId}
            onOpen={() => setIsHighlightMenuOpen(true)} // Set menu open handler
            onClose={() => {
              setTimeout(() => {
                setIsHighlightMenuOpen(false);
              }, 200); // 0.1 second delay
            }}
          />
        )}

        {/* Table of Contents */}
        <TOC
          chapters={chapters}
          isVisible={isTOCVisible}
          handleChapterSelect={handleChapterSelect}
          isDarkTheme={isDarkTheme}
          setIsTOCVisible={setIsTOCVisible}
          //Check it later on most probably this import isnot used in toc component
          //@ts-ignore
          activeChapterHref={currentChapterHref} // Pass current chapter href
        />
      </div>
    </div>
  );
};

export default EpubReader;

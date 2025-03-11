/** @format */

import React, { use, useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition, Location } from "epubjs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";
import {
  saveUserData,
  loadUserData,
  loadHighlights,
} from "../../utils/firebaseFunctions";
import { useParams } from "next/navigation";
import HighlightMenu from "./HighlightMenu"; // Import the HighlightMenu component
import TOC from "./TOC"; // Import the TOC component
import Setting from "./Setting"; // Import the TOC component
import Head from "next/head";

interface EpubReaderProps {
  fileUrl: string; // The URL to the EPUB file
  onChapterChange: (chapter: string) => void; // Callback for chapter change
  isTOCVisible: boolean; // State to manage TOC visibility
  setIsNavbarVisible: (isVisible: boolean) => void; // Function to control Navbar visibility
  isDarkTheme: boolean; // Dark mode toggle
  isnavbarActive: boolean;
  setIsTOCVisible: (isTOCVisible: boolean) => void;
  currentFlow: string;
  setCurrentFlow: (currentFlow: string) => void;
  isSettingVisible: boolean;
  setIsSettingVisible: (isSettingVisible: boolean) => void;
}

const EpubReader: React.FC<EpubReaderProps> = ({
  fileUrl,
  onChapterChange,
  isDarkTheme,
  isTOCVisible,
  setIsNavbarVisible,
  isnavbarActive,
  setIsTOCVisible,
  currentFlow,
  setCurrentFlow,
  isSettingVisible,
  setIsSettingVisible,
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
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("fontSize") || "100");
    }
    return 100;
  });
  const [fontFamily, setFontFamily] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fontFamily") || "Georgia";
    }
    return "Georgia";
  });

  const getFontFamilyStyle = (fontName: string) => {
    const fonts = {
      Georgia: "Georgia, serif",
      Palatino: "Palatino, 'Palatino Linotype', serif",
      Merriweather: "'Merriweather', serif",
    };
    return fonts[fontName as keyof typeof fonts] || "Georgia, serif";
  };

  const updateRenditionStyles = (
    rendition: Rendition,
    isDark: boolean,
    fontSize: number
  ) => {
    console.log("Updating styles with font family:", fontFamily);
    const fontStyle = getFontFamilyStyle(fontFamily);
    console.log("Using font style:", fontStyle);

    rendition.themes.register("default", {
      "*": {
        "font-family": fontStyle,
      },
      body: {
        "font-family": fontStyle,
        "font-size": `${fontSize}% !important`,
        "line-height": "1.75 !important",
        "background-color": isDark ? "#000000" : "#f4f4f9",
        color: isDark ? "#d1d5db" : "#333333",
        padding: "20px",
        "max-width": currentFlow === "scrolled" ? "75%" : "inherit",
        "margin-left": currentFlow === "scrolled" ? "auto !important" : "0px",
        "margin-right": currentFlow === "scrolled" ? "auto !important" : "0px",
        "padding-left": currentFlow === "scrolled" ? "max(5%, 32px)" : "20px",
        "padding-right": currentFlow === "scrolled" ? "max(5%, 32px)" : "20px",
      },
      "p, h1, h2, h3, h4, h5, h6": {
        "font-family": "inherit",
        "max-width": currentFlow === "scrolled" ? "100ch" : "inherit",
        "margin-left": "auto",
        "margin-right": "auto",
      },
      ".epub-container": {
        "overflow-x": "hidden",
      },
    });

    rendition.themes.select("default");
  };

  useEffect(() => {
    if (rendition) {
      updateRenditionStyles(rendition, isDarkTheme, fontSize);
    }
  }, [fontSize, isDarkTheme, currentFlow, fontFamily]);

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

          // Clear the previous content explicitly
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

          // Apply initial styles
          updateRenditionStyles(loadedRendition, isDarkTheme, fontSize);

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

  // Keep the ref updated along with making the navbar disappear slowly with the latest isTOCVisible state value
  useEffect(() => {
    isTOCVisibleRef.current = isTOCVisible;
    setIsNavbarVisible(false);
  }, [isTOCVisible]);

  // Makes the navbar disappear slowly with the latest issettingvisible state value
  useEffect(() => {
    setIsNavbarVisible(false);
  }, [isSettingVisible]);

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
          if (!isTOCVisibleRef.current && !isHighlightMenuOpenRef.current) {
            //@ts-ignore
            setIsNavbarVisible((prevState) => !prevState); // Invert the current navbar visibility
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

  // Handle key press events which happen between iframe(epub.js) and arrow ui for both flows
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

      document.addEventListener("keydown", handleKeys);

      return () => {
        document.removeEventListener("keydown", handleKeys);
      };
    }
  });

  // Handle key press events which happen between iframe(epub.js) and arrow ui for both flows
  useEffect(() => {
    if (!isnavbarActive && currentFlow === "scrolled") {
      const handleKeys = (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          goToNextPage();
        }
        if (event.key === "ArrowDown") {
          goToPreviousPage();
        }
      };

      document.addEventListener("keydown", handleKeys);

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

      return () => {
        document.removeEventListener("wheel", handleWheels);
      };
    }
  });

  // Handle mouse wheel events at top and bottom of the chapter if flow is scrolled
  useEffect(() => {
    if (currentFlow === "scrolled") {
      if (rendition) {
        // Define the wheel event handlers for previous and next page
        const handleWheelUp = (event: WheelEvent) => {
          if (event.deltaY < 0) {
            goToPreviousPage();
          }
        };

        const handleWheelDown = (event: WheelEvent) => {
          if (event.deltaY > 0) {
            goToNextPage();
          }
        };

        // Handle relocated event
        const handleRelocated = (location: Location) => {
          const contents = rendition.getContents();

          //@ts-ignore
          if (contents && contents.length > 0) {
            //@ts-ignore
            const iframeDocument = contents[0].document;

            // Cleanup any previous event listeners before adding new ones
            iframeDocument.removeEventListener("wheel", handleWheelUp);
            iframeDocument.removeEventListener("wheel", handleWheelDown);

            // Check if the user is at the top of the chapter
            if (location.start.displayed.page === 1) {
              console.log("You've reached the top of the chapter.");
              iframeDocument.addEventListener("wheel", handleWheelUp);
            }

            // Check if the user is at the bottom of the chapter
            else if (
              location.end.displayed.page > location.end.displayed.total
            ) {
              console.log(location);
              iframeDocument.addEventListener("wheel", handleWheelDown);
            }
          }
        };

        // Attach the relocated event listener
        rendition.on("relocated", handleRelocated);

        // Cleanup function to remove event listeners when component unmounts or changes
        return () => {
          const contents = rendition.getContents();
          //@ts-ignore
          if (contents && contents.length > 0) {
            //@ts-ignore
            const iframeDocument = contents[0].document;
            iframeDocument.removeEventListener("wheel", handleWheelUp);
            iframeDocument.removeEventListener("wheel", handleWheelDown);
          }
          rendition.off("relocated", handleRelocated);
        };
      }
    }
  }, [currentFlow, rendition]); // Only re-run when currentFlow or rendition changes

  // This function will manage when the Navbar is shown/hidden
  const toggleNavbarVisibility = () => {
    //@ts-ignore
    setIsNavbarVisible((prevState) => !prevState); // Show the Navbar
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

  // Navigate to the previous page
  const goToPreviousPage = async () => {
    if (!isTOCVisible) {
      if (rendition) {
        await rendition.prev();
      }
    }
  };

  // Navigate to the next page
  const goToNextPage = async () => {
    if (!isTOCVisible) {
      if (rendition) {
        try {
          await rendition.next();
        } catch (error) {
          console.error("Error navigating to the next page:", error);
        }
      }
    }
  };

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Literata:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @font-face {
            font-family: 'Merriweather';
            font-display: swap;
            src: local('Merriweather');
        `}</style>
      </Head>
      <div
        className={`flex h-screen relative transition-colors duration-300 ${
          isDarkTheme ? "bg-[#000000] text-white" : "bg-[#f4f4f9] text-black"
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
                &#10094;
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
                &#10095;
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
              currentFlow={currentFlow}
              onOpen={() => setIsHighlightMenuOpen(true)} // Set menu open handler
              onClose={() => {
                // adding timeout so that click and selection event listener willnot trigger at once
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
          <Setting
            isSettingVisible={isSettingVisible}
            isDarkTheme={isDarkTheme}
            setIsSettingVisible={setIsSettingVisible}
            currentFlow={currentFlow}
            setCurrentFlow={setCurrentFlow}
            setFontSize={setFontSize}
            setFontFamily={setFontFamily}
          />
        </div>
      </div>
    </>
  );
};

export default EpubReader;

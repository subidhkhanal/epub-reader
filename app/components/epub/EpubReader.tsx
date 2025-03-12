/** @format */
import React, { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition, Location } from "epubjs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";
import {
  saveUserData,
  loadUserData,
  loadHighlights,
} from "../../utils/firebaseFunctions";
import { useParams } from "next/navigation";
import HighlightMenu from "./HighlightMenu";
import TOC from "./TOC";
import Setting from "./Setting";
import Head from "next/head";

interface EpubReaderProps {
  fileUrl: string;
  onChapterChange: (chapter: string) => void;
  isTOCVisible: boolean;
  setIsNavbarVisible: (isVisible: boolean) => void;
  isnavbarActive: boolean;
  setIsTOCVisible: (isTOCVisible: boolean) => void;
  currentFlow: string;
  setCurrentFlow: (currentFlow: string) => void;
  isSettingVisible: boolean;
  setIsSettingVisible: (isSettingVisible: boolean) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (isDarkTheme: boolean) => void;
  updateChapters: (chapters: TocElement[]) => void;
}

interface TocElement {
  label: string;
  href: string;
}

const EpubReader: React.FC<EpubReaderProps> = ({
  fileUrl,
  onChapterChange,
  isTOCVisible,
  setIsNavbarVisible,
  isnavbarActive,
  setIsTOCVisible,
  currentFlow,
  setCurrentFlow,
  isSettingVisible,
  setIsSettingVisible,
  isDarkTheme,
  setIsDarkTheme,
  updateChapters,
}) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [user] = useAuthState(auth);
  //@ts-ignore
  const [chapters, setChapters] = useState<TocElement[]>([]);
  const { slug } = useParams();
  const bookId = slug;
  //@ts-ignore
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);
  const [currentChapterHref, setCurrentChapterHref] = useState<string | null>(
    null
  );
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
    const fontStyle = getFontFamilyStyle(fontFamily);

    rendition.themes.register("default", {
      "*": {
        "font-family": `${fontStyle} !important`,
      },
      body: {
        "font-family": `${fontStyle} !important`,
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
        "font-family": `${fontStyle} !important`,
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
    if (rendition) {
      rendition.destroy();
    }

    if (fileUrl && viewerRef.current && user) {
      const loadBook = async () => {
        try {
          const loadedBook = ePub(fileUrl);
          const userData = await loadUserData(user.uid, bookId);
          const highlights = await loadHighlights(user.uid, bookId);

          if (viewerRef.current) {
            viewerRef.current.innerHTML = "";
          }

          const loadedRendition = loadedBook.renderTo(viewerRef.current!, {
            width: "100%",
            height: "100%",
            flow: currentFlow,
            spread: "auto",
          });

          setRendition(loadedRendition);
          updateRenditionStyles(loadedRendition, isDarkTheme, fontSize);

          // Load the table of contents first
          const navigation = await loadedBook.loaded.navigation;
          const toc = navigation.toc;
          setChapters(toc);
          updateChapters(toc);

          // Then display the book at the saved location or start
          if (userData?.location) {
            await loadedRendition.display(userData.location);
          } else {
            await loadedRendition.display();
          }

          setBook(loadedBook);

          // Set initial chapter
          const currentLocation = loadedRendition.currentLocation();
          if (currentLocation) {
            const locationStart = currentLocation as any;
            const currentChapterHref = locationStart.start?.href;
            if (currentChapterHref) {
              setCurrentChapterHref(currentChapterHref);
              onChapterChange(currentChapterHref);
            }
          }

          // Load highlights
          highlights?.forEach((highlight: any) => {
            loadedRendition.annotations.add(
              "highlight",
              highlight.cfiRange,
              {},
              (highlightElements: any) => {
                if (Array.isArray(highlightElements)) {
                  highlightElements.forEach((el) => {
                    if (el && typeof el.setAttribute === "function") {
                      el.setAttribute("data-cfi", highlight.cfiRange);
                      el.classList.add("highlight");
                    }
                  });
                } else if (
                  highlightElements &&
                  typeof highlightElements.setAttribute === "function"
                ) {
                  highlightElements.setAttribute(
                    "data-cfi",
                    highlight.cfiRange
                  );
                  highlightElements.classList.add("highlight");
                }
              },
              "highlight",
              { fill: highlight.color }
            );
          });

          loadedRendition.on("relocated", (location: Location) => {
            const cfi = location.start.cfi;
            saveUserData(user.uid, bookId, { location: cfi });
            const currentChapterHref = location.start.href;
            setCurrentChapterHref(currentChapterHref);
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

  useEffect(() => {
    isTOCVisibleRef.current = isTOCVisible;
    setIsNavbarVisible(false);
  }, [isTOCVisible]);

  useEffect(() => {
    setIsNavbarVisible(false);
  }, [isSettingVisible]);

  useEffect(() => {
    isHighlightMenuOpenRef.current = isHighlightMenuOpen;
  }, [isHighlightMenuOpen]);

  useEffect(() => {
    if (rendition) {
      rendition.on("keyup", (event: KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === " ") {
          goToNextPage();
        } else if (event.key === "ArrowLeft") {
          goToPreviousPage();
        }
      });

      if (currentFlow === "paginated") {
        rendition.on("rendered", () => {
          const contents = rendition.getContents();
          //@ts-ignore
          if (contents && contents.length > 0) {
            //@ts-ignore
            const iframeDocument = contents[0].document;
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

      rendition.on("selected", handleSelection);
      let isMouseDown = false;
      let mouseDownTarget: EventTarget | null = null;
      let mouseMoved = false;
      rendition.on("mousedown", (event: MouseEvent) => {
        isMouseDown = true;
        mouseDownTarget = event.target;
        mouseMoved = false;
      });

      rendition.on("mousemove", () => {
        mouseMoved = true;
      });

      rendition.on("mouseup", (event: MouseEvent) => {
        if (isMouseDown && event.target === mouseDownTarget && !mouseMoved) {
          if (!isTOCVisibleRef.current && !isHighlightMenuOpenRef.current) {
            //@ts-ignore
            setIsNavbarVisible((prevState) => !prevState);
          } else {
            setIsTOCVisible(false);
          }
        }
        isMouseDown = false;
        mouseDownTarget = null;
      });

      return () => {
        rendition.off("keyup", KeyboardEvent);
        rendition.off("selected", handleSelection);
        rendition.off("mousedown", MouseEvent);
        rendition.off("mousemove", MouseEvent);
        rendition.off("mouseup", MouseEvent);
      };
    }
  }, [rendition, isHighlightMenuOpen]);

  // Global keydown listener to capture arrow keys
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goToNextPage();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousPage();
      } else if (event.key === "ArrowUp" && currentFlow === "scrolled") {
        event.preventDefault();
        goToPreviousPage();
      } else if (event.key === "ArrowDown" && currentFlow === "scrolled") {
        event.preventDefault();
        goToNextPage();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [currentFlow]);

  // Handle wheel events for paginated flow
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
  }, [currentFlow]);

  // Handle wheel events at chapter boundaries for scrolled flow
  useEffect(() => {
    if (currentFlow === "scrolled" && rendition) {
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

      const handleRelocated = (location: Location) => {
        const contents = rendition.getContents();
        //@ts-ignore
        if (contents && contents.length > 0) {
          //@ts-ignore
          const iframeDocument = contents[0].document;
          iframeDocument.removeEventListener("wheel", handleWheelUp);
          iframeDocument.removeEventListener("wheel", handleWheelDown);

          if (location.start.displayed.page === 1) {
            iframeDocument.addEventListener("wheel", handleWheelUp);
          } else if (
            location.end.displayed.page > location.end.displayed.total
          ) {
            iframeDocument.addEventListener("wheel", handleWheelDown);
          }
        }
      };

      rendition.on("relocated", handleRelocated);
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
  }, [currentFlow, rendition]);

  // New useEffect: Focus the iframe's window after rendering
  useEffect(() => {
    if (rendition) {
      const focusIframe = () => {
        const contents = rendition.getContents();
        //@ts-ignore
        if (contents && contents.length > 0) {
          //@ts-ignore
          contents[0].window.focus();
        }
      };

      setTimeout(focusIframe, 100);
      rendition.on("rendered", focusIframe);
      return () => {
        rendition.off("rendered", focusIframe);
      };
    }
  }, [rendition]);

  // Modified toggleNavbarVisibility to ignore clicks on highlights
  const toggleNavbarVisibility = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".highlight")) return;
    setIsNavbarVisible(!isnavbarActive);
  };

  const handleChapterSelect = (chapterHref: string) => {
    if (rendition) {
      rendition.display(chapterHref);
      onChapterChange(chapterHref);
    }
  };

  const handleSelection = () => {
    setIsTextSelected(true);
    setIsHighlightMenuOpen(true);
  };

  const goToPreviousPage = async () => {
    if (!isTOCVisible && rendition) {
      if (currentFlow === "scrolled") {
        const currentLocation = rendition.currentLocation();
        if (
          currentLocation &&
          //@ts-ignore
          currentLocation.start.cfi !== "epubcfi(/6/2[cover]!/4/1:0)"
        ) {
          await rendition.prev();
        }
      } else if (currentFlow === "paginated") {
        await rendition.prev();
      }
    }
  };

  const goToNextPage = async () => {
    if (!isTOCVisible && rendition) {
      await rendition.next();
    }
  };

  // Focus the outer viewer as a fallback
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.focus();
    }
    return undefined;
  }, []);

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
            tabIndex={0}
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
                    : "bg-gradient-to-r from-[#f4f4f9] to-[#fafafa] hover:from-[#fafafa] hover:to-[#f4f4f9] text-[#333333]"
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
              onOpen={() => setIsHighlightMenuOpen(true)}
              onClose={() => {
                setTimeout(() => {
                  setIsHighlightMenuOpen(false);
                }, 200);
              }}
            />
          )}

          <TOC
            chapters={chapters}
            isVisible={isTOCVisible}
            handleChapterSelect={handleChapterSelect}
            isDarkTheme={isDarkTheme}
            setIsTOCVisible={setIsTOCVisible}
            //@ts-ignore
            activeChapterHref={currentChapterHref}
            userId={user.uid}
            bookId={Array.isArray(bookId) ? bookId[0] : bookId}
          />
          <Setting
            isSettingVisible={isSettingVisible}
            isDarkTheme={isDarkTheme}
            setIsSettingVisible={setIsSettingVisible}
            currentFlow={currentFlow}
            setCurrentFlow={setCurrentFlow}
            setFontSize={setFontSize}
            setFontFamily={setFontFamily}
            setIsDarkTheme={setIsDarkTheme}
          />
        </div>
      </div>
    </>
  );
};

export default EpubReader;

/** @format */
import React, { useState } from "react";
import { BiBookBookmark } from "react-icons/bi";
import { BsBookmarkStar } from "react-icons/bs";
import { loadHighlights } from "@/app/utils/firebaseFunctions";

// Function to compare CFI strings
const compareCFIs = (cfiA: string, cfiB: string): number => {
  // Extract the numerical parts from CFI strings
  const getNumbers = (cfi: string) => {
    return cfi.split("/").map((part) => {
      const num = parseInt(part.replace(/[^0-9]/g, ""));
      return isNaN(num) ? 0 : num;
    });
  };

  const numbersA = getNumbers(cfiA);
  const numbersB = getNumbers(cfiB);

  // Compare each number in the CFI
  for (let i = 0; i < Math.min(numbersA.length, numbersB.length); i++) {
    if (numbersA[i] !== numbersB[i]) {
      return numbersA[i] - numbersB[i];
    }
  }
  return numbersA.length - numbersB.length;
};

interface TOCProps {
  chapters: any[]; // Pass in the chapters from the EPUB book
  isVisible: boolean; // Control TOC visibility
  handleChapterSelect: (chapterHref: string) => void; // Callback to handle chapter selection
  isDarkTheme: boolean; // Dark theme support
  activeChapterHref: string; // Current active chapter
  setIsTOCVisible: (isTOCVisible: boolean) => void;
  userId: string; // User ID for fetching highlights
  bookId: string; // Current book ID
}

// Function to capitalize the first letter of each word and lowercase the rest
const capitalizeEachWord = (str: string) => {
  if (!str) return ""; // Safeguard for undefined/null values
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

const TOC: React.FC<TOCProps> = ({
  chapters,
  isVisible,
  handleChapterSelect,
  isDarkTheme,
  activeChapterHref,
  setIsTOCVisible,
  userId,
  bookId,
}) => {
  const [activeTab, setActiveTab] = useState<"toc" | "highlights">("toc");
  const [highlights, setHighlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch highlights
  const fetchHighlights = async () => {
    if (!userId || !bookId) return;

    try {
      setIsLoading(true);
      const userHighlights = await loadHighlights(userId, bookId);

      // Sort highlights by their CFI position
      const sortedHighlights = [...userHighlights].sort((a, b) =>
        compareCFIs(a.cfiRange, b.cfiRange)
      );

      setHighlights(sortedHighlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch highlights when tab changes to highlights
  React.useEffect(() => {
    if (activeTab === "highlights") {
      fetchHighlights();
    }
  }, [activeTab, userId, bookId]);

  // Function to handle chapter selection and conditional TOC closing
  const handleChapterClick = (chapterHref: string) => {
    // Call the passed-in handleChapterSelect function
    handleChapterSelect(chapterHref);

    // Check the window width
    if (window.innerWidth < 768) {
      // If the window width is less than 768px (mobile view), close the TOC
      setIsTOCVisible(false);
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 shadow-custom right-0 z-50 md:w-[400px] w-[70%] overflow-x-hidden pb-6 mb-4 transition-transform transform transition-colors duration-700 ease-in-out ${
          isDarkTheme
            ? "bg-[#1a1a2e] text-gray-300 border-[#444]"
            : "bg-white text-black border-[#ddd]"
        } ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Tab Navigation */}
        <div
          className={`flex border-b ${
            isDarkTheme ? "border-[#444]" : "border-[#ddd]"
          }`}
        >
          <button
            onClick={() => setActiveTab("toc")}
            className={`flex items-center justify-center w-1/2 px-4 py-3 space-x-2 transition-colors duration-200 ${
              activeTab === "toc"
                ? isDarkTheme
                  ? "bg-[#2a2a3e] text-white border-b-2 border-blue-500"
                  : "bg-gray-100 text-gray-900 border-b-2 border-blue-500"
                : isDarkTheme
                ? "text-gray-400 hover:bg-[#2a2a3e]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BiBookBookmark className="text-xl" />
            <span>Contents</span>
          </button>
          <button
            onClick={() => setActiveTab("highlights")}
            className={`flex items-center justify-center w-1/2 px-4 py-3 space-x-2 transition-colors duration-200 ${
              activeTab === "highlights"
                ? isDarkTheme
                  ? "bg-[#2a2a3e] text-white border-b-2 border-blue-500"
                  : "bg-gray-100 text-gray-900 border-b-2 border-blue-500"
                : isDarkTheme
                ? "text-gray-400 hover:bg-[#2a2a3e]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BsBookmarkStar className="text-xl" />
            <span>Highlights</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="toc-scrollbar overflow-y-auto h-[calc(100vh-91px)] !mt-0">
          {activeTab === "toc" ? (
            <ul className="space-y-2">
              {chapters.map((chapter, index) => {
                const isActive = chapter.href === activeChapterHref;
                const activeStyles = isActive
                  ? isDarkTheme
                    ? "active-item bg-[#37474f] text-[#e0f7fa]"
                    : "active-item bg-[#dde1f9] text-[#2c5282]"
                  : "hover:text-indigo-400 hover:bg-opacity-70";

                const formattedLabel = capitalizeEachWord(chapter?.label);
                return (
                  <li
                    key={index}
                    className={`toc-item ${
                      isDarkTheme ? "" : "hover:text-[#2c5282]"
                    } text-lg cursor-pointer flex justify-between items-center py-3 transition-colors duration-300 ${activeStyles}`}
                    onClick={() => handleChapterClick(chapter.href)}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="text-[16px] leading-[1.75]"
                        style={{
                          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,
                        }}
                      >
                        {formattedLabel || "Untitled Chapter"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4">
              {isLoading ? (
                <div
                  className={`text-center py-8 ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <p className="text-lg">Loading highlights...</p>
                </div>
              ) : highlights.length > 0 ? (
                <ul className="space-y-4">
                  {highlights.map((highlight, index) => (
                    <li
                      key={index}
                      className={`p-5 rounded-lg ${
                        isDarkTheme
                          ? "bg-[#2a2a3e] hover:bg-[#37474f]"
                          : "bg-white hover:bg-gray-50"
                      } transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer border ${
                        isDarkTheme ? "border-gray-700" : "border-gray-100"
                      }`}
                      onClick={() => handleChapterClick(highlight.cfiRange)}
                    >
                      {/* Timestamp and Actions Row */}
                      <div className="flex items-center justify-between mb-3">
                        <time
                          className={`text-xs ${
                            isDarkTheme ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {highlight.timestamp
                            ? new Date(highlight.timestamp).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : ""}
                        </time>
                        <div className="flex items-center space-x-2">
                          {highlight.color && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: highlight.color }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Highlight Text */}
                      <blockquote
                        className={`text-base border-l-4 pl-3 mb-2 ${
                          isDarkTheme ? "text-gray-200" : "text-gray-700"
                        }`}
                        style={{
                          borderLeftColor: highlight.color || "#3B82F6",
                        }}
                      >
                        {highlight.text}
                      </blockquote>

                      {/* Note Section */}
                      {highlight.note && (
                        <div
                          className={`mt-3 pt-3 border-t ${
                            isDarkTheme ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <span className="font-medium">Note:</span>{" "}
                            {highlight.note}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className={`text-center py-12 ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <BsBookmarkStar className="mx-auto text-5xl mb-4 opacity-80" />
                  <h3 className="text-lg font-medium mb-2">
                    No highlights yet
                  </h3>
                  <p className="text-sm opacity-75">
                    Select text while reading to create highlights and notes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <div
        className={`${
          isVisible
            ? "fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 z-40"
            : " "
        }`}
        onClick={() => setIsTOCVisible(false)}
      ></div>
    </>
  );
};

export default TOC;

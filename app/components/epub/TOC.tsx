/** @format */
import React from "react";

interface TOCProps {
  chapters: any[]; // Pass in the chapters from the EPUB book
  isVisible: boolean; // Control TOC visibility
  handleChapterSelect: (chapterHref: string) => void; // Callback to handle chapter selection
  isDarkTheme: boolean; // Dark theme support
  activeChapterHref: string; // Current active chapter
  setIsTOCVisible: (isTOCVisible: boolean) => void;
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
}) => {
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
        } ${isVisible ? "translate-x-0" : "translate-x-full"}`} // Change here to slide from the right
      >
        {/* Header Section */}
        <div
          className={`toc-header sticky top-0 h-[81px] flex items-center pl-4 text-[18px] leading-[1.75] ${
            isDarkTheme
              ? "bg-[#1a1a2e] text-white"
              : "bg-gray-100 text-gray-900 border-b "
          }`}
          style={{ fontFamily: "Lora, serif" }}
        >
          Table of Contents
        </div>

        {/* Chapters List */}
        <div className="toc-scrollbar overflow-y-auto h-[calc(100vh-91px)] !mt-0">
          <ul className="space-y-2">
            {chapters.map((chapter, index) => {
              const isActive = chapter.href === activeChapterHref;
              const activeStyles = isActive
                ? isDarkTheme
                  ? "active-item bg-[#37474f] text-[#e0f7fa]" // Active in dark mode
                  : "active-item bg-[#dde1f9] text-[#2c5282]" // Active in light mode
                : "hover:text-indigo-400 hover:bg-opacity-70";

              // Capitalize each word in the chapter label dynamically
              const formattedLabel = capitalizeEachWord(chapter?.label);
              return (
                // bg-[#333]
                <li
                  key={index}
                  className={`toc-item ${
                    isDarkTheme ? "" : "hover:text-[#2c5282]"
                  } text-lg cursor-pointer flex justify-between items-center py-3 transition-colors duration-300 ${activeStyles}`}
                  onClick={() => handleChapterClick(chapter.href)} // Use the new handleChapterClick function here
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
        </div>
      </aside>
      {/* Used to close the toc component if clicked anywhere else than the aside tag */}

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

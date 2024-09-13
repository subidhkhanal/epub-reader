/** @format */
import React from "react";

interface TOCProps {
  chapters: any[]; // Pass in the chapters from the EPUB book
  isVisible: boolean; // Control TOC visibility
  handleChapterSelect: (chapterHref: string) => void; // Callback to handle chapter selection
  isDarkTheme: boolean; // Dark theme support
  activeChapterHref: string; // Current active chapter
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
}) => {
  if (!isVisible) return null;
  // console.log(chapters);

  return (
    <div
      className={`absolute top-0 right-0 shadow-custom w-full md:w-[400px] overflow-x-hidden pb-6 mb-4	space-y-4  ${
        isDarkTheme
          ? "bg-[#1a1a2e] text-gray-300 border-[#444]"
          : "bg-white text-black border-[#ddd]"
      }`}
    >
      {/* Header Section */}
      <div
        className={`toc-header sticky top-0 h-[81px] flex items-center pl-4 text-[18px] leading-[1.75] ${
          isDarkTheme ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-900"
        }`}
        style={{ fontFamily: "Lora, serif" }}
      >
        Table of Contents
      </div>

      {/* Chapters List */}
      <div className="overflow-y-auto h-[calc(100vh-91px)] !mt-0">
        <ul className="space-y-2">
          {chapters.map((chapter, index) => {
            const isActive = chapter.href === activeChapterHref;
            const activeStyles = isActive
              ? isDarkTheme
                ? "active-item bg-[#333] text-[#9aa0b5]" // Active in dark mode
                : "active-item bg-[#dde1f9] text-black" // Active in light mode
              : "hover:text-indigo-400 hover:bg-opacity-70";

            // Capitalize each word in the chapter label dynamically
            const formattedLabel = capitalizeEachWord(chapter?.label);
            return (
              <li
                key={index}
                className={`toc-item text-lg cursor-pointer flex justify-between items-center py-3 transition-colors duration-300 ${activeStyles}`}
                onClick={() => handleChapterSelect(chapter.href)}
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
    </div>
  );
};

export default TOC;

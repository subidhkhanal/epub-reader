/** @format */
import React from "react";

interface TOCProps {
  chapters: any[]; // Pass in the chapters from the EPUB book
  isVisible: boolean; // Control TOC visibility
  handleChapterSelect: (chapterHref: string) => void; // Callback to handle chapter selection
  isDarkTheme: boolean; // Dark theme support
}

const TOC: React.FC<TOCProps> = ({
  chapters,
  isVisible,
  handleChapterSelect,
  isDarkTheme,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`absolute top-0 right-0 w-[300px] h-full overflow-y-auto p-4 ${
        isDarkTheme ? "bg-[#2c2c38] text-white" : "bg-white text-black"
      }`}
    >
      <h2 className="text-lg font-bold mb-4">Table of Contents</h2>
      <ul>
        {chapters.map((chapter, index) => (
          <li
            key={index}
            className="mb-2 cursor-pointer"
            onClick={() => handleChapterSelect(chapter.href)}
          >
            {chapter.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TOC;

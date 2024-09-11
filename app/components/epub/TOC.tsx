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
      className={`absolute top-0 right-0 w-[300px] h-full overflow-y-auto p-6 space-y-4 ${
        isDarkTheme ? "bg-[#1c1c28] text-gray-300" : "bg-white text-black"
      }`}
    >
      <h2 className="text-xl font-extrabold mb-6">Table of Contents</h2>
      <ul className="space-y-4">
        {chapters.map((chapter, index) => (
          <li
            key={index}
            className="text-lg cursor-pointer hover:text-indigo-400 hover:underline transition duration-200"
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

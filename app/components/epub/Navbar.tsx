/** @format */

import React from "react";

interface NavbarProps {
  chapters: string[];
  onSelectChapter: (chapter: string) => void;
  isVisible: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  chapters,
  onSelectChapter,
  isVisible,
}) => {
  if (!isVisible) return null; // Don't render if not visible

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "300px",
        backgroundColor: "#fff",
        zIndex: 1000,
        height: "100vh",
        overflowY: "auto",
        boxShadow: "2px 0px 5px rgba(0,0,0,0.3)",
      }}
    >
      <h3 style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
        Chapters
      </h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {chapters.map((chapter, index) => (
          <li
            key={index}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              cursor: "pointer",
            }}
            onClick={() => onSelectChapter(chapter)}
          >
            {chapter}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navbar;

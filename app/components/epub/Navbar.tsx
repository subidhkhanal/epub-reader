/** @format */

import React from "react";
import { FiMenu } from "react-icons/fi";

interface NavbarProps {
  title: string; // The title of the book
  isDarkTheme: boolean; // Dark mode toggle
  toggleTOC: () => void; // Function to toggle the Table of Contents (TOC)
  isTOCVisible: boolean; // Current state of the TOC visibility
  setIsNavbarActive: (isActive: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  isDarkTheme,
  toggleTOC,
  isTOCVisible,
  setIsNavbarActive,
}) => {
  return (
    <nav
      className={`p-4 flex items-center justify-between shadow-md transition-all duration-300 ${
        isDarkTheme
          ? "bg-gradient-to-r from-[#2c2c38] to-[#3a3a4a]"
          : "bg-[#d3d3e0]"
      } rounded-lg`}
      onClick={() => setIsNavbarActive(true)}
    >
      <span
        className={`text-lg font-semibold ${isDarkTheme ? " " : "text-[#333]"}`}
      >
        {title}
      </span>
      <button
        onClick={toggleTOC}
        aria-label={
          isTOCVisible ? "Hide Table of Contents" : "Show Table of Contents"
        }
        className={`p-2 text-sm rounded-md transition-transform duration-300 hover:scale-105 active:scale-95 ${
          isTOCVisible
            ? isDarkTheme
              ? "bg-[#5a5a68] text-gray-100 shadow-lg"
              : "bg-[#b0b8ff] text-gray-800 shadow-lg"
            : isDarkTheme
            ? "bg-transparent text-gray-100 hover:bg-[#444455] hover:text-white"
            : "bg-transparent text-gray-800 hover:bg-[#dde1f9]  hover:text-black hover:text-gray-900"
        }`}
        style={{ transition: "background-color 0.3s ease, color 0.3s ease" }}
      >
        <FiMenu size={24} />
      </button>
    </nav>
  );
};

export default Navbar;

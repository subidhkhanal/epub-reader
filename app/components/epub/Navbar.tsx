/** @format */

import React from "react";
import { MdOutlineToc } from "react-icons/md";

interface NavbarProps {
  title: string; // The title of the book
  isDarkTheme: boolean; // Dark mode toggle
  isTOCVisible: boolean; // Current state of the TOC visibility
  setIsNavbarActive: (isActive: boolean) => void;
  setIsTOCVisible: (isTOCVisible: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  isDarkTheme,
  isTOCVisible,
  setIsNavbarActive,
  setIsTOCVisible,
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
        onClick={() => {
          setIsTOCVisible(!isTOCVisible); // Invert the current navbar visibility
        }}
        aria-label={
          isTOCVisible ? "Hide Table of Contents" : "Show Table of Contents"
        }
        className={`p-2 text-sm rounded-md transition-transform hover:scale-105 active:scale-95 ${
          isTOCVisible
            ? isDarkTheme
              ? "bg-[#5a5a68] text-gray-100 shadow-lg"
              : "bg-[#d3d3e0] text-gray-800 shadow-lg"
            : isDarkTheme
            ? "bg-transparent text-gray-100 hover:bg-[#444455] hover:text-white"
            : "bg-transparent text-gray-800 hover:bg-[#dde1f9]  hover:text-black hover:text-gray-900"
        }`}
        style={{ transition: "background-color 0.3s ease, color 0.3s ease" }}
      >
        {/* <FiMenu size={24} /> */}
        <MdOutlineToc
          style={{ transform: "scaleX(-1) scale(1.3)" }}
          size={24}
        />
      </button>
    </nav>
  );
};

export default Navbar;

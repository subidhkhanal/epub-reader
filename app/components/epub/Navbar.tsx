/** @format */

import React, { useState } from "react";
import { MdOutlineToc } from "react-icons/md";
import { FaExpand, FaCompress, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { FiSettings } from "react-icons/fi";

interface NavbarProps {
  title: string; // The title of the book
  isDarkTheme: boolean; // Dark mode toggle
  isTOCVisible: boolean; // Current state of the TOC visibility
  setIsNavbarActive: (isActive: boolean) => void;
  setIsTOCVisible: (isTOCVisible: boolean) => void;
  currentFlow: string;
  setCurrentFlow: (currentFlow: string) => void;
  isNavbarVisible: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  isDarkTheme,
  isTOCVisible,
  setIsNavbarActive,
  setIsTOCVisible,
  currentFlow,
  setCurrentFlow,
  isNavbarVisible,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const newCurrentFlow = () => {
    const newFlow = currentFlow === "paginated" ? "scrolled" : "paginated";
    setCurrentFlow(newFlow);
  };
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-transform transform transition-colors duration-700 ease-in-out pl-1.5 p-4 flex items-center justify-between shadow-md ${
        isDarkTheme
          ? "bg-gradient-to-r from-[#1e1e28] to-[#2b2b36]"
          : "bg-[#e0e4eb]"
      } rounded-lg ${isNavbarVisible ? "translate-y-0" : "-translate-y-full"} `}
      onClick={() => setIsNavbarActive(true)}
    >
      <div className="flex items-center">
        <Link href="/">
          <div
            className={`mr-3.5 p-2  flex transform scale-110 p-2 rounded-full cursor-pointer transition-transform duration-300 ${
              isFullscreen ? "" : " "
            } ${isDarkTheme ? "hover:bg-[#3d3d4a]" : "hover:bg-[#cdd3f3]"}
        `}
          >
            <FaArrowLeft size={17} />
          </div>
        </Link>

        <div
          className={`text-lg font-semibold ${
            isDarkTheme ? "text-gray-200" : "text-[#333]"
          }`}
        >
          {title}
        </div>
      </div>
      <div className="flex items-center">
        <FiSettings
          onClick={() => newCurrentFlow()}
          className={`transition-all duration-300 cursor-pointer ${
            isDarkTheme ? "hover:bg-[#525268]" : "hover:bg-[#b3b7d8]"
          }`} // Added button styling for consistency
          size={24}
        />
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
                : "bg-[#c3c7d5] text-gray-800 shadow-lg"
              : isDarkTheme
              ? "bg-transparent text-gray-100 hover:bg-[#3d3d4a] hover:text-white"
              : "bg-transparent text-gray-800 hover:bg-[#cdd3f3]  hover:text-black"
          }`}
          style={{ transition: "background-color 0.3s ease, color 0.3s ease" }}
        >
          {/* <FiMenu size={24} /> */}
          <MdOutlineToc
            style={{ transform: "scaleX(-1) scale(1.3)" }}
            size={24}
            className="scale-125"
          />
        </button>
        <div
          onClick={handleFullscreen}
          className={`transform scale-110 p-2 rounded-full cursor-pointer transition-transform duration-300 ${
            isFullscreen ? "" : " "
          } ${isDarkTheme ? "hover:bg-[#3d3d4a]" : "hover:bg-[#cdd3f3]"}
        `}
        >
          {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

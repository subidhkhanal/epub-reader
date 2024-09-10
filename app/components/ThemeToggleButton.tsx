/** @format */
import React, { useContext } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { ThemeContext } from "@/app/context/ThemeContext"; // Import ThemeContext

const ThemeToggleButton: React.FC = () => {
  //@ts-ignore
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext); // Use the theme context

  return (
    <button
      className={`p-2 rounded-full bg-transparent border-2 transition-transform duration-300 transform focus:outline-none ${
        isDarkTheme
          ? "border-[#18212f] text-yellow-400" // Dark theme: Match the border to the dark navbar color
          : "border-transparent text-white" // Light theme: Transparent border to blend with gradient
      }`}
      onClick={toggleTheme}
      title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkTheme ? (
        <FaSun className="text-lg" />
      ) : (
        <FaMoon className="text-lg" />
      )}
    </button>
  );
};

export default ThemeToggleButton;

/** @format */
import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaSearch, FaGoogle, FaSun, FaMoon } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "@/firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";

interface NavBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onMenuClick: () => void;
  isDarkTheme: boolean; // Add dark theme prop
  onThemeToggle: () => void; // Add theme toggle function
}

const NavBar: React.FC<NavBarProps> = ({
  searchTerm,
  setSearchTerm,
  onMenuClick,
  isDarkTheme,
  onThemeToggle,
}) => {
  const [user] = useAuthState(auth);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setDropdownVisible(false); // Hide dropdown after signing out
    } catch (error) {
      console.error("Sign Out error:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-1000 flex justify-between items-center p-4 transition-all duration-300 ${
        isDarkTheme
          ? "bg-[#18212f] text-[#F3F4F6] shadow-lg" // Dark theme styles with slate gray background
          : "bg-gradient-to-br from-[#1d2b64] to-[#f8cdda] text-white shadow-md" // Light theme styles
      }`}
    >
      {/* Left: Menu and Logo */}
      <div className="flex items-center">
        <FaBars className="text-lg cursor-pointer" onClick={onMenuClick} />
        <span className="ml-2 font-bold text-xl">My Books</span>
      </div>

      {/* Middle: Search Bar */}
      <div className="flex-1 flex justify-center items-center">
        <div
          className={`flex items-center rounded-full px-4 py-2 w-full max-w-xl ${
            isDarkTheme
              ? "bg-[#111827] text-[#D1D5DB] shadow-inner" // Dark theme styles with dark navy background
              : "bg-white text-gray-800 shadow-md" // Light theme styles
          }`}
        >
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-transparent border-none outline-none text-base"
          />
        </div>
      </div>

      {/* Right: Theme Toggle and User Profile */}
      <div className="flex items-center relative">
        <button
          className={`p-2 rounded-full bg-transparent border-2 transition-transform duration-300 transform focus:outline-none ${
            isDarkTheme
              ? "border-[#18212f] text-yellow-400" // Dark theme: Match the border to the dark navbar color
              : "border-transparent text-white" // Light theme: Transparent border to blend with gradient
          }`}
          onClick={onThemeToggle}
          title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkTheme ? (
            <FaSun className="text-lg" />
          ) : (
            <FaMoon className="text-lg" />
          )}
        </button>

        {user ? (
          <div className="flex items-center ml-4">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full mr-2 cursor-pointer"
              onClick={toggleDropdown}
            />
            {dropdownVisible && (
              <div
                ref={dropdownRef}
                className={`absolute top-12 right-0 mt-2 w-48 ${
                  isDarkTheme ? "bg-[#18212f] text-gray-200" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden z-50`}
              >
                <button
                  onClick={handleSignOut}
                  className={`block w-full px-4 py-2 text-left ${
                    isDarkTheme
                      ? "hover:bg-[#111827] text-white"
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
            onClick={handleGoogleSignIn}
          >
            <FaGoogle className="mr-2 text-lg" />
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
};

export default NavBar;

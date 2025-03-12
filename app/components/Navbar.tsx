/** @format */
import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaGoogle } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "@/firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";
import AddBook from "./AddBook";

interface NavBarProps {
  onMenuClick: () => void;
  isDarkTheme: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ onMenuClick }) => {
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
      setDropdownVisible(false);
    } catch (error) {
      console.error("Sign Out error:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

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
      className={`fixed top-0 left-0 w-full z-1000 flex justify-between items-center p-4 pl-2 transition-all duration-300 bg-[#18212f] text-[#F3F4F6] shadow-lg`}
    >
      {/* Left: Menu and Logo */}
      <div className="flex items-center">
        <FaBars
          className="text-lg cursor-pointer [@media(min-width:786px)]:hidden block"
          onClick={onMenuClick}
        />
        <span className="ml-2 font-bold text-xl [@media(min-width:786px)]:block hidden">
          My Books
        </span>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center relative">
        <div className="[@media(min-width:786px)]:block hidden">
          <AddBook isDarkTheme={true} />
        </div>

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
                className="absolute top-12 right-0 mt-2 w-48 bg-[#18212f] text-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
              >
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-left hover:bg-[#111827] text-white"
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
            Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default NavBar;

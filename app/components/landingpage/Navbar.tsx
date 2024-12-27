/** @format */
import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaGoogle } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "@/firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";
import Link from "next/link";

const NavBar = () => {
  const [user] = useAuthState(auth);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSmallSearch, setShowSmallSearch] = useState(false);
  const smallSearchRef = useRef<HTMLDivElement>(null); // Reference for the small search input

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

  // Close small search input if clicked outside
  useEffect(() => {
    const handleClickOutsideSmallSearch = (event: MouseEvent | TouchEvent) => {
      if (
        smallSearchRef.current &&
        !smallSearchRef.current.contains(event.target as Node)
      ) {
        setShowSmallSearch(false);
      }
    };

    if (showSmallSearch) {
      document.addEventListener("mousedown", handleClickOutsideSmallSearch);
      document.addEventListener("touchstart", handleClickOutsideSmallSearch);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideSmallSearch);
      document.removeEventListener("touchstart", handleClickOutsideSmallSearch);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSmallSearch);
      document.removeEventListener("touchstart", handleClickOutsideSmallSearch);
    };
  }, [showSmallSearch]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-1000 flex justify-between items-center p-4 pl-2 transition-all duration-300 bg-[#18212f] text-[#F3F4F6] shadow-lg`}
    >
      {/* Left: Menu and Logo */}
      <div className="flex items-center">
        <span className="ml-2 font-bold text-xl [@media(min-width:786px)]:block ">
          Epub Online
        </span>
      </div>

      {/* Middle: Search Bar */}
      <div className=" [@media(min-width:786px)]:flex justify-center items-center">
        {showSmallSearch ? (
          <div
            className={`[@media(min-width:786px)]:hidden flex items-center rounded-full px-4 py-2 w-full max-w-xl bg-white text-gray-800 shadow-md`}
            ref={smallSearchRef}
          >
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent border-none outline-none text-base"
            />
          </div>
        ) : (
          <div className="text-outline typescale-body-large items-center gap-4">
            <Link
              href="https://broad-comma-cd4.notion.site/b7c5ab608a2641e3806f27108bb527ae?v=79d80cc18c604defa9b3c66bc3469d03&pvs=73"
              target="_blank"
            >
              <span className="ml-2 font-bold text-lg [@media(min-width:786px)]:block ">
                Roadmap{" "}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Right: Theme Toggle and User Profile */}
      <div className="flex items-center relative">
        {user ? (
          /* Small Devices: Search Icon and Search Input */
          <div
            className="[@media(min-width:786px)]:hidden"
            ref={smallSearchRef}
          >
            <FaSearch
              className={`text-gray-400 mr-4 cursor-pointer ${
                showSmallSearch ? "hidden" : "block"
              }`}
              onClick={() => {
                setShowSmallSearch(true); // Show the search input
              }}
            />
          </div>
        ) : (
          " "
        )}

        <button
          className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
          onClick={handleGoogleSignIn}
        >
          <FaGoogle className="mr-2 text-lg" />
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default NavBar;

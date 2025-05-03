"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, provider } from "@/firebaseConfig";
/* @ts-ignore */
import { collection, getDocs } from "firebase/firestore";
import NavBar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import BookGrid from "@/app/components/BookGrid";
import { ThemeContext } from "@/app/context/ThemeContext"; // Import ThemeContex
/* @ts-ignore */
import { signInWithPopup } from "firebase/auth"; // Import signInWithPopup
import Footer from "./components/footer";
import FaqSection from "./components/landingpage/faq_section";
import Banner from "./components/landingpage/Banner";
import Navbar from "./components/landingpage/Navbar";
import Features from "./components/landingpage/Features";
import BlogSection from "./components/landingpage/blog/BlogSection"; // Import the new BlogSection

const Home: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  //@ts-ignore
  const { isDarkTheme } = useContext(ThemeContext); // Use theme context

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    if (user) {
      try {
        const booksCollection = collection(db, "users", user.uid, "books");
        const booksSnapshot = await getDocs(booksCollection);
        /* @ts-ignore */
        const booksList = booksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            epubPath:
              data.epubUrl || data.epubPath || `books/${user.uid}/${doc.id}`,
          };
        });
        setBooks(booksList);
      } catch (error) {
        // Handle error silently in production
        setBooks([]);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const filteredBooks = books.filter((book) =>
    (book.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div
      className={`flex flex-col h-screen  ${
        isDarkTheme ? "dark bg-[#0e131f]" : "bg-gray-200"
      }`}
    >
      {user ? (
        <div>
          <NavBar
            onMenuClick={toggleSidebar}
            // onThemeToggle={toggleTheme} // Pass toggle function
            isDarkTheme={isDarkTheme} // Pass dark theme state
          />
          <div ref={sidebarRef}>
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={handleSidebarClose}
              isDarkTheme={isDarkTheme} // Pass dark theme state
            />
          </div>
          <div
            className={`flex-1 py-5 mt-16 overflow-y-auto transition-all duration-300 
           ${
             isDarkTheme
               ? "bg-[#0e131f] text-white"
               : "bg-gray-200 text-gray-900"
           }`}
          >
            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              <div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="text-center mb-12">
                    <h1
                      className={`text-3xl font-bold mb-4 ${
                        isDarkTheme ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Welcome to Your Personal eBook Library
                    </h1>
                    <p
                      className={`text-lg ${
                        isDarkTheme ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Manage your eBook collection, track your reading progress,
                      and enjoy a seamless reading experience.
                    </p>
                  </div>
                </div>

                <BookGrid
                  books={filteredBooks}
                  userId={user.uid}
                  isDarkTheme={isDarkTheme}
                  onBookDeleted={fetchBooks}
                />

                {/* Content about the reading experience */}
                <div
                  className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${
                    isDarkTheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  <h2 className="text-2xl font-bold mb-6">
                    Make the Most of Your Reading Experience
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div
                      className={`p-6 rounded-lg ${
                        isDarkTheme ? "bg-gray-800" : "bg-white"
                      } shadow-md`}
                    >
                      <h3 className="text-xl font-semibold mb-3">
                        Customizable Display
                      </h3>
                      <p
                        className={`${
                          isDarkTheme ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Adjust font size, style, and background color to reduce
                        eye strain and enhance readability during long reading
                        sessions.
                      </p>
                    </div>
                    <div
                      className={`p-6 rounded-lg ${
                        isDarkTheme ? "bg-gray-800" : "bg-white"
                      } shadow-md`}
                    >
                      <h3 className="text-xl font-semibold mb-3">
                        Bookmarks & Highlights
                      </h3>
                      <p
                        className={`${
                          isDarkTheme ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Save important passages with highlights and add
                        bookmarks to easily return to your favorite sections.
                      </p>
                    </div>
                    <div
                      className={`p-6 rounded-lg ${
                        isDarkTheme ? "bg-gray-800" : "bg-white"
                      } shadow-md`}
                    >
                      <h3 className="text-xl font-semibold mb-3">
                        Progress Tracking
                      </h3>
                      <p
                        className={`${
                          isDarkTheme ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Track your reading progress across all your books and
                        pick up exactly where you left off.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
                  <p className="text-xs leading-5 text-gray-500 text-center	">
                    {" "}
                    Contact Us at{" "}
                    <span className="font-bold	">
                      subidhkhanal38@gmail.com
                    </span>{" "}
                    for any queries
                  </p>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : (
        <div>
          <Navbar />
          <div className="pt-[68px] bg-[#181a1b]">
            <Banner />
          </div>
          <Features />

          {/* Add the blog section here */}
          <BlogSection />

          <FaqSection />
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Home;

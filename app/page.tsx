"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import NavBar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import BookGrid from "@/app/components/BookGrid";

const Home: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false); // Dark theme state
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    if (user) {
      const booksCollection = collection(db, "users", user.uid, "books");
      const booksSnapshot = await getDocs(booksCollection);
      const booksList = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksList);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
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
    <div className={`flex flex-col h-screen ${isDarkTheme ? "dark" : ""}`}>
      <NavBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onMenuClick={toggleSidebar}
        onThemeToggle={toggleTheme} // Pass toggle function
        isDarkTheme={isDarkTheme} // Pass dark theme state
      />
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={isSidebarOpen}
          onBookUpload={() => console.log("Book uploaded!")}
          onClose={handleSidebarClose}
          isDarkTheme={isDarkTheme} // Pass dark theme state
        />
      </div>
      <div
        className={`flex-1 p-5 mt-16 overflow-y-auto transition-all duration-300 
           ${
             isDarkTheme
               ? "bg-gray-900 text-white"
               : "bg-gray-200 text-gray-900"
           }`}
      >
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <BookGrid
            books={filteredBooks}
            userId={user.uid}
            isDarkTheme={isDarkTheme}
          />
        ) : (
          <div className="text-center mt-5">
            <h2 className="text-2xl font-semibold">Welcome to Epub Reader</h2>
            <p className="mt-2">
              Please sign in with Google to view and manage your books.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

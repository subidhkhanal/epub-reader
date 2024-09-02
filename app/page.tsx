/** @format */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import NavBar from "@/app/components/NavBar";
import Sidebar from "@/app/components/Sidebar";
import BookGrid from "@/app/components/BookGrid";

const Home: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
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

  return (
    <div className="home-page" style={styles.homePage}>
      <NavBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onMenuClick={toggleSidebar}
      />
      <div ref={sidebarRef}>
        <Sidebar isOpen={isSidebarOpen} onBookUpload={fetchBooks} />
      </div>
      <div
        className="main-content"
        style={{
          ...styles.mainContent,
          marginLeft: isSidebarOpen ? "200px" : "0",
        }}
      >
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <BookGrid books={filteredBooks} userId={user.uid} />
        ) : (
          <div style={styles.welcomeMessage}>
            <h2>Welcome to My Epub Reader</h2>
            <p>Please sign in with Google to view and manage your books.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  homePage: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: "20px",
    marginTop: "60px", // Adjust for fixed NavBar height
    overflowY: "auto",
    transition: "margin-left 0.3s", // Smooth transition for sidebar
  },
  welcomeMessage: {
    textAlign: "center",
    marginTop: "20px",
  },
};

export default Home;

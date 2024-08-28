/** @format */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Auth from "@/app/components/Auth";
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    //@ts-ignore
    return <Auth onAuth={(user) => console.log("Logged in as:", user.email)} />;
  }

  const filteredBooks = books.filter((book) =>
    (book.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    //@ts-ignore
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
        //@ts-ignore
        style={{
          ...styles.mainContent,
          marginLeft: isSidebarOpen ? "200px" : "0",
        }}
      >
        <BookGrid books={filteredBooks} userId={user.uid} />
      </div>
    </div>
  );
};

const styles = {
  homePage: {
    display: "flex",
    flexDirection: "column", // Change to column to ensure NavBar stays at the top
    height: "100vh",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: "20px",
    marginTop: "60px", // Add margin to compensate for fixed NavBar
    overflowY: "auto",
    transition: "margin-left 0.3s", // Smooth transition for sidebar opening
  },
};

export default Home;

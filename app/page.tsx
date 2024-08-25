/** @format */
"use client";
// pages/index.tsx
import React, { useState, useEffect } from "react";
import FileUpload from "@/app/components/FileUpload";
import EpubReader from "@/app/components/EpubReader";
import Auth from "@/app/components/Auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import Sidebar from "@/app/components/Sidebar";
import BookGrid from "@/app/components/BookGrid";
import SearchBar from "@/app/components/SearchBar";

const Home: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    <div className="home-page">
      <Sidebar onBookUpload={fetchBooks} />
      <div className="main-content">
        <div className="header">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <BookGrid books={filteredBooks} userId={user.uid} />
      </div>
    </div>
  );
};

export default Home;

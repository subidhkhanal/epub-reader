/** @format */
"use client";
// components/Bookshelf.tsx
import React, { useEffect, useState } from "react";
import { Book } from "../types/book";
import BookCard from "./BookCard";
import { db, auth } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const Bookshelf: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) return;

      const booksCollection = collection(db, "users", user.uid, "books");
      const booksSnapshot = await getDocs(booksCollection);
      const booksList = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Book[];

      setBooks(booksList);
    };

    fetchBooks();
  }, [user]);

  return (
    <div className="bookshelf">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default Bookshelf;

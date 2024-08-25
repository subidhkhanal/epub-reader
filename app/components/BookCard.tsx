/** @format */

// components/BookCard.tsx
import React from "react";
import { Book } from "../types/book";

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="book-card">
      <img src={book.coverImage} alt={book.title} className="book-cover" />
      <div className="book-info">
        <h4 className="book-title">{book.title}</h4>
        <p className="book-author">{book.author}</p>
      </div>
    </div>
  );
};

export default BookCard;

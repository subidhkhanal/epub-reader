/** @format */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BookGridProps {
  books: any[];
  userId: string; // Ensure you pass the userId directly from the parent component
}

const BookGrid: React.FC<BookGridProps> = ({ books, userId }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Set to true after the component mounts (client-side)
  }, []);

  const handleBookClick = (bookId: string) => {
    if (isMounted) {
      router.push(`/read/${bookId}?userId=${userId}`);
    }
  };

  return (
    <div className="book-grid">
      {books.map((book) => (
        <div
          key={book.id}
          className="book-card"
          onClick={() => handleBookClick(book.id)}
        >
          <img src={book.coverImage} alt={book.title} className="book-cover" />
          <div className="book-info">
            <p className="book-title">{book.title}</p>
            <a href="#" onClick={() => handleBookClick(book.id)}>
              Open
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookGrid;

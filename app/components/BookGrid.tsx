/** @format */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BookGridProps {
  books: Array<{
    id: string;
    title: string;
    author: string;
    coverImage: string;
  }>;
  userId: string;
}

const BookGrid: React.FC<BookGridProps> = ({ books, userId }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Log the coverImage URLs for each book to debug
    books.forEach((book) => {
      console.log(book.coverImage);
    });

    setIsMounted(true); // Ensure routing only happens on the client side
  }, [books]);

  const handleBookClick = (bookId: string) => {
    if (isMounted) {
      router.push(`/read/${bookId}?userId=${userId}`);
    }
  };

  return (
    <div style={styles.gridContainer}>
      {books.map((book) => (
        <div
          key={book.id}
          style={styles.bookCard}
          onClick={() => handleBookClick(book.id)}
        >
          <img
            src={book.coverImage}
            alt={book.title}
            style={styles.coverImage}
          />
          <div style={styles.bookInfo}>
            <div style={styles.bookTitle}>{book.title}</div>
            <div style={styles.bookAuthor}>{book.author}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "15px",
    padding: "20px",
  },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  coverImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },
  bookInfo: {
    padding: "10px",
  },
  bookTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "5px",
  },
  bookAuthor: {
    fontSize: "14px",
    color: "#777",
  },
  openLink: {
    display: "inline-block",
    marginTop: "10px",
    padding: "5px 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "5px",
    textDecoration: "none",
    textAlign: "center",
  },
};

export default BookGrid;

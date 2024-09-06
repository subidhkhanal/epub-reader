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
  isDarkTheme: boolean; // Add this prop to pass the current theme
}

const BookGrid: React.FC<BookGridProps> = ({ books, userId, isDarkTheme }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensure routing only happens on the client side
  }, [books]);

  const handleBookClick = (bookId: string) => {
    if (isMounted) {
      router.push(`/read/${bookId}?userId=${userId}`);
    }
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 p-5">
      {books.map((book) => (
        <div
          key={book.id}
          className={`${
            isDarkTheme
              ? "bg-white dark:bg-gray-800 rounded-lg overflow-hidden  cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              : "bg-white rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
          }`}
          onClick={() => handleBookClick(book.id)}
        >
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-[220px] object-cover"
          />
          <div className="p-4">
            <div
              className={`${
                isDarkTheme
                  ? "text-lg font-bold text-gray-900 dark:text-gray-100 mb-2"
                  : "text-lg font-bold text-gray-800 mb-2"
              }`}
            >
              {book.title}
            </div>
            <div
              className={`${
                isDarkTheme
                  ? "text-sm text-gray-600 dark:text-gray-400"
                  : "text-sm text-gray-600"
              }`}
            >
              {book.author}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookGrid;

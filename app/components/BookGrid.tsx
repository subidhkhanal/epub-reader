import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteBook } from "../utils/bookOperations";
import { FaTrash } from "react-icons/fa";

interface BookGridProps {
  books: Array<{
    id: string;
    title: string;
    author: string;
    coverImage: string;
    epubPath: string;
  }>;
  userId: string;
  isDarkTheme: boolean;
  onBookDeleted?: () => void;
}

const BookGrid: React.FC<BookGridProps> = ({
  books,
  userId,
  isDarkTheme,
  onBookDeleted,
}) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, [books]);

  const handleBookClick = (bookId: string) => {
    if (isMounted) {
      router.push(`/read/${bookId}?userId=${userId}`);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    book: { id: string; epubPath: string }
  ) => {
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this book?")) {
      setIsDeleting(book.id);
      try {
        const result = await deleteBook(userId, book.id, book.epubPath);
        if (result.success) {
          onBookDeleted?.();
        } else {
          alert(
            `Failed to delete the book: ${result.details || "Unknown error"}`
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`An error occurred while deleting the book: ${errorMessage}`);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 p-5">
      {books.map((book) => (
        <div
          key={book.id}
          className={`relative group ${
            isDarkTheme
              ? "bg-white dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-xl"
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

          {/* Delete Button */}
          <button
            onClick={(e) =>
              handleDelete(e, { id: book.id, epubPath: book.epubPath })
            }
            className={`absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isDarkTheme
                ? "bg-gray-800 hover:bg-red-600 text-white"
                : "bg-white hover:bg-red-600 hover:text-white"
            } ${isDeleting === book.id ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={isDeleting === book.id}
          >
            {isDeleting === book.id ? (
              <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
            ) : (
              <FaTrash className="w-4 h-4" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookGrid;

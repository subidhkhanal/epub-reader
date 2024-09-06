/** @format */

// This page have the main layout for the epub reader
/** @format */

"use client";

import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import EpubReader from "@/app/components/EpubReader";
import { ThemeContext } from "@/app/context/ThemeContext"; // Import ThemeContext

const ReadBook: React.FC = () => {
  const { slug } = useParams(); // Access the dynamic segment
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Untitled");
  const [currentChapter, setCurrentChapter] = useState<string>("");
  //@ts-ignore
  const { isDarkTheme } = useContext(ThemeContext); // Access the theme from the context

  useEffect(() => {
    const fetchBook = async () => {
      //@ts-ignore
      const encodedSlug = encodeURIComponent(slug); // Encode the slug
      // console.log("Fetching book with encoded slug:", encodedSlug);

      try {
        //@ts-ignore
        const bookDoc = doc(db, "users", userId, "books", encodedSlug);
        const bookSnapshot = await getDoc(bookDoc);

        if (bookSnapshot.exists()) {
          const bookData = bookSnapshot.data();
          setFileUrl(bookData?.fileUrl || null);
          setTitle(bookData?.title || "Untitled");
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBook();
  }, [slug, userId]);

  if (!fileUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`flex flex-col h-screen transition-colors duration-300 ${
        isDarkTheme ? "bg-[#1c1c28] text-white" : "bg-[#f4f4f9] text-gray-900"
      }`}
    >
      <EpubReader fileUrl={fileUrl} onChapterChange={setCurrentChapter} />
    </div>
  );
};

export default ReadBook;

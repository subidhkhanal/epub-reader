/** @format */

// This page have the main layout for the epub reader
/** @format */

"use client";

import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import EpubReader from "@/app/components/EpubReader";

const ReadBook: React.FC = () => {
  const { slug } = useParams(); // Access the dynamic segment
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Untitled");
  const [currentChapter, setCurrentChapter] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState<number>(0);

  useEffect(() => {
    const fetchBook = async () => {
      //@ts-ignore
      const encodedSlug = encodeURIComponent(slug); // Encode the slug
      console.log("Fetching book with encoded slug:", encodedSlug);

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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <EpubReader
        fileUrl={fileUrl}
        onChapterChange={setCurrentChapter}
        onProgressChange={setReadingProgress}
      />
      {/* <footer
        style={{
          // backgroundColor: "#f4f4f4",
          padding: "10px",
          textAlign: "center",
          // borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
        }}
      >
        <div style={{ marginLeft: "10px" }}>{currentChapter}</div>
        <div style={{ marginRight: "10px" }}>
          {Math.round(readingProgress)}%
        </div>
      </footer> */}
    </div>
  );
};

export default ReadBook;

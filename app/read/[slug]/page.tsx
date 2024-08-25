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
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const fetchBook = async () => {
      if (slug && userId) {
        try {
          //@ts-ignore
          const bookDoc = doc(db, "users", userId, "books", slug);
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
      }
    };

    fetchBook();
  }, [slug, userId]);

  if (!fileUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{title}</h1>
      <EpubReader fileUrl={fileUrl} />
    </div>
  );
};

export default ReadBook;

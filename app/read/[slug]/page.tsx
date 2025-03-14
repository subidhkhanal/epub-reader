"use client";

import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import EpubReader from "@/app/components/epub/EpubReader";
import Navbar from "@/app/components/epub/Navbar"; // Import the Navbar component

interface TocElement {
  label: string;
  href: string;
}

const ReadBook: React.FC = () => {
  // Client-side hydration flag
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks regardless of mounted state
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Untitled");
  const [currentChapter, setCurrentChapter] = useState<string>("");
  const [isTOCVisible, setIsTOCVisible] = useState<boolean>(false);
  const [isSettingVisible, setIsSettingVisible] = useState<boolean>(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(false);
  const [isnavbarActive, setIsNavbarActive] = useState(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [chapters, setChapters] = useState<TocElement[]>([]);

  // Initialize currentFlow based on localStorage or window width
  const [currentFlow, setCurrentFlow] = useState(() => {
    if (typeof window !== "undefined") {
      const savedFlow = localStorage.getItem("currentFlow");
      return savedFlow
        ? savedFlow
        : window.innerWidth < 940
        ? "scrolled"
        : "paginated";
    }
    return "paginated";
  });

  // Initialize theme based on localStorage or default to dark theme
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("isDarkTheme");
      return savedTheme === "true";
    }
    return true;
  });

  // Update reading progress based on the current chapter index
  const updateReadingProgress = (
    currentChapter: string,
    totalChapters: number
  ) => {
    const chapterIndex = chapters.findIndex(
      (chapter) => chapter.href === currentChapter
    );
    if (chapterIndex !== -1 && totalChapters > 0) {
      const progress = ((chapterIndex + 1) / totalChapters) * 100;
      console.log(
        `Current Chapter Index: ${chapterIndex}, Total Chapters: ${totalChapters}, Progress: ${progress}%`
      );
      setReadingProgress(progress);
    } else {
      console.log("Chapter not found or total chapters is zero.");
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      //@ts-ignore
      const encodedSlug = encodeURIComponent(slug); // Encode the slug
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

  useEffect(() => {
    if (chapters.length > 0 && currentChapter) {
      updateReadingProgress(currentChapter, chapters.length);
    }
  }, [chapters, currentChapter]);

  // Render the UI only after hydration, but always call hooks
  return (
    <>
      {!mounted ? null : (
        <div
          className={`flex flex-col h-screen transition-colors duration-300 ${
            isDarkTheme
              ? "bg-[#000000] text-white"
              : "bg-[#f4f4f9] text-gray-900"
          }`}
        >
          <Navbar
            title={title}
            isDarkTheme={isDarkTheme}
            setIsTOCVisible={setIsTOCVisible}
            isTOCVisible={isTOCVisible}
            setIsNavbarActive={setIsNavbarActive}
            isNavbarVisible={isNavbarVisible}
            setIsSettingVisible={setIsSettingVisible}
            isSettingVisible={isSettingVisible}
          />
          <EpubReader
            fileUrl={fileUrl!}
            onChapterChange={(chapter) => {
              console.log(`Chapter changed to: ${chapter}`);
              setCurrentChapter(chapter);
              if (chapters.length > 0) {
                updateReadingProgress(chapter, chapters.length);
              } else {
                console.log("Chapters array is not yet populated.");
              }
            }}
            updateChapters={setChapters}
            isDarkTheme={isDarkTheme}
            setIsDarkTheme={setIsDarkTheme}
            isTOCVisible={isTOCVisible}
            setIsNavbarVisible={setIsNavbarVisible}
            isnavbarActive={isNavbarVisible}
            setIsTOCVisible={setIsTOCVisible}
            setIsSettingVisible={setIsSettingVisible}
            isSettingVisible={isSettingVisible}
            currentFlow={currentFlow}
            setCurrentFlow={setCurrentFlow}
          />
          <div
            className={`w-full h-2 ${
              isDarkTheme ? "bg-gray-700" : "bg-gray-300"
            }`}
          >
            <div
              className={`h-full ${
                isDarkTheme ? "bg-blue-400" : "bg-blue-500"
              }`}
              style={{ width: `${readingProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReadBook;

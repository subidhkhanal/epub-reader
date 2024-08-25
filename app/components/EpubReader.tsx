/** @format */

import React, { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition, NavItem, Location } from "epubjs";
import { useAuthState } from "react-firebase-hooks/auth"; // Import the hook
import { auth } from "@/firebaseConfig";
import { saveUserData, loadUserData } from "../utils/firebaseFunctions";

interface EpubReaderProps {
  file: File | null;
}

const EpubReader: React.FC<EpubReaderProps> = ({ file }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [toc, setToc] = useState<NavItem[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [user] = useAuthState(auth); // Use the useAuthState hook

  const bookId = file?.name;

  useEffect(() => {
    if (file && viewerRef.current && user) {
      const loadedBook = ePub(file);

      loadUserData(user.uid, bookId).then((userData) => {
        const loadedRendition = loadedBook.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          flow: "scrolled",
        });

        if (userData?.location) {
          loadedRendition.display(userData.location);
        } else {
          loadedRendition.display();
        }

        setBook(loadedBook);
        setRendition(loadedRendition);

        loadedBook.loaded.navigation.then((nav) => {
          setToc(nav.toc);
        });

        loadedRendition.on("relocated", (location: Location) => {
          const cfi = location.start.cfi;
          saveUserData(user.uid, bookId, { location: cfi });
        });
      });

      return () => {
        if (rendition) {
          rendition.destroy();
        }
      };
    }
  }, [file, user]);

  const goToNextChapter = () => {
    if (rendition && toc.length > 0) {
      const nextIndex = currentChapterIndex + 1;
      if (nextIndex < toc.length) {
        rendition.display(toc[nextIndex].href);
        setCurrentChapterIndex(nextIndex);
      }
    }
  };

  const goToPreviousChapter = () => {
    if (rendition && toc.length > 0) {
      const prevIndex = currentChapterIndex - 1;
      if (prevIndex >= 0) {
        rendition.display(toc[prevIndex].href);
        setCurrentChapterIndex(prevIndex);
      }
    }
  };

  const goToLocation = (href: string, index: number) => {
    if (rendition) {
      rendition.display(href);
      setCurrentChapterIndex(index);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div id="toc-container">
        <ul>
          {toc.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => goToLocation(item.href, index)}
                className={currentChapterIndex === index ? "active" : ""}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div id="viewer-container">
        <div id="viewer" ref={viewerRef} />
        <button
          id="prev-chapter"
          className="navigation-button"
          onClick={goToPreviousChapter}
        >
          {"<"}
        </button>
        <button
          id="next-chapter"
          className="navigation-button"
          onClick={goToNextChapter}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default EpubReader;

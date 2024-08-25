/** @format */

import React, { useEffect, useRef } from "react";
import ePub, { Book, Rendition } from "epubjs";

interface EpubReaderProps {
  file: File | null;
}

const EpubReader: React.FC<EpubReaderProps> = ({ file }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  let rendition: Rendition | null = null; // Track the rendition to clean it up

  useEffect(() => {
    let book: Book | null = null;

    if (file && viewerRef.current) {
      //@ts-ignore
      const book: Book = ePub(file);
      const rendition = book.renderTo(viewerRef.current, {
        width: "100%",
        height: "100%",
      });
      rendition.display();
      console.log(file.name);
    }
    // Cleanup function to run when the component unmounts or before the effect reruns
    return () => {
      if (rendition) {
        rendition.destroy(); // Cleanup the rendition
        rendition = null; // Clear the reference
      }
      if (book) {
        book.destroy(); // Cleanup the book
        book = null; // Clear the reference
      }
    };
  }, [file]);

  return <div ref={viewerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default EpubReader;

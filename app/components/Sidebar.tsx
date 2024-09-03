/** @format */

import React, { useState, useRef, useEffect } from "react";
import { storage, db, auth } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ePub from "epubjs";
import { FaPlus, FaTimes } from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  onBookUpload: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onBookUpload,
  onClose = () => {},
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [user] = useAuthState(auth);
  const [isHover, setIsHover] = useState(false);

  const handleAddBookClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const bookId = file.name
        .replace(/[\s]+/g, "-") // Replace spaces with hyphens
        .replace(/,/g, "") // Remove commas
        .replace(/&/g, "and") // Replace ampersands with 'and'
        .replace(/[^\w-]+/g, "") // Remove all non-word characters except hyphens
        .toLowerCase(); // Convert to lowercase for consistency

      const storageRef = ref(storage, `books/${user.uid}/${bookId}.epub`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload failed:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          const bookDocRef = doc(db, "users", user.uid, "books", bookId);
          const docSnapshot = await getDoc(bookDocRef);

          if (!docSnapshot.exists()) {
            // Same logic as before
            //@ts-ignore
            const book = ePub(file);
            const metadata = await book.loaded.metadata;
            const coverUrl = await book.coverUrl();

            let coverDownloadURL = "";
            if (coverUrl) {
              const response = await fetch(coverUrl);
              const blob = await response.blob();
              const coverStorageRef = ref(
                storage,
                `covers/${user.uid}/${bookId}.jpg`
              );
              await uploadBytesResumable(coverStorageRef, blob);
              coverDownloadURL = await getDownloadURL(coverStorageRef);
            }

            await setDoc(bookDocRef, {
              title: metadata.title || file.name,
              author: metadata.creator || "Unknown Author",
              fileUrl: downloadURL,
              coverImage: coverDownloadURL,
              uploadedAt: serverTimestamp(),
            });

            console.log(
              `Book ${metadata.title || file.name} saved successfully.`
            );
          } else {
            console.log("Book document already exists. Skipping creation.");
          }

          onBookUpload(); // Notify parent component that a new book was uploaded
        }
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose(); // Close the sidebar
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <aside
        ref={sidebarRef}
        //@ts-ignore

        style={{
          ...styles.sidebar,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div style={styles.header}>
          <span style={styles.title}>My Library</span>
        </div>
        <button
          style={
            isHover
              ? { ...styles.addButton, ...styles.addButtonHover }
              : styles.addButton
          }
          onClick={handleAddBookClick}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <FaPlus style={styles.addIcon} /> Add Book
        </button>
        <input
          type="file"
          accept=".epub"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </aside>
      {isOpen && (
        <div
          //@ts-ignore

          style={styles.backdrop}
          onClick={onClose} // Close the sidebar when clicking on the backdrop
        ></div>
      )}
    </>
  );
};

const styles = {
  sidebar: {
    width: "210px",
    padding: "20px",
    backgroundColor: "#f8f9fa", // Light gray background for a clean look
    color: "#343a40", // Dark gray text for contrast
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    transition: "transform 0.3s ease-in-out",
    zIndex: 1000, // Ensure it appears above other content
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)", // Subtle shadow for depth
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#212529", // Even darker gray for titles
  },
  closeIcon: {
    cursor: "pointer",
    fontSize: "1.2rem",
    color: "#adb5bd", // Subtle gray for the close icon
  },
  addButton: {
    backgroundColor: "#374151", // A modern, fresh green color
    color: "#fff",
    padding: "12px 20px",
    border: "none",
    borderRadius: "30px", // Rounded corners for a modern look
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "background-color 0.3s ease, transform 0.2s ease", // Smooth hover effect
  },
  addButtonHover: {
    backgroundColor: "#2d3643", // Slightly darker color for hover
    transform: "scale(1.05)", // Slightly enlarge on hover
  },
  addIcon: {
    marginRight: "8px",
  },
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Slightly lighter backdrop for a softer overlay
    zIndex: 999, // Below the sidebar but above the main content
  },
};

export default Sidebar;

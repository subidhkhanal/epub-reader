/** @format */

import React, { useRef } from "react";
import { storage, db, auth } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ePub from "epubjs"; // Import epub.js library

interface SidebarProps {
  isOpen: boolean;
  onBookUpload: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onBookUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user] = useAuthState(auth);

  const handleAddBookClick = () => {
    fileInputRef.current?.click(); // Trigger file input click
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const bookId = file.name.replace(/\s+/g, "-").toLowerCase(); // Generate a unique ID based on the file name
      const storageRef = ref(storage, `books/${user.uid}/${file.name}`);
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

          // Extract metadata using epub.js
          const book = ePub(file);
          const metadata = await book.loaded.metadata; // Extract title and author
          const coverUrl = await book.coverUrl(); // Extract cover image URL

          let coverDownloadURL = "";
          if (coverUrl) {
            const response = await fetch(coverUrl);
            const blob = await response.blob();
            const coverStorageRef = ref(
              storage,
              `covers/${user.uid}/${file.name}.jpg`
            );
            const coverUploadTask = await uploadBytesResumable(
              coverStorageRef,
              blob
            );
            coverDownloadURL = await getDownloadURL(coverStorageRef);
          }

          // Save metadata to Firestore with setDoc to avoid duplicate entries
          const bookDocRef = doc(db, "users", user.uid, "books", bookId);
          await setDoc(bookDocRef, {
            title: metadata.title || file.name, // Save the title
            author: metadata.creator || "Unknown Author", // Save the author
            fileUrl: downloadURL,
            coverImage: coverDownloadURL, // Store cover image URL
            uploadedAt: serverTimestamp(),
          });

          onBookUpload(); // Notify parent component that a new book was uploaded
        }
      );
    }
  };

  return (
    <aside
      style={{
        ...styles.sidebar,
        transform: isOpen ? "translateX(0)" : "translateX(-200px)",
      }}
    >
      <button style={styles.addButton} onClick={handleAddBookClick}>
        + Add Book
      </button>
      <input
        type="file"
        accept=".epub"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <ul style={styles.menuList}>
        <li style={styles.menuItem}>
          <a href="#">All</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">OldBook</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">TextBook</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">French</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">Novel</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">Fiction</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">Science</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">Art</a>
        </li>
        <li style={styles.menuItem}>
          <a href="#">Manage Category</a>
        </li>
      </ul>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "200px",
    padding: "20px",
    backgroundColor: "#333",
    color: "#fff",
    borderRight: "1px solid #ccc",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    transition: "transform 0.3s ease-in-out",
    zIndex: 1000,
  },
  addButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    marginBottom: "20px",
    width: "100%",
    cursor: "pointer",
  },
  menuList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  menuItem: {
    marginBottom: "20px",
    fontSize: "16px",
  },
};

export default Sidebar;

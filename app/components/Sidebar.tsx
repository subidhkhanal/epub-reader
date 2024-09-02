/** @format */

import React, { useRef, useEffect } from "react";
import { storage, db, auth } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ePub from "epubjs";

interface SidebarProps {
  isOpen: boolean;
  onBookUpload: () => void;
  onClose?: () => void; // Make onClose optional
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onBookUpload,
  onClose = () => {},
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [user] = useAuthState(auth);

  const handleAddBookClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const bookId = file.name.replace(/\s+/g, "-").toLowerCase();
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

          const bookDocRef = doc(db, "users", user.uid, "books", bookId);
          const docSnapshot = await getDoc(bookDocRef);

          if (!docSnapshot.exists()) {
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
                `covers/${user.uid}/${file.name}.jpg`
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

  // Close sidebar if clicked outside of it
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
    width: "250px",
    padding: "20px",
    backgroundColor: "#333",
    color: "#fff",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    transition: "transform 0.3s ease-in-out",
    zIndex: 1000, // Ensure it appears above other content
    boxShadow: "2px 0 5px rgba(0,0,0,0.5)", // Add a subtle shadow
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
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999, // Below the sidebar but above the main content
  },
};

export default Sidebar;

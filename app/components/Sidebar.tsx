/** @format */

import React, { useRef } from "react";
import { storage, db, auth } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const Sidebar: React.FC<{ onBookUpload: () => void }> = ({ onBookUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user] = useAuthState(auth);

  const handleAddBookClick = () => {
    fileInputRef.current?.click(); // Trigger file input click
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
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

          // Save metadata to Firestore
          await addDoc(collection(db, "users", user.uid, "books"), {
            title: file.name,
            fileUrl: downloadURL,
            uploadedAt: serverTimestamp(),
          });

          onBookUpload(); // Notify parent component that a new book was uploaded
        }
      );
    }
  };

  return (
    <div className="sidebar">
      <button className="add-book-button" onClick={handleAddBookClick}>
        + Add Book
      </button>
      <input
        type="file"
        accept=".epub"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="categories">
        <ul>
          <li>All</li>
          <li>OldBook</li>
          <li>TextBook</li>
          <li>French</li>
          <li>Novel</li>
          <li>Fiction</li>
          <li>Science</li>
          <li>Art</li>
          <li>Manage Category</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

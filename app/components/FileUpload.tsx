/** @format */
"use client";
// components/FileUpload.tsx
import React, { useState, useEffect } from "react";
import { storage, db, auth } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

interface Book {
  id: string;
  title: string;
  fileUrl: string;
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const fetchBooks = async () => {
        const booksCollection = collection(db, "users", user.uid, "books");
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map((doc) => ({
          //@ts-ignore
          id: doc.id,
          ...(doc.data() as Book),
        }));
        setBooks(booksList);
      };
      fetchBooks();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    setUploading(true);

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
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File available at", downloadURL);

        // Save metadata to Firestore
        const docRef = await addDoc(
          collection(db, "users", user.uid, "books"),
          {
            title: file.name,
            fileUrl: downloadURL,
            uploadedAt: serverTimestamp(),
          }
        );

        setBooks((prevBooks) => [
          ...prevBooks,
          { id: docRef.id, title: file.name, fileUrl: downloadURL },
        ]);

        setUploading(false);
        setFile(null);
      }
    );
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <input type="file" accept=".epub" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      <div className="uploaded-books" style={{ marginTop: "20px" }}>
        {books.map((book) => (
          <div
            key={book.id}
            className="uploaded-book"
            style={{ marginBottom: "10px" }}
          >
            <p>{book.title}</p>
            <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
              Read
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FileUpload;

// AddBook.tsx
import React, { useState, useRef } from "react";
import { storage, db, auth, provider } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ePub from "epubjs";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";

interface AddBookProps {
  isDarkTheme: boolean;
}

const AddBook: React.FC<AddBookProps> = ({ isDarkTheme }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user] = useAuthState(auth);
  const [isHover, setIsHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleAddBookClick = async () => {
    if (!user) {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Google Sign-In error:", error);
        return;
      }
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const bookId = file.name
        .replace(/[\s]+/g, "-")
        .replace(/,/g, "")
        .replace(/&/g, "and")
        .replace(/[^\w-]+/g, "")
        .toLowerCase();

      const storageRef = ref(storage, `books/${user.uid}/${bookId}.epub`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploading(true);
      setUploadProgress(0);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

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
          }

          setUploading(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
          window.location.reload();
        }
      );
    }
  };

  return (
    <div>
      <button
        className={`${
          isHover || uploading
            ? "bg-gray-700 hover:scale-105"
            : isDarkTheme
            ? "bg-[#3c444f] hover:bg-gray-500 text-[#e8e6e3]"
            : "bg-gray-600 hover:bg-gray-500 text-white"
        } py-3 px-5 rounded-full flex items-center justify-center font-bold text-base transition-all duration-200 ease-in-out`}
        onClick={handleAddBookClick}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />{" "}
            {uploadProgress && `${Math.round(uploadProgress)}% Uploading...`}
          </>
        ) : (
          <>
            <FaPlus className="mr-2" /> Add Book
          </>
        )}
      </button>
      {uploadSuccess && (
        <div className="mt-5 p-3 bg-green-500 text-white text-center rounded-lg sm:hidden block">
          Book uploaded successfully!
        </div>
      )}
      <input
        type="file"
        accept=".epub"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AddBook;

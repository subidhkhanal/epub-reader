// AddBook.tsx
import React, { useState, useRef } from "react";
import { storage, db, auth, provider } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ePub from "epubjs";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import Toast from "./Toast";

interface AddBookProps {
  isDarkTheme: boolean;
}

const AddBook: React.FC<AddBookProps> = ({ isDarkTheme }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user] = useAuthState(auth);
  const [isHover, setIsHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    duration: number;
  } | null>(null);

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

      const bookDocRef = doc(db, "users", user.uid, "books", bookId);
      const docSnapshot = await getDoc(bookDocRef);

      if (docSnapshot.exists()) {
        setNotification({
          type: "error",
          message: "Book already exists in library",
          duration: 2000,
        });
        return;
      }

      const storageRef = ref(storage, `books/${user.uid}/${bookId}.epub`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploading(true);
      setUploadProgress(0);

      uploadTask.on(
        "state_changed",
        //@ts-ignore
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        //@ts-ignore
        (error) => {
          console.error("Upload failed:", error);
          setUploading(false);
          setNotification({
            type: "error",
            message: "Upload failed. Try again",
            duration: 2000,
          });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

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

          setUploading(false);
          setNotification({
            type: "success",
            message: "Book uploaded!",
            duration: 3000,
          });
          setTimeout(() => window.location.reload(), 1500);
        }
      );
    }
  };

  return (
    <>
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={notification.duration}
        />
      )}

      <div className="w-full max-w-md mx-auto px-2 sm:px-4">
        <div className="relative">
          <button
            className={`${
              isHover || uploading
                ? "bg-gray-700 hover:scale-105"
                : isDarkTheme
                ? "bg-[#3c444f] hover:bg-gray-500 text-[#e8e6e3]"
                : "bg-gray-600 hover:bg-gray-500 text-white"
            } w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-5 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-200 ease-in-out`}
            onClick={handleAddBookClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            disabled={uploading}
          >
            {uploading ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">
                  {uploadProgress
                    ? `${Math.round(uploadProgress)}%`
                    : "Preparing..."}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Add Book</span>
              </div>
            )}
          </button>

          {/* Upload Progress Bar */}
          {uploading && uploadProgress !== null && (
            <div className="absolute -bottom-2 left-0 right-0 px-1 sm:px-2">
              <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700 overflow-hidden">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        accept=".epub"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
          setNotification(null);
        }}
      />
    </>
  );
};

export default AddBook;

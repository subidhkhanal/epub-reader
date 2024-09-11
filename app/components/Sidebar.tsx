import React, { useState, useRef, useEffect } from "react";
import { storage, db, auth, provider } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ePub from "epubjs";
import { FaPlus, FaTimes, FaSpinner } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth"; // Import signInWithPopup

interface SidebarProps {
  isOpen: boolean;
  onBookUpload: () => void;
  onClose?: () => void;
  isDarkTheme: boolean; // Add the dark theme prop
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onBookUpload,
  onClose = () => {},
  isDarkTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [user] = useAuthState(auth);
  const [isHover, setIsHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleAddBookClick = async () => {
    // If the user is not signed in, trigger Google sign-in
    if (!user) {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Google Sign-In error:", error);
        return;
      }
    }

    // After successful sign-in, allow the file input to be clicked
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
          setTimeout(() => setUploadSuccess(false), 3000); // Auto-hide success after 3s
          onBookUpload();
          window.location.reload();
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
        onClose();
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
        className={`fixed top-0 left-0 h-screen w-[210px] p-5 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50 shadow-lg flex flex-col gap-5
          transition-colors duration-500 ease-in-out
          ${
            isDarkTheme
              ? "bg-[#18212f] text-[#F3F4F6]"
              : "bg-gray-100 text-gray-800"
          }
        `}
      >
        <div className="flex justify-between items-center mb-5">
          <span
            className={`text-2xl font-bold ${
              isDarkTheme ? "text-white" : "text-gray-900"
            }`}
          >
            My Library
          </span>
        </div>
        <button
          className={`${
            isHover || uploading
              ? "bg-gray-700 hover:scale-105"
              : isDarkTheme
              ? "bg-[#3c444f] hover:bg-gray-500 text-[#e8e6e3]"
              : "bg-gray-600 hover:bg-gray-500 text-white"
          }  py-3 px-5 rounded-full flex items-center justify-center font-bold text-base transition-all duration-200 ease-in-out`}
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
          <div className="mt-5 p-3 bg-green-500 text-white text-center rounded-lg">
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
      </aside>
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 z-40"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default Sidebar;

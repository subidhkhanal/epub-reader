import React, { useRef } from "react";
import { storage, db, auth } from "@/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ePub from "epubjs";

interface SidebarProps {
  isOpen: boolean;
  onBookUpload: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onBookUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  return (
    <aside
      //@ts-ignore

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
};

export default Sidebar;

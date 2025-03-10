import { db, storage } from "@/firebaseConfig";
import { doc, deleteDoc, collection, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export const deleteBook = async (
  userId: string,
  bookId: string,
  epubPath: string
) => {
  try {
    if (!userId || !bookId) {
      return { success: false, error: "Missing user ID or book ID" };
    }

    // First, get the book document to ensure we have the correct path
    const bookRef = doc(db, "users", userId, "books", bookId);
    const bookDoc = await getDoc(bookRef);

    if (!bookDoc.exists()) {
      return { success: false, error: "Book not found in database" };
    }

    const bookData = bookDoc.data();
    // Try different possible path fields
    const storagePath =
      epubPath ||
      bookData.epubUrl ||
      bookData.epubPath ||
      `books/${userId}/${bookId}`;

    // Delete the book document from Firestore
    await deleteDoc(bookRef);

    try {
      // Try to delete the EPUB file from Storage
      const epubRef = ref(storage, storagePath);
      await deleteObject(epubRef);
    } catch (storageError) {
      // Silently handle storage deletion errors in production
      // The file might have been moved or already deleted
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error,
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

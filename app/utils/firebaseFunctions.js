/** @format */

// src/utils/firebaseFunctions.js

import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Save highlights and notes to Firestore
export const saveHighlight = async (userId, bookId, highlight) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);

  // First, get the document to check if the highlights array exists
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // If the document doesn't exist, create it with an empty highlights array
    await setDoc(userDocRef, { highlights: [] });
  } else if (!userDoc.data().highlights) {
    // If the document exists but the highlights array doesn't, initialize it
    await updateDoc(userDocRef, { highlights: [] });
  }

  // Now safely add the highlight to the array
  await updateDoc(userDocRef, {
    highlights: arrayUnion(highlight),
  });
};

// Load highlights and notes from Firestore
export const loadHighlights = async (userId, bookId) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data().highlights : [];
};

// Save the user's current reading position
export const saveUserData = async (userId, bookId, data) => {
  try {
    const userDocRef = doc(db, "users", userId, "books", bookId);
    await setDoc(userDocRef, data, { merge: true }); // Use merge to update only the fields that have changed
    console.log("User data saved successfully:");
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

// Load the user's data (e.g., reading position)
export const loadUserData = async (userId, bookId) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data() : null;
};

// Save a bookmark to Firestore
export const saveBookmark = async (userId, bookId, bookmark) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);

  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // If the document doesn't exist, create it with an empty bookmarks array
    await setDoc(userDocRef, { bookmarks: [] });
  } else if (!userDoc.data().bookmarks) {
    // If the document exists but the bookmarks array doesn't, initialize it
    await updateDoc(userDocRef, { bookmarks: [] });
  }

  // Add the new bookmark to the array
  await updateDoc(userDocRef, {
    bookmarks: arrayUnion(bookmark),
  });
};

// Load bookmarks from Firestore
export const loadBookmarks = async (userId, bookId) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data().bookmarks || [] : [];
};

export const removeHighlightFromDatabase = async (userId, bookId, cfiRange) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);

  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const highlights = userDoc.data().highlights || [];
      const updatedHighlights = highlights.filter(
        (highlight) => highlight.cfiRange !== cfiRange
      );
      await updateDoc(userDocRef, { highlights: updatedHighlights });
    }
  } catch (error) {
    console.error("Error removing highlight from database:", error);
  }
};

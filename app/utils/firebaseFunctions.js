/** @format */

// src/utils/firebaseFunctions.js

import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Save user data to Firestore
export const saveUserData = async (userId, bookId, data) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);
  await setDoc(userDocRef, data, { merge: true });
};

// Load user data from Firestore
export const loadUserData = async (userId, bookId) => {
  const userDocRef = doc(db, "users", userId, "books", bookId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data() : null;
};

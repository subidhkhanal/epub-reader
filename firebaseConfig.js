/** @format */

// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKZSeuFs-ypR2P5mWL73ltgcBjKXODnz4",
  authDomain: "epub-reader-25822.firebaseapp.com",
  projectId: "epub-reader-25822",
  storageBucket: "epub-reader-25822.appspot.com",
  messagingSenderId: "466613851505",
  appId: "1:466613851505:web:7f686974ed35d4e88312d0",
  measurementId: "G-57T2PMMFKG",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, provider };

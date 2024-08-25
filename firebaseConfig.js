/** @format */

// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1d3FMM_omdq7MhxXDRK83pIyWtETPR3E",
  authDomain: "epub-reader-31566.firebaseapp.com",
  projectId: "epub-reader-31566",
  storageBucket: "epub-reader-31566.appspot.com",
  messagingSenderId: "521582493694",
  appId: "1:521582493694:web:baf62539df7038231fcaaf",
  measurementId: "G-VWMVCJ3M9M",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

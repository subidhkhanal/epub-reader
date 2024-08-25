/** @format */

// app/page.tsx

"use client";

import React, { useState } from "react";
import FileUpload from "@/app/components/FileUpload";
import EpubReader from "@/app/components/EpubReader";
import Auth from "@/app/components/Auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [user, loading] = useAuthState(auth);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth onAuth={(user) => console.log("Logged in as:", user.email)} />;
  }

  return (
    <div>
      {!selectedFile ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Welcome, {user.email}</h1>
          <input
            type="file"
            accept=".epub"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            style={{ display: "block", margin: "20px auto" }}
          />
        </div>
      ) : (
        <EpubReader file={selectedFile} />
      )}
    </div>
  );
};

export default Home;

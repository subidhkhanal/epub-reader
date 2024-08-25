/** @format */

// app/page.tsx

"use client";

import React, { useState } from "react";
import FileUpload from "@/app/components/FileUpload";
import EpubReader from "@/app/components/EpubReader";

const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  return (
    <div>
      <div>
        {!selectedFile ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <EpubReader file={selectedFile} />
        )}
      </div>
    </div>
  );
};

export default Home;

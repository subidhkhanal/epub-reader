/** @format */

// app/page.tsx

"use client";

import React, { useState } from "react";
import FileUpload from "@/app/components/FileUpload";
import EpubReader from "@/app/components/EpubReader";

const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div>
      <h1>EPUB Reader</h1>
      <FileUpload onFileSelect={setSelectedFile} />
      {selectedFile && (
        <EpubReader key={selectedFile.name} file={selectedFile} />
      )}
    </div>
  );
};

export default Home;

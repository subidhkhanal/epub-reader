/** @format */

import React, { useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".epub" onChange={handleFileChange} />
      {selectedFile && <p>Selected File: {selectedFile.name}</p>}
    </div>
  );
};

export default FileUpload;

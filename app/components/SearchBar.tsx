/** @format */

import React from "react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div style={styles.searchBar}>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />
    </div>
  );
};

const styles = {
  searchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#eef2f3",
    borderRadius: "20px",
    padding: "5px 15px",
    width: "100%",
    maxWidth: "600px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    width: "100%",
    fontSize: "16px",
    color: "#333",
  },
};

export default SearchBar;

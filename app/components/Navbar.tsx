/** @format */

import React from "react";
import { FaBars, FaSearch, FaEllipsisV } from "react-icons/fa";

interface NavBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onMenuClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  searchTerm,
  setSearchTerm,
  onMenuClick,
}) => {
  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <FaBars style={styles.icon} onClick={onMenuClick} />
        <span style={styles.title}>My books</span>
      </div>
      <div style={styles.centerSection}>
        <div style={styles.searchBar}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>
      <div style={styles.rightSection}>
        <FaEllipsisV style={styles.icon} />
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#673ab7", // Purple color
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    position: "fixed", // Keep the navbar fixed at the top
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    marginLeft: "10px",
    fontWeight: "bold",
    fontSize: "20px",
  },
  centerSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "5px 15px",
    width: "100%",
    maxWidth: "500px",
  },
  searchIcon: {
    color: "#777",
    marginRight: "10px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    width: "100%",
    fontSize: "16px",
    color: "#333",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    fontSize: "20px",
    cursor: "pointer",
  },
};

export default NavBar;

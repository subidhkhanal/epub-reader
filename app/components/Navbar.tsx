/** @format */

import React from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, provider } from "@/firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";

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
  const [user] = useAuthState(auth);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign Out error:", error);
    }
  };

  return (
    //@ts-ignore
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <FaBars style={styles.icon} onClick={onMenuClick} />
        <span style={styles.title}>My Books</span>
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
        {user ? (
          <div style={styles.userSection}>
            <img
              src={user.photoURL || ""}
              alt="User Avatar"
              style={styles.avatar}
              onClick={handleSignOut}
            />
            <span style={styles.userName}>{user.displayName}</span>
          </div>
        ) : (
          <button style={styles.signInButton} onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>
        )}
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
  signInButton: {
    backgroundColor: "#4285F4",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "10px",
    cursor: "pointer",
  },
  userName: {
    color: "#fff",
  },
  icon: {
    fontSize: "20px",
    cursor: "pointer",
  },
};

export default NavBar;

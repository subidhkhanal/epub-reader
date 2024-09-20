// Sidebar.tsx
import React, { useRef, useEffect } from "react";
import AddBook from "./AddBook"; // Import the AddBook component

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isDarkTheme: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose = () => {},
  isDarkTheme,
}) => {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-[210px] p-5 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50 shadow-lg flex flex-col gap-5
          transition-colors duration-500 ease-in-out
          ${
            isDarkTheme
              ? "bg-[#18212f] text-[#F3F4F6]"
              : "bg-gray-100 text-gray-800"
          }
        `}
      >
        <AddBook isDarkTheme={isDarkTheme} />
      </aside>
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 z-40"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default Sidebar;

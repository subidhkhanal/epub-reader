/** @format */

import React, { useEffect, useState, useRef } from "react";
import { saveHighlight } from "../utils/firebaseFunctions";
import { Rendition } from "epubjs";

interface HighlightMenuProps {
  position: { top: number; left: number };
  selectedCFIRange: string | null;
  highlightedText: string | null;
  userId: string;
  bookId: string;
  rendition: Rendition | null;
  closeMenu: () => void;
}

const HighlightMenu: React.FC<HighlightMenuProps> = ({
  position,
  selectedCFIRange,
  highlightedText,
  userId,
  bookId,
  rendition,
  closeMenu,
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState({
    top: position.top,
    left: position.left,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  const menuHeight = 40; // Approx height of your menu
  const menuWidth = 220; // Adjust width based on the number of buttons and spacing
  const padding = 8; // Space between text and menu

  const addHighlight = async (color: string) => {
    if (highlightedText && selectedCFIRange) {
      const highlight = {
        cfiRange: selectedCFIRange,
        text: highlightedText,
        note: "", // Add a note if needed
        color: color,
      };

      try {
        await saveHighlight(userId, bookId, highlight);
        rendition?.annotations.add(
          "highlight",
          selectedCFIRange,
          {},
          () => {},
          "highlight",
          { fill: color }
        );
        closeMenu(); // Close the menu after adding the highlight
      } catch (error) {
        console.error("Error saving highlight:", error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Adding a listener to clicks within the EPUB rendition
    rendition?.on("click", closeMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      // Removing the EPUB rendition click listener
      rendition?.off("click", closeMenu);
    };
  }, [closeMenu, rendition]);

  useEffect(() => {
    let newTop = position.top - menuHeight - padding; // Position above the selected text by default
    let newLeft = position.left - menuWidth / 2; // Center the menu horizontally relative to the selection

    // Ensure the menu does not overflow the right side of the viewport
    if (newLeft + menuWidth > window.innerWidth) {
      newLeft = window.innerWidth - menuWidth - padding;
    }

    // Ensure the menu does not overflow the left side of the viewport
    if (newLeft < padding) {
      newLeft = padding;
    }

    // Ensure the menu does not overflow the top of the viewport
    if (newTop < window.scrollY + padding) {
      newTop = position.top + padding; // If it overflows, place it below the selection
    }

    setAdjustedPosition({ top: newTop, left: newLeft });
  }, [position]);

  return (
    <div
      ref={menuRef}
      className="absolute p-[5px] border border-solid border-gray-300 rounded-[5px] flex gap-[10px] z-[1000]"
      style={{
        backgroundColor: "white",
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)", // Box shadow for the menu
      }}
    >
      <button
        onClick={() => addHighlight("#FFEB3B")}
        className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
        style={{
          backgroundColor: "#FFEB3B", // Yellow
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)", // Shadow effect for button
        }}
        title="Yellow Highlight"
      />
      <button
        onClick={() => addHighlight("#FF5252")}
        className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
        style={{
          backgroundColor: "#FF5252", // Red
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)", // Shadow effect for button
        }}
        title="Red Highlight"
      />
      <button
        onClick={() => addHighlight("#4CAF50")}
        className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
        style={{
          backgroundColor: "#4CAF50", // Green
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)", // Shadow effect for button
        }}
        title="Green Highlight"
      />
      <button
        onClick={() => addHighlight("#448AFF")}
        className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
        style={{
          backgroundColor: "#448AFF", // Blue
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)", // Shadow effect for button
        }}
        title="Blue Highlight"
      />
    </div>
  );
};

export default HighlightMenu;

import React, { useEffect, useState, useRef } from "react";
import {
  saveHighlight,
  removeHighlightFromDatabase,
} from "../../utils/firebaseFunctions";
import { Rendition } from "epubjs";

interface HighlightMenuProps {
  rendition: Rendition;
  userId: string;
  bookId: string;
  currentFlow: string;
  onClose: () => void;
  onOpen: () => void;
}

const HighlightMenu: React.FC<HighlightMenuProps> = ({
  rendition,
  userId,
  bookId,
  currentFlow,
  onClose,
  onOpen,
}) => {
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [selectedCFIRange, setSelectedCFIRange] = useState<string | null>(null);
  const [highlightMenuPosition, setHighlightMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const addHighlight = async (color: string) => {
    if (highlightedText && selectedCFIRange) {
      const highlight = {
        cfiRange: selectedCFIRange,
        text: highlightedText,
        note: "",
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
        setHighlightMenuPosition(null);
      } catch (error) {
        console.error("Error saving highlight:", error);
      }
    }
  };

  const removeHighlight = async () => {
    if (selectedCFIRange) {
      try {
        // Remove highlight from the database
        await removeHighlightFromDatabase(userId, bookId, selectedCFIRange);
        // Remove highlight from the rendition
        rendition?.annotations.remove(selectedCFIRange, "highlight");
        setHighlightMenuPosition(null);
      } catch (error) {
        console.error("Error removing highlight:", error);
      }
    }
  };

  useEffect(() => {
    const handleTextSelection = (cfiRange: string, contents: any) => {
      const text = contents.window.getSelection()?.toString();
      if (cfiRange && text && text.trim()) {
        setHighlightedText(text);
        setSelectedCFIRange(cfiRange);

        const range = contents.window.getSelection()?.getRangeAt(0);
        const containerWidth =
          //@ts-ignore
          rendition.manager.container.getBoundingClientRect().width;

        if (range) {
          const rect = range.getBoundingClientRect();
          let newTop;
          let newLeft;
          if (currentFlow === "paginated") {
            newTop = rect.top - 50;
            const pageIndex = Math.floor(rect.left / containerWidth);
            if (pageIndex === 0) {
              newLeft = rect.left;
            } else if (pageIndex > 0) {
              newLeft = rect.left - containerWidth * pageIndex;
            }
            const menuWidth = 220;
            const padding = 8;
            if (newLeft + menuWidth > window.innerWidth) {
              newLeft = window.innerWidth - menuWidth - padding;
            }
            if (newLeft < padding) {
              newLeft = padding;
            }
            if (newTop < padding) {
              newTop = rect.bottom + padding;
            }
          } else if (currentFlow === "scrolled") {
            const iframe = contents.document.defaultView.frameElement;
            const iframeRect = iframe.getBoundingClientRect();
            newTop = rect.top + iframeRect.top - 60;
            if (newTop < 0) {
              newTop += 100;
            }
            newLeft = rect.left;
          }

          setHighlightMenuPosition({ top: newTop, left: newLeft });
        }
      } else {
        setHighlightedText(null);
        setSelectedCFIRange(null);
        setHighlightMenuPosition(null);
      }
    };

    rendition.on("selected", handleTextSelection);

    return () => {
      rendition.off("selected", handleTextSelection);
    };
  }, [rendition, currentFlow]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setHighlightMenuPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    rendition?.on("mousedown", () => setHighlightMenuPosition(null));

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      rendition?.off("mousedown", () => setHighlightMenuPosition(null));
    };
  }, [rendition]);

  useEffect(() => {
    if (highlightMenuPosition === null) {
      onClose();
    } else {
      onOpen();
    }
  }, [highlightMenuPosition]);

  return (
    highlightMenuPosition && (
      <div
        ref={menuRef}
        className="absolute p-3 border border-gray-200 rounded-lg flex space-x-2 z-[1000] bg-white/90 backdrop-blur-sm shadow-lg"
        style={{
          top: `${highlightMenuPosition.top}px`,
          left: `${highlightMenuPosition.left}px`,
        }}
      >
        <button
          onClick={() => addHighlight("#FFEB3B")}
          className="w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
          style={{ backgroundColor: "#FFEB3B" }}
          title="Yellow Highlight"
        />
        <button
          onClick={() => addHighlight("#FF5252")}
          className="w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
          style={{ backgroundColor: "#FF5252" }}
          title="Red Highlight"
        />
        <button
          onClick={() => addHighlight("#4CAF50")}
          className="w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
          style={{ backgroundColor: "#4CAF50" }}
          title="Green Highlight"
        />
        <button
          onClick={() => addHighlight("#448AFF")}
          className="w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          style={{ backgroundColor: "#448AFF" }}
          title="Blue Highlight"
        />
        <button
          onClick={removeHighlight}
          className="w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          style={{ backgroundColor: "#FFFFFF" }}
          title="Remove Highlight"
        >
          🗑️
        </button>
      </div>
    )
  );
};

export default HighlightMenu;

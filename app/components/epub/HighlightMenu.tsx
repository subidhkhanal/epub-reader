import React, { useEffect, useState, useRef } from "react";
import {
  saveHighlight,
  removeHighlightFromDatabase,
  loadHighlights,
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
  const [note, setNote] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isExistingHighlight, setIsExistingHighlight] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const loadExistingHighlight = async (cfiRange: string) => {
    try {
      const highlights = await loadHighlights(userId, bookId);
      const existingHighlight = highlights.find(
        (h: any) => h.cfiRange === cfiRange
      );

      if (existingHighlight) {
        setNote(existingHighlight.note || "");
        setSelectedColor(existingHighlight.color);
        setIsExistingHighlight(true);
      } else {
        setNote("");
        setSelectedColor(null);
        setIsExistingHighlight(false);
      }
    } catch (error) {
      console.error("Error loading existing highlight:", error);
    }
  };

  const addHighlight = async (color: string) => {
    if (highlightedText && selectedCFIRange) {
      // If there's already a highlight, remove it first
      if (selectedColor) {
        rendition?.annotations.remove(selectedCFIRange, "highlight");
      }

      setSelectedColor(color);

      // Add the new highlight with the selected color
      rendition?.annotations.add(
        "highlight",
        selectedCFIRange,
        {},
        () => {},
        "highlight",
        { fill: color }
      );

      // Save or update the highlight in the database
      const highlight = {
        cfiRange: selectedCFIRange,
        text: highlightedText,
        note: note,
        color: color,
        timestamp: new Date().toISOString(),
      };

      // Update database in the background
      Promise.resolve().then(async () => {
        try {
          if (selectedColor) {
            await removeHighlightFromDatabase(userId, bookId, selectedCFIRange);
          }
          await saveHighlight(userId, bookId, highlight);
        } catch (error) {
          console.error("Error saving highlight:", error);
        }
      });
    }
  };

  const saveNote = async () => {
    if (highlightedText && selectedCFIRange && selectedColor) {
      const highlight = {
        cfiRange: selectedCFIRange,
        text: highlightedText,
        note: note,
        color: selectedColor,
        timestamp: new Date().toISOString(),
      };

      // Close menu immediately for better UX
      setHighlightMenuPosition(null);

      // Update database in the background
      Promise.resolve().then(async () => {
        try {
          await removeHighlightFromDatabase(userId, bookId, selectedCFIRange);
          await saveHighlight(userId, bookId, highlight);
        } catch (error) {
          console.error("Error saving note:", error);
        }
      });
    }
  };

  const removeHighlight = async () => {
    if (selectedCFIRange) {
      // Remove highlight from UI immediately
      rendition?.annotations.remove(selectedCFIRange, "highlight");
      setHighlightMenuPosition(null);
      setSelectedColor(null);
      setNote("");
      setIsExistingHighlight(false);

      // Update database in the background
      Promise.resolve().then(async () => {
        try {
          await removeHighlightFromDatabase(userId, bookId, selectedCFIRange);
        } catch (error) {
          console.error("Error removing highlight:", error);
        }
      });
    }
  };

  useEffect(() => {
    const handleTextSelection = async (cfiRange: string, contents: any) => {
      const text = contents.window.getSelection()?.toString();
      if (cfiRange && text && text.trim()) {
        setHighlightedText(text);
        setSelectedCFIRange(cfiRange);

        // Load existing highlight data if any
        await loadExistingHighlight(cfiRange);

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
  }, [rendition, currentFlow, userId, bookId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setHighlightMenuPosition(null);
        setNote("");
        setSelectedColor(null);
        setIsExistingHighlight(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    rendition?.on("mousedown", () => {
      setHighlightMenuPosition(null);
      setNote("");
      setSelectedColor(null);
      setIsExistingHighlight(false);
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      rendition?.off("mousedown", () => {
        setHighlightMenuPosition(null);
        setNote("");
        setSelectedColor(null);
        setIsExistingHighlight(false);
      });
    };
  }, [rendition]);

  useEffect(() => {
    if (highlightMenuPosition === null) {
      onClose();
    } else {
      onOpen();
    }
  }, [highlightMenuPosition]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote();
    }
  };

  return (
    highlightMenuPosition && (
      <div
        ref={menuRef}
        className="absolute p-3 border border-gray-200 rounded-lg flex flex-col space-y-3 z-[1000] bg-white/90 backdrop-blur-sm shadow-lg min-w-[220px]"
        style={{
          top: `${highlightMenuPosition.top}px`,
          left: `${highlightMenuPosition.left}px`,
        }}
      >
        <div className="flex space-x-2">
          <button
            onClick={() => addHighlight("#FFEB3B")}
            className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${
              selectedColor === "#FFEB3B"
                ? "ring-2 ring-yellow-400 ring-offset-2"
                : ""
            }`}
            style={{ backgroundColor: "#FFEB3B" }}
            title="Yellow Highlight"
          />
          <button
            onClick={() => addHighlight("#FF5252")}
            className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 ${
              selectedColor === "#FF5252"
                ? "ring-2 ring-red-400 ring-offset-2"
                : ""
            }`}
            style={{ backgroundColor: "#FF5252" }}
            title="Red Highlight"
          />
          <button
            onClick={() => addHighlight("#4CAF50")}
            className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ${
              selectedColor === "#4CAF50"
                ? "ring-2 ring-green-400 ring-offset-2"
                : ""
            }`}
            style={{ backgroundColor: "#4CAF50" }}
            title="Green Highlight"
          />
          <button
            onClick={() => addHighlight("#448AFF")}
            className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
              selectedColor === "#448AFF"
                ? "ring-2 ring-blue-400 ring-offset-2"
                : ""
            }`}
            style={{ backgroundColor: "#448AFF" }}
            title="Blue Highlight"
          />
          <button
            onClick={removeHighlight}
            className="w-10 h-10 rounded-full cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 flex items-center justify-center"
            style={{ backgroundColor: "#FFFFFF" }}
            title="Remove Highlight"
          >
            🗑️
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <textarea
            ref={noteInputRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note (optional)..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={saveNote}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              {isExistingHighlight ? "Update Note" : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default HighlightMenu;

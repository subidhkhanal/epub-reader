import React, { useEffect, useState, useRef } from "react";
import { saveHighlight } from "../../utils/firebaseFunctions";
import { Rendition } from "epubjs";

interface HighlightMenuProps {
  rendition: Rendition;
  userId: string;
  bookId: string;
  currentFlow: string;
  onClose: () => void; // Add onClose prop to manage closing
  onOpen: () => void; // Add onOpen prop to manage opening
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

  const menuHeight = 40;
  const menuWidth = 220;
  const padding = 8;

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
        setHighlightMenuPosition(null); // Close the menu after adding the highlight
      } catch (error) {
        console.error("Error saving highlight:", error);
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
        // Get the width of the iframe or container holding the page
        const containerWidth =
          //@ts-ignore
          rendition.manager.container.getBoundingClientRect().width;

        if (range) {
          const rect = range.getBoundingClientRect();
          let newTop;
          let newLeft;
          if (currentFlow === "paginated") {
            newTop = rect.top - 50;
            // Calculate the current page index based on rect.left and container width
            const pageIndex = Math.floor(rect.left / containerWidth);
            if (pageIndex === 0) {
              newLeft = rect.left;
            } else if (pageIndex > 0) {
              newLeft = rect.left - containerWidth * pageIndex;
            }

            // Adjust position to ensure it stays within the viewport
            const menuHeight = 40; // Approximate menu height
            const menuWidth = 220; // Adjust based on your menu width
            const padding = 8;

            // Ensure menu doesn't overflow the right edge of the screen
            if (newLeft + menuWidth > window.innerWidth) {
              newLeft = window.innerWidth - menuWidth - padding;
            }

            // Ensure menu doesn't overflow the left edge of the screen
            if (newLeft < padding) {
              newLeft = padding;
            }

            // Ensure menu doesn't overflow the top of the screen
            if (newTop < padding) {
              newTop = rect.bottom + padding; // Place it below the text if there's not enough space above
            }
          } else if (currentFlow === "scrolled") {
            // / Get the iframe that contains the EPUB content
            const iframe = contents.document.defaultView.frameElement; // Correct way to access iframe

            // Get the iframe's bounding rect relative to the main document
            const iframeRect = iframe.getBoundingClientRect();

            // Adjust rect values by subtracting the iframe's top and left position
            // console.log("rect", rect);
            // console.log("iframeRect", iframeRect);
            newTop = rect.top + iframeRect.top - 60;
            if (newTop < 0) {
              newTop = newTop + 100;
            }
            console.log("new Top", newTop);
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

    // Handle highlightmenu if clicked outside of epub and arrow keys
    document.addEventListener("mousedown", handleClickOutside);
    // Handle highlightmenu if clicked inside the epub
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
        className="absolute p-[5px] border border-solid border-gray-300 rounded-[5px] flex gap-[10px] z-[1000]"
        style={{
          backgroundColor: "white",
          top: `${highlightMenuPosition.top}px`,
          left: `${highlightMenuPosition.left}px`,
          boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          onClick={() => addHighlight("#FFEB3B")}
          className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
          style={{ backgroundColor: "#FFEB3B" }}
          title="Yellow Highlight"
        />
        <button
          onClick={() => addHighlight("#FF5252")}
          className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
          style={{ backgroundColor: "#FF5252" }}
          title="Red Highlight"
        />
        <button
          onClick={() => addHighlight("#4CAF50")}
          className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
          style={{ backgroundColor: "#4CAF50" }}
          title="Green Highlight"
        />
        <button
          onClick={() => addHighlight("#448AFF")}
          className="w-[30px] h-[30px] rounded-full border border-solid border-gray-300 cursor-pointer"
          style={{ backgroundColor: "#448AFF" }}
          title="Blue Highlight"
        />
      </div>
    )
  );
};

export default HighlightMenu;

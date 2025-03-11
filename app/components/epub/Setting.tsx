/** @format */
import React, { useState } from "react";

interface SettingProps {
  isSettingVisible: boolean;
  isDarkTheme: boolean;
  setIsSettingVisible: (isSettingVisible: boolean) => void;
  setCurrentFlow: (currentFlow: string) => void;
  currentFlow: string;
  setFontSize?: (size: number) => void;
  setFontFamily?: (family: string) => void;
}

const Setting: React.FC<SettingProps> = ({
  isSettingVisible,
  isDarkTheme,
  setIsSettingVisible,
  setCurrentFlow,
  currentFlow,
  setFontSize,
  setFontFamily,
}) => {
  const [isChecked, setIsChecked] = useState(() => {
    if (typeof window !== "undefined") {
      const savedChecked = localStorage.getItem("isChecked");
      return savedChecked === "true";
    }
    return false;
  });

  // Initialize font size from localStorage or default to 100
  const [fontSize, setLocalFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const savedFontSize = localStorage.getItem("fontSize");
      return savedFontSize ? parseInt(savedFontSize) : 100;
    }
    return 100;
  });

  // Initialize font family from localStorage or default to Georgia
  const [selectedFont, setSelectedFont] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fontFamily") || "Georgia";
    }
    return "Georgia";
  });

  const fonts = [
    {
      name: "Georgia",
      family: "Georgia, serif",
      fallback: "serif",
    },
    {
      name: "Palatino",
      family: "'Palatino', 'Palatino Linotype', serif",
      fallback: "serif",
    },
    {
      name: "Merriweather",
      family: "var(--font-merriweather)",
      fallback: "serif",
    },
  ];

  const toggleCheckbox = () => {
    const newFlow = currentFlow === "paginated" ? "scrolled" : "paginated";
    setCurrentFlow(newFlow);

    setIsChecked((prevState) => {
      const newIsChecked = !prevState;
      localStorage.setItem("isChecked", newIsChecked.toString());
      return newIsChecked;
    });
    localStorage.setItem("currentFlow", newFlow);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setLocalFontSize(newSize);
    localStorage.setItem("fontSize", newSize.toString());
    setFontSize?.(newSize);
  };

  const handleFontFamilyChange = (font: string) => {
    const selectedFontObj = fonts.find((f) => f.name === font);
    const fontFamily = selectedFontObj
      ? `${selectedFontObj.family}, ${selectedFontObj.fallback}`
      : font;
    setSelectedFont(font);
    localStorage.setItem("fontFamily", font);
    if (setFontFamily) {
      setFontFamily(fontFamily);
    }
  };

  return (
    <>
      <aside
        className={`h-screen fixed top-0 shadow-custom right-0 z-50 md:w-[400px] w-[70%] overflow-x-hidden overflow-y-hidden pb-6 mb-4 transition-transform transform transition-colors duration-700 ease-in-out ${
          isDarkTheme
            ? "bg-[#1a1a2e] text-gray-300 border-[#444]"
            : "bg-white text-black border-[#ddd]"
        } ${isSettingVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header Section */}
        <div
          className={`toc-header sticky top-0 h-[81px] flex items-center pl-4 text-[18px] leading-[1.75] ${
            isDarkTheme
              ? "bg-[#1a1a2e] text-white"
              : "bg-gray-100 text-gray-900 border-b"
          }`}
          style={{ fontFamily: "Lora, serif" }}
        >
          Setting
        </div>
        <div className="toc-scrollbar h-[calc(100vh-91px)]">
          <div
            className="py-1 pl-4 pr-4"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Settings Container */}
            <div className="space-y-8 pt-4">
              {/* Scroll Toggle */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={toggleCheckbox}
              >
                <span className="text-base font-medium">Scrolled</span>
                <label className="relative inline-block w-8 h-5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                  />
                  <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all duration-300"></div>
                  <div className="absolute top-[4px] left-[4px] w-3 h-3 bg-white rounded-full transform transition-all duration-300 peer-checked:translate-x-3"></div>
                </label>
              </div>

              {/* Font Family Selection */}
              <div className="space-y-3">
                <span className="text-base font-medium">Font Family</span>
                <div className="grid grid-cols-1 gap-2">
                  {fonts.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => handleFontFamilyChange(font.name)}
                      className={`p-3 rounded-lg text-sm transition-all duration-200 ${
                        selectedFont === font.name
                          ? isDarkTheme
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkTheme
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-2">
                        <span className="font-medium">{font.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Font Size</span>
                  <span className="text-sm text-gray-500">{fontSize}%</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">A</span>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      isDarkTheme ? "bg-gray-700" : "bg-gray-200"
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                        ((fontSize - 50) * 100) / 150
                      }%, ${isDarkTheme ? "#374151" : "#E5E7EB"} ${
                        ((fontSize - 50) * 100) / 150
                      }%, ${isDarkTheme ? "#374151" : "#E5E7EB"} 100%)`,
                    }}
                  />
                  <span className="text-lg font-medium">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {/* Backdrop */}
      <div
        className={`${
          isSettingVisible
            ? "fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 z-40"
            : " "
        }`}
        onClick={() => setIsSettingVisible(false)}
      ></div>
    </>
  );
};

export default Setting;

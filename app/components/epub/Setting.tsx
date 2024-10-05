/** @format */
import React, { useState } from "react";

interface SettingProps {
  isSettingVisible: boolean;
  isDarkTheme: boolean;
  setIsSettingVisible: (isSettingVisible: boolean) => void;
  setCurrentFlow: (currentFlow: string) => void;
  currentFlow: string;
}

const Setting: React.FC<SettingProps> = ({
  isSettingVisible,
  isDarkTheme,
  setIsSettingVisible,
  setCurrentFlow,
  currentFlow,
}) => {
  const [isChecked, setIsChecked] = useState(() => {
    if (typeof window !== "undefined") {
      const savedChecked = localStorage.getItem("isChecked");
      return savedChecked === "true"; // localStorage stores everything as string
    }
    return false;
  });
  const toggleCheckbox = () => {
    const newFlow = currentFlow === "paginated" ? "scrolled" : "paginated";
    setCurrentFlow(newFlow);

    setIsChecked((prevState) => {
      const newIsChecked = !prevState;

      // Save the new values to localStorage inside the state update function
      localStorage.setItem("isChecked", newIsChecked.toString());

      return newIsChecked;
    });
    localStorage.setItem("currentFlow", newFlow);
  };

  return (
    <>
      <aside
        className={`h-screen fixed top-0 shadow-custom right-0 z-50 md:w-[400px] w-[70%] overflow-x-hidden overflow-y-hidden pb-6 mb-4 transition-transform transform transition-colors duration-700 ease-in-out ${
          isDarkTheme
            ? "bg-[#1a1a2e] text-gray-300 border-[#444]"
            : "bg-white text-black border-[#ddd]"
        } ${isSettingVisible ? "translate-x-0" : "translate-x-full"}`} // Change here to slide from the right
      >
        {/* Header Section */}
        <div
          className={`toc-header sticky top-0 h-[81px] flex items-center pl-4 text-[18px] leading-[1.75] ${
            isDarkTheme
              ? "bg-[#1a1a2e] text-white"
              : "bg-gray-100 text-gray-900 border-b "
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
            {/* Toggles the scrollbar */}
            <div className="space-y-4 pt-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={toggleCheckbox}
              >
                <span>Scrolled</span>
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
            </div>
          </div>
        </div>
      </aside>
      {/* Used to close the setting component if clicked anywhere else than the aside tag */}
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

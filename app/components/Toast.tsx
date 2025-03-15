import React, { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 animate-slide-in">
      <div
        className={`relative flex items-center p-2 sm:p-2.5 rounded-lg shadow-lg ${
          type === "success"
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
        }`}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
          <div
            className={`h-full ${
              type === "success" ? "bg-green-400" : "bg-red-400"
            } animate-border-progress`}
            style={{
              animationDuration: `${duration}ms`,
            }}
          />
        </div>

        <div className="flex items-center max-w-[180px] sm:max-w-[200px] relative mt-1">
          {type === "success" ? (
            <FaCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0" />
          ) : (
            <FaExclamationCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-red-500 flex-shrink-0" />
          )}
          <p className="text-xs sm:text-sm font-medium truncate">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Toast;

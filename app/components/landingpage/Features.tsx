import React from "react";
import {
  FaCloud,
  FaMoon,
  FaBookOpen,
  FaSync,
  FaLock,
  FaBolt,
} from "react-icons/fa";

const Features: React.FC = () => {
  const features = [
    {
      icon: <FaBookOpen className="w-8 h-8" />,
      title: "Intuitive Reading",
      description:
        "Clean interface designed for distraction-free reading experience",
    },
    {
      icon: <FaCloud className="w-8 h-8" />,
      title: "Cloud Storage",
      description: "Securely store your books and access them from any device",
    },
    {
      icon: <FaMoon className="w-8 h-8" />,
      title: "Dark Mode",
      description: "Easy on the eyes with customizable reading themes",
    },
    {
      icon: <FaSync className="w-8 h-8" />,
      title: "Progress Sync",
      description: "Never lose your place with automatic bookmark syncing",
    },
    {
      icon: <FaLock className="w-8 h-8" />,
      title: "Private Library",
      description: "Your personal collection, secured and organized",
    },
    {
      icon: <FaBolt className="w-8 h-8" />,
      title: "Fast Loading",
      description: "Quick access to your books with optimized performance",
    },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-[#2d3436] to-[#1a1c1d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features for Modern Readers
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need for an enhanced reading experience, right in
            your browser
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 ease-out"
            >
              {/* Icon Container */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <div className="text-white">{feature.icon}</div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;

import * as React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebaseConfig";
import { FaBook, FaGoogle } from "react-icons/fa";

const Banner: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      // Handle error silently in production
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1c1d] to-[#2d3436] text-white py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAwIiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <FaBook className="text-6xl text-blue-500 animate-float" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Redefine Your Reading Experience
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            A modern, browser-based EPUB reader that brings your digital library
            to life. Free to use, easy to access, anywhere you go.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
            {[
              {
                title: "Cloud Sync",
                description: "Access your books from any device",
              },
              {
                title: "Dark Mode",
                description: "Comfortable reading day and night",
              },
              {
                title: "Free Forever",
                description: "No hidden costs or subscriptions",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGoogleSignIn}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
            <FaGoogle className="w-5 h-5 mr-3" />
            <span className="relative">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;

// Add this to your global CSS or a new style block
const styles = `
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
`;

import * as React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebaseConfig";

const Banner: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };
  return (
    <div className="text-center mt-5 bg-[#181a1b] text-white">
      <h1 className="text-3xl font-bold">Redefine Epub Reader</h1>
      <h2 className="text-2xl mt-4 ">Free. Browser Based</h2>
      <p className="mt-2">
        Please{" "}
        <span
          onClick={handleGoogleSignIn}
          className="text-blue-500 cursor-pointer"
        >
          sign in with Google
        </span>{" "}
        to view and manage your books.
      </p>
    </div>
  );
};

export default Banner;

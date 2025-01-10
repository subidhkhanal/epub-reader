// Feedback Form for the user after they log in  into the website. The user can submit their feedback about the website. The feedback will be saved in the Firestore database.
import React, { useState } from "react";
import { db } from "@/firebaseConfig"; // Import Firebase configuration
import { collection, addDoc } from "firebase/firestore"; // Firestore functions

const FeedbackForm: React.FC = () => {
  const [feature, setFeature] = useState(""); // State to track the feature input
  const [success, setSuccess] = useState(false); // State to display success message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form reload
    try {
      if (!feature) {
        alert("Please enter a feature request!");
        return;
      }
      // Save feedback to Firestore
      await addDoc(collection(db, "feedback"), { feature });
      setSuccess(true); // Show success message
      setFeature(""); // Clear input
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto lg:flex lg:items-center p-10 mt-10">
      <div className="lg:w-0 lg:flex-1">
        <h2
          id="newsletter-headline"
          className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl sm:leading-snug"
        >
          Got a Feature in Mind?
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Share your ideas with us, and let’s make our platform better together!
        </p>
      </div>
      <div className="max-w-md mt-8 lg:mt-0 lg:ml-12">
        <form
          aria-labelledby="newsletter-headline"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="relative">
            <input
              type="text"
              name="feature"
              placeholder="Your Desired Feature"
              value={feature}
              onChange={(e) => setFeature(e.target.value)} // Update state on input change
              className="w-full px-5 py-4 text-base leading-6 border-2 rounded-md shadow-sm transition duration-150 ease-in-out appearance-none focus:outline-none border-gray-300 text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-5 py-3 text-white font-medium text-lg transition duration-150 ease-in-out bg-blue-600 border border-transparent rounded-md shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        </form>
        {success && (
          <p className="mt-4 text-green-500">
            Thank you! Your feature request has been submitted.
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;

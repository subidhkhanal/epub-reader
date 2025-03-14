"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, provider } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import NavBar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import BookGrid from "@/app/components/BookGrid";
import { ThemeContext } from "@/app/context/ThemeContext"; // Import ThemeContext
import { signInWithPopup } from "firebase/auth"; // Import signInWithPopup
import Footer from "./components/footer";
import FaqSection from "./components/landingpage/faq_section";
import Banner from "./components/landingpage/Banner";
import Navbar from "./components/landingpage/Navbar";
import Features from "./components/landingpage/Features";
// import FeedbackForm from "@/app/components/FeedbackForm"; // Import the FeedbackForm component';

const Home: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  //@ts-ignore
  const { isDarkTheme } = useContext(ThemeContext); // Use theme context

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    if (user) {
      try {
        const booksCollection = collection(db, "users", user.uid, "books");
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            epubPath:
              data.epubUrl || data.epubPath || `books/${user.uid}/${doc.id}`,
          };
        });
        setBooks(booksList);
      } catch (error) {
        // Handle error silently in production
        setBooks([]);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const filteredBooks = books.filter((book) =>
    (book.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div
      className={`flex flex-col h-screen  ${
        isDarkTheme ? "dark bg-[#0e131f]" : "bg-gray-200"
      }`}
    >
      {user ? (
        <div>
          <NavBar
            onMenuClick={toggleSidebar}
            // onThemeToggle={toggleTheme} // Pass toggle function
            isDarkTheme={isDarkTheme} // Pass dark theme state
          />
          <div ref={sidebarRef}>
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={handleSidebarClose}
              isDarkTheme={isDarkTheme} // Pass dark theme state
            />
          </div>
          <div
            className={`flex-1 py-5 mt-16 overflow-y-auto transition-all duration-300 
           ${
             isDarkTheme
               ? "bg-[#0e131f] text-white"
               : "bg-gray-200 text-gray-900"
           }`}
          >
            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              <div>
                <BookGrid
                  books={filteredBooks}
                  userId={user.uid}
                  isDarkTheme={isDarkTheme}
                  onBookDeleted={fetchBooks}
                />
                {/* <FeedbackForm /> */}
                {/* <div className="fixed right-6 bottom-8 z-50">
                  <a
                    href="https://www.buymeacoffee.com/subidhkhanal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                      isDarkTheme
                        ? "bg-yellow-500 hover:bg-yellow-400 text-gray-900"
                        : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    } shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.962-.105-.502-.061-1.007-.123-1.507-.195-.527-.077-1.044-.17-1.571-.249-.115-.016-.232-.033-.346-.048-.633-.086-1.148-.35-1.488-.946-.466-.816-.707-1.723-.773-2.673-.031-.445-.043-.892-.044-1.339-.001-.114-.013-.227-.019-.341l-.418-4.07c-.024-.235-.095-.465-.18-.685-.046-.116-.115-.228-.18-.339-.111-.185-.126-.399-.179-.602-.053-.206-.106-.411-.152-.619-.095-.431-.139-.871-.162-1.315a3.723 3.723 0 01.044-1.003c.05-.229.143-.436.288-.622a1.52 1.52 0 01.726-.523c.435-.176.901-.179 1.359-.179.687.001 1.371.037 2.055.089.67.05 1.337.114 2.004.184l1.78.188c.64.068 1.278.138 1.917.205l1.438.154c.476.051.953.1 1.428.154.288.033.574.072.861.104.466.054.931.102 1.396.161.465.059.927.124 1.392.182.153.019.307.036.46.057l.416.056c.439.056.87.152 1.285.306a2.85 2.85 0 011.067.773c.224.283.376.604.43.959.064.418.006.847-.195 1.215z" />
                    </svg>
                    Buy me a coffee
                  </a>
                </div> */}
                <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
                  <p className="text-xs leading-5 text-gray-500 text-center	">
                    {" "}
                    Contact Us at{" "}
                    <span className="font-bold	">
                      subidhkhanal38@gmail.com
                    </span>{" "}
                    for any queries
                  </p>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : (
        <div>
          <Navbar />
          <div className="pt-[68px] bg-[#181a1b]">
            <Banner />
          </div>
          <Features />
          <FaqSection />
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Home;

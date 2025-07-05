import React, { useState, KeyboardEvent } from "react";

// Define the props interface for type safety
interface HomeProps {
  onNavigate: (page: "home" | "medicine" | "health") => void;
  isDarkMode: boolean;
}

export default function Home({ onNavigate }: HomeProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement | HTMLSpanElement | HTMLButtonElement>,
    page: "home" | "medicine" | "health"
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onNavigate(page);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 font-inter text-gray-200">
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
        <section className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-blue-400 mb-6 leading-tight tracking-tight animate-fade-in-up">
            আপনার স্বাস্থ্য, আপনার হাতে
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 sm:mb-12 animate-fade-in-up delay-200">
            “সময়ের সাথে” আপনাকে সুস্থ ও সংগঠিত রাখতে সাহায্য করে। মেডিসিন রিমাইন্ডার এবং হেলথ ট্র্যাকারের মাধ্যমে আপনার স্বাস্থ্য যাত্রা সহজ করুন।
          </p>
          <button
            type="button" // added for clarity, prevents form submit
            onClick={() => onNavigate("medicine")}
            className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 animate-fade-in-up delay-400"
            role="button"
            tabIndex={0}
            aria-label="শুরু করুন"
            onKeyDown={(e) => handleKeyDown(e, "medicine")}
          >
            শুরু করুন
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 max-w-5xl w-full">
          <div
            onClick={() => onNavigate("medicine")}
            onKeyDown={(e) => handleKeyDown(e, "medicine")}
            role="button"
            tabIndex={0}
            aria-label="মেডিসিন রিমাইন্ডার"
            className="bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center text-center border border-gray-700 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-6xl sm:text-7xl text-blue-400 mb-4 transition-transform duration-300 group-hover:scale-110">
                💊
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-300 mb-3 group-hover:text-blue-200 transition-colors duration-300">
                মেডিসিন রিমাইন্ডার
              </h3>
              <p className="text-lg text-gray-400 opacity-90 group-hover:text-gray-300 transition-colors duration-300">
                আপনার দৈনিক ওষুধের সময় মনে করিয়ে দেবে।
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate("health")}
            onKeyDown={(e) => handleKeyDown(e, "health")}
            role="button"
            tabIndex={0}
            aria-label="হেলথ ট্র্যাকার"
            className="bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-10 flex flex-col items-center text-center border border-gray-700 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-6xl sm:text-7xl text-green-400 mb-4 transition-transform duration-300 group-hover:scale-110">
                🩺
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-green-300 mb-3 group-hover:text-green-200 transition-colors duration-300">
                হেলথ ট্র্যাকার
              </h3>
              <p className="text-lg text-gray-400 opacity-90 group-hover:text-gray-300 transition-colors duration-300">
                আপনার স্বাস্থ্যের অগ্রগতি ট্র্যাক করুন সহজে।
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

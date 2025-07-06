import React, { useState, useEffect } from "react";
// Assuming these components exist in the 'components' directory.
// If they don't, placeholder components will be used for demonstration.
import Home from "./components/Home";
import MedicineReminderForm from "./components/MedicineReminderForm";
import HealthTracker from "./components/HealthTracker";
import Login from "./components/UserLogin"; // Assuming UserLogin is the correct path
import { messaging } from "./firebase-messaging";
import { getToken } from "firebase/messaging";
import axios from "axios";

// --- Placeholder Components (Updated for new design) ---
// These placeholders are styled to adapt to the dark/light mode
const MedicineReminderFormPlaceholder: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className={`min-h-[calc(100vh-160px)] flex items-center justify-center p-8 rounded-3xl shadow-2xl transition-colors duration-500 ${
    isDarkMode ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-white text-gray-800 border border-blue-100'
  }`}>
    <div className="text-center">
      <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>মেডিসিন রিমাইন্ডার</h2>
      <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>আপনার ওষুধের রিমাইন্ডার এখানে সেট করুন।</p>
      <button
        onClick={() => window.history.back()}
        className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
          isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500' : 'bg-blue-700 hover:bg-blue-800 text-white focus:ring-blue-300'
        }`}
      >
        হোমে ফিরে যান
      </button>
    </div>
  </div>
);

const HealthTrackerPlaceholder: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <div className={`min-h-[calc(100vh-160px)] flex items-center justify-center p-8 rounded-3xl shadow-2xl transition-colors duration-500 ${
    isDarkMode ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-white text-gray-800 border border-green-100'
  }`}>
    <div className="text-center">
      <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>হেলথ ট্র্যাকার</h2>
      <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>আপনার স্বাস্থ্যের অগ্রগতি এখানে ট্র্যাক করুন।</p>
      <button
        onClick={() => window.history.back()}
        className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
          isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500' : 'bg-green-700 hover:bg-green-800 text-white focus:ring-green-300'
        }`}
      >
        হোমে ফিরে যান
      </button>
    </div>
  </div>
);
// --- End Placeholder Components ---


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<"home" | "medicine" | "health">("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ _id: string; username: string; name?: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("somoyerTheme");
    return savedTheme ? JSON.parse(savedTheme) : true; // Default to dark mode
  });

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("somoyerUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("somoyerTheme", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

   useEffect(() => {
    const saveFcmToken = async () => {
      if (!user || Notification.permission !== "granted") return;

      try {
        const fcmToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, 
        });
        console.log("🔥 FCM Token from getToken:", fcmToken);
        if (fcmToken) {
          const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/save-token`, {
            userId: user._id,
            token: fcmToken,
          });
          console.log("✅ FCM Token saved successfully");
        } else {
          console.warn("⚠️ FCM Token not generated");
        }
      } catch (err) {
        console.error("🔥 Error saving FCM Token:", err);
      }
    };

    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          saveFcmToken();
        }
      });
    }
  }, [user]);

  const handleLogin = (userData: { _id: string; username: string; name?: string }) => {
    setUser(userData);
    localStorage.setItem("somoyerUser", JSON.stringify(userData));
    setCurrentView("home");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("somoyerUser");
    setCurrentView("home");
  };

  const handleNavigate = (page: "home" | "medicine" | "health") => {
    setCurrentView(page);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // If user is not logged in, show the Login component
  if (!user) {
    return <Login onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

  // Determine dynamic classes based on theme mode for a powerful UI
  const appBgClass = isDarkMode ? 'bg-gradient-to-br from-gray-950 to-gray-800 text-gray-200' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800';
  const headerBgClass = isDarkMode ? 'bg-gray-800 shadow-2xl border-b border-gray-700' : 'bg-white shadow-xl border-b border-blue-100';
  const brandTextColorClass = isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-800';
  const navLinkBaseClass = isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600';
  const navLinkActiveClass = (view: string) => currentView === view ? (isDarkMode ? 'text-blue-400 font-semibold bg-gray-700/50' : 'text-blue-700 font-semibold bg-blue-100/50') : '';
  const themeToggleBgClass = isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 focus:ring-yellow-500' : 'bg-blue-100 hover:bg-blue-200 text-yellow-600 focus:ring-blue-300';
  const logoutTextColorClass = isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700';
  const mobileMenuBgClass = isDarkMode ? 'bg-gray-800 shadow-lg border-b border-gray-700' : 'bg-white shadow-md border-b border-blue-100';
  const footerBgClass = isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-blue-100 bg-white text-gray-600';


  return (
    <div className={`min-h-screen flex flex-col font-inter transition-colors duration-500 ${appBgClass}`}>
      {/* Moved Tailwind CSS and Font Inter imports to index.css for better practice */}

      {/* Main Header/Navbar for the App */}
      <header className={`${headerBgClass} py-4 px-6 md:px-10 lg:px-16 sticky top-0 z-50 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Brand/Logo - Clickable to go home */}
          <button
            onClick={() => handleNavigate("home")}
            className={`text-2xl md:text-3xl font-extrabold ${brandTextColorClass} transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'} focus:ring-opacity-50 rounded-md p-1`}
            aria-label="Go to Home"
          >
            🕒 সময়ের সাথে
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 md:gap-8 text-base md:text-lg font-medium">
            <button
              onClick={() => handleNavigate("home")}
              className={`${navLinkBaseClass} transition-colors duration-200 px-3 py-2 rounded-md ${navLinkActiveClass('home')} relative group`}
            >
              হোম
              <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded`}></span>
            </button>
            <button
              onClick={() => handleNavigate("medicine")}
              className={`${navLinkBaseClass} transition-colors duration-200 px-3 py-2 rounded-md ${navLinkActiveClass('medicine')} relative group`}
            >
              মেডিসিন
              <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded`}></span>
            </button>
            <button
              onClick={() => handleNavigate("health")}
              className={`${navLinkBaseClass} transition-colors duration-200 px-3 py-2 rounded-md ${navLinkActiveClass('health')} relative group`}
            >
              হেলথ
              <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded`}></span>
            </button>
            {/* Theme Toggle Button for Desktop */}
            <button
              onClick={toggleTheme}
              className={`ml-4 p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 ${themeToggleBgClass}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'} {/* Sun for light, Moon for dark */}
            </button>
            <button
              onClick={handleLogout}
              className={`${logoutTextColorClass} transition-colors duration-200 ml-4 px-4 py-2 rounded-md border ${isDarkMode ? 'border-red-400 hover:bg-red-900/20' : 'border-red-600 hover:bg-red-50'}`}
            >
              লগআউট
            </button>
          </nav>

          {/* Mobile Hamburger Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 ${themeToggleBgClass}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              className={`${navLinkBaseClass} focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-300'} focus:ring-opacity-50 rounded-md p-2 transition-colors duration-200`}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu (conditionally rendered below header) */}
      {isMobileMenuOpen && (
        <div className={`md:hidden ${mobileMenuBgClass} py-4 px-6 space-y-4 text-center animate-fade-in-down transition-colors duration-500`}>
          <button
            onClick={() => handleNavigate("home")}
            className={`block w-full text-lg font-semibold py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400 focus:ring-blue-500' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:ring-blue-300'}`}
          >
            হোম
          </button>
          <button
            onClick={() => handleNavigate("medicine")}
            className={`block w-full text-lg font-semibold py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400 focus:ring-blue-500' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:ring-blue-300'}`}
          >
            মেডিসিন
          </button>
          <button
            onClick={() => handleNavigate("health")}
            className={`block w-full text-lg font-semibold py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400 focus:ring-blue-500' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:ring-blue-300'}`}
          >
            হেলথ
          </button>
          <button
            onClick={handleLogout}
            className={`block w-full text-lg font-semibold py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${isDarkMode ? 'text-red-400 hover:bg-gray-700 hover:text-red-300 focus:ring-red-500' : 'text-red-600 hover:bg-blue-50 hover:text-red-700 focus:ring-red-300'}`}
          >
            লগআউট
          </button>
        </div>
      )}

      {/* Main content area, conditionally rendering components based on currentView */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === "home" && <Home onNavigate={handleNavigate} isDarkMode={isDarkMode} />}
        {currentView === "medicine" && (MedicineReminderForm ? <MedicineReminderForm userId={user._id} isDarkMode={isDarkMode} /> : <MedicineReminderFormPlaceholder isDarkMode={isDarkMode} />)}
        {currentView === "health" && (HealthTracker ? <HealthTracker userId={user._id} isDarkMode={isDarkMode} /> : <HealthTrackerPlaceholder isDarkMode={isDarkMode} />)}
      </main>

      {/* Footer */}
      <footer className={`text-center text-sm py-4 border-t ${footerBgClass} transition-colors duration-500`}>
        &copy; {toBanglaNumber(new Date().getFullYear())} সময়ের সাথে | উন্নত জীবনের জন্য প্রযুক্তি
      </footer>
    </div>
  );
};

// Helper function to convert numbers to Bangla digits
function toBanglaNumber(number: number): string {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return number
    .toString()
    .split("")
    .map((d) => banglaDigits[parseInt(d)])
    .join("");
}

export default App;
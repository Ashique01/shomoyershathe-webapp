import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

interface LoginProps {
  onLogin: (userData: { _id: string; username: string; name?: string }) => void;
    isDarkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // Determine if the user is attempting to register (if name field has content)
  const isRegistering = !!name.trim();

  const handleSubmit = async () => {
    setError(""); // Clear previous errors
    setInfo(""); // Clear previous info messages

    if (!username.trim()) {
      setError("⚠️ ইউজারনেম আবশ্যক");
      return;
    }

    setLoading(true); // Set loading state to true during API call
    try {
      if (isRegistering) {
        // Registration attempt
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
          username,
          name,
        });
        const { user, message } = res.data;
        setInfo(`✅ ${message || "রেজিস্ট্রেশন সফল হয়েছে"}`);
        onLogin(user); // Call onLogin with user data
      } else {
        // Login attempt
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
          username,
        });
        const { user, message } = res.data;
        setInfo(`✅ ${message || "লগইন সফল হয়েছে"}`);
        onLogin(user); // Call onLogin with user data
      }
    } catch (err: any) {
      // Handle API errors
      if (err.response?.data?.error) {
        setError(`❌ ${err.response.data.error}`);
      } else {
        setError("❌ অজানা ত্রুটি ঘটেছে। পরে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    // Full screen container with a dark, professional background gradient
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 font-inter">
      {/* Login/Registration Card */}
      <div className="bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-700">
        {/* Brand/Logo */}
        <div className="flex justify-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-400 select-none flex items-center gap-2">
            <span role="img" aria-label="clock">🕒</span>
            <span>সময়ের সাথে</span>
          </h1>
        </div>

        {/* Title for Login/Registration */}
        <h2 className="text-center text-2xl font-semibold mb-8 text-gray-200">
          {isRegistering ? "নতুন ব্যবহারকারী রেজিস্ট্রেশন" : "লগইন করুন"}
        </h2>

        {/* Username Input Field */}
        <label className="block text-gray-300 font-medium mb-2" htmlFor="username">
          🧑 ইউজারনেম <span className="text-red-400">*</span>
        </label>
        <input
          id="username"
          ref={usernameRef}
          type="text"
          placeholder="আপনার ইউজারনেম লিখুন"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading} // Disable input when loading
          className="w-full mb-6 px-5 py-3 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-700 text-gray-200 placeholder-gray-400"
        />

        {/* Name Input Field (only for registration) */}
        <label className="block text-gray-300 font-medium mb-2" htmlFor="name">
          📛 নাম (শুধু রেজিস্ট্রেশনের জন্য)
        </label>
        <input
          id="name"
          type="text"
          placeholder="নতুন নাম দিলে রেজিস্ট্রেশন হবে"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading} // Disable input when loading
          className="w-full mb-6 px-5 py-3 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-700 text-gray-200 placeholder-gray-400"
        />

        {/* Error & Info Messages */}
        {error && (
          <p className="mb-4 text-sm text-red-400 font-medium text-center select-none">{error}</p>
        )}
        {info && (
          <p className="mb-4 text-sm text-green-400 font-medium text-center select-none">{info}</p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading} // Disable button when loading
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-75 ${
            loading
              ? "bg-blue-700 cursor-not-allowed opacity-70" // Dimmed and no hover for loading state
              : "bg-blue-600 hover:bg-blue-700" // Normal state with hover
          }`}
        >
          {loading
            ? "⏳ প্রসেসিং..."
            : isRegistering
            ? "📝 রেজিস্টার করুন"
            : "🔐 লগইন করুন"}
        </button>

        {/* Footer Text */}
        <p className="mt-6 text-center text-gray-500 text-sm select-none">
          {isRegistering
            ? "আগে রেজিস্টার না করলে, নাম দিয়ে ফর্ম পূরণ করুন"
            : "শুধু ইউজারনেম দিলেই লগইন হবে"}
        </p>
      </div>
    </div>
  );
};

export default Login;

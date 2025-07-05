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
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const isRegistering = !!name.trim();

  const handleSubmit = async () => {
    setError("");
    setInfo("");

    if (!username.trim()) {
      setError("⚠️ ইউজারনেম আবশ্যক");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
          username,
          name,
        });
        const { user, message } = res.data;
        setInfo(`✅ ${message || "রেজিস্ট্রেশন সফল হয়েছে"}`);
        onLogin(user);
      } else {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
          username,
        });
        const { user, message } = res.data;
        setInfo(`✅ ${message || "লগইন সফল হয়েছে"}`);
        onLogin(user);
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(`❌ ${err.response.data.error}`);
      } else {
        setError("❌ কিছু ভুল হয়েছে। পরে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 font-inter">
      <div className="bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-10 border border-gray-700 animate-fade-in-down">
        <div className="flex justify-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-400 select-none flex items-center gap-2">
            <span role="img" aria-label="clock">🕒</span>
            <span>সময়ের সাথে</span>
          </h1>
        </div>

        <h2 className="text-center text-2xl font-semibold mb-8 text-gray-200">
          {isRegistering ? "নতুন ব্যবহারকারী রেজিস্ট্রেশন" : "লগইন করুন"}
        </h2>

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
          disabled={loading}
          className={`w-full mb-6 px-5 py-3 rounded-xl bg-gray-700 text-gray-200 placeholder-gray-400 border ${
            error.includes("ইউজারনেম") ? "border-red-500" : "border-gray-700"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
        />

        <label className="block text-gray-300 font-medium mb-2" htmlFor="name">
          📛 নাম (শুধু রেজিস্ট্রেশনের জন্য)
        </label>
        <input
          id="name"
          type="text"
          placeholder="নতুন নাম লিখলে রেজিস্ট্রেশন হবে"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="w-full mb-6 px-5 py-3 border border-gray-700 rounded-xl bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        {error && (
          <p ref={errorRef} className="mb-4 text-sm text-red-400 font-medium text-center animate-pulse select-none">
            {error}
          </p>
        )}
        {info && (
          <p className="mb-4 text-sm text-green-400 font-medium text-center select-none">
            {info}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-75 ${
            loading
              ? "bg-blue-700 cursor-not-allowed opacity-70"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "⏳ প্রসেস হচ্ছে..."
            : isRegistering
            ? "📝 রেজিস্টার করুন"
            : "🔐 লগইন করুন"}
        </button>

        <div className="mt-10 bg-gray-700 text-gray-200 rounded-xl p-5 border border-gray-600 shadow-inner animate-fade-in-down">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">📌 নির্দেশাবলি</h3>
          <ul className="list-disc list-inside text-sm space-y-2">
            <li><span className="text-yellow-400">🧑</span> শুধু ইউজারনেম দিলে লগইন হবে।</li>
            <li><span className="text-green-400">📛</span> ইউজারনেম ও নাম দিলে রেজিস্ট্রেশন হবে।</li>
            <li><span className="text-red-300">❗</span> ইউজারনেম ফাঁকা রাখা যাবে না।</li>
            <li><span className="text-blue-400">📊</span> লগইন করার পর আপনি স্বাস্থ্য তথ্য সংরক্ষণ করতে পারবেন।</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;

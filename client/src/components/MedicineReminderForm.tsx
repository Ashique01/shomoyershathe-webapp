import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Trash2, Info } from "lucide-react";

type Reminder = {
  _id?: string;
  userId: string;
  text: string;
  time: string;
};

interface Props {
  userId: string;
  isDarkMode: boolean;
}

export default function Reminder({ userId }: Props) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/reminders`;

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${userId}`);
      setReminders(res.data);
    } catch (err) {
      console.error("রিমাইন্ডার আনতে সমস্যা হয়েছে:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchReminders();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!text.trim()) {
      setError("💊 ওষুধের নাম অবশ্যই লিখতে হবে।");
      return;
    }
    if (!time.trim()) {
      setError("⏰ ওষুধ খাওয়ার সময় দিন।");
      return;
    }

    try {
      const res = await axios.post(API_BASE, {
        userId,
        text,
        time,
      });
      setReminders((prev) => [...prev, res.data]);
      setText("");
      setTime("");
      setSuccess("✅ ওষুধের রিমাইন্ডার সফলভাবে সংরক্ষণ হয়েছে।");

      scheduleNotification(res.data.text, res.data.time);
    } catch (err) {
      console.error("রিমাইন্ডার সংরক্ষণ করতে সমস্যা হয়েছে:", err);
      setError("❌ রিমাইন্ডার সংরক্ষণ ব্যর্থ হয়েছে।");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await axios.delete(`${API_BASE}/entry/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("❌ রিমাইন্ডার ডিলিট করতে সমস্যা হয়েছে:", err);
    }
  };

  const scheduleNotification = (text: string, time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hour);
    scheduled.setMinutes(minute);
    scheduled.setSeconds(0);

    const delay = scheduled.getTime() - now.getTime();
    if (delay <= 0) return;

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("💊 ওষুধ খাওয়ার সময়", {
          body: text,
          icon: "/icon-64.png",
        });
      }
    }, delay);
  };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 font-inter text-gray-100">
      {/* নির্দেশনা */}
      <div className="bg-yellow-800 border border-yellow-500 text-yellow-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-6 h-6 mt-1 text-yellow-300" />
        <div>
          <h2 className="text-lg font-bold mb-1">📌 নির্দেশাবলি</h2>
          <ul className="list-disc list-inside text-sm">
            <li>এই অ্যাপে শুধু <strong>ওষুধ খাওয়ার রিমাইন্ডার</strong> সংরক্ষণ করতে পারবেন।</li>
            <li>নির্দিষ্ট সময়ে একটি <strong>নোটিফিকেশন</strong> পাবেন।</li>
            <li>নিচের ফর্মে ওষুধের নাম ও সময় লিখে "রিমাইন্ডার সংরক্ষণ" চাপুন।</li>
          </ul>
        </div>
      </div>

      {/* ফর্ম */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">💊 ওষুধের রিমাইন্ডার দিন</h2>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {success && <p className="text-green-400 mb-4">{success}</p>}

        <div className="mb-4">
          <label htmlFor="text" className="block mb-1 text-gray-300 font-medium">
            ওষুধের নাম
          </label>
          <input
            id="text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="উদাহরণ: সকাল ৮টায় প্যারাসিটামল"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="time" className="block mb-1 text-gray-300 font-medium">
            ওষুধ খাওয়ার সময়
          </label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          ✅ রিমাইন্ডার সংরক্ষণ করুন
        </button>
      </form>

      {/* তালিকা */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h3 className="text-xl font-bold text-blue-400 mb-4">📋 ওষুধের রিমাইন্ডার তালিকা</h3>
        {reminders.length === 0 ? (
          <p className="text-gray-400 text-center">কোনো ওষুধের রিমাইন্ডার নেই।</p>
        ) : (
          <ul className="space-y-3">
            {reminders.map((reminder) => (
              <li
                key={reminder._id}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center text-sm"
              >
                <div>
                  <Bell className="inline w-4 h-4 mr-1 text-yellow-400" />
                  <span>{reminder.text}</span> — <span className="text-blue-300">{reminder.time}</span>
                </div>
                <button
                  onClick={() => handleDelete(reminder._id)}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

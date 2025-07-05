import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/reminders`;

type Reminder = {
  _id?: string;
  medicineName: string;
  time: string;
  userId?: string;
};

interface Props {
  userId: string;
  isDarkMode: boolean;
}

export default function MedicineReminderForm({ userId, isDarkMode }: Props) {
  const [medicineName, setMedicineName] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchReminders = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Reminder[]>(`${API_BASE}?userId=${userId}`);
        setReminders(res.data);
        res.data.forEach((r) => scheduleNotification(r.medicineName, r.time));
      } catch (err) {
        console.error("Failed to fetch reminders:", err);
        setError("ডেটা আনতে সমস্যা হয়েছে। সার্ভার চালু আছে কিনা দেখুন।");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim() || !time.trim()) {
      setError("সব তথ্য পূরণ করুন।");
      return;
    }
    setError("");

    try {
      if (editingId) {
        const res = await axios.put<Reminder>(`${API_BASE}/${editingId}`, {
          medicineName,
          time,
          userId,
        });
        setReminders((prev) =>
          prev.map((r) => (r._id === editingId ? res.data : r))
        );
        toast.success("রিমাইন্ডার আপডেট হয়েছে।");
        setEditingId(null);
      } else {
        const res = await axios.post<Reminder>(API_BASE, {
          medicineName,
          time,
          userId,
        });
        setReminders((prev) => [...prev, res.data]);
        scheduleNotification(medicineName, time);
        toast.success("রিমাইন্ডার যোগ করা হয়েছে।");
      }
      setMedicineName("");
      setTime("");
    } catch (err) {
      console.error("Failed to save reminder:", err);
      setError("সেভ করতে সমস্যা হয়েছে।");
      toast.error("রিমাইন্ডার সেভ করতে সমস্যা হয়েছে।");
    }
  };

  const confirmDelete = (id: string) => {
    setReminderToDelete(id);
    setShowConfirmModal(true);
  };

  const handleEdit = (reminder: Reminder) => {
    setMedicineName(reminder.medicineName);
    setTime(reminder.time);
    setEditingId(reminder._id || null);
    setError("");
  };

  const handleDelete = async () => {
    if (!reminderToDelete) return;
    setShowConfirmModal(false);
    try {
      await axios.delete(`${API_BASE}/${reminderToDelete}`);
      setReminders((prev) => prev.filter((r) => r._id !== reminderToDelete));
      toast.success("রিমাইন্ডার ডিলিট হয়েছে।");
      setReminderToDelete(null);
    } catch (err) {
      console.error("Failed to delete reminder:", err);
      setError("ডিলিট করতে সমস্যা হয়েছে।");
      toast.error("রিমাইন্ডার ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  const cancelDelete = () => {
    setReminderToDelete(null);
    setShowConfirmModal(false);
  };

  const scheduleNotification = (medicineName: string, time: string) => {
    if (Notification.permission !== "granted") return;

    const [hour, minute] = time.split(":").map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);

    let delay = reminderTime.getTime() - now.getTime();
    if (delay < 0) delay += 24 * 60 * 60 * 1000;

    setTimeout(() => {
      new Notification("মেডিসিন সময়", {
        body: `এখন ${medicineName} গ্রহণের সময়!`,
        icon: "https://placehold.co/64x64/007bff/ffffff?text=💊",
      });
    }, delay);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-3xl mx-auto my-8 p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 text-gray-200 font-inter">
        <div className="mb-8 p-4 bg-yellow-900 border border-yellow-600 rounded-lg text-white">
          <h2 className="text-2xl font-semibold mb-3">নির্দেশাবলী</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              💊 মেডিসিনের নাম লিখুন, যেমন: প্যারাসিটামল, আইবুপ্রোফেন ইত্যাদি।
            </li>
            <li>⏰ মেডিসিন খাওয়ার সঠিক সময় নির্বাচন করুন।</li>
            <li>➕ রিমাইন্ডার যোগ করতে “যোগ করুন” বাটনে ক্লিক করুন।</li>
            <li>✏️ রিমাইন্ডার আপডেট করতে তালিকা থেকে “এডিট” করুন।</li>
            <li>🗑️ রিমাইন্ডার মুছে ফেলতে “ডিলিট” বাটনে ক্লিক করুন।</li>
            <li>🔔 আপনার ডিভাইসে নোটিফিকেশন চালু আছে কিনা নিশ্চিত করুন।</li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 mb-8"
        >
          <h2 className="text-3xl font-bold text-blue-400 text-center mb-6">
            মেডিসিন রিমাইন্ডার যোগ করুন
          </h2>
          {error && (
            <div className="flex items-center gap-2 text-red-400 mb-4">
              <AlertCircle size={20} /> <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2">মেডিসিনের নাম</label>
            <input
              type="text"
              value={medicineName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMedicineName(e.target.value)
              }
              placeholder="যেমন: প্যারাসিটামল"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">সময়</label>
            <input
              type="time"
              value={time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTime(e.target.value)
              }
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "আপডেট করুন" : "যোগ করুন"}
          </button>
        </form>

        <div className="p-6 bg-gray-800 border border-gray-700 rounded-2xl">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">
            সংরক্ষিত রিমাইন্ডার সমূহ
          </h3>
          {loading ? (
            <p className="text-gray-400 text-center">তথ্য লোড হচ্ছে...</p>
          ) : reminders.length === 0 ? (
            <p className="text-gray-400 text-center">কোনো রিমাইন্ডার নেই।</p>
          ) : (
            <ul className="space-y-3">
              {reminders.map((reminder) => (
                <li
                  key={reminder._id}
                  className="flex justify-between items-center bg-gray-700 p-4 rounded-lg"
                >
                  <div>
                    <strong className="text-blue-300">
                      {reminder.medicineName}
                    </strong>
                    <p className="text-gray-400 text-sm">⏰ {reminder.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded"
                    >
                      এডিট
                    </button>
                    <button
                      onClick={() => confirmDelete(reminder._id!)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      ডিলিট
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 shadow-xl text-center">
              <h4 className="text-lg font-bold text-red-400 mb-4">
                আপনি কি রিমাইন্ডারটি ডিলিট করতে চান?
              </h4>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded"
                >
                  না
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

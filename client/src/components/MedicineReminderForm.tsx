import { useState, useEffect } from "react";
import axios from "axios";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

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

export default function MedicineReminderForm({ userId,isDarkMode }: Props) {
  const [medicineName, setMedicineName] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);

  // Get speech recognition controls and support flag
  const { isListening, startListening, stopListening, supported } = useSpeechRecognition(
    (transcript) => {
      const { name, parsedTime } = parseBanglaSpeech(transcript.trim());
      if (name) setMedicineName(name);
      if (parsedTime) setTime(parsedTime);
      setError("");
    },
    "bn-BD"
  );

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
        setEditingId(null);
      } else {
        const res = await axios.post<Reminder>(API_BASE, {
          medicineName,
          time,
          userId,
        });
        setReminders((prev) => [...prev, res.data]);
        scheduleNotification(medicineName, time);
      }
      setMedicineName("");
      setTime("");
    } catch (err) {
      console.error("Failed to save reminder:", err);
      setError("সেভ করতে সমস্যা হয়েছে।");
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
      setReminderToDelete(null);
    } catch (err) {
      console.error("Failed to delete reminder:", err);
      setError("ডিলিট করতে সমস্যা হয়েছে।");
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
    <div className="max-w-3xl mx-auto my-8 p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 text-gray-200 font-inter">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 mb-8"
      >
        <h2 className="text-3xl font-bold text-blue-400 text-center mb-6">
          মেডিসিন রিমাইন্ডার যোগ করুন
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block mb-2">মেডিসিনের নাম</label>
          <input
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="যেমন: প্যারাসিটামল"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">সময়</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "আপডেট করুন" : "যোগ করুন"}
          </button>
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={!supported}
            title={
              supported
                ? isListening
                  ? "ভয়েস বন্ধ করুন"
                  : "ভয়েস শুরু করুন"
                : "আপনার ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়"
            }
            className={`px-4 py-3 rounded text-white transition
              ${isListening ? "bg-red-500" : "bg-green-600"}
              ${!supported ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            🎙️ {isListening ? "বন্ধ করুন" : "ভয়েস"}
          </button>
        </div>
      </form>

      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
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
                    className="bg-yellow-500 px-3 py-2 text-sm rounded text-white hover:bg-yellow-600"
                  >
                    এডিট
                  </button>
                  <button
                    onClick={() => confirmDelete(reminder._id!)}
                    className="bg-red-600 px-3 py-2 text-sm rounded text-white hover:bg-red-700"
                  >
                    ডিলিট
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 shadow-xl text-center">
            <h4 className="text-lg font-bold text-red-400 mb-4">
              আপনি কি রিমাইন্ডারটি ডিলিট করতে চান?
            </h4>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
              >
                না
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// === Utility Functions ===

function convertBanglaDigits(input: string): string {
  const bnToEn: Record<string, string> = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };
  return input.replace(/[০-৯]/g, (char) => bnToEn[char]);
}

function convertTo24Hour(hourStr: string): string {
  let hour = parseInt(hourStr);
  if (isNaN(hour)) hour = 8;
  return `${hour.toString().padStart(2, "0")}:00`;
}

function parseBanglaSpeech(transcript: string): {
  name: string;
  parsedTime: string;
} {
  let name = transcript;
  let parsedTime = "";

  const patterns = [
    {
      regex: /সকাল\s?(৭|৮|৯|১০|১১)?টা/,
      time: (h: string) => (h ? convertTo24Hour(h) : "08:00"),
    },
    {
      regex: /দুপুর\s?(১২|১|২|৩)?টা/,
      time: (h: string) =>
        h ? convertTo24Hour(((parseInt(h) % 12) + 12).toString()) : "13:00",
    },
    {
      regex: /বিকেল\s?(৪|৫)?টা/,
      time: (h: string) =>
        h ? convertTo24Hour((parseInt(h) + 12).toString()) : "16:00",
    },
    {
      regex: /সন্ধ্যা\s?(৬|৭)?টা/,
      time: (h: string) =>
        h ? convertTo24Hour((parseInt(h) + 12).toString()) : "18:00",
    },
    {
      regex: /রাত\s?(৮|৯|১০|১১)?টা/,
      time: (h: string) =>
        h ? convertTo24Hour((parseInt(h) + 12).toString()) : "21:00",
    },
    {
      regex: /(\d{1,2}|[০-৯]{1,2})\s*(am|pm|এএম|পিএম)/i,
      time: (h: string, ampm: string) => {
        let hour = parseInt(convertBanglaDigits(h));
        if (ampm.toLowerCase().includes("pm") && hour < 12) hour += 12;
        if (ampm.toLowerCase().includes("am") && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, "0")}:00`;
      },
    },
    {
      regex: /(\d{1,2}|[০-৯]{1,2})\s*টা/,
      time: (h: string) => convertTo24Hour(convertBanglaDigits(h)),
    },
  ];

  for (const p of patterns) {
    const match = transcript.match(p.regex);
    if (match) {
      const matchedHour = match[1] || "";
      const ampm = match[2] || "";
      parsedTime = p.time(matchedHour, ampm);
      name = transcript.replace(match[0], "").trim();
      break;
    }
  }

  return { name, parsedTime };
}

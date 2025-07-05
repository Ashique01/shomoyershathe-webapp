import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Entry = {
  _id?: string;
  date: string;
  bp: string;
  sugar: string;
  weight: string;
};

type HealthTrackerProps = {
  userId: string;
  isDarkMode: boolean;
};

export default function HealthTracker({
  userId,
  isDarkMode,
}: HealthTrackerProps) {
  const [bp, setBp] = useState("");
  const [sugar, setSugar] = useState("");
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Hardcoded API base URL for now
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/health`;

  const parseBP = (bp: string) => {
    const parts = bp.split("/");
    if (parts.length !== 2) return { systolic: NaN, diastolic: NaN };
    const [systolic, diastolic] = parts.map(Number);
    return { systolic, diastolic };
  };

  const isValidBP = (bp: string) => {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (!bpRegex.test(bp)) return false;
    const { systolic, diastolic } = parseBP(bp);
    return systolic > 50 && systolic < 250 && diastolic > 30 && diastolic < 150;
  };

  const isValidSugar = (s: string) => {
    const val = parseFloat(s);
    return !isNaN(val) && val > 0 && val < 100;
  };
  const isValidWeight = (w: string) => {
    const val = parseFloat(w);
    return !isNaN(val) && val > 10 && val < 500;
  };

  const chartData = entries.map((entry) => {
    const { systolic, diastolic } = parseBP(entry.bp || "0/0");
    return {
      date: entry.date,
      systolic: isNaN(systolic) ? 0 : systolic,
      diastolic: isNaN(diastolic) ? 0 : diastolic,
      sugar: parseFloat(entry.sugar) || 0,
      weight: parseFloat(entry.weight) || 0,
    };
  });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      // Changed here: userId as path param, not query param
      const res = await axios.get<Entry[]>(`${API_BASE}/${userId}`);
      setEntries(res.data);
      setError("");
    } catch (err: any) {
      console.error("Failed to fetch health entries:", err);
      setError("তথ্য আনতে সমস্যা হয়েছে। সার্ভার চালু আছে কিনা দেখুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchEntries();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    const date = new Date().toISOString().split("T")[0];

    if (!bp || !sugar || !weight) {
      setError("সবগুলো ফিল্ড পূরণ করুন।");
      return;
    }

    if (!isValidBP(bp)) {
      setError("BP ফরম্যাট সঠিক নয়। যেমন: 120/80");
      return;
    }
    if (!isValidSugar(sugar)) {
      setError("সঠিক পরিমাণে চিনি দিন (উদা: 6.5)");
      return;
    }
    if (!isValidWeight(weight)) {
      setError("সঠিক ওজন দিন (উদা: 65)");
      return;
    }

    if (entries.some((e) => e.date === date)) {
      setError("এই দিনের জন্য ইতিমধ্যেই একটি এন্ট্রি রয়েছে।");
      return;
    }

    try {
      const res = await axios.post<Entry>(API_BASE, {
        userId,
        bp,
        sugar,
        weight,
        date,
      });
      setEntries((prev) => [...prev, res.data]);
      setBp("");
      setSugar("");
      setWeight("");
      setError("");
      setSuccess("তথ্য সফলভাবে সংরক্ষণ হয়েছে।");
    } catch (err) {
      console.error("Failed to save entry:", err);
      setError("তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/entry/${id}`); // updated path
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
      setError("");
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setError("ডিলিট করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 text-gray-200 font-inter">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 mb-8"
      >
        <h2 className="text-3xl font-bold text-blue-400 text-center mb-6">
          স্বাস্থ্য ট্র্যাকার
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-400 text-center mb-4">{success}</p>
        )}

        <div className="mb-4">
          <label htmlFor="bp" className="block mb-2 text-gray-300 font-medium">
            রক্তচাপ (BP)
          </label>
          <input
            id="bp"
            type="text"
            value={bp}
            onChange={(e) => setBp(e.target.value)}
            placeholder="উদাহরণ: 120/80"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="sugar"
            className="block mb-2 text-gray-300 font-medium"
          >
            রক্তে চিনির পরিমাণ (mmol/L)
          </label>
          <input
            id="sugar"
            type="text"
            value={sugar}
            onChange={(e) => setSugar(e.target.value)}
            placeholder="উদাহরণ: 6.5"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="weight"
            className="block mb-2 text-gray-300 font-medium"
          >
            ওজন (কেজি)
          </label>
          <input
            id="weight"
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="উদাহরণ: 65"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          সংরক্ষণ করুন
        </button>
      </form>

      {/* Entry List */}
      <div className="bg-gray-800 p-6 rounded-2xl mb-8">
        <h3 className="text-2xl font-bold text-blue-400 mb-4">
          পুরোনো তথ্যসমূহ
        </h3>
        {loading ? (
          <p className="text-gray-400 text-center">লোড হচ্ছে...</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-400 text-center">কোনো তথ্য নেই।</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry._id ?? entry.date}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center text-sm"
              >
                <div>
                  📅 {entry.date} — BP: {entry.bp}, চিনি: {entry.sugar}, ওজন:{" "}
                  {entry.weight}kg
                </div>
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                >
                  ডিলিট
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-gray-800 p-6 rounded-2xl">
        <h3 className="text-2xl font-bold text-blue-400 text-center mb-6">
          স্বাস্থ্য চার্ট
        </h3>

        <Chart
          title="রক্তচাপের প্রবণতা"
          data={chartData}
          lines={[
            { dataKey: "systolic", stroke: "#8884d8", name: "সিস্টোলিক" },
            { dataKey: "diastolic", stroke: "#82ca9d", name: "ডায়াস্টোলিক" },
          ]}
        />

        <Chart
          title="রক্তে চিনির প্রবণতা"
          data={chartData}
          lines={[{ dataKey: "sugar", stroke: "#ff7300", name: "চিনি" }]}
        />

        <Chart
          title="ওজনের প্রবণতা"
          data={chartData}
          lines={[{ dataKey: "weight", stroke: "#387908", name: "ওজন" }]}
        />
      </div>
    </div>
  );
}

function Chart({
  title,
  data,
  lines,
}: {
  title: string;
  data: any[];
  lines: { dataKey: string; stroke: string; name: string }[];
}) {
  return (
    <div className="mb-10">
      <h4 className="text-xl font-semibold text-gray-300 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#374151",
              borderRadius: "8px",
              border: "none",
            }}
            labelStyle={{ color: "#e5e7eb" }}
            itemStyle={{ color: "#e5e7eb" }}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              name={line.name}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

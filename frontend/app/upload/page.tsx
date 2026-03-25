"use client";
import { useState } from "react";
import { uploadFile, addTransaction } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await uploadFile(file);
      setResult(data.transactions);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAll() {
    setLoading(true);
    for (const tx of result) {
      await addTransaction(tx);
    }
    setSaved(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-400 mb-6">Upload Bank Statement</h1>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <input
          type="file"
          accept=".csv,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4 block text-sm text-gray-300"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          {loading ? "Parsing..." : "Parse File"}
        </button>
        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>

      {result.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">{result.length} transactions found</h2>
            <button
              onClick={handleSaveAll}
              disabled={loading || saved}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              {saved ? "Saved!" : "Save All & Categorize"}
            </button>
          </div>
          <div className="space-y-2">
            {result.map((tx, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 flex justify-between text-sm">
                <span className="text-gray-300">{tx.date} — {tx.description}</span>
                <span className={tx.amount < 0 ? "text-red-400" : "text-emerald-400"}>
                  ${tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

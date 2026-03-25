"use client";
import { useState } from "react";
import { getSavingsAdvice } from "@/lib/api";

export default function AdvicePage() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchAdvice() {
    setLoading(true);
    setError("");
    try {
      const data = await getSavingsAdvice();
      setAdvice(data.advice);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-400 mb-6">AI Savings Advice</h1>
      <p className="text-gray-400 mb-6">
        Our AI analyzes your recent transactions and gives personalized savings tips.
      </p>

      <button
        onClick={fetchAdvice}
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition mb-6"
      >
        {loading ? "Thinking..." : "Get Advice"}
      </button>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {advice && (
        <div className="bg-gray-800 rounded-xl p-6 whitespace-pre-wrap text-gray-200 leading-relaxed">
          {advice}
        </div>
      )}
    </main>
  );
}

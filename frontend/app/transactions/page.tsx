"use client";
import { useEffect, useState } from "react";
import { getTransactions, reviewTransaction } from "@/lib/api";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Income", "Transfer", "Other"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then(setTransactions).finally(() => setLoading(false));
  }, []);

  async function handleAction(id: number, action: "accept" | "reject", category?: string) {
    await reviewTransaction({ id, action, category });
    setTransactions((prev) =>
      action === "reject" ? prev.filter((t) => t.id !== id) : prev.map((t) => t.id === id ? { ...t, reviewed: true, category } : t)
    );
  }

  if (loading) return <main className="min-h-screen bg-gray-950 text-white p-8">Loading...</main>;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-400 mb-6">Transactions</h1>

      {transactions.length === 0 && (
        <p className="text-gray-400">No transactions yet. Upload a bank statement first.</p>
      )}

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className={`bg-gray-800 rounded-xl p-4 ${tx.reviewed ? "opacity-60" : ""}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-gray-400 text-sm">{tx.date} · {tx.source}</p>
              </div>
              <span className={`text-lg font-bold ${tx.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                ${tx.amount}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                {tx.category || "Uncategorized"} ({tx.confidence ?? "?"}%)
              </span>

              {!tx.reviewed && (
                <>
                  <select
                    defaultValue={tx.category}
                    onChange={(e) => handleAction(tx.id, "accept", e.target.value)}
                    className="text-xs bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button
                    onClick={() => handleAction(tx.id, "accept")}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(tx.id, "reject")}
                    className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
                  >
                    Reject
                  </button>
                </>
              )}
              {tx.reviewed && <span className="text-xs text-emerald-400">Reviewed</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

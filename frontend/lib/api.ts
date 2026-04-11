/**
 * API client — all communication with the backend lives here.
 *
 * Base URL is controlled by the NEXT_PUBLIC_API_URL env variable.
 * Set it in `.env.local` for local development, and in your deployment
 * environment for staging / production.
 *
 * Example .env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000
 */

import type {
  Transaction,
  UploadResponse,
  PortfolioResponse
} from "@/types/finance";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText} (${path})`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Transactions  →  backend/routes/transactions.py
// ---------------------------------------------------------------------------

/**
 * GET /api/transactions/
 * Returns all stored transactions, ordered by date descending.
 */
export function getTransactions(): Transaction[] {
  const data = JSON.parse(localStorage.getItem('transactions') ?? "[]") as Transaction[];
  return data;
}

/**
 * POST /api/transactions/bulk
 * Save all transactions parsed from an uploaded file in one request.
 * Triggers LLM categorization for each transaction on the backend.
 */
export function bulkSaveTransactions(
  transactions: Transaction[]
) {
  const key = "transactions";
  const idKey = "id";
  let mxId = parseInt(localStorage.getItem(idKey) ?? "0");
  const prevTransactions = JSON.parse(localStorage.getItem(key) ?? "[]") as Transaction[];
  transactions = transactions.map((transac) => {
    transac.id=mxId++;
    return transac;
  });
  let allTransac = prevTransactions.concat(transactions);
  localStorage.setItem(idKey, mxId.toString());
  localStorage.setItem(key, JSON.stringify(allTransac));
}

/**
 * POST /api/transactions/review
 * Accept, edit, or reject an AI-classified transaction.
 */
export function reviewTransaction(review: {
  id: number;
  action: "accept" | "edit" | "reject";
  category?: string;
  description?: string;
}) {
  const key = "transactions";
  let transactions = JSON.parse(localStorage.getItem(key) ?? "[]") as Transaction[];
  if (review.action === "reject") {
    transactions = transactions.filter((transac) => transac.id !== review.id);
  } else if (review.action === "edit") {
    transactions.map((transac) => {
      if (transac.id === review.id) {
        transac.category = review.category;
      }
    });
  } else if (review.action == "accept") {
    transactions.map((transac) => {
      if (transac.id === review.id) {
        transac.reviewed = true;
      }
    })
  }
  localStorage.setItem(key, JSON.stringify(transactions));
}

// ---------------------------------------------------------------------------
// File upload  →  backend/routes/parser.py
// ---------------------------------------------------------------------------

/**
 * POST /api/parser/upload
 * Upload a PDF / CSV bank statement for parsing.
 * Returns the extracted transactions — call bulkSaveTransactions() to persist them.
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<UploadResponse>("/api/parser/upload", {
    method: "POST",
    body: form,
  });
}

// ---------------------------------------------------------------------------
// AI advice  →  backend/routes/transactions.py
// ---------------------------------------------------------------------------

/**
 * GET /api/transactions/advice
 * Returns AI-generated savings recommendations based on stored transaction history.
 */
export async function getSavingsAdvice(): Promise<{ advice: string }> {
  return apiFetch<{ advice: string }>("/api/transactions/advice");
}

// ---------------------------------------------------------------------------
// Portfolio  →  backend/routes/portfolio.py  (planned)
//
// TODO: implement GET /api/portfolio/ on the backend.
//       The dashboard falls back to demo data from lib/demo-data.ts until then.
// ---------------------------------------------------------------------------

/**
 * GET /api/portfolio/
 * Returns current holdings and historical value snapshots.
 */
export async function getPortfolio(): Promise<PortfolioResponse> {
  return apiFetch<PortfolioResponse>("/api/portfolio/");
}

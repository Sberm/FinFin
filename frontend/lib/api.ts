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
  TransactionsResponse,
  UploadResponse,
  BulkTransactionsResponse,
  PortfolioResponse,
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
export async function getTransactions(): Promise<Transaction[]> {
  const data = await apiFetch<TransactionsResponse | Transaction[]>("/api/transactions/");
  // Support both `{ transactions: [...] }` and bare `[...]` response shapes
  return Array.isArray(data) ? data : (data as TransactionsResponse).transactions ?? [];
}

/**
 * POST /api/transactions/
 * Manually create a single transaction. Triggers LLM categorization.
 */
export async function addTransaction(
  data: Pick<Transaction, "date" | "description" | "amount" | "source">
): Promise<Transaction> {
  return apiFetch<Transaction>("/api/transactions/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * POST /api/transactions/bulk
 * Save all transactions parsed from an uploaded file in one request.
 * Triggers LLM categorization for each transaction on the backend.
 */
export async function bulkSaveTransactions(
  transactions: Pick<Transaction, "date" | "description" | "amount" | "source">[]
): Promise<BulkTransactionsResponse> {
  return apiFetch<BulkTransactionsResponse>("/api/transactions/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions }),
  });
}

/**
 * POST /api/transactions/review
 * Accept, edit, or reject an AI-classified transaction.
 */
export async function reviewTransaction(review: {
  id: number;
  action: "accept" | "edit" | "reject";
  category?: string;
  description?: string;
}): Promise<Transaction | { status: string }> {
  return apiFetch<Transaction | { status: string }>("/api/transactions/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
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

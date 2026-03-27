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
// Transactions  →  backend/api/views.py  TransactionViewSet
// ---------------------------------------------------------------------------

/**
 * GET /api/transactions/
 * Returns all transactions for the authenticated user (or global for MVP).
 */
export async function getTransactions(): Promise<Transaction[]> {
  const data = await apiFetch<TransactionsResponse | Transaction[]>("/api/transactions/");
  // Support both `{ transactions: [...] }` and bare `[...]` response shapes
  return Array.isArray(data) ? data : (data as TransactionsResponse).transactions ?? [];
}

/**
 * POST /api/transactions/
 * Manually create a single transaction.
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
 * POST /api/transactions/review
 * Accept, edit, or reject an AI-classified transaction.
 */
export async function reviewTransaction(review: {
  id: number;
  action: "accept" | "edit" | "reject";
  category?: string;
  description?: string;
}): Promise<Transaction> {
  return apiFetch<Transaction>("/api/transactions/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
}

// ---------------------------------------------------------------------------
// File upload  →  backend/api/views.py  ParserViewSet
// ---------------------------------------------------------------------------

/**
 * POST /api/parser/upload
 * Upload a PDF / CSV bank statement for AI parsing.
 */
export async function uploadFile(file: File): Promise<{ transactions: Transaction[] }> {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ transactions: Transaction[] }>("/api/parser/upload", {
    method: "POST",
    body: form,
  });
}

// ---------------------------------------------------------------------------
// AI advice  →  backend/api/views.py  AdviceViewSet
// ---------------------------------------------------------------------------

/**
 * GET /api/transactions/advice
 * Returns AI-generated savings recommendations based on spending patterns.
 */
export async function getSavingsAdvice(): Promise<{ advice: string }> {
  return apiFetch<{ advice: string }>("/api/transactions/advice");
}

// ---------------------------------------------------------------------------
// Portfolio  →  backend/api/views.py  PortfolioViewSet  (planned)
//
// TODO: implement these endpoints on the backend.
//       Until then, the dashboard falls back to demo data from lib/demo-data.ts
// ---------------------------------------------------------------------------

/**
 * GET /api/portfolio/
 * Returns current holdings and historical value snapshots.
 */
export async function getPortfolio(): Promise<PortfolioResponse> {
  return apiFetch<PortfolioResponse>("/api/portfolio/");
}

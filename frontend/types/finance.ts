/**
 * Shared TypeScript interfaces that mirror the backend FastAPI/SQLAlchemy schema.
 *
 * Keep these in sync with:
 *   backend/models/transaction.py  (Pydantic models + SQLAlchemy ORM)
 *   db/schema.sql                  (PostgreSQL table definitions)
 *
 * Field names use snake_case to match the JSON the API returns directly.
 */

// ---------------------------------------------------------------------------
// Banking / Transactions
// ---------------------------------------------------------------------------

export interface Transaction {
  id?: number;
  date: string;          // ISO 8601 "YYYY-MM-DD"
  description: string;
  amount: number;        // positive = income, negative = expense
  category?: string;     // e.g. "Food", "Bills", "Income" — set by AI classifier
  source?: string;       // "csv" | "pdf" | "manual"
  reviewed?: boolean;    // false until user accepts or edits in the Transactions page
}

/** Shape returned by GET /api/transactions/ */
export interface TransactionsResponse {
  transactions: Transaction[];
}

/** Shape returned by POST /api/parser/upload */
export interface UploadResponse {
  count: number;
  transactions: Transaction[];
}

/** Shape returned by POST /api/transactions/bulk */
export interface BulkTransactionsResponse {
  count: number;
  transactions: Transaction[];
}

// ---------------------------------------------------------------------------
// Investment Portfolio
// ---------------------------------------------------------------------------

export interface Holding {
  ticker: string;      // e.g. "AAPL"
  name: string;        // e.g. "Apple Inc."
  shares: number;
  avg_cost: number;    // cost basis per share
  price: number;       // current market price per share
  sector: string;      // e.g. "Tech", "ETF", "Crypto"
}

export interface PortfolioSnapshot {
  month: string;       // "YYYY-MM" — one data point per month
  value: number;       // total portfolio market value at end of month
}

/** Shape returned by GET /api/portfolio/ */
export interface PortfolioResponse {
  holdings: Holding[];
  history: PortfolioSnapshot[];
}

// ---------------------------------------------------------------------------
// Derived / chart-ready types (computed on the frontend, never from the API)
// ---------------------------------------------------------------------------

export interface CategoryStat {
  category: string;
  total: number;
  color: string;
}

export interface MonthlyNet {
  month: string;
  net: number;
}

export interface SectorAllocation {
  name: string;   // sector label
  value: number;  // total market value in that sector
  fill: string;   // chart color
}

/**
 * Shared TypeScript interfaces that mirror the backend Django models / API schema.
 *
 * Keep these in sync with:
 *   backend/api/models.py   (Django models)
 *   backend/api/serializers.py (DRF serializers)
 *
 * Field names intentionally use snake_case to match the JSON the API returns.
 * The frontend layer converts to camelCase only in display logic, never in fetch/store.
 */

// ---------------------------------------------------------------------------
// Banking / Transactions
// ---------------------------------------------------------------------------

export interface Transaction {
  id?: number;
  date: string;        // ISO 8601 "YYYY-MM-DD"
  description: string;
  amount: number;      // positive = income, negative = expense
  category?: string;   // e.g. "Food", "Bills", "Income" — set by AI classifier
  source?: string;     // e.g. "upload", "manual"
}

/** Shape returned by GET /api/transactions/ */
export interface TransactionsResponse {
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
}

export interface MonthlyNet {
  month: string;
  net: number;
}

export interface SectorAllocation {
  name: string;        // sector label
  value: number;       // total market value in that sector
  fill: string;        // chart color
}

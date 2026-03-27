/**
 * Demo / seed data used when the backend is unavailable or returns no records.
 *
 * HOW TO REMOVE DEMO DATA
 * ───────────────────────
 * 1. Delete this file.
 * 2. In `lib/api.ts`, remove the `demo` fallback imports from `getTransactions`
 *    and `getPortfolio`.
 * 3. In `app/dashboard/page.tsx`, remove the `|| demoHoldings` / `|| demoHistory`
 *    fallbacks from the useEffect blocks.
 *
 * All values are fictional and for UI demonstration only.
 */

import type { Transaction, Holding, PortfolioSnapshot } from "@/types/finance";

// ---------------------------------------------------------------------------
// Transactions (3 months of income + expenses)
// ---------------------------------------------------------------------------

export const demoTransactions: Transaction[] = [
  { date: "2025-01-05", description: "Paycheck",        amount:  3200,   category: "Income"        },
  { date: "2025-01-08", description: "Rent",             amount: -1200,   category: "Bills"         },
  { date: "2025-01-10", description: "Grocery Store",    amount:   -85.5, category: "Food"          },
  { date: "2025-01-12", description: "Netflix",          amount:   -15.99,category: "Entertainment" },
  { date: "2025-01-14", description: "Gas Station",      amount:   -52,   category: "Transport"     },
  { date: "2025-01-18", description: "Restaurant",       amount:   -43.2, category: "Food"          },
  { date: "2025-01-22", description: "Amazon",           amount:  -129,   category: "Shopping"      },
  { date: "2025-01-25", description: "Doctor Visit",     amount:   -60,   category: "Health"        },
  { date: "2025-02-05", description: "Paycheck",         amount:  3200,   category: "Income"        },
  { date: "2025-02-07", description: "Rent",             amount: -1200,   category: "Bills"         },
  { date: "2025-02-09", description: "Grocery Store",    amount:   -91,   category: "Food"          },
  { date: "2025-02-11", description: "Spotify",          amount:    -9.99,category: "Entertainment" },
  { date: "2025-02-13", description: "Uber",             amount:   -22.5, category: "Transport"     },
  { date: "2025-02-17", description: "Pharmacy",         amount:   -34,   category: "Health"        },
  { date: "2025-02-20", description: "Clothing Store",   amount:   -76,   category: "Shopping"      },
  { date: "2025-02-24", description: "Electric Bill",    amount:   -95,   category: "Bills"         },
  { date: "2025-03-05", description: "Paycheck",         amount:  3200,   category: "Income"        },
  { date: "2025-03-06", description: "Rent",             amount: -1200,   category: "Bills"         },
  { date: "2025-03-10", description: "Grocery Store",    amount:   -78.3, category: "Food"          },
  { date: "2025-03-12", description: "Cinema",           amount:   -28,   category: "Entertainment" },
  { date: "2025-03-15", description: "Gas Station",      amount:   -48,   category: "Transport"     },
  { date: "2025-03-18", description: "Restaurant",       amount:   -55,   category: "Food"          },
  { date: "2025-03-21", description: "Online Shopping",  amount:  -112,   category: "Shopping"      },
  { date: "2025-03-28", description: "Internet Bill",    amount:   -60,   category: "Bills"         },
];

// ---------------------------------------------------------------------------
// Portfolio holdings (current positions)
// ---------------------------------------------------------------------------

export const demoHoldings: Holding[] = [
  { ticker: "AAPL",  name: "Apple Inc.",        shares: 12,   avg_cost: 145.30, price: 189.50, sector: "Tech"    },
  { ticker: "MSFT",  name: "Microsoft Corp.",   shares: 8,    avg_cost: 280.00, price: 415.20, sector: "Tech"    },
  { ticker: "VTI",   name: "Vanguard Total Mkt",shares: 25,   avg_cost: 210.00, price: 248.60, sector: "ETF"     },
  { ticker: "GOOGL", name: "Alphabet Inc.",      shares: 5,    avg_cost: 135.00, price: 172.80, sector: "Tech"    },
  { ticker: "JPM",   name: "JPMorgan Chase",     shares: 10,   avg_cost: 155.40, price: 198.30, sector: "Finance" },
  { ticker: "BTC",   name: "Bitcoin",            shares: 0.18, avg_cost: 42000,  price: 68500,  sector: "Crypto"  },
];

// ---------------------------------------------------------------------------
// Portfolio value history (one snapshot per month, for the line chart)
// ---------------------------------------------------------------------------

export const demoPortfolioHistory: PortfolioSnapshot[] = [
  { month: "2024-10", value: 18200 },
  { month: "2024-11", value: 19450 },
  { month: "2024-12", value: 21800 },
  { month: "2025-01", value: 20600 },
  { month: "2025-02", value: 23100 },
  { month: "2025-03", value: 25430 },
];

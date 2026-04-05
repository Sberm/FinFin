"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

import { getTransactions, getPortfolio } from "@/lib/api";
import { demoTransactions, demoHoldings, demoPortfolioHistory } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";

import type { BarShapeProps } from "recharts/types/cartesian/Bar";
import type {
  Transaction,
  Holding,
  PortfolioSnapshot,
  CategoryStat,
  MonthlyNet,
  SectorAllocation,
} from "@/types/finance";

// ---------------------------------------------------------------------------
// Chart theme
// ---------------------------------------------------------------------------

/** Retro color palette used across all charts. */
const PALETTE = [
  "#e63946", "#f4a261", "#2a9d8f", "#e9c46a",
  "#a8dadc", "#457b9d", "#6a4c93", "#1982c4", "#264653",
];

const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--card)",
  border: "2px solid var(--foreground)",
  borderRadius: 0,
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 9,
};

const CHART_TICK_STYLE = {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 7,
  fill: "var(--muted-foreground)",
};

// ---------------------------------------------------------------------------
// Derived-data helpers  (pure functions — easy to unit-test)
// ---------------------------------------------------------------------------

function computeCategoryStats(transactions: Transaction[]): CategoryStat[] {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const key = t.category ?? "Other";
    map[key] = (map[key] ?? 0) + Math.abs(t.amount);
  }
  return Object.entries(map)
    .map(([category, total]) => ({ category, total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total)
    .map((item, i) => ({ ...item, color: PALETTE[i % PALETTE.length] }));
}

function computeMonthlyNet(transactions: Transaction[]): MonthlyNet[] {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    const month = t.date?.slice(0, 7) ?? "Unknown";
    map[month] = (map[month] ?? 0) + t.amount;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, net]) => ({ month, net: parseFloat(net.toFixed(2)) }));
}

function computeSectorAllocation(holdings: Holding[]): SectorAllocation[] {
  const map: Record<string, number> = {};
  for (const h of holdings) {
    map[h.sector] = (map[h.sector] ?? 0) + h.shares * h.price;
  }
  return Object.entries(map).map(([sector, value], i) => ({
    name: sector,
    value: parseFloat(value.toFixed(2)),
    fill: PALETTE[i % PALETTE.length],
  }));
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = getTransactions()
      .then((data) => setTransactions(data.length > 0 ? data : demoTransactions))
      .catch(() => setTransactions(demoTransactions));

    // TODO: remove the demo fallback once GET /api/portfolio/ is implemented
    const loadPortfolio = getPortfolio()
      .then((data) => {
        setHoldings(data.holdings.length > 0 ? data.holdings : demoHoldings);
        setPortfolioHistory(data.history.length > 0 ? data.history : demoPortfolioHistory);
      })
      .catch(() => {
        setHoldings(demoHoldings);
        setPortfolioHistory(demoPortfolioHistory);
      });

    Promise.all([loadTransactions, loadPortfolio])
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Early returns ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <p className="retro text-xs text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="retro text-xl font-bold text-primary">Dashboard</h1>
        <p className="retro text-xs text-destructive">{error}</p>
        <p className="retro text-[10px] text-muted-foreground">
          Make sure the backend is running and NEXT_PUBLIC_API_URL is set correctly.
        </p>
      </main>
    );
  }

  if (transactions.length === 0) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="retro text-xl font-bold text-primary">Dashboard</h1>
        <p className="retro text-xs text-muted-foreground">
          No data yet. Upload a bank statement first.
        </p>
      </main>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const income   = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net      = income - expenses;

  const categoryStats  = computeCategoryStats(transactions);
  const monthlyNetData = computeMonthlyNet(transactions);

  const portfolioValue    = holdings.reduce((s, h) => s + h.shares * h.price, 0);
  const portfolioCost     = holdings.reduce((s, h) => s + h.shares * h.avg_cost, 0);
  const portfolioGain     = portfolioValue - portfolioCost;
  const portfolioGainPct  = portfolioCost > 0 ? (portfolioGain / portfolioCost) * 100 : 0;
  const sectorAllocation  = computeSectorAllocation(holdings);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto space-y-10">
      <h1 className="retro text-xl font-bold text-primary">Dashboard</h1>

      {/* ── Banking Overview ────────────────────────────────────────────── */}
      <section aria-labelledby="banking-heading" className="space-y-8">
        <h2 id="banking-heading" className="retro text-sm font-bold text-primary">
          Banking Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <SummaryCard label="Total Income"   value={`$${income.toFixed(2)}`}   valueClass="text-primary" />
          <SummaryCard label="Total Expenses" value={`$${expenses.toFixed(2)}`} valueClass="text-destructive" />
          <SummaryCard
            label="Net Balance"
            value={`$${net.toFixed(2)}`}
            valueClass={net >= 0 ? "text-primary" : "text-destructive"}
          />
          <SummaryCard label="Transactions" value={String(transactions.length)} valueClass="text-foreground" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spending by category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px]">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryStats} margin={{ top: 8, right: 8, left: 8, bottom: 52 }}>
                  <XAxis dataKey="category" tick={CHART_TICK_STYLE} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={CHART_TICK_STYLE} tickFormatter={(v) => `$${v}`} width={58} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const { color, category, total } = payload[0].payload as CategoryStat;
                      return (
                        <div style={{ ...CHART_TOOLTIP_STYLE, padding: "6px 10px" }}>
                          <p style={{ color, margin: 0 }}>{category}</p>
                          <p style={{ color, margin: 0 }}>${total.toFixed(2)} spent</p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="total"
                    isAnimationActive
                    shape={(props: BarShapeProps) => {
                      const { x, y, width, height, payload } = props;
                      const color = (payload as CategoryStat)?.color ?? "#888";
                      return <rect x={x} y={y} width={Number(width)} height={Number(height)} fill={color} />;
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Net balance over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px]">Net Balance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyNetData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="month" tick={CHART_TICK_STYLE} />
                  <YAxis tick={CHART_TICK_STYLE} tickFormatter={(v) => `$${v}`} width={58} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, "Net"]}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="net"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Investment Portfolio ─────────────────────────────────────────── */}
      <section aria-labelledby="portfolio-heading" className="space-y-8">
        <h2 id="portfolio-heading" className="retro text-sm font-bold text-primary">
          Investment Portfolio
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <SummaryCard label="Portfolio Value" value={`$${portfolioValue.toFixed(2)}`} valueClass="text-primary" />
          <SummaryCard
            label="Total Gain / Loss"
            value={`${portfolioGain >= 0 ? "+" : ""}$${portfolioGain.toFixed(2)}`}
            valueClass={portfolioGain >= 0 ? "text-primary" : "text-destructive"}
          />
          <SummaryCard
            label="Return %"
            value={`${portfolioGainPct >= 0 ? "+" : ""}${portfolioGainPct.toFixed(2)}%`}
            valueClass={portfolioGainPct >= 0 ? "text-primary" : "text-destructive"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio value over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px]">Portfolio Value Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={portfolioHistory} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="month" tick={CHART_TICK_STYLE} />
                  <YAxis tick={CHART_TICK_STYLE} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={52} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v) => [`$${Number(v).toLocaleString()}`, "Value"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={PALETTE[2]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: PALETTE[2], strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sector allocation pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[10px]">Allocation by Sector</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={sectorAllocation}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, "Value"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Holdings table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[10px]">Holdings</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-[9px] retro border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground">
                  {["Ticker", "Name", "Shares", "Avg Cost", "Price", "Market Val", "Gain / Loss", "%"].map((col) => (
                    <th key={col} className="text-left py-2 pr-4 text-muted-foreground font-normal">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const marketValue = h.shares * h.price;
                  const gainLoss    = marketValue - h.shares * h.avg_cost;
                  const gainPct     = h.avg_cost > 0 ? (gainLoss / (h.shares * h.avg_cost)) * 100 : 0;
                  const gainClass   = gainLoss >= 0 ? "text-primary" : "text-destructive";
                  return (
                    <tr key={h.ticker} className="border-b border-muted">
                      <td className="py-2 pr-4 font-bold text-primary">{h.ticker}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{h.name}</td>
                      <td className="py-2 pr-4">{h.shares}</td>
                      <td className="py-2 pr-4">${h.avg_cost.toFixed(2)}</td>
                      <td className="py-2 pr-4">${h.price.toFixed(2)}</td>
                      <td className="py-2 pr-4">${marketValue.toFixed(2)}</td>
                      <td className={`py-2 pr-4 ${gainClass}`}>
                        {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
                      </td>
                      <td className={`py-2 ${gainClass}`}>
                        {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Small reusable sub-component (local — not worth a separate file at this size)
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[10px]">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`retro text-base font-bold ${valueClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

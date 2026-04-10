"use client";
import { useEffect, useState } from "react";
import { getTransactions, reviewTransaction } from "@/lib/api";
import type { Transaction } from "@/types/finance";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Income", "Transfer", "Other"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  if (loading) return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <p className="retro text-xs text-muted-foreground">Loading...</p>
    </main>
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="retro text-xl font-bold text-primary">Transactions</h1>

      {transactions.length === 0 && (
        <p className="retro text-xs text-muted-foreground">No transactions yet. Upload a bank statement first.</p>
      )}

      <div className="space-y-4">
        {transactions.map((tx) => (
          <Card key={tx.id} className={tx.reviewed ? "opacity-60" : ""}>
            <CardContent className="space-y-3 py-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="retro text-xs font-medium text-foreground">{tx.description}</p>
                  <p className="retro text-[10px] text-muted-foreground">{tx.date} · {tx.source}</p>
                </div>
                <span className={`retro text-sm font-bold ${tx.amount < 0 ? "text-destructive" : "text-primary"}`}>
                  ${tx.amount}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant={tx.reviewed ? "secondary" : "default"}>
                  <span className="retro text-[9px]">
                    {tx.category || "Uncategorized"}
                  </span>
                </Badge>

                {!tx.reviewed && (
                  <>
                    <Select
                      defaultValue={tx.category}
                      onValueChange={(value) => handleAction(tx.id!, "accept", value as string)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="retro text-[10px]">{c}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(tx.id!, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(tx.id!, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {tx.reviewed && (
                  <span className="retro text-[10px] text-primary">Reviewed</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

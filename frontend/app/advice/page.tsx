"use client";
import { useState } from "react";
import { getSavingsAdvice } from "@/lib/api";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/8bit/card";

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
    <main className="min-h-screen p-8 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="retro text-xl font-bold text-primary">AI Savings Advice</h1>
        <p className="retro text-[10px] text-muted-foreground">
          Our AI analyzes your recent transactions and gives personalized savings tips.
        </p>
      </div>

      <Button onClick={fetchAdvice} disabled={loading}>
        {loading ? "Thinking..." : "Get Advice"}
      </Button>

      {error && <p className="retro text-[10px] text-destructive">{error}</p>}

      {advice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs">Your Savings Tips</CardTitle>
            <CardDescription>Personalized by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="retro text-[10px] leading-relaxed text-foreground whitespace-pre-wrap">
              {advice}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

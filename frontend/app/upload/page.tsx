"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadFile, bulkSaveTransactions, upsertHolding } from "@/lib/api";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/8bit/card";
import type { Transaction, Holding } from "@/types/finance";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<Transaction[]>([]);
  const [parsedHoldings, setParsedHoldings] = useState<Holding[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;
    setError("");

    try {
      // Step 1: parse file → show preview immediately
      setParsing(true);
      const data = await uploadFile(file);
      setParsed(data.transactions);
      setParsedHoldings(data.holdings ?? []);
      setParsing(false);

      // Step 2: save transactions + holdings → redirect on done
      setSaving(true);
      const saves: Promise<unknown>[] = [];

      if (data.transactions.length > 0) {
        saves.push(bulkSaveTransactions(data.transactions));
      }
      if (data.holdings && data.holdings.length > 0) {
        saves.push(...data.holdings.map((h) => upsertHolding(h)));
      }

      await Promise.all(saves);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setParsing(false);
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="retro text-xl font-bold text-primary">Upload Bank Statement</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select File</CardTitle>
          <CardDescription>Accepts .csv or .pdf — CSV may include both expenses and investments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={parsing || saving}>
              Choose File
            </Button>
            <span className="retro text-[10px] text-muted-foreground">
              {file ? file.name : "No file chosen"}
            </span>
          </div>
          <Button onClick={handleUpload} disabled={!file || parsing || saving}>
            {parsing ? "Uploading..." : "Upload & Generate Dashboard"}
          </Button>
          {error && <p className="retro text-[10px] text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {parsed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="retro text-xs text-foreground">{parsed.length} transactions found</h2>
            {saving && (
              <span className="retro text-[10px] text-muted-foreground animate-pulse">
                Categorizing & saving...
              </span>
            )}
          </div>

          <div className="space-y-3">
            {parsed.map((tx, i) => (
              <Card key={i}>
                <CardContent className="flex justify-between items-center py-3">
                  <span className="retro text-[10px] text-muted-foreground">
                    {tx.date} — {tx.description}
                  </span>
                  <span className={`retro text-xs font-bold ${tx.amount < 0 ? "text-destructive" : "text-primary"}`}>
                    ${tx.amount}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {parsedHoldings.length > 0 && (
        <div className="space-y-4">
          <h2 className="retro text-xs text-foreground">{parsedHoldings.length} holdings found</h2>
          <div className="space-y-3">
            {parsedHoldings.map((h, i) => (
              <Card key={i}>
                <CardContent className="flex justify-between items-center py-3">
                  <span className="retro text-[10px] text-muted-foreground">
                    <span className="font-bold text-primary">{h.ticker}</span> — {h.name} ({h.sector})
                  </span>
                  <span className="retro text-xs font-bold text-primary">
                    {h.shares} shares @ ${h.price}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

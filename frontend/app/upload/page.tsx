"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadFile, bulkSaveTransactions } from "@/lib/api";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/8bit/card";
import type { Transaction } from "@/types/finance";

const CATEGORY_COLORS: Record<string, string> = {
  Food:          "bg-orange-100 text-orange-700",
  Transport:     "bg-blue-100 text-blue-700",
  Shopping:      "bg-pink-100 text-pink-700",
  Bills:         "bg-yellow-100 text-yellow-700",
  Health:        "bg-green-100 text-green-700",
  Entertainment: "bg-purple-100 text-purple-700",
  Income:        "bg-emerald-100 text-emerald-700",
  Transfer:      "bg-gray-100 text-gray-700",
  Other:         "bg-slate-100 text-slate-700",
};

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<Transaction[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isPdf = file?.name.toLowerCase().endsWith(".pdf") ?? false;

  async function handleUpload() {
    if (!file) return;
    setError("");

    try {
      // Step 1: parse file → show preview immediately
      // For PDFs the backend calls the LLM to extract transactions from free-form text.
      setParsing(true);
      const data = await uploadFile(file);
      setParsed(data.transactions);
      setParsing(false);

      // Step 2: save to DB; LLM categorization is skipped for transactions
      // that already have a category (i.e. those extracted from PDFs).
      setSaving(true);
      bulkSaveTransactions(data.transactions);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setParsing(false);
      setSaving(false);
    }
  }

  function parsingLabel() {
    if (!parsing) return "Upload & Generate Dashboard";
    return isPdf ? "Analyzing PDF with AI..." : "Uploading...";
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="retro text-xl font-bold text-primary">Upload Bank Statement</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select File</CardTitle>
          <CardDescription>Accepts .csv or .pdf</CardDescription>
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
            {parsingLabel()}
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
                Saving to dashboard...
              </span>
            )}
          </div>

          <div className="space-y-3">
            {parsed.map((tx, i) => (
              <Card key={i}>
                <CardContent className="flex justify-between items-center py-3 gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    {tx.category && (
                      <span className={`retro text-[9px] px-1.5 py-0.5 rounded shrink-0 ${CATEGORY_COLORS[tx.category] ?? CATEGORY_COLORS["Other"]}`}>
                        {tx.category}
                      </span>
                    )}
                    <span className="retro text-[10px] text-muted-foreground truncate">
                      {tx.date} — {tx.description}
                    </span>
                  </div>
                  <span className={`retro text-xs font-bold shrink-0 ${tx.amount < 0 ? "text-destructive" : "text-primary"}`}>
                    ${Math.abs(tx.amount).toFixed(2)}
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

"use client";
import { useRef, useState } from "react";
import { uploadFile, addTransaction } from "@/lib/api";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/8bit/card";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await uploadFile(file);
      setResult(data.transactions);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAll() {
    setLoading(true);
    for (const tx of result) {
      await addTransaction(tx);
    }
    setSaved(true);
    setLoading(false);
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
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              Choose File
            </Button>
            <span className="retro text-[10px] text-muted-foreground">
              {file ? file.name : "No file chosen"}
            </span>
          </div>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Parsing..." : "Parse File"}
          </Button>
          {error && <p className="retro text-[10px] text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {result.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="retro text-xs text-foreground">{result.length} transactions found</h2>
            <Button
              variant={saved ? "secondary" : "default"}
              onClick={handleSaveAll}
              disabled={loading || saved}
            >
              {saved ? "Saved!" : "Save All & Categorize"}
            </Button>
          </div>
          <div className="space-y-3">
            {result.map((tx, i) => (
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
    </main>
  );
}

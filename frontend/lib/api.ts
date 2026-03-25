const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/api/transactions/`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function addTransaction(data: {
  date: string;
  description: string;
  amount: number;
  source?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/transactions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add transaction");
  return res.json();
}

export async function reviewTransaction(review: {
  id: number;
  action: "accept" | "edit" | "reject";
  category?: string;
  description?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/transactions/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error("Failed to review transaction");
  return res.json();
}

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/api/parser/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to upload file");
  return res.json();
}

export async function getSavingsAdvice() {
  const res = await fetch(`${BASE_URL}/api/transactions/advice`);
  if (!res.ok) throw new Error("Failed to get advice");
  return res.json();
}

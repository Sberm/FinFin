import httpx
import os
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "mistral")


async def categorize_transaction(description: str, amount: float) -> dict:
    """Send transaction to local LLM and get category + confidence."""
    prompt = f"""You are a financial assistant. Categorize the following bank transaction.
Respond ONLY with valid JSON in this format: {{"category": "string", "confidence": 0-100}}

Categories: Food, Transport, Shopping, Bills, Health, Entertainment, Income, Transfer, Other

Transaction: "{description}" | Amount: ${amount}
"""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={"model": LLM_MODEL, "prompt": prompt, "stream": False},
            )
            result = response.json()
            raw = result.get("response", "{}")
            data = json.loads(raw)
            return {
                "category": data.get("category", "Other"),
                "confidence": int(data.get("confidence", 50)),
            }
    except Exception as e:
        return {"category": "Other", "confidence": 0, "error": str(e)}


async def get_savings_advice(transactions: list) -> str:
    """Ask LLM for savings advice based on transaction history."""
    summary = "\n".join(
        [f"- {t['date']}: {t['description']} (${t['amount']}) [{t.get('category','?')}]"
         for t in transactions[:20]]
    )
    prompt = f"""You are a personal finance advisor. Based on these recent transactions, give 3 short, actionable savings tips.

Transactions:
{summary}

Respond in plain text, bullet points."""
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={"model": LLM_MODEL, "prompt": prompt, "stream": False},
            )
            return response.json().get("response", "No advice available.")
    except Exception as e:
        return f"LLM unavailable: {str(e)}"

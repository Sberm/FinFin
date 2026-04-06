import httpx
import os
import json
from openai import OpenAI

async def categorize_transaction(description: str, amount: float) -> dict:
    """Send transaction to local LLM and get category + confidence."""
    prompt = f"""You are a financial assistant. Categorize the following bank transaction.
Respond ONLY with valid JSON in this format: {{"category": "string", "confidence": 0-100}}

Categories: Food, Transport, Shopping, Bills, Health, Entertainment, Income, Transfer, Other

Transaction: "{description}" | Amount: ${amount}
"""
    try:
        client = OpenAI(
            api_key=os.getenv("API_KEY"),
            base_url=os.getenv("LLM_URL"),
        )
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL"),
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        data = json.loads(response.choices[0].message.content)
        return {
            "category": data.get("category", "Other"),
            "confidence": int(data.get("confidence", 50))
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
        client = OpenAI(
            api_key=os.getenv("API_KEY"),
            base_url=os.getenv("LLM_URL"),
        )
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL"),
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"LLM unavailable: {str(e)}"

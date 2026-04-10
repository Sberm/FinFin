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

async def parse_pdf_transactions(text: str) -> list[dict]:
    """Use LLM to extract structured transactions from free-form PDF text.

    Handles natural language descriptions, multiple currencies (converting to
    USD), and assigns an initial spending category.
    """
    prompt = f"""You are a financial data extraction assistant. Extract all financial transactions from the text below.

For each transaction return a JSON object with:
- "date": string in YYYY-MM-DD format
- "description": concise description of what was purchased or paid for
- "amount": number, negative for expenses, positive for income, always in USD
- "category": one of: Food, Transport, Shopping, Bills, Health, Entertainment, Income, Transfer, Other

Rules:
- If an amount is in a non-USD currency, convert it to approximate USD using current exchange rates and append the original amount and currency to the description (e.g. "PS5 controller on eBay (60,000 JPY)").
- Expenses must be negative numbers.
- Return ONLY a valid JSON array. No markdown fences, no explanation, no other text.

Text:
{text}
"""
    client = OpenAI(
        api_key=os.getenv("API_KEY"),
        base_url=os.getenv("LLM_URL"),
    )
    response = client.chat.completions.create(
        model=os.getenv("LLM_MODEL"),
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.choices[0].message.content.strip()

    # Strip markdown code fences the LLM sometimes adds
    if content.startswith("```"):
        lines = content.splitlines()
        content = "\n".join(
            lines[1:-1] if lines[-1].strip() == "```" else lines[1:]
        ).strip()

    data = json.loads(content)
    if not isinstance(data, list):
        raise ValueError("LLM returned unexpected format (expected a JSON array).")

    valid_categories = {
        "Food", "Transport", "Shopping", "Bills",
        "Health", "Entertainment", "Income", "Transfer", "Other",
    }
    result = []
    for item in data:
        category = item.get("category", "Other")
        if category not in valid_categories:
            category = "Other"
        result.append({
            "date":        str(item.get("date", "")).strip(),
            "description": str(item.get("description", "")).strip(),
            "amount":      float(item.get("amount", 0)),
            "category":    category,
            "source":      "pdf",
            "reviewed":    False,
        })
    return result


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

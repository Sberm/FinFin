import pandas as pd
import pdfplumber
import io
from datetime import datetime


def parse_csv(file_bytes: bytes) -> list[dict]:
    """Parse bank statement CSV into normalized transaction rows."""
    df = pd.read_csv(io.BytesIO(file_bytes))
    df.columns = [c.strip().lower() for c in df.columns]

    # Try common column name mappings
    col_map = {
        "date":        ["date", "date_time", "transaction date", "trans date", "posted date"],
        "description": ["description", "memo", "details", "payee", "narrative", "category"],
        "amount":      ["amount", "debit", "credit", "transaction amount"],
    }

    resolved = {}
    for key, candidates in col_map.items():
        for c in candidates:
            if c in df.columns:
                resolved[key] = c
                break

    if len(resolved) < 3:
        raise ValueError(f"Could not map columns. Found: {list(df.columns)}")

    transactions = []
    for _, row in df.iterrows():
        try:
            # Strip time component if date includes a timestamp (e.g. "2025-01-05 00:00:00")
            raw_date = str(row[resolved["date"]]).strip()
            date = raw_date.split(" ")[0]

            # Use the category column as the pre-set category if it exists
            category = str(row["category"]).strip() if "category" in df.columns else None

            transactions.append({
                "date":        date,
                "description": str(row[resolved["description"]]).strip(),
                "amount":      -abs(float(str(row[resolved["amount"]]).replace(",", "").replace("$", ""))),
                "category":    category,
                "source":      "csv",
                "reviewed":    False,
            })
        except Exception:
            continue

    return transactions


def parse_pdf(file_bytes: bytes) -> list[dict]:
    """Extract transactions from a bank statement PDF."""
    transactions = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue
            headers = [str(h).strip().lower() for h in table[0]]
            for row in table[1:]:
                if not row or all(cell is None for cell in row):
                    continue
                try:
                    row_dict = dict(zip(headers, row))
                    transactions.append({
                        "date": str(row_dict.get("date", "")).strip(),
                        "description": str(row_dict.get("description", row_dict.get("details", ""))).strip(),
                        "amount": float(str(row_dict.get("amount", 0)).replace(",", "").replace("$", "") or 0),
                        "source": "pdf",
                        "reviewed": False,
                    })
                except Exception:
                    continue
    return transactions

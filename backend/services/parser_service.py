import pandas as pd
import pdfplumber
import io


def parse_csv(file_bytes: bytes) -> dict:
    """Parse bank statement CSV into normalized transaction and holding rows.

    Supports two CSV formats:
    1. Combined CSV with a 'type' column — rows with type 'investment', 'stock',
       or 'crypto' are parsed as portfolio holdings; all other rows are parsed
       as bank transactions.
    2. Plain transaction CSV (no 'type' column) — all rows parsed as transactions.

    Returns a dict: {"transactions": [...], "holdings": [...]}
    """
    df = pd.read_csv(io.BytesIO(file_bytes))
    df.columns = [c.strip().lower() for c in df.columns]

    transactions = []
    holdings = []

    has_type_col = "type" in df.columns

    if has_type_col:
        investment_types = {"investment", "stock", "crypto", "etf"}
        expense_df = df[~df["type"].str.strip().str.lower().isin(investment_types)].copy()
        investment_df = df[df["type"].str.strip().str.lower().isin(investment_types)].copy()
    else:
        expense_df = df
        investment_df = pd.DataFrame()

    # --- Parse transactions ---
    col_map = {
        "date":        ["date", "date_time", "transaction date", "trans date", "posted date"],
        "description": ["description", "memo", "details", "payee", "narrative"],
        "amount":      ["amount", "debit", "credit", "transaction amount"],
    }

    resolved = {}
    for key, candidates in col_map.items():
        for c in candidates:
            if c in expense_df.columns:
                resolved[key] = c
                break

    if len(resolved) < 3 and not has_type_col:
        raise ValueError(f"Could not map columns. Found: {list(df.columns)}")

    if len(resolved) == 3 and not expense_df.empty:
        for _, row in expense_df.iterrows():
            try:
                raw_date = str(row[resolved["date"]]).strip()
                date = raw_date.split(" ")[0]
                category = str(row["category"]).strip() if "category" in expense_df.columns else None
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

    # --- Parse holdings ---
    if not investment_df.empty:
        for _, row in investment_df.iterrows():
            try:
                holdings.append({
                    "ticker":   str(row.get("ticker", "")).strip().upper(),
                    "name":     str(row.get("name", "")).strip(),
                    "shares":   float(str(row.get("shares", 0)).replace(",", "")),
                    "avg_cost": float(str(row.get("avg_cost", 0)).replace(",", "").replace("$", "")),
                    "price":    float(str(row.get("price", 0)).replace(",", "").replace("$", "")),
                    "sector":   str(row.get("sector", "Other")).strip(),
                })
            except Exception:
                continue

    return {"transactions": transactions, "holdings": holdings}


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract all text from a PDF bank statement for LLM processing."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
    return "\n".join(text_parts)

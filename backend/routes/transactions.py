from fastapi import APIRouter, HTTPException
from models.transaction import Transaction, TransactionReview
from services.llm_service import categorize_transaction, get_savings_advice
import re

router = APIRouter()

# TODO: Replace with PostgreSQL via services/db.py — schema is in db/schema.sql
_transactions: list[dict] = []
_next_id = 1


def sanitize(value: str) -> str:
    return re.sub(r"[<>\"'%;()&+]", "", str(value)).strip()


@router.get("/")
def list_transactions():
    return _transactions


@router.post("/")
async def add_transaction(tx: Transaction):
    global _next_id
    data = tx.model_dump()
    data["description"] = sanitize(data["description"])
    data["id"] = _next_id
    _next_id += 1

    # Auto-categorize via LLM
    result = await categorize_transaction(data["description"], data["amount"])
    data["category"] = result["category"]
    data["confidence"] = result["confidence"]

    _transactions.append(data)
    return data


@router.post("/review")
def review_transaction(review: TransactionReview):
    for tx in _transactions:
        if tx["id"] == review.id:
            if review.action == "reject":
                _transactions.remove(tx)
                return {"status": "rejected"}
            if review.action in ("accept", "edit"):
                tx["reviewed"] = True
                if review.category:
                    tx["category"] = review.category
                if review.description:
                    tx["description"] = sanitize(review.description)
                return tx
    raise HTTPException(status_code=404, detail="Transaction not found")


@router.get("/advice")
async def savings_advice():
    if not _transactions:
        raise HTTPException(status_code=400, detail="No transactions yet")
    advice = await get_savings_advice(_transactions)
    return {"advice": advice}

import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.transaction import (
    Transaction,
    TransactionReview,
    BulkTransactionRequest,
    TransactionORM,
    from_orm_to_dict,
)
from services.db import get_db
from services.llm_service import categorize_transaction, get_savings_advice

router = APIRouter()


def sanitize(value: str) -> str:
    """Strip characters that could cause XSS or injection issues."""
    return re.sub(r"[<>\"'%;()&+]", "", str(value)).strip()


# ---------------------------------------------------------------------------
# GET /api/transactions/
# ---------------------------------------------------------------------------

@router.get("/")
def list_transactions(db: Session = Depends(get_db)):
    rows = db.query(TransactionORM).order_by(TransactionORM.date.desc()).all()
    return [from_orm_to_dict(r) for r in rows]


# ---------------------------------------------------------------------------
# POST /api/transactions/bulk
# Save multiple transactions in one request (used by the upload page).
#
# NOTE: LLM categorization is called once per transaction sequentially.
# This is acceptable for MVP since Ollama processes one request at a time.
# Future improvement: batch with asyncio.gather() if a parallel LLM backend
# is introduced.
#
# Registered BEFORE the single-transaction POST to avoid any future path
# conflicts if an /{id} route is added later.
# ---------------------------------------------------------------------------

@router.post("/bulk")
async def add_transactions_bulk(
    payload: BulkTransactionRequest,
    db: Session = Depends(get_db),
):
    saved_rows: list[TransactionORM] = []

    for tx in payload.transactions:
        data = tx.model_dump(exclude_none=True)
        data["description"] = sanitize(data["description"])

        result = await categorize_transaction(data["description"], data["amount"])
        data["category"] = result["category"]
        data["confidence"] = result["confidence"]

        row = TransactionORM(**data)
        db.add(row)
        saved_rows.append(row)

    db.commit()
    for row in saved_rows:
        db.refresh(row)

    return {"count": len(saved_rows), "transactions": [from_orm_to_dict(r) for r in saved_rows]}


# ---------------------------------------------------------------------------
# POST /api/transactions/
# Save a single transaction (used by manual entry).
# ---------------------------------------------------------------------------

@router.post("/")
async def add_transaction(tx: Transaction, db: Session = Depends(get_db)):
    data = tx.model_dump(exclude_none=True)
    data["description"] = sanitize(data["description"])

    result = await categorize_transaction(data["description"], data["amount"])
    data["category"] = result["category"]
    data["confidence"] = result["confidence"]

    row = TransactionORM(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return from_orm_to_dict(row)


# ---------------------------------------------------------------------------
# POST /api/transactions/review
# Accept, edit, or reject an AI-classified transaction.
# ---------------------------------------------------------------------------

@router.post("/review")
def review_transaction(review: TransactionReview, db: Session = Depends(get_db)):
    row = db.query(TransactionORM).filter(TransactionORM.id == review.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if review.action == "reject":
        db.delete(row)
        db.commit()
        return {"status": "rejected"}

    if review.action in ("accept", "edit"):
        row.reviewed = True
        if review.category:
            row.category = review.category
        if review.description:
            row.description = sanitize(review.description)
        db.commit()
        db.refresh(row)
        return from_orm_to_dict(row)

    raise HTTPException(status_code=400, detail=f"Unknown action: {review.action}")


# ---------------------------------------------------------------------------
# GET /api/transactions/advice
# Generate AI savings tips from the stored transaction history.
# ---------------------------------------------------------------------------

@router.get("/advice")
async def savings_advice(db: Session = Depends(get_db)):
    rows = db.query(TransactionORM).all()
    if not rows:
        raise HTTPException(status_code=400, detail="No transactions yet. Upload a bank statement first.")
    advice = await get_savings_advice([from_orm_to_dict(r) for r in rows])
    return {"advice": advice}

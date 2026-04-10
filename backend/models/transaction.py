from pydantic import BaseModel
from typing import Optional
from datetime import date

from sqlalchemy import Column, Integer, String, Float, Boolean, Date
from sqlalchemy.orm import declarative_base

# ---------------------------------------------------------------------------
# SQLAlchemy ORM
# Mirrors the `transactions` table in db/schema.sql
# ---------------------------------------------------------------------------

Base = declarative_base()


class TransactionORM(Base):
    __tablename__ = "transactions"

    id          = Column(Integer, primary_key=True, index=True)
    date        = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount      = Column(Float, nullable=False)
    category    = Column(String, nullable=True)
    source      = Column(String, default="manual") # "csv" | "pdf" | "manual"
    reviewed    = Column(Boolean, default=False)
    # user_id intentionally nullable — no auth in MVP
    user_id     = Column(Integer, nullable=True)


def from_orm_to_dict(row: TransactionORM) -> dict:
    """Serialize a TransactionORM row to a plain dict for API responses.

    - Converts date to ISO string ("YYYY-MM-DD") so the frontend receives
      the same string format it expects.
    - Omits user_id — it is an internal FK not exposed to the frontend.
    """
    return {
        "id":          row.id,
        "date":        str(row.date),
        "description": row.description,
        "amount":      row.amount,
        "category":    row.category,
        "source":      row.source,
        "reviewed":    row.reviewed,
    }


# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------

class Transaction(BaseModel):
    id: Optional[int] = None
    date: date
    description: str
    amount: float
    category: Optional[str] = None
    source: str = "manual"            # "csv", "pdf", "manual"
    reviewed: bool = False


class TransactionReview(BaseModel):
    id: int
    action: str  # "accept", "edit", "reject"
    category: Optional[str] = None
    description: Optional[str] = None


class BulkTransactionRequest(BaseModel):
    transactions: list[Transaction]

from pydantic import BaseModel
from typing import Optional
from datetime import date


class Transaction(BaseModel):
    id: Optional[int] = None
    date: date
    description: str
    amount: float
    category: Optional[str] = None
    confidence: Optional[int] = None  # 0-100 from LLM
    source: str = "manual"  # "csv", "pdf", "manual"
    reviewed: bool = False


class TransactionReview(BaseModel):
    id: int
    action: str  # "accept", "edit", "reject"
    category: Optional[str] = None
    description: Optional[str] = None

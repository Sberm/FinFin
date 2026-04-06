from pydantic import BaseModel
from sqlalchemy import Column, Float, Integer, String

from models.transaction import Base  # shared Base so init_db() creates all tables

# ---------------------------------------------------------------------------
# SQLAlchemy ORM
# ---------------------------------------------------------------------------


class HoldingORM(Base):
    """One row per stock/crypto/ETF position held by the user."""

    __tablename__ = "holdings"

    id       = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer, nullable=True)   # nullable — no auth in MVP
    ticker   = Column(String,  nullable=False, index=True)  # e.g. "AAPL"
    name     = Column(String,  nullable=False)              # e.g. "Apple Inc."
    shares   = Column(Float,   nullable=False)
    avg_cost = Column(Float,   nullable=False)  # cost basis per share
    price    = Column(Float,   nullable=False)  # current price per share (manually updated for now)
    sector   = Column(String,  nullable=False)  # e.g. "Tech", "ETF", "Crypto"


class PortfolioSnapshotORM(Base):
    """One row per month — total portfolio market value at that point in time.

    A new snapshot is written (or the existing one updated) whenever holdings
    are added, edited, or removed.  This gives the dashboard its history chart.
    """

    __tablename__ = "portfolio_snapshots"

    id      = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    month   = Column(String,  nullable=False, index=True)  # "YYYY-MM"
    value   = Column(Float,   nullable=False)              # total market value


# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------


class HoldingCreate(BaseModel):
    """Request body for POST /api/portfolio/holdings (add or update a position)."""

    ticker:   str
    name:     str
    shares:   float
    avg_cost: float   # cost basis per share
    price:    float   # current price per share
    sector:   str


class HoldingResponse(BaseModel):
    """Single holding as returned by the API."""

    ticker:   str
    name:     str
    shares:   float
    avg_cost: float
    price:    float
    sector:   str


class SnapshotResponse(BaseModel):
    """Monthly portfolio snapshot as returned by the API."""

    month: str    # "YYYY-MM"
    value: float


class PortfolioResponse(BaseModel):
    """Shape returned by GET /api/portfolio/ — matches frontend PortfolioResponse type."""

    holdings: list[HoldingResponse]
    history:  list[SnapshotResponse]

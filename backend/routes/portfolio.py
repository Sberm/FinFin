from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.portfolio import (
    HoldingCreate,
    HoldingORM,
    HoldingResponse,
    PortfolioResponse,
    PortfolioSnapshotORM,
    SnapshotResponse,
)
from services.db import get_db

router = APIRouter()


# ---------------------------------------------------------------------------
# Serialisation helpers
# ---------------------------------------------------------------------------


def _holding_to_dict(row: HoldingORM) -> dict:
    return {
        "ticker":   row.ticker,
        "name":     row.name,
        "shares":   row.shares,
        "avg_cost": row.avg_cost,
        "price":    row.price,
        "sector":   row.sector,
    }


def _snapshot_to_dict(row: PortfolioSnapshotORM) -> dict:
    return {"month": row.month, "value": row.value}


# ---------------------------------------------------------------------------
# Snapshot helper  (called after every holdings mutation)
# ---------------------------------------------------------------------------


def _record_snapshot(db: Session) -> None:
    """Recalculate and upsert a portfolio value snapshot for the current month.

    Called automatically after add / update / delete so the history chart
    stays in sync without any extra work from the caller.
    """
    month = datetime.now().strftime("%Y-%m")
    holdings = db.query(HoldingORM).all()
    total_value = round(sum(h.shares * h.price for h in holdings), 2)

    snapshot = (
        db.query(PortfolioSnapshotORM)
        .filter(PortfolioSnapshotORM.month == month)
        .first()
    )
    if snapshot:
        snapshot.value = total_value
    else:
        db.add(PortfolioSnapshotORM(month=month, value=total_value))

    db.flush()


# ---------------------------------------------------------------------------
# GET /api/portfolio/
# Returns all holdings + full monthly history.
# ---------------------------------------------------------------------------


@router.get("/", response_model=PortfolioResponse)
def get_portfolio(db: Session = Depends(get_db)):
    """Return the current holdings list and the monthly value history.

    The frontend dashboard consumes this to render:
      - Holdings table
      - Sector allocation pie chart
      - Portfolio value line chart
    """
    holdings = db.query(HoldingORM).order_by(HoldingORM.ticker).all()
    history  = db.query(PortfolioSnapshotORM).order_by(PortfolioSnapshotORM.month).all()

    return {
        "holdings": [_holding_to_dict(h) for h in holdings],
        "history":  [_snapshot_to_dict(s) for s in history],
    }


# ---------------------------------------------------------------------------
# POST /api/portfolio/holdings
# Add a new holding or update an existing one (upsert by ticker).
# ---------------------------------------------------------------------------


@router.post("/holdings", response_model=HoldingResponse, status_code=201)
def upsert_holding(payload: HoldingCreate, db: Session = Depends(get_db)):
    """Add a new position or overwrite shares / price / avg_cost for an existing one.

    Ticker is normalised to uppercase so "aapl" and "AAPL" are the same holding.
    A portfolio snapshot for the current month is recorded automatically.
    """
    ticker = payload.ticker.upper().strip()

    row = db.query(HoldingORM).filter(HoldingORM.ticker == ticker).first()

    if row:
        # Update existing position
        row.name     = payload.name
        row.shares   = payload.shares
        row.avg_cost = payload.avg_cost
        row.price    = payload.price
        row.sector   = payload.sector
    else:
        # Create new position
        row = HoldingORM(
            ticker=ticker,
            name=payload.name,
            shares=payload.shares,
            avg_cost=payload.avg_cost,
            price=payload.price,
            sector=payload.sector,
        )
        db.add(row)

    db.flush()   # write to DB within the transaction so snapshot sees current state
    _record_snapshot(db)
    db.commit()
    db.refresh(row)

    return _holding_to_dict(row)


# ---------------------------------------------------------------------------
# PATCH /api/portfolio/holdings/{ticker}/price
# Update just the current price of a holding (e.g. after a market data refresh).
# ---------------------------------------------------------------------------


@router.patch("/holdings/{ticker}/price", response_model=HoldingResponse)
def update_price(ticker: str, price: float, db: Session = Depends(get_db)):
    """Update the current market price for a single holding.

    Designed for a future background job that pulls live prices and calls
    this endpoint to keep the dashboard current without re-entering all fields.

    Example:  PATCH /api/portfolio/holdings/AAPL/price?price=195.50
    """
    if price < 0:
        raise HTTPException(status_code=422, detail="Price must be non-negative")

    row = db.query(HoldingORM).filter(HoldingORM.ticker == ticker.upper()).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Holding '{ticker.upper()}' not found")

    row.price = price
    db.flush()
    _record_snapshot(db)
    db.commit()
    db.refresh(row)

    return _holding_to_dict(row)


# ---------------------------------------------------------------------------
# DELETE /api/portfolio/holdings/{ticker}
# Remove a holding entirely.
# ---------------------------------------------------------------------------


@router.delete("/holdings/{ticker}")
def delete_holding(ticker: str, db: Session = Depends(get_db)):
    """Delete a holding by ticker symbol.

    The portfolio snapshot for the current month is updated automatically
    so the history chart reflects the removal.
    """
    row = db.query(HoldingORM).filter(HoldingORM.ticker == ticker.upper()).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Holding '{ticker.upper()}' not found")

    db.delete(row)
    db.flush()
    _record_snapshot(db)
    db.commit()

    return {"status": "deleted", "ticker": ticker.upper()}

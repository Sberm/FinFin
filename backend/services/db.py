import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from models.transaction import Base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://finfin:finfin@localhost:5432/finfin")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency — yields a DB session and closes it when done."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables defined in the ORM models if they don't already exist.

    Called once at server startup via the FastAPI lifespan handler in main.py.
    Safe to run multiple times — SQLAlchemy uses CREATE TABLE IF NOT EXISTS semantics.
    """
    Base.metadata.create_all(bind=engine)

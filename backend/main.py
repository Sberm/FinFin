from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import transactions, parser, llm
from services.db import init_db

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks before the server accepts requests."""
    init_db()
    yield


app = FastAPI(title="FinFin API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(parser.router, prefix="/api/parser", tags=["Parser"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])


@app.get("/")
def root():
    return {"status": "FinFin API running"}

# FinFin — AI-Powered Personal Finance Tracker

A full-stack finance app with AI categorization, savings advice, and bank statement parsing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Infra | Docker Compose |

---

## Project Structure

```
FinFin/
├── backend/        → FastAPI (Python) — API, LLM, parser logic
├── frontend/       → Next.js (React) — UI
├── db/             → PostgreSQL schema
├── docker-compose.yml
└── .env.example
```

---

## Prerequisites

Install these before starting:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs everything
- [Node.js 20+](https://nodejs.org/) — for frontend dev
- [Python 3.12+](https://www.python.org/) — for backend dev

---

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd FinFin

# 2. Copy environment variables (make sure you copied the API_KEY from the paper)
cp .env.example backend/.env

# 3. Start everything
docker-compose up
```

__Please put the `API_KEY` provided in the project paper into the backend/.env file__


Open: http://localhost:3000

---

## Local Dev Setup (without Docker)

### Backend Developer

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp ../.env.example .env
uvicorn main:app --reload
```

API runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend Developer

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:3000

### Database (Docker only)

```bash
docker-compose up db
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions/` | List all transactions |
| POST | `/api/transactions/` | Add a transaction (auto-categorized) |
| POST | `/api/transactions/review` | Accept / edit / reject a transaction |
| GET | `/api/transactions/advice` | Get AI savings advice |
| POST | `/api/parser/upload` | Upload CSV or PDF bank statement |
| POST | `/api/llm/categorize` | Categorize a single transaction |

---

## Environment Variables

Copy `.env.example` to `backend/.env`.

Make sure you copy the `API_KEY` from the paper to the `backend/.env` file.

---
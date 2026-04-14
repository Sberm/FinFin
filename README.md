# FinFin — AI-Powered Personal Finance Tracker

A full-stack finance app with AI categorization, savings advice, and bank statement parsing.

---

## Project Overview

FinFin is an AI-powered personal finance tracker designed to help users better understand their spending habits. The system allows users to upload bank statements, automatically categorize transactions with AI assistance, and provide savings advice based on spending patterns. This project combines full-stack web development, database design, and practical AI integration in a real-world finance use case.


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

```text
FinFin/
├── backend/        → FastAPI (Python) — API, LLM, parser logic
├── frontend/       → Next.js (React) — UI
├── docs/           → Architecture and project documentation
├── db/             → PostgreSQL schema
├── docker-compose.yml
└── .env.example
```

---

## Core Features

- Upload CSV or PDF bank statements
- Automatically categorize transactions with AI
- Review, edit, or reject categorized transactions
- View transaction history and spending data
- Receive AI-generated savings advice

---

## Prerequisites

Install these before starting:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs everything
- [Node.js 20+](https://nodejs.org/) — for frontend dev
- [Python 3.12+](https://www.python.org/) — for backend dev

---

## Quick Start (Docker — run everything at once)

```bash
# 1. Clone the repo
git clone <repo-url>
cd FinFin

# 2. Copy environment variables
cp .env.example backend/.env

# 3. Start all services
docker-compose up

# 4. Pull the AI model (first time only)
docker exec -it finfin-ollama-1 ollama pull mistral
```

Open: http://localhost:3000

---

## Quick Demo

A quick way to test the project:

1. Start the application with Docker or local development setup.
2. Open the frontend at `http://localhost:3000`.
3. Upload a sample file such as `data/expenses_small.csv`.
4. Check the categorized transactions in the `transactions` and `dashboard` pages.
5. Visit the `advice` page to view AI-generated savings suggestions.

---

## Local Dev Setup (without Docker)

### Backend

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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:3000

### LLM Setup

```bash
# Install Ollama from https://ollama.com, then:
ollama pull mistral
ollama serve
```

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

Copy `.env.example` to `backend/.env` and `frontend/.env.local`:

```env
DATABASE_URL=postgresql://finfin:finfin@localhost:5432/finfin
OLLAMA_URL=http://localhost:11434
LLM_MODEL=mistral
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Team Roles

| Role | Work in |
|---|---|
| Frontend | `frontend/` |
| Backend | `backend/` |
| Database | `db/schema.sql` |

---

## Limitations / Future Work

- The current version is designed for demo and coursework purposes, so it uses sample financial data rather than real banking integrations.
- AI categorization may still require manual review for ambiguous transactions.
- Future improvements could include stronger analytics, better model accuracy, and support for more statement formats.


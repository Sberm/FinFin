# FinFin — AI-Powered Personal Finance Tracker

A full-stack finance app with AI categorization, savings advice, and bank statement parsing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| AI/LLM | Ollama (Mistral, self-hosted) |
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
- [Ollama](https://ollama.com/) — for local LLM

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

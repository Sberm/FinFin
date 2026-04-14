<div align="center">

# FinFin — AI-Powered Personal Finance Tracker

FinFin is a full-stack personal finance app that helps you **understand spending**, **auto-categorize transactions with AI**, and get **actionable savings advice** — with support for **bank statement parsing (CSV/PDF)**.

<!-- Optional badges -->
<!--
[![CI](https://github.com/Sberm/FinFin/actions/workflows/ci.yml/badge.svg)](https://github.com/Sberm/FinFin/actions)
[![License](https://img.shields.io/github/license/Sberm/FinFin.svg)](LICENSE)
-->

</div>

---

## 📖 Project Overview

FinFin is an AI-powered personal finance tracker designed to help users better understand their spending habits.

Upload bank statements, automatically categorize transactions, review/edit results, explore spending trends, and receive AI-generated savings guidance.

---

## ✨ Core Features

- Upload **CSV or PDF** bank statements
- Automatically **categorize transactions** with AI
- **Review / edit / reject** categorized transactions
- View transaction history and spending data
- Get **AI-generated savings advice**

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Infra | Docker Compose |

---

## 🗂️ Project Structure

```text
FinFin/
├── backend/        → FastAPI (Python) — API, AI, parser logic
├── frontend/       → Next.js (React) — UI
├── docs/           → Architecture and project documentation
├── db/             → PostgreSQL schema
├── docker-compose.yml
└── .env.example
```

---

## ✅ Prerequisites

Install these before starting:

- **Docker Desktop** — runs everything
- **Node.js 20+** — for frontend dev
- **Python 3.12+** — for backend dev

---

## 🚀 Quick Start (Docker — run everything)

```bash
# 1. Clone the repo
git clone <repo-url>
cd FinFin

# 2. Copy environment variables
cp .env.example backend/.env

# 3. Start all services
docker-compose up
```

Open: `http://localhost:3000`

---

## 🎬 Quick Demo

1. Start the application with Docker (recommended) or local dev setup.
2. Open the frontend at `http://localhost:3000`.
3. Upload a sample file such as `data/expenses_small.csv`.
4. Review categorized transactions in the `transactions` and `dashboard` pages.
5. Visit the `advice` page to view AI-generated savings suggestions.

---

## 🧪 Local Dev Setup (without Docker)

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp ../.env.example .env
uvicorn main:app --reload
```

- API: `http://localhost:8000`  
- Docs: `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions/` | List all transactions |
| POST | `/api/transactions/` | Add a transaction (auto-categorized) |
| POST | `/api/transactions/review` | Accept / edit / reject a transaction |
| GET | `/api/transactions/advice` | Get AI savings advice |
| POST | `/api/parser/upload` | Upload CSV or PDF bank statement |
| POST | `/api/llm/categorize` | Categorize a single transaction |

---

## 🤖 AI Model (Gemini)

FinFin uses **Google Gemini `gemini-3.1-pro-preview`** for AI-powered features like:

- **Transaction categorization** (assigning labels/categories based on merchant + memo/context)
- **Savings advice** (natural-language guidance based on spending patterns)

### Why this model?
- **High-quality reasoning & language understanding** for messy transaction descriptions
- **Consistent outputs** when prompted with a structured schema (useful for categorization)
- The **`*-preview`** suffix means the model is a *preview release* and may change behavior over time, so results can vary slightly between updates.

---

## 🔐 Environment Variables

Copy `.env.example` to `backend/.env` and (optionally) configure `frontend/.env.local`.

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://finfin:finfin@localhost:5432/finfin

# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-pro-preview
```

### Frontend (`frontend/.env.local`) (if needed)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 👥 Team Roles

| Role | Work in |
|---|---|
| Frontend | `frontend/` |
| Backend | `backend/` |
| Database | `db/schema.sql` |

---

## ⚠️ Limitations / Future Work

- Current version is designed for demo/coursework purposes (uses sample financial data rather than real bank integrations).
- AI categorization may still require manual review for ambiguous transactions.
- Future improvements: stronger analytics, better model accuracy, and more statement formats.

---

## 📄 License

See the [LICENSE](LICENSE) file for details.

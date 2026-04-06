-- FinFin Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category VARCHAR(100),
    confidence INT CHECK (confidence >= 0 AND confidence <= 100),
    source VARCHAR(50) DEFAULT 'manual',  -- 'csv', 'pdf', 'manual'
    reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holdings (
    id       SERIAL PRIMARY KEY,
    user_id  INT REFERENCES users(id) ON DELETE CASCADE,
    ticker   VARCHAR(20)    NOT NULL,
    name     VARCHAR(255)   NOT NULL,
    shares   NUMERIC(18, 6) NOT NULL,
    avg_cost NUMERIC(12, 2) NOT NULL,
    price    NUMERIC(12, 2) NOT NULL,
    sector   VARCHAR(100)   NOT NULL,
    UNIQUE (user_id, ticker)
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id      SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    month   VARCHAR(7)     NOT NULL,  -- "YYYY-MM"
    value   NUMERIC(16, 2) NOT NULL,
    UNIQUE (user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_holdings_ticker            ON holdings(ticker);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_month  ON portfolio_snapshots(month);

CREATE TABLE IF NOT EXISTS savings_goals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_advice_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    advice TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

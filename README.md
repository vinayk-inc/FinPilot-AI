# FinPilot AI — Financial Intelligence Platform

FinPilot AI is a modern financial analytics and risk intelligence platform. It features a React TypeScript frontend, a FastAPI computational engine, and Google Gemini AI integration.

The original Streamlit application in `app.py` is preserved intact as a reference and fallback.

---

## Architecture Overview

```
FinPilot_AI/
├── backend/
│   ├── main.py                     # FastAPI application & REST endpoints
│   ├── services/
│   │   ├── market_data.py          # Yahoo Finance market data & stock summaries
│   │   ├── portfolio.py            # Portfolio return, volatility & asset weighting
│   │   ├── risk.py                 # Historical VaR, CVaR & distribution calculations
│   │   ├── sip.py                  # Systematic Investment Plan & Lump-Sum math
│   │   └── gemini_service.py       # Google Gemini SDK integration & chat assistant
│   └── .env.example                # Template for backend configuration
├── frontend/                       # Modern React + Vite + TypeScript application
│   ├── src/
│   │   ├── components/             # Sidebar, Header, MetricCard
│   │   ├── pages/                  # Dashboard, Stock Research, Portfolio, Risk, SIP, AI Assistant
│   │   ├── services/api.ts         # Centralized typed API client
│   │   └── utils/formatters.ts     # Currency and percentage formatters
│   ├── package.json
│   ├── tailwind.config.js          # Custom dark financial theme palette
│   └── vite.config.ts              # Proxy configuration for /api
├── app.py                          # Streamlit application (preserved intact)
├── requirements.txt                # Python backend dependencies
└── README.md                       # Documentation & run instructions
```

---

## Quick Start Guide

### 1. Backend Setup & Startup (PyCharm Terminal)

Open the **Terminal** tab in PyCharm (ensure your Python virtual environment is activated):

```bash
# 1. Install Python dependencies (if not already installed)
pip install -r requirements.txt

# 2. Verify your .env contains your GEMINI_API_KEY
# GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-3.8-flash

# 3. Start the FastAPI backend server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI backend will start at:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

---

### 2. Frontend Setup & Startup (Frontend Terminal)

Open a separate terminal window or a second terminal tab in PyCharm:

```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start at:
- **Web UI**: `http://localhost:5173`

---

### 3. Streamlit Application (Fallback)

To run the legacy Streamlit application at any time:

```bash
streamlit run app.py
```

---

## Features & Pages

| Page | Features | Backend Endpoint |
|---|---|---|
| **Dashboard** | NIFTY 50, SENSEX, BANK NIFTY & RELIANCE live cards, interactive benchmark chart | `GET /api/market`, `GET /api/stock/{ticker}` |
| **Stock Research** | Ticker search, period selector (1mo-5y), volatility, price chart, historical table & CSV download | `GET /api/stock/{ticker}?period={p}` |
| **Portfolio Analyzer** | CSV/Excel file upload, sample download, asset weight allocation, cumulative return chart | `POST /api/portfolio/analyze` |
| **Risk Analytics** | Historical Value at Risk (VaR), Conditional VaR (CVaR), volatility, return distribution histogram | `POST /api/risk/analyze` |
| **SIP Calculator** | Monthly SIP and Lump-Sum projections, capital vs gains breakdown, milestone timeline | `POST /api/sip/calculate` |
| **AI Assistant** | Dedicated research assistant powered by Google Gemini SDK, suggested prompts, error handling | `POST /api/ai/chat` |

---

## Security & API Key Best Practices

- `GEMINI_API_KEY` is loaded exclusively on the Python server using `python-dotenv`.
- The key is **never** exposed to browser requests, frontend environment variables, or client bundles.
- All `.env` files are ignored in `.gitignore`.

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.services.market_data import (
    get_market_overview,
    get_stock_summary,
    MARKET_TICKERS
)
from backend.services.risk import analyze_risk
from backend.services.portfolio import analyze_portfolio
from backend.services.sip import calculate_sip
from backend.services.gemini_service import gemini_service

app = FastAPI(
    title="FinPilot AI API",
    description="Backend API for FinPilot AI Financial Intelligence Platform",
    version="1.0.0"
)

# Configure CORS
allowed_origins_env = os.getenv("CORS_ORIGINS", "")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if allowed_origins_env:
    origins.extend([origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Request & Response Schemas
# -------------------------------------------------------------

class RiskAnalysisRequest(BaseModel):
    ticker: str = Field(default="^NSEI", description="Stock or index ticker")
    period: str = Field(default="1y", description="Lookback period (6mo, 1y, 2y, 5y)")
    confidence: float = Field(default=0.95, ge=0.5, le=0.999, description="Confidence level")
    portfolio_value: float = Field(default=100000.0, gt=0, description="Portfolio value in currency")

class SipCalculationRequest(BaseModel):
    investment_type: str = Field(default="Monthly SIP", description="'Monthly SIP' or 'Lump Sum'")
    amount: float = Field(default=10000.0, gt=0, description="Monthly SIP or Lump Sum amount")
    annual_return: float = Field(default=12.0, ge=0, le=100, description="Expected annual return percentage")
    years: int = Field(default=10, ge=1, le=50, description="Investment duration in years")

class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str = Field(description="Message text")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(description="Chat history including current user prompt")

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    """Health check endpoint to verify backend status."""
    ai_status = gemini_service.check_status()
    return {
        "status": "healthy",
        "app": "FinPilot AI Backend",
        "version": "1.0.0",
        "ai_ready": ai_status["configured"],
        "ai_model": ai_status["model"]
    }

@app.get("/api/market")
def market_overview():
    """Retrieve market cards for NIFTY 50, SENSEX, BANK NIFTY, and RELIANCE."""
    try:
        cards = get_market_overview()
        return {"data": cards, "total": len(cards)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market overview: {str(e)}")

@app.get("/api/stock/{ticker}")
def stock_research(
    ticker: str,
    period: str = Query(default="1y", pattern="^(1mo|3mo|6mo|1y|2y|5y|max)$")
):
    """Retrieve comprehensive stock metrics, historical table data and chart series."""
    try:
        summary = get_stock_summary(ticker, period=period)
        return summary
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stock research error: {str(e)}")

@app.post("/api/portfolio/analyze")
async def portfolio_analysis(
    file: UploadFile = File(...),
    weights: Optional[str] = Form(None)
):
    """Analyze portfolio return, annualized volatility and cumulative return from CSV/XLSX."""
    try:
        file_bytes = await file.read()
        parsed_weights = None
        if weights and weights.strip():
            try:
                parsed_weights = [float(x.strip()) for x in weights.split(",") if x.strip()]
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid weights format. Must be comma-separated numbers.")

        result = analyze_portfolio(file_bytes, file.filename or "upload.csv", parsed_weights)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio analysis failed: {str(e)}")

@app.post("/api/risk/analyze")
def risk_analysis(payload: RiskAnalysisRequest):
    """Calculate historical Value at Risk (VaR), CVaR, volatility, and return distribution."""
    try:
        result = analyze_risk(
            ticker=payload.ticker,
            period=payload.period,
            confidence=payload.confidence,
            portfolio_value=payload.portfolio_value
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk analytics failed: {str(e)}")

@app.post("/api/sip/calculate")
def sip_calculation(payload: SipCalculationRequest):
    """Calculate Monthly SIP or Lump Sum returns and projection progression."""
    try:
        result = calculate_sip(
            investment_type=payload.investment_type,
            amount=payload.amount,
            annual_return=payload.annual_return,
            years=payload.years
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SIP calculation failed: {str(e)}")

@app.post("/api/ai/chat")
def ai_chat(payload: ChatRequest):
    """Securely interact with FinPilot AI assistant powered by Google Gemini."""
    try:
        raw_messages = [{"role": msg.role, "content": msg.content} for msg in payload.messages]
        response = gemini_service.generate_chat_response(raw_messages)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except ConnectionError as ce:
        raise HTTPException(status_code=503, detail=str(ce))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

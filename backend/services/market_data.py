import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime
from typing import Optional, Dict, Any, List

MARKET_TICKERS = {
    "NIFTY 50": "^NSEI",
    "SENSEX": "^BSESN",
    "BANK NIFTY": "^NSEBANK",
    "RELIANCE": "RELIANCE.NS"
}

def get_stock_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    """Download historical market data using yfinance.
    
    Preserves existing logic from app.py:
    - Auto adjusted prices
    - Flattens MultiIndex columns if returned
    - Drops rows where Close is NaN
    """
    try:
        data = yf.download(
            ticker.strip().upper(),
            period=period,
            auto_adjust=True,
            progress=False
        )

        if data is None or data.empty:
            return pd.DataFrame()

        # Handle the MultiIndex columns returned by some yfinance versions
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        return data.dropna(subset=["Close"])

    except Exception:
        return pd.DataFrame()


def get_market_overview() -> List[Dict[str, Any]]:
    """Retrieve market cards for the dashboard (NIFTY 50, SENSEX, BANK NIFTY, RELIANCE).
    Returns current price, change %, previous price, and sparkline trend points.
    """
    cards = []
    
    for name, ticker in MARKET_TICKERS.items():
        try:
            # Fetch 1 month data for sparkline trend while calculating 1d change
            data = get_stock_data(ticker, period="1mo")
            
            if not data.empty and len(data) >= 1:
                close_series = data["Close"].dropna()
                current = float(close_series.iloc[-1])
                
                if len(close_series) >= 2:
                    previous = float(close_series.iloc[-2])
                    change_pct = ((current / previous) - 1) * 100 if previous else 0.0
                    change_val = current - previous
                else:
                    previous = current
                    change_pct = 0.0
                    change_val = 0.0
                
                # Sparkline data (last 20 observations or all available)
                sparkline = [
                    {
                        "date": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
                        "price": round(float(val), 2)
                    }
                    for idx, val in close_series.tail(20).items()
                ]
                
                cards.append({
                    "name": name,
                    "ticker": ticker,
                    "current": round(current, 2),
                    "previous": round(previous, 2),
                    "change": round(change_val, 2),
                    "change_percent": round(change_pct, 2),
                    "status": "available",
                    "sparkline": sparkline
                })
            else:
                cards.append({
                    "name": name,
                    "ticker": ticker,
                    "current": None,
                    "previous": None,
                    "change": None,
                    "change_percent": None,
                    "status": "unavailable",
                    "sparkline": []
                })
        except Exception as e:
            cards.append({
                "name": name,
                "ticker": ticker,
                "current": None,
                "previous": None,
                "change": None,
                "change_percent": None,
                "status": f"error: {str(e)}",
                "sparkline": []
            })
            
    return cards


def get_stock_summary(ticker: str, period: str = "1y") -> Dict[str, Any]:
    """Calculate key financial metrics and history for Stock Research."""
    clean_ticker = ticker.strip().upper()
    data = get_stock_data(clean_ticker, period=period)

    if data.empty or "Close" not in data.columns or len(data["Close"].dropna()) == 0:
        raise ValueError(f"No market data found for ticker '{clean_ticker}' over period '{period}'.")

    close = data["Close"].dropna()
    latest = float(close.iloc[-1])
    first = float(close.iloc[0])
    previous = float(close.iloc[-2]) if len(close) >= 2 else latest
    
    total_return = ((latest / first) - 1) * 100 if first else 0.0
    daily_change_pct = ((latest / previous) - 1) * 100 if previous else 0.0
    daily_change_val = latest - previous

    daily_returns = close.pct_change().dropna()
    annual_vol = (
        float(daily_returns.std() * np.sqrt(252) * 100)
        if len(daily_returns) > 1 else 0.0
    )

    # Format historical chart data
    chart_data = []
    for idx, row in data.iterrows():
        dt_str = idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx)
        c_val = float(row.get("Close", 0.0))
        o_val = float(row.get("Open", c_val))
        h_val = float(row.get("High", c_val))
        l_val = float(row.get("Low", c_val))
        v_val = int(row.get("Volume", 0)) if not pd.isna(row.get("Volume", 0)) else 0
        chart_data.append({
            "date": dt_str,
            "close": round(c_val, 2),
            "open": round(o_val, 2),
            "high": round(h_val, 2),
            "low": round(l_val, 2),
            "volume": v_val
        })

    # Prepare table rows (latest 50, sorted descending)
    table_rows = list(reversed(chart_data[-50:]))

    return {
        "ticker": clean_ticker,
        "period": period,
        "latest_close": round(latest, 2),
        "previous_close": round(previous, 2),
        "change": round(daily_change_val, 2),
        "change_percent": round(daily_change_pct, 2),
        "total_return_percent": round(total_return, 2),
        "annualized_volatility_percent": round(annual_vol, 2),
        "observations": len(close),
        "history": chart_data,
        "recent_history": table_rows
    }

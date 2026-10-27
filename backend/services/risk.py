import numpy as np
import pandas as pd
from typing import Optional, Dict, Any, List
from backend.services.market_data import get_stock_data

def calculate_risk(returns: pd.Series, confidence: float = 0.95) -> Optional[Dict[str, Any]]:
    """Calculate historical Value at Risk (VaR) and Conditional VaR (CVaR) from daily returns.
    
    Preserves exact formula from app.py:
    - Losses = -returns
    - VaR = quantile(confidence)
    - CVaR = losses[losses >= var].mean()
    - Annualized Volatility = std * sqrt(252)
    """
    returns_clean = pd.Series(returns).dropna()

    if len(returns_clean) < 2:
        return None

    losses = -returns_clean
    var = float(losses.quantile(confidence))
    var_tail = losses[losses >= var]
    cvar = float(var_tail.mean()) if not var_tail.empty else var
    volatility = float(returns_clean.std() * np.sqrt(252))

    return {
        "var": var,
        "cvar": cvar,
        "volatility": volatility,
        "observations": int(len(returns_clean))
    }


def analyze_risk(
    ticker: str,
    period: str = "1y",
    confidence: float = 0.95,
    portfolio_value: float = 100000.0
) -> Dict[str, Any]:
    """Perform comprehensive risk analysis for a ticker."""
    clean_ticker = ticker.strip().upper()
    data = get_stock_data(clean_ticker, period=period)

    if data.empty or "Close" not in data.columns or len(data["Close"].dropna()) < 3:
        raise ValueError(f"Insufficient historical data available for '{clean_ticker}'. Need at least 3 price points.")

    close = data["Close"].dropna()
    returns = close.pct_change().dropna()

    risk_metrics = calculate_risk(returns, confidence=confidence)
    if risk_metrics is None:
        raise ValueError("Could not calculate risk metrics due to empty or invalid returns.")

    var_pct = risk_metrics["var"] * 100
    cvar_pct = risk_metrics["cvar"] * 100
    var_amount = risk_metrics["var"] * portfolio_value
    cvar_amount = risk_metrics["cvar"] * portfolio_value
    volatility_pct = risk_metrics["volatility"] * 100

    # Compute histogram of returns (in percentage)
    returns_pct = (returns * 100).to_numpy()
    hist_counts, bin_edges = np.histogram(returns_pct, bins=40)
    
    distribution = []
    for i in range(len(hist_counts)):
        distribution.append({
            "bin_start": round(float(bin_edges[i]), 2),
            "bin_end": round(float(bin_edges[i + 1]), 2),
            "bin_label": f"{bin_edges[i]:.1f}% to {bin_edges[i+1]:.1f}%",
            "count": int(hist_counts[i]),
            "is_var_zone": bool(bin_edges[i] <= -var_pct)
        })

    # Summary statistics
    positive_days = int((returns > 0).sum())
    negative_days = int((returns < 0).sum())
    total_days = len(returns)
    max_gain = float(returns.max() * 100) if total_days > 0 else 0.0
    max_loss = float(returns.min() * 100) if total_days > 0 else 0.0

    return {
        "ticker": clean_ticker,
        "period": period,
        "confidence": confidence,
        "confidence_label": f"{int(confidence * 100)}%",
        "portfolio_value": portfolio_value,
        "var_amount": round(var_amount, 2),
        "cvar_amount": round(cvar_amount, 2),
        "var_percent": round(var_pct, 2),
        "cvar_percent": round(cvar_pct, 2),
        "annualized_volatility_percent": round(volatility_pct, 2),
        "observations": risk_metrics["observations"],
        "max_single_day_gain_percent": round(max_gain, 2),
        "max_single_day_loss_percent": round(max_loss, 2),
        "positive_days_percent": round((positive_days / total_days) * 100, 1) if total_days else 0,
        "negative_days_percent": round((negative_days / total_days) * 100, 1) if total_days else 0,
        "distribution": distribution
    }

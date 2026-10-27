import io
import pandas as pd
import numpy as np
from typing import Optional, Dict, Any, List

def analyze_portfolio(
    file_bytes: bytes,
    filename: str,
    weights_input: Optional[List[float]] = None
) -> Dict[str, Any]:
    """Parse CSV or Excel file of asset prices and calculate portfolio returns and risk.
    
    Preserves exact logic and formulas from app.py:
    - Identifies 'Date' column case-insensitively
    - Parses dates, sets as index, sorts ascending
    - Validates asset count >= 1 and observations >= 3
    - Normalizes weights to sum to 100%
    - Uses fixed target weights with daily portfolio returns:
        asset_returns = prices.pct_change().dropna(how='all').fillna(0)
        portfolio_returns = asset_returns.dot(weights)
        cumulative = ((1 + portfolio_returns).cumprod() - 1) * 100
        total_return = ((1 + portfolio_returns).prod() - 1) * 100
        vol = portfolio_returns.std() * np.sqrt(252) * 100
    """
    buffer = io.BytesIO(file_bytes)
    
    if filename.lower().endswith(".csv"):
        prices = pd.read_csv(buffer)
    elif filename.lower().endswith((".xlsx", ".xls")):
        prices = pd.read_excel(buffer)
    else:
        raise ValueError("Unsupported file format. Please upload a .csv or .xlsx file.")

    date_col = next((c for c in prices.columns if str(c).strip().lower() == "date"), None)
    if date_col is None:
        raise ValueError("Your file must contain a column named 'Date'.")

    prices[date_col] = pd.to_datetime(prices[date_col], errors="coerce")
    prices = prices.set_index(date_col)
    prices = prices.apply(pd.to_numeric, errors="coerce")
    prices = prices.dropna(how="all").sort_index()

    assets = [str(col) for col in prices.columns]
    if not assets:
        raise ValueError("No numeric asset-price columns were found in the uploaded file.")

    if len(prices) < 3:
        raise ValueError("The uploaded file must have at least three dated price observations.")

    # Process weights
    if weights_input is None or len(weights_input) == 0:
        # Default to equal weights
        weights = np.array([1.0 / len(assets)] * len(assets))
    else:
        if len(weights_input) != len(assets):
            raise ValueError(f"Expected {len(assets)} weights for assets {assets}, but received {len(weights_input)}.")
        weights = np.array([float(w) for w in weights_input])
        if np.any(weights < 0):
            raise ValueError("Asset weights cannot be negative.")
        if weights.sum() <= 0:
            raise ValueError("Sum of asset weights must be strictly positive.")
        weights = weights / weights.sum()

    asset_returns = prices.pct_change().dropna(how="all").fillna(0)
    portfolio_returns = asset_returns.dot(weights)

    cumulative = ((1 + portfolio_returns).cumprod() - 1) * 100
    total_return = ((1 + portfolio_returns).prod() - 1) * 100
    vol = portfolio_returns.std() * np.sqrt(252) * 100

    # Cumulative series for chart
    cumulative_chart = [
        {
            "date": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
            "return": round(float(val), 2)
        }
        for idx, val in cumulative.items()
    ]

    # Individual asset summaries
    asset_breakdown = []
    for i, asset in enumerate(assets):
        asset_col = prices[asset].dropna()
        if len(asset_col) >= 2:
            a_tot_ret = ((asset_col.iloc[-1] / asset_col.iloc[0]) - 1) * 100
            a_vol = asset_col.pct_change().dropna().std() * np.sqrt(252) * 100
        else:
            a_tot_ret = 0.0
            a_vol = 0.0

        asset_breakdown.append({
            "asset": asset,
            "weight_percent": round(float(weights[i]) * 100, 2),
            "total_return_percent": round(float(a_tot_ret), 2),
            "annualized_volatility_percent": round(float(a_vol), 2)
        })

    return {
        "filename": filename,
        "assets": assets,
        "asset_count": len(assets),
        "observations": len(prices),
        "total_return_percent": round(float(total_return), 2),
        "annualized_volatility_percent": round(float(vol), 2),
        "asset_breakdown": asset_breakdown,
        "cumulative_history": cumulative_chart
    }

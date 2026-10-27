from typing import Dict, Any, List

def calculate_sip(
    investment_type: str = "Monthly SIP",
    amount: float = 10000.0,
    annual_return: float = 12.0,
    years: int = 10
) -> Dict[str, Any]:
    """Calculate investment growth for Monthly SIP or Lump Sum.
    
    Preserves exact formulas from app.py:
    - Monthly SIP:
        monthly_rate = (1 + annual_return / 100) ** (1 / 12) - 1
        future_value = monthly_amount * (((1 + monthly_rate)**months - 1) / monthly_rate) * (1 + monthly_rate)
    - Lump Sum:
        future_value = lump_sum * (1 + annual_return / 100) ** years
    """
    if amount <= 0:
        raise ValueError("Investment amount must be greater than zero.")
    if years < 1 or years > 50:
        raise ValueError("Years must be between 1 and 50.")
    if annual_return < 0 or annual_return > 100:
        raise ValueError("Annual return must be between 0% and 100%. combustion")

    is_sip = "monthly" in investment_type.lower() or "sip" in investment_type.lower()

    if is_sip:
        months = years * 12
        monthly_rate = (1 + annual_return / 100.0) ** (1.0 / 12.0) - 1.0

        if monthly_rate == 0:
            future_value = amount * months
        else:
            future_value = (
                amount
                * (((1.0 + monthly_rate) ** months - 1.0) / monthly_rate)
                * (1.0 + monthly_rate)
            )

        invested = amount * months
        gains = future_value - invested

        # Yearly progression
        progression: List[Dict[str, Any]] = []
        for y in range(1, years + 1):
            m = y * 12
            if monthly_rate == 0:
                fv_y = amount * m
            else:
                fv_y = amount * (((1.0 + monthly_rate) ** m - 1.0) / monthly_rate) * (1.0 + monthly_rate)
            inv_y = amount * m
            progression.append({
                "year": y,
                "invested": round(inv_y, 2),
                "future_value": round(fv_y, 2),
                "gain": round(max(0.0, fv_y - inv_y), 2)
            })

    else:
        # Lump sum
        future_value = amount * ((1.0 + annual_return / 100.0) ** years)
        invested = amount
        gains = future_value - invested

        # Yearly progression
        progression = []
        for y in range(1, years + 1):
            fv_y = amount * ((1.0 + annual_return / 100.0) ** y)
            progression.append({
                "year": y,
                "invested": round(invested, 2),
                "future_value": round(fv_y, 2),
                "gain": round(max(0.0, fv_y - invested), 2)
            })

    return {
        "investment_type": "Monthly SIP" if is_sip else "Lump Sum",
        "amount": round(amount, 2),
        "annual_return_percent": round(annual_return, 2),
        "years": years,
        "invested": round(invested, 2),
        "future_value": round(future_value, 2),
        "gains": round(gains, 2),
        "progression": progression
    }

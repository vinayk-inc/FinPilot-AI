import io
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify health endpoint reports status and version."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "FinPilot AI" in data["app"]
    assert "ai_ready" in data
    assert "ai_model" in data

def test_sip_calculation_endpoint():
    """Verify Monthly SIP projection logic."""
    payload = {
        "investment_type": "Monthly SIP",
        "amount": 10000,
        "annual_return": 12,
        "years": 10
    }
    response = client.post("/api/sip/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["invested"] == 1200000
    assert data["future_value"] > data["invested"]
    assert len(data["progression"]) == 10
    assert data["progression"][-1]["future_value"] == data["future_value"]

def test_lump_sum_calculation_endpoint():
    """Verify Lump Sum investment projection logic."""
    payload = {
        "investment_type": "Lump Sum",
        "amount": 100000,
        "annual_return": 10,
        "years": 5
    }
    response = client.post("/api/sip/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["invested"] == 100000
    assert data["future_value"] > 160000

def test_portfolio_analyze_endpoint():
    """Verify portfolio analysis with uploaded CSV."""
    csv_content = (
        "Date,Asset_A,Asset_B\n"
        "2026-01-01,100,200\n"
        "2026-01-02,105,195\n"
        "2026-01-03,103,205\n"
    ).encode("utf-8")

    files = {"file": ("portfolio.csv", io.BytesIO(csv_content), "text/csv")}
    data = {"weights": "50, 50"}
    response = client.post("/api/portfolio/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["asset_count"] == 2
    assert "Asset_A" in res["assets"]
    assert "Asset_B" in res["assets"]
    assert len(res["cumulative_history"]) == 2
    assert "total_return_percent" in res

def test_portfolio_invalid_file():
    """Verify error handling for invalid portfolio file."""
    csv_content = "InvalidHeader,Col2\n1,2\n3,4\n".encode("utf-8")
    files = {"file": ("bad.csv", io.BytesIO(csv_content), "text/csv")}
    response = client.post("/api/portfolio/analyze", files=files)
    assert response.status_code == 400
    assert "Date" in response.json()["detail"]

def test_ai_chat_validation():
    """Verify input validation on AI chat."""
    response = client.post("/api/ai/chat", json={"messages": []})
    assert response.status_code == 400

import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "checks" in data

def test_marketdata_run():
    payload = {"tickers": ["AAPL"], "period": "1y", "interval": "1d"}
    resp = client.post("/marketdata/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "market_data_insights" in data

def test_news_run():
    payload = {"urls": ["https://finance.yahoo.com"]}
    resp = client.post("/news/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "news_insights" in data

def test_secfilings_run():
    payload = {"cik": "0000320193"}
    resp = client.post("/secfilings/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "sec_filings_insights" in data

def test_socialsentiment_run():
    payload = {"subreddits": ["stocks"]}
    resp = client.post("/socialsentiment/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "social_sentiment_insights" in data

def test_macro_run():
    payload = {"macro_indicators": ["GDP"]}
    resp = client.post("/macro/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "macro_insights" in data

def test_companyevent_run():
    payload = {"pressroom_url": "https://www.apple.com/newsroom/"}
    resp = client.post("/companyevent/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "company_events_insights" in data

def test_startupsignals_run():
    payload = {"repo": "openai/gym", "company": "OpenAI"}
    resp = client.post("/startupsignals/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "startup_signals_insights" in data

def test_nlpevent_run():
    payload = {"text": "Apple announced a new product."}
    resp = client.post("/nlpevent/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "nlp_event_insights" in data

def test_insights_run():
    payload = {"tickers": ["AAPL"], "period": "1y", "interval": "1d"}
    resp = client.post("/insights/run?mock=1", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "insights" in data or "result" in data

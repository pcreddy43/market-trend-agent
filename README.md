# README: Multi-Agent Market Trend System (Open-Source Stack)

## Overview
This project is an open-source, multi-agent system for market and startup signal collection, feature engineering, and prediction. It uses LangGraph for orchestration, yfinance and Newspaper3k for data ingestion, and TimescaleDB/FAISS for storage and retrieval.

## Structure
- `orchestration/` — LangGraph skeleton and agent wiring
- `agents/` — Individual agent implementations (MarketDataAgent, NewsAgent, etc.)
- `utils/` — Shared utilities (DB, feature engineering, etc.)
- `projects/` — Space for experiments, notebooks, and MVPs

## Quickstart
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Set up TimescaleDB locally (see `.env.example` for connection string).
3. Copy `.env.example` to `.env` and update credentials as needed.
4. Run the orchestrator:
   ```
   python orchestration/langgraph_skeleton.py
   ```

## Agents
- **MarketDataAgent**: Fetches historical OHLC/fundamentals via yfinance, stores to TimescaleDB.
- **NewsAgent**: Scrapes news articles using Newspaper3k, stores to TimescaleDB.

## Extending
Add new agents in `agents/` and wire them in the LangGraph skeleton.

## License
All code is open-source except for LLM calls (if used).

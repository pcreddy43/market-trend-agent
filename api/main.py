from api.mock_agent_outputs import (
    MOCK_MARKET_DATA, MOCK_NEWS, MOCK_SECFILINGS, MOCK_SOCIAL, MOCK_MACRO, MOCK_COMPANY_EVENTS, MOCK_STARTUP_SIGNALS, MOCK_NLP_EVENT, MOCK_INSIGHTS, MOCK_PATENT_SIGNALS
)

# --- Clean async FastAPI endpoints with mock logic ---
# ...existing code...

# (imports, logger, app = FastAPI, CORS, request models, all other endpoints...)

# --- Patent Signals Agent endpoint ---
from api.mock_agent_outputs import (
    MOCK_MARKET_DATA, MOCK_NEWS, MOCK_SECFILINGS, MOCK_SOCIAL, MOCK_MACRO, MOCK_COMPANY_EVENTS, MOCK_STARTUP_SIGNALS, MOCK_NLP_EVENT, MOCK_INSIGHTS
)

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging

import sys
import asyncio
import os
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import RequestValidationError as FastAPIRequestValidationError
from agents.insights_agent import InsightsAgent
from agents.market_data_agent import MarketDataAgent
from agents.news_agent import NewsAgent
from agents.sec_filings_agent import SECFilingsAgent
from agents.supply_chain_macro_agent import SupplyChainMacroAgent
from agents.company_event_hiring_agent import CompanyEventHiringAgent
from agents.startup_signals_agent import StartupSignalsAgent
from agents.nlp_event_extraction_agent import NLPEventExtractionAgent
from agents.combined_sentiment_agent import CombinedSentimentAgent

# --- Structured Logging Setup ---
logger = logging.getLogger("api")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('[%(asctime)s] %(levelname)s %(name)s: %(message)s')
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)


# --- CORS Restriction: Use env var for allowed origins in production ---
app = FastAPI(title="Market Trend Multi-Agent API")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Rate Limiting Middleware (slowapi) ---
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app.state.limiter = limiter
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
from slowapi.middleware import SlowAPIMiddleware
app.add_middleware(SlowAPIMiddleware)


 # --- Request Models ---
class InsightsRequest(BaseModel):
    tickers: List[str]
    period: Optional[str] = "1y"
    interval: Optional[str] = "1d"
    # API keys are loaded from environment, not exposed in request

class MarketDataRequest(BaseModel):
    tickers: List[str]
    period: Optional[str] = "1y"
    interval: Optional[str] = "1d"
    # API keys are loaded from environment, not exposed in request

class NewsRequest(BaseModel):
    urls: List[str]
    rss_urls: Optional[List[str]] = None

class SECFilingsRequest(BaseModel):
    cik: str

class SocialSentimentRequest(BaseModel):
    subreddits: Optional[List[str]] = ["stocks", "wallstreetbets"]

class MacroRequest(BaseModel):
    macro_indicators: Optional[List[str]] = ["GDP", "UNRATE", "CPIAUCSL"]

class CompanyEventRequest(BaseModel):
    pressroom_url: Optional[str] = "https://www.apple.com/newsroom/"
    job_board_url: Optional[str] = "https://boards.greenhouse.io/apple"
    github_org: Optional[str] = "apple"

class StartupSignalsRequest(BaseModel):
    repo: Optional[str] = "openai/gym"
    company: Optional[str] = "OpenAI"

class NLPEventRequest(BaseModel):
    text: str
class InsightsRequest(BaseModel):
    tickers: List[str]
    period: Optional[str] = "1y"
    interval: Optional[str] = "1d"
    alpha_vantage_api_key: Optional[str] = None

@app.post("/insights/run", summary="Run Insights Agent (Aggregated)", response_model=dict, tags=["Agents"])
async def run_insights(req: InsightsRequest, request: Request):
    logger.info(f"[API] /insights/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /insights/run returning MOCK_INSIGHTS")
        return {"status": "success", **MOCK_INSIGHTS}
    state = req.dict()
    await asyncio.to_thread(MarketDataAgent().run, state)
    await asyncio.to_thread(NewsAgent().run, state)
    await asyncio.to_thread(SECFilingsAgent().run, state)
    await asyncio.to_thread(SupplyChainMacroAgent().run, state)
    await asyncio.to_thread(CompanyEventHiringAgent().run, state)
    await asyncio.to_thread(StartupSignalsAgent().run, state)
    await asyncio.to_thread(NLPEventExtractionAgent().run, state)
    await asyncio.to_thread(InsightsAgent().run, state)
    logger.info(f"[API] /insights/run completed")
    return {
        "status": "success",
        "result": state.get('insights', []),
        "market_data_insights": state.get('market_data_insights', ""),
        "news_insights": state.get('news_insights', ""),
        "sec_filings_insights": state.get('sec_filings_insights', ""),
        "social_sentiment_insights": state.get('social_sentiment_insights', ""),
        "macro_insights": state.get('macro_insights', ""),
        "company_events_insights": state.get('company_events_insights', ""),
        "startup_signals_insights": state.get('startup_signals_insights', ""),
        "nlp_event_insights": state.get('nlp_event_insights', "")
    }


async def run_market_data(req: MarketDataRequest, request: Request):
    logger.info(f"[API] /marketdata/run called from {request.client.host} with {req.dict()}")
    agent = MarketDataAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /marketdata/run completed for {req.dict().get('tickers')}")
    return {
        "status": "success",
        "result": state.get('market_data', []),
        "market_data_insights": state.get('market_data_insights', "")
    }
@app.post("/marketdata/run", summary="Run Market Data Agent", response_model=dict, tags=["Agents"])
async def run_market_data(req: MarketDataRequest, request: Request):
    logger.info(f"[API] /marketdata/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /marketdata/run returning MOCK_MARKET_DATA")
        return {"status": "success", **MOCK_MARKET_DATA}
    agent = MarketDataAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /marketdata/run completed for {req.dict().get('tickers')}")
    return {
        "status": "success",
        "result": state.get('market_data', []),
        "market_data_insights": state.get('market_data_insights', "")
    }

async def run_news(req: NewsRequest, request: Request):
    logger.info(f"[API] /news/run called from {request.client.host} with {req.dict()}")
    agent = NewsAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /news/run completed")
    return {
        "status": "success",
        "result": state.get('news_data', []),
        "news_insights": state.get('news_insights', "")
    }
@app.post("/news/run", summary="Run News Agent", response_model=dict, tags=["Agents"])
async def run_news(req: NewsRequest, request: Request):
    logger.info(f"[API] /news/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /news/run returning MOCK_NEWS")
        return {"status": "success", **MOCK_NEWS}
    agent = NewsAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /news/run completed")
    return {
        "status": "success",
        "result": state.get('news_data', []),
        "news_insights": state.get('news_insights', "")
    }

async def run_sec_filings(req: SECFilingsRequest, request: Request):
    logger.info(f"[API] /secfilings/run called from {request.client.host} with {req.dict()}")
    agent = SECFilingsAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /secfilings/run completed")
    return {
        "status": "success",
        "result": state.get('sec_filings', []),
        "sec_filings_insights": state.get('sec_filings_insights', "")
    }
@app.post("/secfilings/run", summary="Run SEC Filings Agent", response_model=dict, tags=["Agents"])
async def run_sec_filings(req: SECFilingsRequest, request: Request):
    logger.info(f"[API] /secfilings/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /secfilings/run returning MOCK_SECFILINGS")
        return {"status": "success", **MOCK_SECFILINGS}
    agent = SECFilingsAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /secfilings/run completed")
    return {
        "status": "success",
        "result": state.get('sec_filings', []),
        "sec_filings_insights": state.get('sec_filings_insights', "")
    }


async def run_macro(req: MacroRequest, request: Request):
    logger.info(f"[API] /macro/run called from {request.client.host} with {req.dict()}")
    agent = SupplyChainMacroAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /macro/run completed")
    return {
        "status": "success",
        "result": state.get('macro_data', {}),
        "macro_insights": state.get('macro_insights', "")
    }
@app.post("/macro/run", summary="Run Macro Agent", response_model=dict, tags=["Agents"])
async def run_macro(req: MacroRequest, request: Request):
    logger.info(f"[API] /macro/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /macro/run returning MOCK_MACRO")
        return {"status": "success", **MOCK_MACRO}
    agent = SupplyChainMacroAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /macro/run completed")
    return {
        "status": "success",
        "result": state.get('macro_data', {}),
        "macro_insights": state.get('macro_insights', "")
    }

async def run_company_event(req: CompanyEventRequest, request: Request):
    logger.info(f"[API] /companyevent/run called from {request.client.host} with {req.dict()}")
    agent = CompanyEventHiringAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /companyevent/run completed")
    return {
        "status": "success",
        "result": state.get('company_events', {}),
        "company_events_insights": state.get('company_events_insights', "")
    }
@app.post("/companyevent/run", summary="Run Company Event Agent", response_model=dict, tags=["Agents"])
async def run_company_event(req: CompanyEventRequest, request: Request):
    logger.info(f"[API] /companyevent/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /companyevent/run returning MOCK_COMPANY_EVENTS")
        return {"status": "success", **MOCK_COMPANY_EVENTS}
    agent = CompanyEventHiringAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /companyevent/run completed")
    return {
        "status": "success",
        "result": state.get('company_events', {}),
        "company_events_insights": state.get('company_events_insights', "")
    }

async def run_startup_signals(req: StartupSignalsRequest, request: Request):
    logger.info(f"[API] /startupsignals/run called from {request.client.host} with {req.dict()}")
    agent = StartupSignalsAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /startupsignals/run completed")
    return {
        "status": "success",
        "result": state.get('startup_signals', {}),
        "startup_signals_insights": state.get('startup_signals_insights', "")
    }
@app.post("/startupsignals/run", summary="Run Startup Signals Agent", response_model=dict, tags=["Agents"])
async def run_startup_signals(req: StartupSignalsRequest, request: Request):
    logger.info(f"[API] /startupsignals/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /startupsignals/run returning MOCK_STARTUP_SIGNALS")
        return {"status": "success", **MOCK_STARTUP_SIGNALS}
    agent = StartupSignalsAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /startupsignals/run completed")
    return {
        "status": "success",
        "result": state.get('startup_signals', {}),
        "startup_signals_insights": state.get('startup_signals_insights', "")
    }

async def run_nlp_event(req: NLPEventRequest, request: Request):
    logger.info(f"[API] /nlpevent/run called from {request.client.host} with {req.dict()}")
    agent = NLPEventExtractionAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /nlpevent/run completed")
    return {
        "status": "success",
        "result": state.get('extracted_events', {}),
        "nlp_event_insights": state.get('nlp_event_insights', "")
    }
@app.post("/nlpevent/run", summary="Run NLP Event Extraction Agent", response_model=dict, tags=["Agents"])
async def run_nlp_event(req: NLPEventRequest, request: Request):
    logger.info(f"[API] /nlpevent/run called from {request.client.host} with {req.dict()}")
    if request.query_params.get("mock") == "1":
        logger.info("[API] /nlpevent/run returning MOCK_NLP_EVENT")
        return {"status": "success", **MOCK_NLP_EVENT}
    agent = NLPEventExtractionAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /nlpevent/run completed")
    return {
        "status": "success",
        "result": state.get('extracted_events', {}),
        "nlp_event_insights": state.get('nlp_event_insights', "")
    }

class CombinedSentimentRequest(BaseModel):
    tickers: List[str]

@app.post("/combinedsentiment/run", summary="Run Combined Sentiment Agent (StockTwits + News)", response_model=dict, tags=["Agents"])
async def run_combined_sentiment(req: CombinedSentimentRequest, request: Request):
    logger.info(f"[API] /combinedsentiment/run called from {request.client.host} with {req.dict()}")
    agent = CombinedSentimentAgent()
    state = req.dict()
    await asyncio.to_thread(agent.run, state)
    logger.info(f"[API] /combinedsentiment/run completed")
    return {
        "status": "success",
        "result": state.get('combined_sentiment', {})
    }

@app.get("/health")
def health():
    import os
    health_report = {"status": "ok", "checks": {}}
    # yfinance check
    try:
        import yfinance
        yfinance.Ticker('AAPL').info
        health_report["checks"]["yfinance"] = True
    except Exception as e:
        health_report["checks"]["yfinance"] = str(e)
    # Reddit API check
    try:
        import praw
        praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent="OpenSourceMarketAgent/1.0"
        )
        health_report["checks"]["reddit_api"] = True
    except Exception as e:
        health_report["checks"]["reddit_api"] = str(e)
    # OpenAI key check
    openai_key = os.getenv('OPENAI_API_KEY')
    health_report["checks"]["openai_key"] = bool(openai_key)
    logger.info(f"[API] /health checked: {health_report}")
    return health_report

MOCK_ESG_SIGNALS = {
    "esg_signals": [
        {"company": "Apple", "esg_score": 82, "environment": 85, "social": 80, "governance": 81, "recent_event": "Published 2025 Sustainability Report", "trend": "improving"},
        {"company": "Microsoft", "esg_score": 88, "environment": 90, "social": 87, "governance": 86, "recent_event": "Joined global ESG initiative", "trend": "stable"}
    ],
    "esg_signals_insights": "Apple and Microsoft show strong ESG performance, with Apple improving year-over-year."
}
MOCK_PATENT_SIGNALS = {
    "patent_signals": [
        {"company": "Apple", "patent_count": 12, "recent_patent": "US1234567B2", "trend": "increasing"}
    ],
    "patent_signals_insights": "Apple's patent activity is increasing, indicating ongoing innovation."
}
# Mock outputs for all agents for frontend and test use
MOCK_MARKET_DATA = {
    "market_data": [{"ticker": "AAPL", "price": 190.0, "date": "2025-09-05"}],
    "market_data_insights": "AAPL is trending upward with strong momentum."
}
MOCK_NEWS = {
    "news_data": [{"title": "Apple launches new product", "url": "https://news.com/apple"}],
    "news_insights": "Recent news highlights innovation at Apple."
}
MOCK_SECFILINGS = {
    "sec_filings": [{"cik": "0000320193", "form": "10-K", "date": "2025-08-01"}],
    "sec_filings_insights": "Apple's latest 10-K shows strong financials."
}
MOCK_SOCIAL = {
    "social_mentions": [{"subreddit": "stocks", "mention": "AAPL to the moon!"}],
    "social_sentiment_insights": "Reddit sentiment is bullish on AAPL."
}
MOCK_MACRO = {
    "macro_data": {"GDP": 3.2},
    "macro_insights": "GDP growth remains robust."
}
MOCK_COMPANY_EVENTS = {
    "company_events": {"press": "Apple event next week."},
    "company_events_insights": "Upcoming Apple event may impact stock."
}
MOCK_STARTUP_SIGNALS = {
    "startup_signals": {"repo": "openai/gym", "stars": 5000},
    "startup_signals_insights": "OpenAI's repo is gaining traction."
}
MOCK_NLP_EVENT = {
    "extracted_events": {"event": "product launch"},
    "nlp_event_insights": "Detected product launch event."
}
MOCK_INSIGHTS = {
    "insights": [
        {"ticker": "AAPL", "score": 95, "recommendation": "Buy", "insight": "AAPL is a strong buy.", "explanation": "All signals positive: technicals, news, and patent activity are aligned."},
        {"ticker": "MSFT", "score": 88, "recommendation": "Watch", "insight": "MSFT is stable.", "explanation": "Mixed signals: strong financials but neutral sentiment."}
    ],
    "market_data_insights": MOCK_MARKET_DATA["market_data_insights"],
    "news_insights": MOCK_NEWS["news_insights"],
    "sec_filings_insights": MOCK_SECFILINGS["sec_filings_insights"],
    "social_sentiment_insights": MOCK_SOCIAL["social_sentiment_insights"],
    "macro_insights": MOCK_MACRO["macro_insights"],
    "company_events_insights": MOCK_COMPANY_EVENTS["company_events_insights"],
    "startup_signals_insights": MOCK_STARTUP_SIGNALS["startup_signals_insights"],
    "nlp_event_insights": MOCK_NLP_EVENT["nlp_event_insights"],
    "patent_signals_insights": MOCK_PATENT_SIGNALS["patent_signals_insights"]
}

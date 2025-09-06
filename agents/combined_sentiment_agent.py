"""
CombinedSentimentAgent: Aggregates StockTwits and news sentiment for each ticker.
"""
from .base_agent import BaseAgent
from .news_agent import NewsAgent
import requests

class CombinedSentimentAgent(BaseAgent):
    """
    Combines StockTwits and news sentiment for a given list of tickers.
    """
    def __init__(self):
        super().__init__()
        self.news_agent = NewsAgent()

    def fetch_stocktwits_sentiment(self, symbol, limit=10):
        msgs = []
        url = f"https://api.stocktwits.com/api/2/streams/symbol/{symbol}.json"
        try:
            resp = requests.get(url)
            if resp.status_code == 200:
                data = resp.json()
                for msg in data.get("messages", [])[:limit]:
                    sentiment = self.news_agent.analyze_sentiment(msg["body"])
                    msgs.append({
                        "platform": "StockTwits",
                        "symbol": symbol,
                        "body": msg["body"],
                        "sentiment": sentiment
                    })
        except Exception as e:
            self.log(f"StockTwits fetch failed for {symbol}: {e}", level=30)
        return msgs

    def fetch_news_sentiment(self, symbol, news_urls=None, rss_urls=None):
        # Use NewsAgent to fetch and analyze news for the ticker
        state = {"news_urls": news_urls or [], "rss_urls": rss_urls or []}
        news_data = self.news_agent.run(state).get("news_data", [])
        # Filter news mentioning the symbol
        filtered = [n for n in news_data if symbol.upper() in n.get("title", "").upper() or symbol.upper() in n.get("text", "").upper()]
        return filtered

    def run(self, state):
        tickers = state.get("tickers", [])
        results = {}
        for ticker in tickers:
            stocktwits_msgs = self.fetch_stocktwits_sentiment(ticker)
            news_msgs = self.fetch_news_sentiment(ticker)
            results[ticker] = {
                "stocktwits": stocktwits_msgs,
                "news": news_msgs
            }
        state["combined_sentiment"] = results
        return state

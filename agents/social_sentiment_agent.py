"""
SocialSentimentAgent: Scrapes Reddit for stock mentions and sentiment.
"""
from .base_agent import BaseAgent
import praw
from sentence_transformers import SentenceTransformer

class SocialSentimentAgent(BaseAgent):
    """
    Scrapes Reddit for stock mentions and computes sentiment embeddings.
    """
    def __init__(self):
        super().__init__()
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        # Set up Reddit API credentials in .env
        import os
        self.reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent="OpenSourceMarketAgent/1.0"
        )


    def fetch_mentions(self, subreddits=["stocks", "wallstreetbets"], limit=10):
        results = []
        for subreddit in subreddits:
            posts = self.reddit.subreddit(subreddit).hot(limit=limit)
            for post in posts:
                embedding = self.model.encode(post.title)
                sentiment = self.analyze_sentiment(post.title)
                results.append({
                    "subreddit": subreddit,
                    "title": post.title,
                    "score": post.score,
                    "embedding": embedding.tolist(),
                    "sentiment": sentiment
                })
        # Add StockTwits scraping (public endpoint)
        stocktwits_msgs = self.fetch_stocktwits("AAPL")
        results.extend(stocktwits_msgs)
        return results

    def analyze_sentiment(self, text):
        from textblob import TextBlob
        return TextBlob(text).sentiment.polarity

    def fetch_stocktwits(self, symbol):
        import requests
        msgs = []
        url = f"https://api.stocktwits.com/api/2/streams/symbol/{symbol}.json"
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            for msg in data.get("messages", [])[:10]:
                sentiment = self.analyze_sentiment(msg["body"])
                msgs.append({
                    "platform": "StockTwits",
                    "symbol": symbol,
                    "body": msg["body"],
                    "sentiment": sentiment
                })
        return msgs

    def run(self, state):
        subreddits = state.get("subreddits", ["stocks", "wallstreetbets"])
        mentions = self.fetch_mentions(subreddits=subreddits)
        state["social_mentions"] = mentions
        # OpenAI-powered summary/insight
        openai_api_key = state.get('openai_api_key')
        if openai_api_key and mentions:
            try:
                from .openai_utils import openai_chat
                summary_prompt = [
                    {"role": "system", "content": "You are a financial social sentiment analyst. Given the following Reddit/social mentions, summarize the overall sentiment and highlight any actionable signals for equity investors in 2-3 sentences."},
                    {"role": "user", "content": str(mentions[:10])}
                ]
                state['social_sentiment_insights'] = openai_chat(summary_prompt, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI social sentiment insight failed: {e}", level=30)
        return state

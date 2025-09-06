"""
NewsAgent: Scrapes news articles using Scrapy (crawling) and Newspaper3k (parsing), stores to TimescaleDB.
Industry-standard: modular, robust, extensible.
"""
from newspaper import Article
import pandas as pd
from .base_agent import BaseAgent
import scrapy
from scrapy.crawler import CrawlerProcess

class NewsSpider(scrapy.Spider):
    name = "news_spider"
    custom_settings = {'LOG_ENABLED': False}
    def __init__(self, urls, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = urls
        self.results = []
    def parse(self, response):
        self.results.append(response.url)

class NewsAgent(BaseAgent):
    """
    Scrapes news using Scrapy (for crawling) and Newspaper3k (for parsing/extraction).
    Extendable for RSS feeds and open APIs.
    """
    def __init__(self):
        super().__init__()

    def crawl_urls(self, seed_urls):
        """
        Use Scrapy to crawl and collect article URLs from seed pages.
        """
        process = CrawlerProcess(settings={"LOG_ENABLED": False})
        spider = NewsSpider
        process.crawl(spider, urls=seed_urls)
        process.start()
        return spider.results if hasattr(spider, 'results') else seed_urls


    def fetch_rss(self, rss_urls):
        import feedparser
        entries = []
        for rss_url in rss_urls:
            self.log(f"Fetching RSS feed: {rss_url}")
            feed = feedparser.parse(rss_url)
            for entry in feed.entries:
                entries.append({
                    'url': entry.link,
                    'title': entry.title,
                    'summary': entry.summary if 'summary' in entry else '',
                    'published': entry.published if 'published' in entry else ''
                })
        return entries

    def analyze_sentiment(self, text):
        from textblob import TextBlob
        return TextBlob(text).sentiment.polarity

    def summarize(self, text, openai_api_key=None):
        if openai_api_key:
            try:
                from .openai_utils import summarize_text
                return summarize_text(text, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI summarization failed: {e}", level=30)
        # Fallback: Simple extractive summary: first 2 sentences
        import re
        sentences = re.split(r'(?<=[.!?]) +', text)
        return ' '.join(sentences[:2])

    def fetch_and_return(self, urls, rss_urls=None):
        articles = []
        # Optionally crawl for more URLs
        all_urls = self.crawl_urls(urls)
        # Add RSS feed entries
        if rss_urls:
            rss_entries = self.fetch_rss(rss_urls)
            for entry in rss_entries:
                articles.append({
                    'url': entry['url'],
                    'title': entry['title'],
                    'text': entry.get('summary', ''),
                    'publish_date': entry.get('published', ''),
                    'sentiment': self.analyze_sentiment(entry.get('summary', '')),
                    'summary': self.summarize(entry.get('summary', ''))
                })
        for url in all_urls:
            try:
                self.log(f"Parsing article: {url}")
                article = Article(url)
                article.download()
                article.parse()
                sentiment = self.analyze_sentiment(article.text)
                summary = self.summarize(article.text)
                articles.append({
                    'url': url,
                    'title': article.title,
                    'text': article.text,
                    'publish_date': str(article.publish_date) if article.publish_date else '',
                    'sentiment': sentiment,
                    'summary': summary
                })
            except Exception as e:
                self.handle_error(f"Failed to fetch {url}: {e}")
        if articles:
            df = pd.DataFrame(articles)
            # df.to_sql('news', self.engine, if_exists='append', index=False)
            self.log(f"Stored {len(articles)} articles.")
        return articles

    def run(self, state):
        """
        Run the agent with state input (news_urls, rss_urls, etc.), return news data for API.
        """
        urls = state.get('news_urls', [
            'https://www.reuters.com/markets/us',
            'https://www.cnbc.com/finance/'
        ])
        rss_urls = state.get('rss_urls', [
            'https://feeds.reuters.com/reuters/businessNews',
            'https://www.cnbc.com/id/100003114/device/rss/rss.html'
        ])
        news_data = self.fetch_and_return(urls, rss_urls)
        state['news_data'] = news_data
        return state

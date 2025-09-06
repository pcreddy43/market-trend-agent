# Streamlit dashboard for Market Trend System
import streamlit as st
import requests
import pandas as pd
import plotly.express as px
from datetime import datetime

st.set_page_config(page_title="Market Trend Dashboard", layout="wide")
st.title("📈 Market Trend Multi-Agent Dashboard")

st.sidebar.header("Input Parameters")
tickers = st.sidebar.text_input("Tickers (comma-separated)", "AAPL,MSFT,GOOG", key="tickers1")
period = st.sidebar.selectbox("Period", ["1y", "6mo", "3mo", "1mo"], key="period1")
interval = st.sidebar.selectbox("Interval", ["1d", "1h", "5m"], key="interval1")

if st.sidebar.button("Run Market Data Agent", key="btn_market_data_agent"):
    resp = requests.post(
        "http://localhost:8000/marketdata/run",
        json={"tickers": [t.strip() for t in tickers.split(",")], "period": period, "interval": interval}
    tabs = st.tabs([
        "Market Data",
        "News",
        "SEC Filings",
        "Social Sentiment",
        "Macro",
        "Company Events",
        "Startup Signals",
        "NLP Extraction"
    ])
    )
    st.json(resp.json())

news_urls = st.sidebar.text_area("News URLs (one per line)", "https://www.reuters.com/markets/us\nhttps://www.cnbc.com/finance/")
if st.sidebar.button("Run News Agent", key="btn_news_agent"):
    resp = requests.post(
        "http://localhost:8000/news/run",
        json={"urls": [u.strip() for u in news_urls.splitlines() if u.strip()]}
    )
    st.json(resp.json())

st.header("Insights & Predictions")
st.info("Results and visualizations will appear here as you build out the pipeline.")

# Streamlit dashboard for Market Trend System (extended for all agents)
import streamlit as st
import requests

st.set_page_config(page_title="Market Trend Dashboard", layout="wide")
st.title("📈 Market Trend Multi-Agent Dashboard")

st.sidebar.header("Input Parameters")

# Market Data Agent
st.subheader("Market Data Agent")
tickers = st.sidebar.text_input("Tickers (comma-separated)", "AAPL,MSFT,GOOG")
period = st.sidebar.selectbox("Period", ["1y", "6mo", "3mo", "1mo"])
interval = st.sidebar.selectbox("Interval", ["1d", "1h", "5m"])
alpha_vantage_api_key = st.sidebar.text_input("Alpha Vantage API Key (optional)", "", key="alpha_vantage_api_key1")
market_data = None
if st.sidebar.button("Run Market Data Agent"):
    resp = requests.post(
        "http://localhost:8000/marketdata/run",
        json={"tickers": [t.strip() for t in tickers.split(",")], "period": period, "interval": interval, "alpha_vantage_api_key": alpha_vantage_api_key or None}
    )
    market_data = resp.json()
    st.json(market_data)
    # Visualization: show OHLC and indicators if present
    if 'result' in market_data and market_data['result']:
        try:
            df = pd.DataFrame(market_data['result'])
            if not df.empty and 'close' in df:
                st.write("### Price & Indicators")
                fig = px.line(df, x=df.index, y=['close', 'SMA_20', 'RSI_14'], title="Price & Indicators")
                st.plotly_chart(fig)
        except Exception as e:
            st.warning(f"Could not plot market data: {e}")

# News Agent
st.subheader("News Agent")
news_urls = st.sidebar.text_area("News URLs (one per line)", "https://www.reuters.com/markets/us\nhttps://www.cnbc.com/finance/", key="news_urls1")
rss_urls = st.sidebar.text_area("RSS URLs (one per line)", "https://feeds.reuters.com/reuters/businessNews\nhttps://www.cnbc.com/id/100003114/device/rss/rss.html", key="rss_urls1")
news_data = None
if st.sidebar.button("Run News Agent"):
    resp = requests.post(
        "http://localhost:8000/news/run",
        json={"urls": [u.strip() for u in news_urls.splitlines() if u.strip()], "rss_urls": [u.strip() for u in rss_urls.splitlines() if u.strip()]}
    )
    news_data = resp.json()
    st.json(news_data)
    # Visualization: news table and sentiment histogram
    if 'result' in news_data and news_data['result']:
        try:
            df = pd.DataFrame(news_data['result'])
            st.write("### News Table")
            st.dataframe(df[['title', 'publish_date', 'sentiment', 'summary']])
            st.write("### Sentiment Distribution")
            fig = px.histogram(df, x='sentiment', nbins=20, color='sentiment', title="News Sentiment")
            st.plotly_chart(fig)
        except Exception as e:
            st.warning(f"Could not plot news data: {e}")

# SEC Filings Agent
st.subheader("SEC Filings Agent")
cik = st.sidebar.text_input("CIK (e.g., 0000320193 for Apple)", "0000320193", key="cik1")
sec_data = None
if st.sidebar.button("Run SEC Filings Agent", key="btn_sec_filings_agent"):
    resp = requests.post(
        "http://localhost:8000/secfilings/run",
        json={"cik": cik}
    )
    sec_data = resp.json()
    st.json(sec_data)
    # Visualization: filings table
    if 'result' in sec_data and sec_data['result']:
        try:
            df = pd.DataFrame(sec_data['result'])
            st.write("### SEC Filings Table")
            st.dataframe(df[['type', 'title', 'date', 'summary']])
        except Exception as e:
            st.warning(f"Could not plot SEC filings: {e}")

# Social Sentiment Agent
st.subheader("Social Sentiment Agent")
subreddits = st.sidebar.text_input("Subreddits (comma-separated)", "stocks,wallstreetbets", key="subreddits1")
social_data = None
if st.sidebar.button("Run Social Sentiment Agent", key="btn_social_sentiment_agent"):
    resp = requests.post(
        "http://localhost:8000/socialsentiment/run",
        json={"subreddits": [s.strip() for s in subreddits.split(",") if s.strip()]}
    )
    social_data = resp.json()
    st.json(social_data)
    # Visualization: sentiment bar chart
    if 'result' in social_data and social_data['result']:
        try:
            df = pd.DataFrame(social_data['result'])
            if 'sentiment' in df:
                st.write("### Social Sentiment Distribution")
                fig = px.histogram(df, x='sentiment', nbins=20, color='sentiment', title="Social Sentiment")
                st.plotly_chart(fig)
        except Exception as e:
            st.warning(f"Could not plot social sentiment: {e}")

# Macro Agent
st.subheader("Macro Agent")
macro_indicators = st.sidebar.text_input("Macro Indicators (comma-separated)", "GDP,UNRATE,CPIAUCSL", key="macro_indicators1")
macro_data = None
if st.sidebar.button("Run Macro Agent", key="btn_macro_agent"):
    resp = requests.post(
        "http://localhost:8000/macro/run",
        json={"macro_indicators": [m.strip() for m in macro_indicators.split(",") if m.strip()]}
    )
    macro_data = resp.json()
    st.json(macro_data)
    # Visualization: macro indicators line chart
    if 'result' in macro_data and macro_data['result']:
        try:
            for indicator, records in macro_data['result'].items():
                df = pd.DataFrame(records)
                if not df.empty and 'DATE' in df and indicator in df:
                    st.write(f"### {indicator} Over Time")
                    fig = px.line(df, x='DATE', y=indicator, title=f"{indicator} Over Time")
                    st.plotly_chart(fig)
        except Exception as e:
            st.warning(f"Could not plot macro data: {e}")

# Company Event & Hiring Agent
st.subheader("Company Event & Hiring Agent")
pressroom_url = st.sidebar.text_input("Pressroom URL", "https://www.apple.com/newsroom/", key="pressroom_url1")
job_board_url = st.sidebar.text_input("Job Board URL", "https://boards.greenhouse.io/apple", key="job_board_url1")
github_org = st.sidebar.text_input("GitHub Org", "apple", key="github_org1")
company_data = None
if st.sidebar.button("Run Company Event Agent", key="btn_company_event_agent"):
    resp = requests.post(
        "http://localhost:8000/companyevent/run",
        json={"pressroom_url": pressroom_url, "job_board_url": job_board_url, "github_org": github_org}
    )
    company_data = resp.json()
    st.json(company_data)
    # Visualization: show events, jobs, github activity
    if 'result' in company_data and company_data['result']:
        try:
            st.write("### Company Events")
            st.write(company_data['result'])
        except Exception as e:
            st.warning(f"Could not plot company events: {e}")

# Startup Signals Agent
st.subheader("Startup Signals Agent")
repo = st.sidebar.text_input("GitHub Repo (owner/repo)", "openai/gym", key="repo1")
company = st.sidebar.text_input("Startup Company Name", "OpenAI", key="company1")
startup_data = None
if st.sidebar.button("Run Startup Signals Agent", key="btn_startup_signals_agent"):
    resp = requests.post(
        "http://localhost:8000/startupsignals/run",
        json={"repo": repo, "company": company}
    )
    startup_data = resp.json()
    st.json(startup_data)
    # Visualization: show startup signals
    if 'result' in startup_data and startup_data['result']:
        try:
            st.write("### Startup Signals")
            st.write(startup_data['result'])
        except Exception as e:
            st.warning(f"Could not plot startup signals: {e}")

# NLP Event Extraction Agent
st.subheader("NLP Event Extraction Agent")
text = st.text_area("Text for NLP Event Extraction", "Apple announced a new product in Cupertino.", key="nlp_text1")
nlp_data = None
if st.button("Run NLP Event Extraction Agent", key="btn_nlp_event_agent"):
    resp = requests.post(
        "http://localhost:8000/nlpevent/run",
        json={"text": text}
    )
    nlp_data = resp.json()
    st.json(nlp_data)
    # Visualization: show extracted events/entities
    if 'result' in nlp_data and nlp_data['result']:
        try:
            st.write("### Extracted Events/Entities")
            st.write(nlp_data['result'])
        except Exception as e:
            st.warning(f"Could not plot NLP events: {e}")

st.header("Insights & Predictions")
st.info("Use the filters and visualizations above to explore your data. Advanced filtering and color-coded charts are now enabled!")

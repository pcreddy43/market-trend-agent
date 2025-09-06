"""
MarketDataAgent: Fetches historical OHLC and fundamentals using yfinance (API), stores to TimescaleDB.
Industry-standard: modular, robust, extensible.
"""
import yfinance as yf
import pandas as pd
from .base_agent import BaseAgent

class MarketDataAgent(BaseAgent):
    """
    Fetches market data using open-source APIs (yfinance) and stores to TimescaleDB.
    Extendable for other APIs (e.g., Alpha Vantage, Finnhub).
    """
    def __init__(self):
        super().__init__()


    def fetch_from_yfinance(self, ticker, period, interval):
        data = yf.download(ticker, period=period, interval=interval)
        return data

    def fetch_from_alpha_vantage(self, ticker, api_key):
        # Example: Fetch daily data from Alpha Vantage (free API, limited calls)
        import requests
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={api_key}&outputsize=compact"
        resp = requests.get(url)
        if resp.status_code == 200:
            json_data = resp.json()
            if "Time Series (Daily)" in json_data:
                df = pd.DataFrame.from_dict(json_data["Time Series (Daily)"], orient="index")
                df = df.rename(columns=lambda x: x.split(". ")[-1])
                df.index = pd.to_datetime(df.index)
                return df
        return pd.DataFrame()

    def add_technical_indicators(self, df):
        # Add simple moving average, RSI, etc.
        if df.empty:
            return df
        df = df.copy()
        df['SMA_20'] = df['Close'].astype(float).rolling(window=20).mean()
        df['RSI_14'] = self.compute_rsi(df['Close'].astype(float), 14)
        return df

    def compute_rsi(self, series, period=14):
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def fetch_and_store(self, tickers, period="1y", interval="1d", api_key=None):
        for ticker in tickers:
            try:
                self.log(f"Fetching {ticker} from yfinance API...")
                data = self.fetch_from_yfinance(ticker, period, interval)
                if api_key:
                    self.log(f"Fetching {ticker} from Alpha Vantage API...")
                    av_data = self.fetch_from_alpha_vantage(ticker, api_key)
                    if not av_data.empty:
                        data = pd.concat([data, av_data], axis=0).sort_index().drop_duplicates()
                if not data.empty:
                    data = self.add_technical_indicators(data)
                    data['ticker'] = ticker
                    # data.to_sql('ohlc', self.engine, if_exists='append', index=True)
                    # self.log(f"Stored {ticker} data to DB with indicators.")
                if data.empty:
                    self.log(f"No data for {ticker}", level=30)
            except Exception as e:
                self.handle_error(e)

    def run(self, state):
        """
        Run the agent with state input (tickers, etc.), return processed data and recommendations.
        """
        print(f"[DEBUG] state: {state}")
        tickers = state.get('tickers', ['AAPL', 'MSFT', 'GOOG'])
        # Robust ticker parsing: handle comma-separated string or list
        if isinstance(tickers, str):
            tickers = [t.strip() for t in tickers.split(',') if t.strip()]
        period = state.get('period', '1y')
        interval = state.get('interval', '1d')
        api_key = state.get('alpha_vantage_api_key')
        all_results = []
        for ticker in tickers:
            data = self.fetch_from_yfinance(ticker, period, interval)
            print(f"[DEBUG] {ticker} yfinance shape: {data.shape}")
            print(f"[DEBUG] {ticker} yfinance head:\n{data.head()}")
            if api_key:
                av_data = self.fetch_from_alpha_vantage(ticker, api_key)
                if not av_data.empty:
                    data = pd.concat([data, av_data], axis=0).sort_index().drop_duplicates()
            if not data.empty:
                data = self.add_technical_indicators(data)
                print(f"[DEBUG] {ticker} with indicators head:\n{data.head()}")
                data['ticker'] = ticker
                # Flatten columns if MultiIndex (e.g., after yfinance download)
                if isinstance(data.columns, pd.MultiIndex):
                    data.columns = ['_'.join([str(i) for i in col if i]) for col in data.columns.values]
                # Find the correct 'Close' column (e.g., 'Close_AAPL')
                close_col = None
                for col in data.columns:
                    if col.lower().startswith('close'):
                        close_col = col
                        break
                # Find the correct SMA_20 and RSI_14 columns (may be just 'SMA_20', 'RSI_14')
                sma_col = next((c for c in data.columns if 'SMA_20' in c), 'SMA_20')
                rsi_col = next((c for c in data.columns if 'RSI_14' in c), 'RSI_14')
                # Recommendation logic: RSI < 30 = Buy, RSI > 70 = Sell, else Hold
                data['recommendation'] = data[rsi_col].apply(
                    lambda rsi: 'Buy' if rsi < 30 else ('Sell' if rsi > 70 else 'Hold') if pd.notnull(rsi) else 'N/A')
                # Only keep relevant columns for frontend
                result = data.reset_index()[['Date','ticker',close_col,sma_col,rsi_col,'recommendation']].rename(columns={"Date": "date", close_col: "close", sma_col: "SMA_20", rsi_col: "RSI_14"}).fillna('').to_dict(orient='records')
                print(f"[DEBUG] {ticker} result sample: {result[:2]}")
                all_results.extend(result)
            else:
                self.log(f"No data for {ticker}", level=30)
        print(f"[DEBUG] all_results length: {len(all_results)}")
        state['market_data'] = all_results
        # OpenAI-powered summary/insight
        openai_api_key = state.get('openai_api_key')
        if openai_api_key and all_results:
            try:
                from .openai_utils import openai_chat
                summary_prompt = [
                    {"role": "system", "content": "You are a financial analyst. Given the following market data, provide a 2-3 sentence summary of the overall trend and any actionable insights for an equity investor."},
                    {"role": "user", "content": str(all_results[:10])}
                ]
                state['market_data_insights'] = openai_chat(summary_prompt, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI market data insight failed: {e}", level=30)
        return state

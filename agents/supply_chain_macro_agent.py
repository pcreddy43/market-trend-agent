"""
SupplyChainMacroAgent: Ingests macroeconomic indicators and public datasets.
"""
from .base_agent import BaseAgent
import requests
import pandas as pd

class SupplyChainMacroAgent(BaseAgent):
    """
    Fetches macroeconomic data from public APIs (e.g., FRED) and Kaggle datasets.
    """
    def __init__(self):
        super().__init__()


    def fetch_macro(self, indicators=["GDP", "UNRATE", "CPIAUCSL"], source="FRED"):
        # Fetch multiple macro indicators from FRED
        all_data = {}
        for indicator in indicators:
            if source == "FRED":
                url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={indicator}"
                resp = requests.get(url)
                import io
                df = pd.read_csv(io.StringIO(resp.text))
                all_data[indicator] = df.to_dict(orient="records")
        return all_data

    def run(self, state):
        indicators = state.get("macro_indicators", ["GDP", "UNRATE", "CPIAUCSL"])
        macro = self.fetch_macro(indicators=indicators)
        state["macro_data"] = macro
        # OpenAI-powered summary/insight
        openai_api_key = state.get('openai_api_key')
        if openai_api_key and macro:
            try:
                from .openai_utils import openai_chat
                summary_prompt = [
                    {"role": "system", "content": "You are a macroeconomic analyst. Given the following macro indicators, summarize the current macroeconomic environment and any implications for equity investors in 2-3 sentences."},
                    {"role": "user", "content": str(macro)}
                ]
                state['macro_insights'] = openai_chat(summary_prompt, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI macro insight failed: {e}", level=30)
        return state

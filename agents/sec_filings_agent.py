"""
SECFilingsAgent: Fetches and parses SEC EDGAR filings (10-K, 10-Q, 8-K, insider trades).
"""
from .base_agent import BaseAgent
import requests
from bs4 import BeautifulSoup
import pandas as pd

class SECFilingsAgent(BaseAgent):
    """
    Fetches SEC filings using EDGAR and parses for key events.
    """
    def __init__(self):
        super().__init__()


    def fetch_filings(self, cik, filing_types=["10-K", "10-Q", "8-K", "4"], count=5, openai_api_key=None):
        filings = []
        headers = {"User-Agent": "OpenSourceMarketAgent/1.0 (contact: your_email@example.com)"}
        for filing_type in filing_types:
            base_url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type={filing_type}&count={count}&output=atom"
            print(f"[DEBUG] Fetching SEC filings: {base_url}")
            resp = requests.get(base_url, headers=headers)
            print(f"[DEBUG] Response status for {filing_type}: {resp.status_code}")
            soup = BeautifulSoup(resp.content, "xml")
            entries = soup.find_all("entry")
            print(f"[DEBUG] {len(entries)} entries found for {filing_type}")
            for entry in entries:
                filings.append({
                    "type": filing_type,
                    "title": entry.title.text,
                    "link": entry.link["href"],
                    "date": entry.updated.text,
                    "summary": self.summarize_filing(entry.summary.text if entry.summary else "", openai_api_key=openai_api_key)
                })
        return filings

    def summarize_filing(self, text, openai_api_key=None):
        if openai_api_key:
            try:
                from .openai_utils import summarize_text
                return summarize_text(text, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI summarization failed: {e}", level=30)
        # Fallback: Simple summary: first 2 sentences
        import re
        sentences = re.split(r'(?<=[.!?]) +', text)
        return ' '.join(sentences[:2])

    def run(self, state):
        cik = state.get("cik", "0000320193")  # Apple Inc. as example
        openai_api_key = state.get("openai_api_key")
        filings = self.fetch_filings(cik, openai_api_key=openai_api_key)
        print(f"[DEBUG] SECFilingsAgent: {len(filings)} filings found. Sample: {filings[:2]}")
        state["sec_filings"] = filings
        return state

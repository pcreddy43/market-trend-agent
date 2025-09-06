"""
StartupSignalsAgent: Tracks startup funding, GitHub stars, job postings, and public press.
"""
from .base_agent import BaseAgent
import requests
import pandas as pd

class StartupSignalsAgent(BaseAgent):
    """
    Fetches startup signals from public datasets and APIs.
    """
    def __init__(self):
        super().__init__()


    def fetch_github_stars(self, repo="openai/gym"):
        url = f"https://api.github.com/repos/{repo}"
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            return {"repo": repo, "stars": data.get("stargazers_count", 0)}
        return {"repo": repo, "stars": None}

    def fetch_funding_news(self, company="OpenAI"):
        # Example: Use Bing News Search API or scrape public news (here, just a placeholder)
        # In production, use a news API or a robust scraper
        return [f"{company} raised Series C funding"]

    def fetch_job_postings(self, company="OpenAI"):
        # Example: Scrape Indeed or use a public job board API (placeholder)
        return [f"{company} is hiring ML Engineer"]

    def run(self, state):
        repo = state.get("repo", "openai/gym")
        company = state.get("company", "OpenAI")
        stars = self.fetch_github_stars(repo)
        funding = self.fetch_funding_news(company)
        jobs = self.fetch_job_postings(company)
        state["startup_signals"] = {
            "github_stars": stars,
            "funding_news": funding,
            "job_postings": jobs
        }
        # OpenAI-powered summary/insight
        openai_api_key = state.get('openai_api_key')
        if openai_api_key and (stars or funding or jobs):
            try:
                from .openai_utils import openai_chat
                summary_prompt = [
                    {"role": "system", "content": "You are a startup signals analyst. Given the following GitHub stars, funding news, and job postings, summarize any key startup signals or trends relevant to equity investors in 2-3 sentences."},
                    {"role": "user", "content": str({'github_stars': stars, 'funding_news': funding, 'job_postings': jobs})}
                ]
                state['startup_signals_insights'] = openai_chat(summary_prompt, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI startup signals insight failed: {e}", level=30)
        return state

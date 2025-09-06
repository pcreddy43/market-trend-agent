"""
CompanyEventHiringAgent: Monitors company pressrooms, job boards, and GitHub activity.
"""
from .base_agent import BaseAgent
import requests
from bs4 import BeautifulSoup
import pandas as pd

class CompanyEventHiringAgent(BaseAgent):
    """
    Scrapes company pressrooms and job boards for events and hiring signals.
    """
    def __init__(self):
        super().__init__()


    def fetch_pressroom(self, url):
        resp = requests.get(url)
        soup = BeautifulSoup(resp.content, "html.parser")
        headlines = [h.text for h in soup.find_all('h2')]
        return headlines

    def fetch_job_board(self, url):
        resp = requests.get(url)
        soup = BeautifulSoup(resp.content, "html.parser")
        jobs = [j.text for j in soup.find_all('a') if 'job' in j.text.lower()]
        return jobs

    def fetch_github_activity(self, org="apple"):
        api_url = f"https://api.github.com/orgs/{org}/events"
        resp = requests.get(api_url)
        if resp.status_code == 200:
            events = resp.json()
            return [e['type'] for e in events[:10]]
        return []

    def run(self, state):
        url = state.get("pressroom_url", "https://www.apple.com/newsroom/")
        job_url = state.get("job_board_url", "https://boards.greenhouse.io/apple")
        org = state.get("github_org", "apple")
        events = self.fetch_pressroom(url)
        jobs = self.fetch_job_board(job_url)
        github_events = self.fetch_github_activity(org)
        state["company_events"] = {
            "pressroom": events,
            "jobs": jobs,
            "github_activity": github_events
        }
        # OpenAI-powered summary/insight
        openai_api_key = state.get('openai_api_key')
        if openai_api_key and (events or jobs or github_events):
            try:
                from .openai_utils import openai_chat
                summary_prompt = [
                    {"role": "system", "content": "You are a company events analyst. Given the following press releases, job postings, and GitHub activity, summarize any key company events or signals relevant to equity investors in 2-3 sentences."},
                    {"role": "user", "content": str({'pressroom': events[:5], 'jobs': jobs[:5], 'github_activity': github_events[:5]})}
                ]
                state['company_events_insights'] = openai_chat(summary_prompt, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI company events insight failed: {e}", level=30)
        return state

"""
LangGraph skeleton for orchestrating agents.
This is a minimal example wiring MarketDataAgent and NewsAgent as nodes.
"""
import langgraph
import networkx as nx

from agents.market_data_agent import MarketDataAgent
from agents.news_agent import NewsAgent
def main():
    # Example state (can be expanded)
    state = {}
    orchestrator.run(state)

if __name__ == "__main__":
    main()

from agents.sec_filings_agent import SECFilingsAgent
from agents.social_sentiment_agent import SocialSentimentAgent
from agents.supply_chain_macro_agent import SupplyChainMacroAgent
from agents.company_event_hiring_agent import CompanyEventHiringAgent
from agents.startup_signals_agent import StartupSignalsAgent
from agents.nlp_event_extraction_agent import NLPEventExtractionAgent


# Define the agent nodes
market_agent = MarketDataAgent()
news_agent = NewsAgent()
sec_agent = SECFilingsAgent()
social_agent = SocialSentimentAgent()
macro_agent = SupplyChainMacroAgent()
company_agent = CompanyEventHiringAgent()
startup_agent = StartupSignalsAgent()
nlp_agent = NLPEventExtractionAgent()

# Create a directed graph for agent orchestration
G = nx.DiGraph()
G.add_node('market_data', agent=market_agent)
G.add_node('news', agent=news_agent)
G.add_node('sec_filings', agent=sec_agent)
G.add_node('social_sentiment', agent=social_agent)
G.add_node('macro', agent=macro_agent)
G.add_node('company_event', agent=company_agent)
G.add_node('startup_signals', agent=startup_agent)
G.add_node('nlp_event', agent=nlp_agent)

# Example: market_data feeds into news, then to NLP, etc.
G.add_edge('market_data', 'news')
G.add_edge('news', 'nlp_event')
G.add_edge('sec_filings', 'nlp_event')
G.add_edge('social_sentiment', 'startup_signals')
G.add_edge('macro', 'company_event')

# LangGraph orchestrator
orchestrator = langgraph.Orchestrator(graph=G)

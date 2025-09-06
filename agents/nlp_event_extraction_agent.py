"""
NLPEventExtractionAgent: Extracts structured events/entities from news/filings using spaCy and rule-based pipelines.
"""
from .base_agent import BaseAgent
import spacy

class NLPEventExtractionAgent(BaseAgent):
    """
    Uses spaCy to extract entities and events from text.
    """
    def __init__(self):
        super().__init__()
        self.nlp = spacy.load("en_core_web_sm")


    def extract_events(self, text):
        doc = self.nlp(text)
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        key_phrases = [chunk.text for chunk in doc.noun_chunks]
        sentiment = self.analyze_sentiment(text)
        return {
            "entities": entities,
            "key_phrases": key_phrases,
            "sentiment": sentiment
        }

    def analyze_sentiment(self, text):
        from textblob import TextBlob
        return TextBlob(text).sentiment.polarity

    def run(self, state):
        text = state.get("text", "Apple announced a new product in Cupertino.")
        events = self.extract_events(text)
        state["extracted_events"] = events
        # OpenAI-powered event extraction/summary
        openai_api_key = state.get('openai_api_key')
        if openai_api_key and text:
            try:
                from .openai_utils import openai_chat
                summary_prompt = [
                    {"role": "system", "content": "You are an NLP event extraction expert. Given the following text, extract and summarize any key events relevant to equity investors in 2-3 sentences."},
                    {"role": "user", "content": text}
                ]
                state['nlp_event_insights'] = openai_chat(summary_prompt, api_key=openai_api_key)
            except Exception as e:
                self.log(f"OpenAI NLP event insight failed: {e}", level=30)
        return state

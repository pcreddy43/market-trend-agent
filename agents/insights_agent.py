"""
InsightsAgent: Aggregates all agent outputs and produces buy recommendations for equities.
"""
from .base_agent import BaseAgent

class InsightsAgent(BaseAgent):
    def __init__(self):
        super().__init__()

    def run(self, state):
        # Collect outputs from all agents
        market_data = state.get('market_data', [])
        news = state.get('news', [])
        sec_filings = state.get('sec_filings', [])
        sentiment = state.get('social_mentions', [])
        macro = state.get('macro_data', [])
        events = state.get('company_events', {})
        startup = state.get('startup_signals', {})
        nlp = state.get('extracted_events', [])
        openai_api_key = state.get('openai_api_key')

        # Build a context for each ticker
        ticker_context = {}
        for row in market_data:
            ticker = row.get('ticker')
            if not ticker:
                continue
            ticker_context[ticker] = {
                'market_data': row,
                'news': [n for n in news if n.get('ticker', ticker) == ticker],
                'sec_filings': [f for f in sec_filings if f.get('ticker', ticker) == ticker],
                'sentiment': [s for s in sentiment if s.get('ticker', ticker) == ticker],
                'macro': macro,
                'events': events,
                'startup': startup,
                'nlp': nlp,
            }

        recommendations = []
        for ticker, context in ticker_context.items():
            # Use OpenAI to generate a recommendation and explanation
            if openai_api_key:
                try:
                    from .openai_utils import openai_chat
                    prompt = [
                        {"role": "system", "content": "You are a Chief Investment Officer AI. Given the following multi-agent signals for a stock, provide a buy/sell/hold recommendation, a confidence score (1-5), and a 2-3 sentence explanation referencing the most important signals. Format: {\"recommendation\":..., \"confidence\":..., \"explanation\":...}"},
                        {"role": "user", "content": str(context)}
                    ]
                    ai_result = openai_chat(prompt, api_key=openai_api_key, max_tokens=256)
                    import json
                    try:
                        ai_json = json.loads(ai_result)
                    except Exception:
                        ai_json = {"recommendation": ai_result, "confidence": 3, "explanation": ai_result}
                    recommendations.append({
                        'ticker': ticker,
                        'score': ai_json.get('confidence', 3),
                        'recommendation': ai_json.get('recommendation', 'Watch'),
                        'insight': ai_json.get('explanation', ai_result),
                        'signals': context
                    })
                except Exception as e:
                    self.log(f"OpenAI InsightsAgent failed: {e}", level=30)
                    recommendations.append({
                        'ticker': ticker,
                        'score': 3,
                        'recommendation': 'Watch',
                        'insight': 'AI error: fallback to Watch.',
                        'signals': context
                    })
            else:
                # Fallback: simple scoring logic
                score = 0
                md = context['market_data']
                if md.get('SMA_20') and md.get('close') and float(md['close']) > float(md['SMA_20']):
                    score += 1
                if md.get('RSI_14') and md['RSI_14'] != '' and float(md['RSI_14']) < 40:
                    score += 1
                if context['news']:
                    score += 1
                if context['sentiment']:
                    score += 1
                recommendations.append({
                    'ticker': ticker,
                    'score': score,
                    'recommendation': 'Buy' if score >= 3 else 'Watch',
                    'insight': 'Strong technicals and positive signals.' if score >= 3 else 'Needs more confirmation.',
                    'signals': context
                })
        # Sort by score/confidence
        recommendations = sorted(recommendations, key=lambda x: x['score'], reverse=True)
        state['insights'] = recommendations
        return state

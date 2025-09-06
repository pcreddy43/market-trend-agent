import os
import requests

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

# Utility to call OpenAI Chat API for summarization, Q&A, etc.
def openai_chat(messages, api_key=None, model='gpt-3.5-turbo', temperature=0.2, max_tokens=256):
    api_key = api_key or OPENAI_API_KEY
    if not api_key:
        raise ValueError('OpenAI API key not set')
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': model,
        'messages': messages,
        'temperature': temperature,
        'max_tokens': max_tokens,
    }
    resp = requests.post(OPENAI_API_URL, headers=headers, json=payload)
    resp.raise_for_status()
    return resp.json()['choices'][0]['message']['content']

# Example: Summarize a text
def summarize_text(text, api_key=None):
    messages = [
        {"role": "system", "content": "You are a financial news and filings summarizer. Summarize the following text in 2-3 crisp sentences for an investor."},
        {"role": "user", "content": text}
    ]
    return openai_chat(messages, api_key=api_key)

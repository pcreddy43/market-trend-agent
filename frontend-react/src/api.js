export const fetchESGSignals = (company) => {
  return axios.post(withMock(`${API_URL}/esgsignals/run`), { company });
};
export const fetchPatentSignals = (company) => {
  return axios.post(withMock(`${API_URL}/patentsignals/run`), { company });
};
// Centralized API utility for all agent calls
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
let mockMode = true;

export function setMockMode(val) {
  mockMode = val;
}

function withMock(url) {
  if (mockMode) {
    return url.includes('?') ? `${url}&mock=1` : `${url}?mock=1`;
  }
  return url.replace(/[?&]mock=1/, '');
}

export const fetchMarketData = (tickers, period, interval) => {
  const tickerList = typeof tickers === 'string'
    ? tickers.split(',').map(t => t.trim()).filter(Boolean)
    : Array.isArray(tickers) ? tickers : [];
  return axios.post(withMock(`${API_URL}/marketdata/run`), {
    tickers: tickerList,
    period,
    interval
  });
};

export const fetchNews = (urls, rss_urls) => {
  return axios.post(withMock(`${API_URL}/news/run`), {
    urls,
    rss_urls
  });
};

export const fetchSECFilings = (cik) => {
  return axios.post(withMock(`${API_URL}/secfilings/run`), { cik });
};

export const fetchSocialSentiment = (subreddits) => {
  return axios.post(withMock(`${API_URL}/socialsentiment/run`), { subreddits });
};

export const fetchMacro = (macro_indicators) => {
  return axios.post(withMock(`${API_URL}/macro/run`), { macro_indicators });
};

export const fetchCompanyEvents = (pressroom_url, job_board_url, github_org) => {
  return axios.post(withMock(`${API_URL}/companyevent/run`), { pressroom_url, job_board_url, github_org });
};

export const fetchStartupSignals = (repo, company) => {
  return axios.post(withMock(`${API_URL}/startupsignals/run`), { repo, company });
};

export const fetchNLPEvent = (text) => {
  return axios.post(withMock(`${API_URL}/nlpevent/run`), { text });
};

// Add similar functions for other agents as you build out the UI

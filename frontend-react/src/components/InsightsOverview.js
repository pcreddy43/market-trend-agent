import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Alert, Tooltip } from 'antd';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const agentRoles = {
  market_data: 'Technical Analyst',
  news: 'News & Sentiment Analyst',
  sec_filings: 'Regulatory/Compliance Analyst',
  social_sentiment: 'Social Pulse Analyst',
  macro: 'Macro & Risk Analyst',
  company_events: 'Corporate Events Analyst',
  startup_signals: 'Innovation/Disruption Scout',
  nlp_event: 'NLP Event Extractor',
  patent_signals: 'IP/Innovation Analyst',
  insights: 'Chief Investment Officer (CIO) AI',
};

const insightFields = [
  { key: 'market_data_insights', label: 'Market Data', agent: 'market_data' },
  { key: 'news_insights', label: 'News', agent: 'news' },
  { key: 'sec_filings_insights', label: 'SEC Filings', agent: 'sec_filings' },
  { key: 'social_sentiment_insights', label: 'Social Sentiment', agent: 'social_sentiment' },
  { key: 'macro_insights', label: 'Macro', agent: 'macro' },
  { key: 'company_events_insights', label: 'Company Events', agent: 'company_events' },
  { key: 'startup_signals_insights', label: 'Startup Signals', agent: 'startup_signals' },
  { key: 'nlp_event_insights', label: 'NLP Extraction', agent: 'nlp_event' },
  { key: 'patent_signals_insights', label: 'Patent Signals', agent: 'patent_signals' },
  { key: 'insights', label: 'Top Picks (CIO AI)', agent: 'insights' },
];

export default function InsightsOverview() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/insights/run`, {
      tickers: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'],
      period: '1y',
      interval: '1d',
      openai_api_key: process.env.REACT_APP_OPENAI_API_KEY || '',
    })
      .then(res => {
        setData(res.data.result ? res.data.result.reduce((acc, rec) => {
          // If it's the CIO AI tab, show as array, else as string
          if (rec.ticker) {
            acc.insights = (acc.insights || []).concat([`${rec.ticker}: ${rec.recommendation} (Score: ${rec.score}) - ${rec.insight}`]);
          }
          return acc;
        }, {}) : {});
      })
      .catch(() => setError('Failed to fetch insights.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Insights Overview</Title>
      <Paragraph>
        This page summarizes the latest AI-powered insights from each agent. Hover on each card to see the agent's role in the investment process.
      </Paragraph>
      {loading ? <Spin /> : error ? <Alert type="error" message={error} /> : (
        <Row gutter={[16, 16]}>
          {insightFields.map(field => (
            <Col xs={24} sm={12} md={8} lg={6} key={field.key}>
              <Tooltip title={agentRoles[field.agent]}>
                <Card title={field.label} bordered style={{ minHeight: 120 }}>
                  {Array.isArray(data[field.key])
                    ? data[field.key].map((item, idx) => <div key={idx}>{item}</div>)
                    : (data[field.key] || <span style={{ color: '#aaa' }}>No insight available</span>)}
                </Card>
              </Tooltip>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

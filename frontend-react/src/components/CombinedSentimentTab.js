import React, { useState } from 'react';
import { fetchCombinedSentiment } from '../api';
import { Card, Input, Button, Spin, Tabs, List, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

function renderSentimentList(data, label) {
  if (!data || data.length === 0) return <Text type="secondary">No data</Text>;
  return (
    <List
      size="small"
      bordered
      dataSource={data}
      renderItem={item => (
        <List.Item>
          <div>
            <b>{label === 'StockTwits' ? item.symbol : item.title || item.url}</b>: {item.body || item.summary || item.text || ''}
            <br />
            <Text type={item.sentiment > 0 ? 'success' : item.sentiment < 0 ? 'danger' : 'secondary'}>
              Sentiment: {item.sentiment}
            </Text>
          </div>
        </List.Item>
      )}
    />
  );
}

const CombinedSentimentTab = () => {
  const [tickers, setTickers] = useState('AAPL,MSFT,GOOG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchCombinedSentiment(tickers);
      setResult(resp.data.result);
    } catch (e) {
      setError(e.message || 'Error fetching combined sentiment');
    }
    setLoading(false);
  };

  return (
    <Card title="Combined Social Sentiment (StockTwits + News)">
      <Input
        style={{ maxWidth: 400, marginBottom: 8 }}
        value={tickers}
        onChange={e => setTickers(e.target.value)}
        placeholder="Enter comma-separated tickers"
      />
      <Button type="primary" onClick={handleFetch} loading={loading} style={{ marginLeft: 8 }}>
        Fetch Sentiment
      </Button>
      {error && <Alert type="error" message={error} showIcon style={{ marginTop: 16 }} />}
      {loading && <Spin style={{ marginTop: 16 }} />}
      {result && (
        <Tabs style={{ marginTop: 16 }}>
          {Object.entries(result).map(([ticker, data]) => (
            <Tabs.TabPane tab={ticker} key={ticker}>
              <Title level={5}>StockTwits</Title>
              {renderSentimentList(data.stocktwits, 'StockTwits')}
              <Title level={5} style={{ marginTop: 16 }}>News</Title>
              {renderSentimentList(data.news, 'News')}
            </Tabs.TabPane>
          ))}
        </Tabs>
      )}
    </Card>
  );
};

export default CombinedSentimentTab;

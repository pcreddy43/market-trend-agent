import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, Tag, Spin, Alert, Tooltip, Button, Drawer } from 'antd';
import { exportToCsv } from '../utils/exportCsv';
import axios from 'axios';

const { Title, Paragraph } = Typography;

export default function InsightsTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/insights/run`, {
      tickers: ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'],
      period: '1y',
      interval: '1d',
    })
      .then(res => {
        setData(res.data.result || []);
      })
      .catch(err => {
        setError('Failed to fetch insights.');
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'Ticker', dataIndex: 'ticker', key: 'ticker' },
    { title: 'Score', dataIndex: 'score', key: 'score', sorter: (a, b) => a.score - b.score },
    { title: 'Recommendation', dataIndex: 'recommendation', key: 'recommendation',
      render: rec => rec === 'Buy' ? <Tag color="green">Buy</Tag> : <Tag color="orange">Watch</Tag> },
    { title: 'Insight', dataIndex: 'insight', key: 'insight' },
    { title: 'Why?', key: 'why',
      render: (_, record) => (
        <Button size="small" onClick={() => { setDrawerContent(record); setDrawerOpen(true); }}>Why?</Button>
      )
    },
  ];

  return (
    <Card style={{ margin: 24 }}>
      <Title level={3}>Top Equity Picks (AI Insights)</Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        <b>Explainability:</b> Click <b>Why?</b> for each pick to see the AI's reasoning.
      </Paragraph>
      <Button
        style={{ marginBottom: 12 }}
        onClick={() => exportToCsv('insights.csv', data)}
        disabled={!data.length}
      >
        Export to CSV
      </Button>
      {loading ? <Spin /> : error ? <Alert type="error" message={error} /> :
        <Table columns={columns} dataSource={data} rowKey="ticker" pagination={false} />}
      <Drawer
        title={drawerContent ? `Why: ${drawerContent.ticker}` : 'Why?'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {drawerContent && (
          <>
            <p><b>Insight:</b> {drawerContent.insight}</p>
            <p><b>Explanation:</b> {drawerContent.explanation}</p>
            <p><b>Score:</b> {drawerContent.score}</p>
            <p><b>Recommendation:</b> {drawerContent.recommendation}</p>
          </>
        )}
      </Drawer>
    </Card>
  );
}

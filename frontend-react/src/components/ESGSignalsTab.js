import React, { useState } from 'react';
import { Card, Table, Button, Input, Spin, Alert, Tooltip, Drawer } from 'antd';
import { fetchESGSignals } from '../api';
import { exportToCsv } from '../utils/exportCsv';

export default function ESGSignalsTab() {
  const [company, setCompany] = useState('Apple');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchESGSignals(company);
      setData(resp.data.esg_signals || []);
    } catch (e) {
      setError('Failed to fetch ESG signals.');
      setData([]);
    }
    setLoading(false);
  };

  const columns = [
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'ESG Score', dataIndex: 'esg_score', key: 'esg_score', sorter: (a, b) => a.esg_score - b.esg_score },
    { title: 'Environment', dataIndex: 'environment', key: 'environment' },
    { title: 'Social', dataIndex: 'social', key: 'social' },
    { title: 'Governance', dataIndex: 'governance', key: 'governance' },
    { title: 'Recent Event', dataIndex: 'recent_event', key: 'recent_event',
      render: text => <Tooltip title={text}>{text && text.length > 40 ? text.slice(0, 40) + '...' : text}</Tooltip> },
    { title: 'Trend', dataIndex: 'trend', key: 'trend' },
    { title: 'Why?', key: 'why',
      render: (_, record) => (
        <Button size="small" onClick={() => { setDrawerContent(record); setDrawerOpen(true); }}>Why?</Button>
      )
    },
  ];

  return (
    <Card title="ESG Signals" style={{ margin: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Company name"
          style={{ width: 200, marginRight: 8 }}
        />
        <Button onClick={handleFetch} type="primary" disabled={loading}>
          {loading ? <Spin size="small" /> : 'Fetch ESG Signals'}
        </Button>
        <Button
          style={{ marginLeft: 12 }}
          onClick={() => exportToCsv('esg_signals.csv', data)}
          disabled={!data.length}
        >
          Export to CSV
        </Button>
      </div>
      {error && <Alert type="error" message={error} />}
      <Table columns={columns} dataSource={data} rowKey="company" pagination={false} />
      <Drawer
        title={drawerContent ? `Why: ${drawerContent.company}` : 'Why?'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {drawerContent && (
          <>
            <p><b>ESG Score:</b> {drawerContent.esg_score}</p>
            <p><b>Environment:</b> {drawerContent.environment}</p>
            <p><b>Social:</b> {drawerContent.social}</p>
            <p><b>Governance:</b> {drawerContent.governance}</p>
            <p><b>Recent Event:</b> {drawerContent.recent_event}</p>
            <p><b>Trend:</b> {drawerContent.trend}</p>
          </>
        )}
      </Drawer>
    </Card>
  );
}

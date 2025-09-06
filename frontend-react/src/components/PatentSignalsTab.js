import React, { useState } from 'react';
import { Card, Table, Button, Input, Spin, Alert } from 'antd';
import { Drawer } from 'antd';
import { exportToCsv } from '../utils/exportCsv';
import { fetchPatentSignals } from '../api';

export default function PatentSignalsTab() {
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
      const resp = await fetchPatentSignals(company);
      setData(resp.data.patent_signals || []);
    } catch (e) {
      setError('Failed to fetch patent signals.');
      setData([]);
    }
    setLoading(false);
  };

  const columns = [
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Patent Count', dataIndex: 'patent_count', key: 'patent_count' },
    { title: 'Recent Patent', dataIndex: 'recent_patent', key: 'recent_patent' },
    { title: 'Trend', dataIndex: 'trend', key: 'trend' },
    { title: 'Why?', key: 'why',
      render: (_, record) => (
        <Button size="small" onClick={() => { setDrawerContent(record); setDrawerOpen(true); }}>Why?</Button>
      )
    },
  ];

  return (
    <Card title="Patent Signals" style={{ margin: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Company name"
          style={{ width: 200, marginRight: 8 }}
        />
        <Button onClick={handleFetch} type="primary" disabled={loading}>
          {loading ? <Spin size="small" /> : 'Fetch Patent Signals'}
        </Button>
        <Button
          style={{ marginLeft: 12 }}
          onClick={() => exportToCsv('patent_signals.csv', data)}
          disabled={!data.length}
        >
          Export to CSV
        </Button>
      </div>
      {error && <Alert type="error" message={error} />}
      <Table columns={columns} dataSource={data} rowKey="recent_patent" pagination={false} />
      <Drawer
        title={drawerContent ? `Why: ${drawerContent.company}` : 'Why?'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {drawerContent && (
          <>
            <p><b>Patent Count:</b> {drawerContent.patent_count}</p>
            <p><b>Recent Patent:</b> {drawerContent.recent_patent}</p>
            <p><b>Tech Area:</b> {drawerContent.tech_area}</p>
            <p><b>Trend:</b> {drawerContent.trend}</p>
          </>
        )}
      </Drawer>
    </Card>
  );
}
import React, { useState, useContext } from 'react';
import { fetchStartupSignals } from '../api';
import { TextField, Button, Box, CircularProgress, Typography, Card as MuiCard, Skeleton } from '@mui/material';
import { Card, Statistic, Tooltip } from 'antd';
import { Line, Bar } from '@ant-design/charts';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import RocketOutlined from '@ant-design/icons/RocketOutlined';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { Area, Bar as AntBar } from '@ant-design/plots';
import { DashboardContext } from '../App';

export default function StartupSignalsTab() {
  const [repo, setRepo] = useState('openai/gym');
  const [company, setCompany] = useState('OpenAI');
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [showLegend, setShowLegend] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [barTypeFilter, setBarTypeFilter] = useState([]);
  const [drilldown, setDrilldown] = useState(null);
  const { globalTickers, globalDateRange, globalSearch } = useContext(DashboardContext);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const resp = await fetchStartupSignals(repo, company);
      setData(resp.data.result);
      setInsight(resp.data.startup_signals_insights || '');
    } catch (e) {
      setData(null);
      setInsight('');
    }
    setLoading(false);
  };

  // Prepare chart data for GitHub stars (if available)
  let chartData = [];
  if (data && data.github_stars && data.github_stars.stars !== undefined) {
    chartData = [{
      repo: data.github_stars.repo,
      stars: data.github_stars.stars,
      label: `${data.github_stars.repo} Stars`
    }];
  }
  // Prepare bar chart for job postings and funding news
  let barData = [];
  if (data && data.job_postings) {
    barData = data.job_postings.map((job, idx) => ({ type: 'Job Posting', label: job, value: 1, idx }));
  }
  if (data && data.funding_news) {
    barData = barData.concat(data.funding_news.map((news, idx) => ({ type: 'Funding News', label: news, value: 1, idx: 100 + idx })));
  }
  // Apply global search filter to barData
  let filteredBarData = barData;
  if (barTypeFilter.length > 0) {
    filteredBarData = filteredBarData.filter(d => barTypeFilter.includes(d.type));
  }
  if (globalSearch) {
    filteredBarData = filteredBarData.filter(d =>
      (d.label && d.label.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (d.type && d.type.toLowerCase().includes(globalSearch.toLowerCase()))
    );
  }
  const barConfig = {
    data: filteredBarData,
    xField: 'value',
    yField: 'label',
    seriesField: 'type',
    isStack: true,
    height: 200,
    legend: showLegend ? { position: 'top-left' } : false,
    tooltip: showTooltip ? {} : false,
    color: ['#faad14', '#52c41a'],
    label: false,
    onReady: plot => {
      plot.on('element:click', (ev) => {
        setDrilldown(ev.data.data.label);
      });
    },
  };
  const handleExport = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, 'startup_signals.json');
    }
  };
  const handleExportCSV = () => {
    if (data) {
      let rows = [];
      if (data.github_stars) rows.push({ type: 'github_stars', ...data.github_stars });
      if (data.funding_news) data.funding_news.forEach((f, i) => rows.push({ type: 'funding_news', value: f }));
      if (data.job_postings) data.job_postings.forEach((j, i) => rows.push({ type: 'job_posting', value: j }));
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, 'startup_signals.csv');
    }
  };

  const config = {
    data: chartData,
    xField: 'label',
    yField: 'stars',
    height: 200,
    color: '#faad14',
    label: { position: 'top' },
    point: { size: 4 },
    legend: false,
  };

  return (
    <Box>
      <TextField label="GitHub Repo (owner/repo)" value={repo} onChange={e => setRepo(e.target.value)} sx={{ mr: 2 }} />
      <TextField label="Company Name" value={company} onChange={e => setCompany(e.target.value)} sx={{ mr: 2 }} />
      <Button onClick={handleFetch} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Fetch Startup Signals'}
      </Button>
      <Button onClick={handleExport} disabled={!data} variant="outlined" sx={{ ml: 2 }}>
        Export JSON
      </Button>
      <Button onClick={handleExportCSV} disabled={!data} variant="outlined" sx={{ ml: 2 }}>
        Export CSV
      </Button>
      <select value={chartType} onChange={e => setChartType(e.target.value)} style={{ marginLeft: 16, padding: 4 }}>
        <option value="line">Line</option>
        <option value="area">Area</option>
        <option value="bar">Bar</option>
      </select>
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2">Filter Bar Types:</Typography>
        <select multiple value={barTypeFilter} onChange={e => setBarTypeFilter(Array.from(e.target.selectedOptions, o => o.value))} style={{ minWidth: 180, marginRight: 16 }}>
          {Array.from(new Set(barData.map(d => d.type))).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <label style={{ marginLeft: 16 }}><input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} /> Legend</label>
        <label style={{ marginLeft: 8 }}><input type="checkbox" checked={showTooltip} onChange={e => setShowTooltip(e.target.checked)} /> Tooltip</label>
      </Box>
      {drilldown && (
        <MuiCard sx={{ mt: 2, p: 2, bgcolor: '#fffbe6' }}>
          <Typography variant="subtitle2">Drill-down:</Typography>
          <Typography>{drilldown}</Typography>
          <Button onClick={() => setDrilldown(null)} sx={{ mt: 1 }}>Close</Button>
        </MuiCard>
      )}
      {loading && <Skeleton active paragraph={{ rows: 4 }} />}
      {!loading && insight && (
        <Card style={{ marginTop: 24, background: '#fffbe6', borderLeft: '6px solid #faad14' }}>
          <Statistic
            title={<span>Startup Signals Insight <Tooltip title="AI-generated summary of startup signals."><InfoCircleOutlined /></Tooltip></span>}
            value={insight}
            valueStyle={{ fontSize: 16, color: '#faad14' }}
            prefix={<RocketOutlined />}
          />
        </Card>
      )}
      {!loading && chartData.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>GitHub Stars</Typography>
          {chartType === 'line' && <Line {...config} />}
          {chartType === 'area' && <Area {...{ ...config, areaStyle: { fillOpacity: 0.5 } }} />}
          {chartType === 'bar' && <AntBar {...{ ...config, isGroup: true }} />}
        </Card>
      )}
      {!loading && barData.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Job Postings & Funding News</Typography>
          <Bar {...barConfig} />
        </Card>
      )}
      {!loading && data && (
        <MuiCard sx={{ mt: 2, p: 2, bgcolor: '#fafafa' }}>
          <Typography variant="subtitle2">Raw Startup Signals Data</Typography>
          <pre style={{ background: '#fafafa', padding: 8, fontSize: 13 }}>{JSON.stringify(data, null, 2)}</pre>
        </MuiCard>
      )}
    </Box>
  );
}

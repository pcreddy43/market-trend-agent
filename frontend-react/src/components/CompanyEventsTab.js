import React, { useState, useContext } from 'react';
import { fetchCompanyEvents } from '../api';
import { TextField, Button, Box, CircularProgress, Typography, Card as MuiCard, Skeleton } from '@mui/material';
import { Card, Statistic, Timeline, Tooltip } from 'antd';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { ApartmentOutlined, UserOutlined, GithubOutlined } from '@ant-design/icons';
import { Bar } from '@ant-design/charts';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { Area } from '@ant-design/plots';
import { DashboardContext } from '../App';

export default function CompanyEventsTab() {
  const { globalTickers, globalDateRange, globalSearch } = useContext(DashboardContext);
  const [pressroom, setPressroom] = useState('https://www.apple.com/newsroom/');
  const [jobBoard, setJobBoard] = useState('https://boards.greenhouse.io/apple');
  const [githubOrg, setGithubOrg] = useState('apple');
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [showLegend, setShowLegend] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [barTypeFilter, setBarTypeFilter] = useState([]);
  const [drilldown, setDrilldown] = useState(null);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const resp = await fetchCompanyEvents(pressroom, jobBoard, githubOrg);
      setData(resp.data.result);
      setInsight(resp.data.company_events_insights || '');
    } catch (e) {
      setData(null);
      setInsight('');
    }
    setLoading(false);
  };

  // Prepare bar chart for job postings and pressroom
  let barData = [];
  if (data && data.jobs) {
    barData = data.jobs.map((job, idx) => ({ type: 'Job Posting', label: job, value: 1, idx }));
  }
  if (data && data.pressroom) {
    barData = barData.concat(data.pressroom.map((headline, idx) => ({ type: 'Pressroom', label: headline, value: 1, idx: 100 + idx })));
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
    color: ['#1890ff', '#52c41a'],
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
      saveAs(blob, 'company_events.json');
    }
  };
  const handleExportCSV = () => {
    if (data) {
      let rows = [];
      if (data.jobs) data.jobs.forEach((j, i) => rows.push({ type: 'job_posting', value: j }));
      if (data.pressroom) data.pressroom.forEach((p, i) => rows.push({ type: 'pressroom', value: p }));
      if (data.github_activity) data.github_activity.forEach((g, i) => rows.push({ type: 'github_activity', value: g }));
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, 'company_events.csv');
    }
  };

  return (
    <Box>
      <TextField label="Pressroom URL" value={pressroom} onChange={e => setPressroom(e.target.value)} sx={{ mr: 2 }} />
      <TextField label="Job Board URL" value={jobBoard} onChange={e => setJobBoard(e.target.value)} sx={{ mr: 2 }} />
      <TextField label="GitHub Org" value={githubOrg} onChange={e => setGithubOrg(e.target.value)} sx={{ mr: 2 }} />
      <Button onClick={handleFetch} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Fetch Events'}
      </Button>
      <Button onClick={handleExport} disabled={!data} variant="outlined" sx={{ ml: 2 }}>
        Export JSON
      </Button>
      <Button onClick={handleExportCSV} disabled={!data} variant="outlined" sx={{ ml: 2 }}>
        Export CSV
      </Button>
      <select value={chartType} onChange={e => setChartType(e.target.value)} style={{ marginLeft: 16, padding: 4 }}>
        <option value="bar">Bar</option>
        <option value="area">Area</option>
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
        <MuiCard sx={{ mt: 2, p: 2, bgcolor: '#e6f7ff' }}>
          <Typography variant="subtitle2">Drill-down:</Typography>
          <Typography>{drilldown}</Typography>
          <Button onClick={() => setDrilldown(null)} sx={{ mt: 1 }}>Close</Button>
        </MuiCard>
      )}
      {loading && <Skeleton active paragraph={{ rows: 4 }} />}
      {!loading && insight && (
        <Card style={{ marginTop: 24, background: '#f6ffed', borderLeft: '6px solid #52c41a' }}>
          <Statistic
            title={<span>Company Events Insight <Tooltip title="AI-generated summary of company events."><InfoCircleOutlined /></Tooltip></span>}
            value={insight}
            valueStyle={{ fontSize: 16, color: '#389e0d' }}
          />
        </Card>
      )}
      {!loading && data && (
        <Card style={{ marginTop: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Company Events Timeline</Typography>
          <Timeline mode="left">
            {(data.pressroom || []).slice(0, 5).map((headline, idx) => (
              <Timeline.Item key={idx} dot={<ApartmentOutlined style={{ color: '#1890ff' }} />}>
                <b>Pressroom:</b> {headline}
              </Timeline.Item>
            ))}
            {(data.jobs || []).slice(0, 5).map((job, idx) => (
              <Timeline.Item key={idx + 100} dot={<UserOutlined style={{ color: '#52c41a' }} />}>
                <b>Job:</b> {job}
              </Timeline.Item>
            ))}
            {(data.github_activity || []).slice(0, 5).map((event, idx) => (
              <Timeline.Item key={idx + 200} dot={<GithubOutlined style={{ color: '#000' }} />}>
                <b>GitHub:</b> {event}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}
      {!loading && data && (
        <MuiCard sx={{ mt: 2, p: 2, bgcolor: '#fafafa' }}>
          <Typography variant="subtitle2">Raw Company Events Data</Typography>
          <pre style={{ background: '#fafafa', padding: 8, fontSize: 13 }}>{JSON.stringify(data, null, 2)}</pre>
        </MuiCard>
      )}
      {!loading && barData.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Job Postings & Pressroom Headlines</Typography>
          {chartType === 'bar' && <Bar {...barConfig} />}
          {chartType === 'area' && <Area {...{ ...barConfig, areaStyle: { fillOpacity: 0.5 }, xField: 'label', yField: 'value' }} />}
        </Card>
      )}
    </Box>
  );
}

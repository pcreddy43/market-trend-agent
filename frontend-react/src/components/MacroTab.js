import React, { useState, useContext } from 'react';
import { fetchMacro } from '../api';
import { TextField, Button, Box, CircularProgress, Typography, Grid, Card as MuiCard, Skeleton } from '@mui/material';
import { Card, Statistic, Tooltip } from 'antd';
import { Line, Area, Bar as AntBar } from '@ant-design/plots';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import { DashboardContext } from '../App';

export default function MacroTab() {
  const [macroIndicators, setMacroIndicators] = useState('GDP,UNRATE,CPIAUCSL');
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [showLegend, setShowLegend] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);

  const { globalTickers, globalDateRange, globalSearch } = useContext(DashboardContext);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const resp = await fetchMacro(macroIndicators.split(',').map(m => m.trim()).filter(Boolean));
      setData(resp.data.result);
      setInsight(resp.data.macro_insights || '');
    } catch (e) {
      setData(null);
      setInsight('');
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, 'macro_data.json');
    }
  };

  const handleExportCSV = () => {
    if (data) {
      let rows = [];
      Object.entries(data).forEach(([indicator, records]) => {
        records.forEach(row => {
          rows.push({ indicator, ...row });
        });
      });
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, 'macro_data.csv');
    }
  };

  // Prepare chart data
  let chartData = [];
  if (data) {
    Object.entries(data).forEach(([indicator, records]) => {
      records.forEach(row => {
        chartData.push({
          indicator,
          date: row.DATE || row.date,
          value: Number(row[indicator]) || Number(row.value) || null
        });
      });
    });
  }

  // Filtering logic
  let filteredChartData = chartData;
  if (selectedIndicators.length > 0) {
    filteredChartData = filteredChartData.filter(d => selectedIndicators.includes(d.indicator));
  }
  // Apply global date range filter
  if ((dateRange[0] && dateRange[1]) || (globalDateRange[0] && globalDateRange[1])) {
    const dr = dateRange[0] && dateRange[1] ? dateRange : globalDateRange;
    filteredChartData = filteredChartData.filter(d => {
      const dt = dayjs(d.date);
      return dt.isAfter(dayjs(dr[0]).subtract(1, 'day')) && dt.isBefore(dayjs(dr[1]).add(1, 'day'));
    });
  }
  // Apply global search filter
  if (globalSearch) {
    filteredChartData = filteredChartData.filter(d =>
      (d.indicator && d.indicator.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (d.date && d.date.toLowerCase().includes(globalSearch.toLowerCase()))
    );
  }
  const config = {
    data: filteredChartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'indicator',
    height: 320,
    smooth: true,
    legend: showLegend ? { position: 'top' } : false,
    tooltip: showTooltip ? { showMarkers: true } : false,
    animation: false,
  };

  return (
    <Box>
      <TextField label="Macro Indicators" value={macroIndicators} onChange={e => setMacroIndicators(e.target.value)} sx={{ mr: 2 }} />
      <Button onClick={handleFetch} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Fetch Macro Data'}
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
      {loading && <Skeleton active paragraph={{ rows: 4 }} />}
      {!loading && insight && (
        <Card style={{ marginTop: 24, background: '#f6ffed', borderLeft: '6px solid #52c41a' }}>
          <Statistic
            title={<span>Macro Insight <Tooltip title="AI-generated summary of macro indicators."><InfoCircleOutlined /></Tooltip></span>}
            value={insight}
            valueStyle={{ fontSize: 16, color: '#389e0d' }}
          />
        </Card>
      )}
      {!loading && chartData.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Macro Indicators Over Time</Typography>
          {chartType === 'line' && <Line {...config} />}
          {chartType === 'area' && <Area {...{ ...config, areaStyle: { fillOpacity: 0.5 } }} />}
          {chartType === 'bar' && <AntBar {...{ ...config, isGroup: true }} />}
        </Card>
      )}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2">Filter Indicators:</Typography>
        <select multiple value={selectedIndicators} onChange={e => setSelectedIndicators(Array.from(e.target.selectedOptions, o => o.value))} style={{ minWidth: 180, marginRight: 16 }}>
          {Array.from(new Set(chartData.map(d => d.indicator))).map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <Typography variant="subtitle2" sx={{ ml: 2 }}>Date Range:</Typography>
        <input type="date" value={dateRange[0] || ''} onChange={e => setDateRange([e.target.value, dateRange[1]])} style={{ marginRight: 8 }} />
        <input type="date" value={dateRange[1] || ''} onChange={e => setDateRange([dateRange[0], e.target.value])} />
        <label style={{ marginLeft: 16 }}><input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} /> Legend</label>
        <label style={{ marginLeft: 8 }}><input type="checkbox" checked={showTooltip} onChange={e => setShowTooltip(e.target.checked)} /> Tooltip</label>
      </Box>
      {!loading && data && Object.keys(data).length > 0 && (
        <MuiCard sx={{ mt: 2, p: 2, bgcolor: '#fafafa' }}>
          <Typography variant="subtitle2">Raw Macro Data</Typography>
          <pre style={{ background: '#fafafa', padding: 8, fontSize: 13 }}>{JSON.stringify(data, null, 2)}</pre>
        </MuiCard>
      )}
    </Box>
  );
}

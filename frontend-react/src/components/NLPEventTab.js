import React, { useState, useContext } from 'react';
import { fetchNLPEvent } from '../api';
import { TextField, Button, Box, CircularProgress, Typography, Card as MuiCard, Skeleton } from '@mui/material';
import { Card, Statistic, Tooltip } from 'antd';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import ClusterOutlined from '@ant-design/icons/ClusterOutlined';
// import ReactWordcloud from 'react-wordcloud';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { DashboardContext } from '../App';

export default function NLPEventTab() {
  const [text, setText] = useState('Apple announced a new product in Cupertino.');
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [minWordLength, setMinWordLength] = useState(3);
  const [cloudType, setCloudType] = useState('entities');
  const [drilldown, setDrilldown] = useState(null);
  const { globalSearch } = useContext(DashboardContext);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const resp = await fetchNLPEvent(text);
      setData(resp.data.result);
      setInsight(resp.data.nlp_event_insights || '');
    } catch (e) {
      setData(null);
      setInsight('');
    }
    setLoading(false);
  };

  // Prepare word cloud data
  const entityWords = data && data.entities ? data.entities.filter(e => e[0].length >= minWordLength && (!globalSearch || e[0].toLowerCase().includes(globalSearch.toLowerCase()))).map(e => ({ text: e[0], value: 10 })) : [];
  const keyPhraseWords = data && data.key_phrases ? data.key_phrases.filter(k => k.length >= minWordLength && (!globalSearch || k.toLowerCase().includes(globalSearch.toLowerCase()))).map(k => ({ text: k, value: 10 })) : [];
  const handleWordClick = word => {
    setDrilldown(word.text);
    navigator.clipboard.writeText(word.text);
  };

  const handleExport = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, 'nlp_extraction.json');
    }
  };

  const handleExportCSV = () => {
    if (data) {
      let rows = [];
      if (data.entities) data.entities.forEach((e, i) => rows.push({ type: 'entity', value: e[0], label: e[1] }));
      if (data.key_phrases) data.key_phrases.forEach((k, i) => rows.push({ type: 'key_phrase', value: k }));
      if (data.sentiment !== undefined) rows.push({ type: 'sentiment', value: data.sentiment });
      const csv = Papa.unparse(rows);
      const blob = new Blob([csv], { type: 'text/csv' });
      saveAs(blob, 'nlp_extraction.csv');
    }
  };

  return (
    <Box>
      <TextField label="Text for NLP Extraction" value={text} onChange={e => setText(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <Button onClick={handleFetch} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Extract Events'}
      </Button>
      <Button onClick={handleExport} disabled={!data} variant="outlined" sx={{ ml: 2 }}>
        Export JSON
      </Button>
      <Button onClick={handleExportCSV} disabled={!data} variant="outlined" sx={{ ml: 2 }}>
        Export CSV
      </Button>
      {loading && <Skeleton active paragraph={{ rows: 4 }} />}
      {!loading && insight && (
        <Card style={{ marginTop: 24, background: '#e6f7ff', borderLeft: '6px solid #1890ff' }}>
          <Statistic
            title={<span>NLP Event Insight <Tooltip title="AI-generated summary of extracted events."><InfoCircleOutlined /></Tooltip></span>}
            value={insight}
            valueStyle={{ fontSize: 16, color: '#1890ff' }}
            prefix={<ClusterOutlined />}
          />
        </Card>
      )}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2">Word Cloud Type:</Typography>
        <select value={cloudType} onChange={e => setCloudType(e.target.value)} style={{ minWidth: 120, marginRight: 16 }}>
          <option value="entities">Entities</option>
          <option value="keyphrases">Key Phrases</option>
        </select>
        <Typography variant="subtitle2" sx={{ ml: 2 }}>Min Word Length:</Typography>
        <input type="number" min={1} max={20} value={minWordLength} onChange={e => setMinWordLength(Number(e.target.value))} style={{ width: 60, marginLeft: 8 }} />
      </Box>
      {drilldown && (
        <MuiCard sx={{ mt: 2, p: 2, bgcolor: '#e6f7ff' }}>
          <Typography variant="subtitle2">Drill-down:</Typography>
          <Typography>{drilldown}</Typography>
          <Button onClick={() => setDrilldown(null)} sx={{ mt: 1 }}>Close</Button>
        </MuiCard>
      )}
      {!loading && data && (
        <Card style={{ marginTop: 24 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Entities Word Cloud</Typography>
          {/* Word cloud feature temporarily disabled due to react-wordcloud incompatibility with React 19 */}
          {cloudType === 'entities' && (entityWords.length > 0 ? <Typography>Word cloud unavailable (React 19 incompatibility).</Typography> : <Typography>No entities found.</Typography>)}
          {cloudType === 'keyphrases' && (keyPhraseWords.length > 0 ? <Typography>Word cloud unavailable (React 19 incompatibility).</Typography> : <Typography>No key phrases found.</Typography>)}
          <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Sentiment</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{data && data.sentiment !== undefined ? data.sentiment : 'N/A'}</Typography>
        </Card>
      )}
      {!loading && data && (
        <MuiCard sx={{ mt: 2, p: 2, bgcolor: '#fafafa' }}>
          <Typography variant="subtitle2">Raw NLP Extraction Data</Typography>
          <pre style={{ background: '#fafafa', padding: 8, fontSize: 13 }}>{JSON.stringify(data, null, 2)}</pre>
        </MuiCard>
      )}
    </Box>
  );
}

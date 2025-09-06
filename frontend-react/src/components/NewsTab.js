
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, CircularProgress, Typography, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import InsightBox from './InsightBox';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function NewsTab() {
  const [urls, setUrls] = useState('https://www.reuters.com/markets/us\nhttps://www.cnbc.com/finance/');
  const [rss, setRss] = useState('https://feeds.reuters.com/reuters/businessNews\nhttps://www.cnbc.com/id/100003114/device/rss/rss.html');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const resp = await axios.post(`${API_URL}/news/run`, {
        urls: urls.split('\n').map(u => u.trim()).filter(Boolean),
        rss_urls: rss.split('\n').map(u => u.trim()).filter(Boolean)
      });
      setData(resp.data.result || []);
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  };

  // Compute insights
  let mostPositive = null, mostNegative = null, avgSentiment = null, newsRecommendation = null;
  if (data.length > 0) {
    const sorted = [...data].sort((a, b) => (b.sentiment || 0) - (a.sentiment || 0));
    mostPositive = sorted[0];
    mostNegative = sorted[sorted.length - 1];
    avgSentiment = (data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / data.length).toFixed(2);
    // Recommendation logic
    const avg = parseFloat(avgSentiment);
    if (avg > 0.2) newsRecommendation = 'Bullish';
    else if (avg < -0.2) newsRecommendation = 'Bearish';
    else newsRecommendation = 'Neutral';
  }

  return (
    <Box>
      <TextField label="News URLs (one per line)" value={urls} onChange={e => setUrls(e.target.value)} fullWidth sx={{ mb: 2 }} multiline minRows={2} />
      <TextField label="RSS URLs (one per line)" value={rss} onChange={e => setRss(e.target.value)} fullWidth sx={{ mb: 2 }} multiline minRows={2} />
      <Button onClick={fetchNews} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Fetch News'}
      </Button>
      {data.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
            <Grid item>
              <InsightBox
                title="Total News Items"
                value={data.length}
                color="#1976d2"
                description="Stories analyzed"
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="Avg. Sentiment"
                value={avgSentiment}
                color="#388e3c"
                description="Average sentiment score"
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="Most Positive"
                value={mostPositive?.title || 'N/A'}
                color="#43a047"
                description={mostPositive ? `Score: ${mostPositive.sentiment}` : ''}
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="Most Negative"
                value={mostNegative?.title || 'N/A'}
                color="#e53935"
                description={mostNegative ? `Score: ${mostNegative.sentiment}` : ''}
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="News Sentiment"
                value={newsRecommendation}
                color={
                  newsRecommendation === 'Bullish' ? '#43a047' :
                  newsRecommendation === 'Bearish' ? '#e53935' :
                  '#1976d2'
                }
                description={
                  newsRecommendation === 'Bullish' ? 'Positive news flow' :
                  newsRecommendation === 'Bearish' ? 'Negative news flow' :
                  'Neutral news flow'
                }
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">News Table</Typography>
            <DataGrid
              rows={data.map((row, i) => ({ id: i, ...row }))}
              columns={[
                { field: 'title', headerName: 'Title', width: 300 },
                { field: 'publish_date', headerName: 'Date', width: 150 },
                { field: 'sentiment', headerName: 'Sentiment', width: 120 },
                { field: 'summary', headerName: 'Summary', width: 400 }
              ]}
              autoHeight
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

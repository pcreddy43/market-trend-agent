
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, CircularProgress, Typography, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import InsightBox from './InsightBox';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function SocialSentimentTab() {
  const [subreddits, setSubreddits] = useState('stocks,wallstreetbets');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSentiment = async () => {
    setLoading(true);
    try {
      const resp = await axios.post(`${API_URL}/socialsentiment/run`, {
        subreddits: subreddits.split(',').map(s => s.trim()).filter(Boolean)
      });
      setData(resp.data.result || []);
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  };

  // Compute insights
  let mostPositive = null, mostNegative = null, avgSentiment = null, socialRecommendation = null;
  if (data.length > 0) {
    const sorted = [...data].sort((a, b) => (b.sentiment || 0) - (a.sentiment || 0));
    mostPositive = sorted[0];
    mostNegative = sorted[sorted.length - 1];
    avgSentiment = (data.reduce((sum, d) => sum + (d.sentiment || 0), 0) / data.length).toFixed(2);
    // Recommendation logic
    const avg = parseFloat(avgSentiment);
    if (avg > 0.2) socialRecommendation = 'Bullish';
    else if (avg < -0.2) socialRecommendation = 'Bearish';
    else socialRecommendation = 'Neutral';
  }

  return (
    <Box>
      <TextField label="Subreddits (comma-separated)" value={subreddits} onChange={e => setSubreddits(e.target.value)} sx={{ mr: 2 }} />
      <Button onClick={fetchSentiment} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Fetch Sentiment'}
      </Button>
      {data.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
            <Grid item>
              <InsightBox
                title="Total Posts"
                value={data.length}
                color="#1976d2"
                description="Posts analyzed"
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
                title="Most Positive Post"
                value={mostPositive?.title || 'N/A'}
                color="#43a047"
                description={mostPositive ? `Score: ${mostPositive.sentiment}` : ''}
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="Most Negative Post"
                value={mostNegative?.title || 'N/A'}
                color="#e53935"
                description={mostNegative ? `Score: ${mostNegative.sentiment}` : ''}
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="Social Sentiment"
                value={socialRecommendation}
                color={
                  socialRecommendation === 'Bullish' ? '#43a047' :
                  socialRecommendation === 'Bearish' ? '#e53935' :
                  '#1976d2'
                }
                description={
                  socialRecommendation === 'Bullish' ? 'Positive social flow' :
                  socialRecommendation === 'Bearish' ? 'Negative social flow' :
                  'Neutral social flow'
                }
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Social Sentiment Table</Typography>
            <DataGrid
              rows={data.map((row, i) => ({ id: i, ...row }))}
              columns={[
                { field: 'subreddit', headerName: 'Subreddit', width: 150 },
                { field: 'title', headerName: 'Title', width: 300 },
                { field: 'score', headerName: 'Score', width: 100 },
                { field: 'sentiment', headerName: 'Sentiment', width: 120 }
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

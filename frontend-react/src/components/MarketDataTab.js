
import React, { useState } from 'react';
import { exportToCsv } from '../utils/exportCsv';
import { fetchMarketData } from '../api';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TextField, Button, Box, CircularProgress, Grid, Drawer, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import InsightBox from './InsightBox';
import MarketDataChart from './MarketDataChart';
import ErrorMessage from './ErrorMessage';

export default function MarketDataTab() {
  const [tickers, setTickers] = useState('AAPL,MSFT,GOOG');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchMarketData(tickers, '1y', '1d');
      setData(resp.data.result || []);
    } catch (e) {
      setError(e);
      setData([]);
    }
    setLoading(false);
  };

  let latest = null;
  if (data.length > 0) {
    latest = data[data.length - 1];
  }

  return (
    <div style={{ margin: 24 }}>
      <TextField label="Tickers" value={tickers} onChange={e => setTickers(e.target.value)} sx={{ mr: 2 }} />
      <Button onClick={handleFetch} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Fetch Data'}
      </Button>
      <Button
        style={{ marginLeft: 12, marginBottom: 8 }}
        onClick={() => exportToCsv('market_data.csv', data)}
        disabled={!data.length}
        variant="outlined"
      >
        Export to CSV
      </Button>
      <ErrorMessage error={error} />
      {latest && (
        <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
          <Grid item>
            <InsightBox
              title="Latest Close"
              value={latest.close ? `$${Number(latest.close).toFixed(2)}` : 'N/A'}
              color="#1976d2"
              description="Most recent closing price"
            />
          </Grid>
          <Grid item>
            <InsightBox
              title="20-Day SMA"
              value={latest.SMA_20 ? `$${Number(latest.SMA_20).toFixed(2)}` : 'N/A'}
              color="#388e3c"
              description="20-day Simple Moving Average"
            />
          </Grid>
          <Grid item>
            <InsightBox
              title="14-Day RSI"
              value={latest.RSI_14 ? Number(latest.RSI_14).toFixed(2) : 'N/A'}
              color="#ffa000"
              description="14-day Relative Strength Index"
            />
          </Grid>
          <Grid item>
            <InsightBox
              title="Recommendation"
              value={latest.recommendation || 'N/A'}
              color={
                latest.recommendation === 'Buy' ? '#43a047' :
                latest.recommendation === 'Sell' ? '#e53935' :
                '#1976d2'
              }
              description={
                latest.recommendation === 'Buy' ? 'RSI < 30: Potentially oversold' :
                latest.recommendation === 'Sell' ? 'RSI > 70: Potentially overbought' :
                'RSI neutral: Hold'
              }
            />
          </Grid>
        </Grid>
      )}
      {/* Advanced chart: Ant Design candlestick + overlays */}
      <MarketDataChart data={data} />
      {/* Comparison: recharts line overlays */}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="close" stroke="#8884d8" />
            <Line type="monotone" dataKey="SMA_20" stroke="#82ca9d" />
            <Line type="monotone" dataKey="RSI_14" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      )}
      {/* Table with Why? explainability */}
      {data.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Close</TableCell>
                <TableCell>SMA 20</TableCell>
                <TableCell>RSI 14</TableCell>
                <TableCell>Recommendation</TableCell>
                <TableCell>Why?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.date + idx}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.close}</TableCell>
                  <TableCell>{row.SMA_20}</TableCell>
                  <TableCell>{row.RSI_14}</TableCell>
                  <TableCell>{row.recommendation}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => { setDrawerContent(row); setDrawerOpen(true); }}>Why?</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 400 } }}
      >
        {drawerContent && (
          <Box sx={{ p: 3 }}>
            <h3>Explainability for {drawerContent.date}</h3>
            <p><b>Close:</b> {drawerContent.close}</p>
            <p><b>SMA 20:</b> {drawerContent.SMA_20}</p>
            <p><b>RSI 14:</b> {drawerContent.RSI_14}</p>
            <p><b>Recommendation:</b> {drawerContent.recommendation}</p>
            <p><b>Reasoning:</b> {
              drawerContent.recommendation === 'Buy' ? 'RSI < 30: Potentially oversold' :
              drawerContent.recommendation === 'Sell' ? 'RSI > 70: Potentially overbought' :
              'RSI neutral: Hold'
            }</p>
          </Box>
        )}
      </Drawer>
    </div>
  );
}

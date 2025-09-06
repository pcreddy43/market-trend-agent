
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, CircularProgress, Typography, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import InsightBox from './InsightBox';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function SECFilingsTab() {
  const [cik, setCik] = useState('0000320193');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFilings = async () => {
    setLoading(true);
    try {
      const resp = await axios.post(`${API_URL}/secfilings/run`, { cik });
      setData(resp.data.result || []);
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  };

  // Compute insights
  let latest = null;
  if (data.length > 0) {
    latest = data[0];
  }

  return (
    <Box>
      <TextField label="CIK (e.g., 0000320193 for Apple)" value={cik} onChange={e => setCik(e.target.value)} sx={{ mr: 2 }} />
      <Button onClick={fetchFilings} disabled={loading} variant="contained">
        {loading ? <CircularProgress size={20} /> : 'Fetch Filings'}
      </Button>
      {data.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
            <Grid item>
              <InsightBox
                title="Total Filings"
                value={data.length}
                color="#1976d2"
                description="Filings retrieved"
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="Latest Filing Type"
                value={latest?.type || 'N/A'}
                color="#388e3c"
                description={latest?.title || ''}
              />
            </Grid>
            <Grid item>
              <InsightBox
                title="Latest Filing Date"
                value={latest?.date || 'N/A'}
                color="#ffa000"
                description="Most recent filing date"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">SEC Filings Table</Typography>
            <DataGrid
              rows={data.map((row, i) => ({ id: i, ...row }))}
              columns={[
                { field: 'type', headerName: 'Type', width: 120 },
                { field: 'title', headerName: 'Title', width: 300 },
                { field: 'date', headerName: 'Date', width: 150 },
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

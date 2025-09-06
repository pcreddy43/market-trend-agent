import React from 'react';
import { Box, Typography } from '@mui/material';

export default function InsightBox({ title, value, color = '#1976d2', description }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        bgcolor: '#fff',
        borderLeft: `6px solid ${color}`,
        mb: 2,
        minWidth: 220,
        minHeight: 90,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700} color={color}>
        {value}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
}

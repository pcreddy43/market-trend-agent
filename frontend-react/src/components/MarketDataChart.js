import React from 'react';
import { Card } from 'antd';
import { Stock, Line } from '@ant-design/plots';

// Expects data: [{date, open, close, high, low, volume, SMA_20, RSI_14, ...}]
export default function MarketDataChart({ data = [] }) {
  // Prepare candlestick data for Stock chart
  const stockData = data.map(row => ({
    time: row.date,
    open: Number(row.open || row.Open || row.open_AAPL || row.open_MSFT || row.open_GOOG || 0),
    close: Number(row.close || row.Close || 0),
    high: Number(row.high || row.High || 0),
    low: Number(row.low || row.Low || 0),
    volume: Number(row.volume || row.Volume || 0),
  }));

  // Prepare SMA overlay
  const smaData = data.filter(row => row.SMA_20 && row.SMA_20 !== '').map(row => ({
    time: row.date,
    SMA_20: Number(row.SMA_20)
  }));

  // Prepare RSI overlay
  const rsiData = data.filter(row => row.RSI_14 && row.RSI_14 !== '').map(row => ({
    time: row.date,
    RSI_14: Number(row.RSI_14)
  }));

  return (
    <Card title="Price, Volume & Technicals" style={{ marginBottom: 24 }}>
      <Stock
        data={stockData}
        xField="time"
        yField={["open", "close", "high", "low"]}
        volumeField="volume"
        height={320}
        annotations={[]}
        meta={{
          open: { alias: 'Open' },
          close: { alias: 'Close' },
          high: { alias: 'High' },
          low: { alias: 'Low' },
          volume: { alias: 'Volume' },
        }}
      />
      {smaData.length > 0 && (
        <Line
          data={smaData}
          xField="time"
          yField="SMA_20"
          height={120}
          color="#faad14"
          point={{ size: 2 }}
          style={{ marginTop: 16 }}
        />
      )}
      {rsiData.length > 0 && (
        <Line
          data={rsiData}
          xField="time"
          yField="RSI_14"
          height={120}
          color="#52c41a"
          point={{ size: 2 }}
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
}

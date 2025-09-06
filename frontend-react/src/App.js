import React, { useState, useEffect, createContext } from 'react';
import { setMockMode } from './api';
import DashboardLayout from './DashboardLayout';

import InsightsOverview from './components/InsightsOverview';
import InsightsTab from './components/InsightsTab';
import MarketDataTab from './components/MarketDataTab';
import NewsTab from './components/NewsTab';
import SECFilingsTab from './components/SECFilingsTab';
import SocialSentimentTab from './components/SocialSentimentTab';
import MacroTab from './components/MacroTab';
import CompanyEventsTab from './components/CompanyEventsTab';
import StartupSignalsTab from './components/StartupSignalsTab';
import NLPEventTab from './components/NLPEventTab';
import PatentSignalsTab from './components/PatentSignalsTab';
import ESGSignalsTab from './components/ESGSignalsTab';

const tabComponents = {
  overview: <InsightsOverview />,
  insights: <InsightsTab />,
  market: <MarketDataTab />,
  news: <NewsTab />,
  sec: <SECFilingsTab />,
  sentiment: <SocialSentimentTab />,
  macro: <MacroTab />,
  events: <CompanyEventsTab />,
  startup: <StartupSignalsTab />,
  nlp: <NLPEventTab />,
  patent: <PatentSignalsTab />,
  esg: <ESGSignalsTab />,
};

export const DashboardContext = createContext();


function App() {
  const [selectedKey, setSelectedKey] = useState(() => localStorage.getItem('selectedKey') || 'market');
  const [globalTickers, setGlobalTickers] = useState(() => localStorage.getItem('globalTickers') || 'AAPL,MSFT,GOOG');
  const [globalDateRange, setGlobalDateRange] = useState(() => {
    const stored = localStorage.getItem('globalDateRange');
    return stored ? JSON.parse(stored) : [null, null];
  });
  const [globalSearch, setGlobalSearch] = useState(() => localStorage.getItem('globalSearch') || '');
  const [mockMode, setMockModeState] = useState(() => {
    const stored = localStorage.getItem('mockMode');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('selectedKey', selectedKey);
    localStorage.setItem('globalTickers', globalTickers);
    localStorage.setItem('globalDateRange', JSON.stringify(globalDateRange));
    localStorage.setItem('globalSearch', globalSearch);
  }, [selectedKey, globalTickers, globalDateRange, globalSearch]);

  useEffect(() => {
    localStorage.setItem('mockMode', mockMode);
    setMockMode(mockMode);
  }, [mockMode]);

  return (
    <DashboardContext.Provider value={{
      globalTickers, setGlobalTickers,
      globalDateRange, setGlobalDateRange,
      globalSearch, setGlobalSearch,
      mockMode, setMockMode: setMockModeState
    }}>
      <div style={{ padding: 16, background: '#f0f2f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <input
            type="text"
            value={globalTickers}
            onChange={e => setGlobalTickers(e.target.value)}
            placeholder="Tickers (comma-separated)"
            style={{ marginRight: 12, padding: 4, minWidth: 180 }}
          />
          <input
            type="date"
            value={globalDateRange[0] || ''}
            onChange={e => setGlobalDateRange([e.target.value, globalDateRange[1]])}
            style={{ marginRight: 4 }}
          />
          <span style={{ margin: '0 4px' }}>to</span>
          <input
            type="date"
            value={globalDateRange[1] || ''}
            onChange={e => setGlobalDateRange([globalDateRange[0], e.target.value])}
            style={{ marginRight: 16 }}
          />
          <input
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Dashboard-wide search..."
            style={{ padding: 4, minWidth: 220 }}
          />
          <label style={{ marginLeft: 24, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={mockMode}
              onChange={e => setMockModeState(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Mock Data
          </label>
        </div>
        <DashboardLayout selectedKey={selectedKey} onMenuChange={setSelectedKey}>
          {tabComponents[selectedKey]}
        </DashboardLayout>
      </div>
    </DashboardContext.Provider>
  );
}

export default App;

# Market Trend Multi-Agent Dashboard (React)

## Quickstart

1. Install dependencies:
   ```
   cd frontend-react
   npm install
   ```
2. Set your backend API URL in `.env` (default: `http://localhost:8000`).
3. Start the React app:
   ```
   npm start
   ```
4. The dashboard will be available at `http://localhost:3000`.

## Features
- Material UI tabs for each agent (Market Data, News, SEC Filings, etc.)
- Example Market Data tab with chart and API integration
- Easily extendable: add more agent tabs in `src/components/`

## Deployment
- Deploy to Vercel, Netlify, or Render for a public URL
- Set `REACT_APP_API_URL` to your backend's public URL in production

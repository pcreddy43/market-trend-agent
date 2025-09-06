# 🚀 Market Trend Agent: Open Source Cloud Deployment (Fly.io)

This guide helps you deploy your FastAPI + React full-stack app to Fly.io, a free/open-source-friendly cloud platform.

---

## Prerequisites
- [Fly.io account](https://fly.io/signup)
- [Fly CLI](https://fly.io/docs/hands-on/install/) (`npm install -g flyctl` or download)
- Docker installed (for local builds)

---

## 1. Configure Environment
- Copy `.env.example` to `.env` and fill in your API keys and allowed origins.
- **Never commit real secrets to git!**

```
cp .env.example .env
# Edit .env and set your keys
```

---

## 2. Launch Your App on Fly.io

```
flyctl launch
# Accept prompts (choose region, app name, etc)
```
- This creates `fly.toml` and provisions your app.

---

## 3. Set Secrets (API Keys)

```
flyctl secrets set ALPHA_VANTAGE_API_KEY=your_key OPENAI_API_KEY=your_key REDDIT_CLIENT_ID=your_id REDDIT_CLIENT_SECRET=your_secret ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 4. Deploy

```
flyctl deploy
```
- This builds and deploys your Dockerized app (API + frontend) to the cloud.

---

## 5. Access Your App
- Fly.io will provide a public URL (e.g., `https://market-trend-agent.fly.dev`)
- Set up a custom domain if desired (see Fly.io docs)

---

## 6. CI/CD (Optional)
- See `.github/workflows/ci-cd.yml` for automated test/build/deploy.
- You can add a deploy step using the [Fly GitHub Action](https://github.com/superfly/flyctl-actions):

```yaml
- name: Deploy to Fly.io
  uses: superfly/flyctl-actions@1.4
  with:
    args: "deploy"
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## 7. Production Security
- CORS is restricted via `ALLOWED_ORIGINS`.
- API keys are never exposed in code or git.
- Rate limiting is enabled (60 req/min/IP).

---

## Troubleshooting
- Check logs: `flyctl logs`
- Redeploy: `flyctl deploy`
- Docs: https://fly.io/docs/

---

Enjoy your open-source, production-grade, cloud-deployed analytics dashboard!

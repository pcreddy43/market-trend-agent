# 🚀 Market Trend Agent: Free Deployment on Render.com

This guide helps you deploy your FastAPI + React full-stack app for free on Render.com (no credit card required).

---

## 1. Prepare Your Repo
- Push your code to GitHub (done).
- Ensure you have a `Dockerfile` and `requirements.txt` in your backend root.
- Your frontend should be in `frontend-react/`.

---

## 2. Create a Free Render Account
- Go to https://render.com/
- Sign up (GitHub login recommended).

---

## 3. Deploy the Backend (FastAPI)
1. Click **New +** → **Web Service**.
2. Connect your GitHub and select your repo.
3. For **Environment**, choose **Docker**.
4. Leave **Build Command** and **Start Command** blank (Render uses your Dockerfile).
5. Set **Port** to `8080`.
6. Click **Create Web Service**.

---

## 4. Set Environment Variables
- In the Render dashboard for your service, go to **Environment**.
- Add your secrets (API keys, etc.) as environment variables (copy from your `.env`).

---

## 5. Deploy the Frontend (React)
1. Click **New +** → **Static Site**.
2. Select your repo and set the root directory to `frontend-react`.
3. **Build Command:** `npm run build`
4. **Publish Directory:** `build`
5. Click **Create Static Site**.

---

## 6. Connect Frontend to Backend
- In your frontend `.env` or API config, set the backend URL to your Render backend’s public URL.
- Example: `REACT_APP_API_URL=https://your-backend-service.onrender.com`

---

## 7. Done!
- Both backend and frontend will be live on Render’s free tier.
- Update your code and redeploy with a git push.

---

## Troubleshooting
- Check build/deploy logs in the Render dashboard.
- For CORS/API issues, ensure your frontend is using the correct backend URL.
- For environment variables, always set them in the Render dashboard (not in code).

---

Enjoy your free, production-grade, cloud-deployed analytics dashboard!

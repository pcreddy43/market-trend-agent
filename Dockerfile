# Dockerfile for FastAPI backend + React frontend (production, Fly.io compatible)
# Multi-stage build: frontend static files + backend API

# --- Build frontend ---
FROM node:20 AS frontend-build
WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm install
COPY frontend-react/ ./
RUN npm run build

# --- Build backend ---
FROM python:3.11-slim AS backend-build
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# --- Final image ---
FROM python:3.11-slim
WORKDIR /app
COPY --from=backend-build /app /app
COPY --from=frontend-build /app/frontend-react/build /app/frontend-static
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
EXPOSE 8080

# Entrypoint: serve React static files and FastAPI app
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080"]

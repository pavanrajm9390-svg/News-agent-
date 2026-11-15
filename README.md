# News Briefing Agent – Layered Architecture

Multi-layer news briefing system:

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Frontend** | React + Vite | Dashboard, sources, briefings UI |
| **Backend** | Node.js + Express | API, RSS collection, SQLite, Telegram, scheduler |
| **AI Layer** | Python + FastAPI | Claude-powered briefing generation |

## Project Structure

```
news-briefing-layered/
├── frontend/          # React + Vite dashboard
├── backend/           # Node.js Express (API, DB, scheduler, Telegram)
└── ai-layer/          # Python FastAPI (Claude agent)
```

## Quick Start

### 1. AI Layer (Python FastAPI)

```bash
cd ai-layer
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY
python main.py
# Runs on http://localhost:8001
```

### 2. Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env   # or create .env
# Set TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
# AI_LAYER_URL=http://localhost:8001  (optional, default)
npm run dev
# Runs on http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Environment

**AI Layer** (`ai-layer/.env`):
```
ANTHROPIC_API_KEY=your_claude_api_key
```

**Backend** (`backend/.env`):
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
AI_LAYER_URL=http://localhost:8001
AI_PROVIDER=anthropic
```

## How It Works

1. Frontend talks to Backend REST API
2. Backend collects RSS, stores in SQLite
3. Backend calls AI Layer (`POST /briefing`) with articles
4. AI Layer uses Claude to generate structured briefing + markdown
5. Backend saves briefing and optionally posts to Telegram

The original CLI-based AI layer has been replaced with a proper FastAPI service.
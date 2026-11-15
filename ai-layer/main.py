"""FastAPI AI Layer – Claude-powered news briefing service."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models import BriefingRequest, BriefingResponse
from agents.news_agent import run_agent

app = FastAPI(
    title="News Briefing AI Layer",
    version="1.0.0",
    description="Python FastAPI AI layer for generating news briefings with Claude",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "service": "News Briefing AI Layer",
        "provider": "Claude (Anthropic)",
        "status": "ready",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "provider": settings.ai_provider}


@app.post("/briefing", response_model=BriefingResponse)
async def generate_briefing(request: BriefingRequest):
    try:
        articles = [a.model_dump() for a in request.articles]
        options = request.options or {}
        result = await run_agent(articles, options)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)

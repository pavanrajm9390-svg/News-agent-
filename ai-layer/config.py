from pathlib import Path
from dotenv import load_dotenv

# Load tracing settings before LangSmith or LangChain is imported.
ENV_FILE = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_FILE)

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Literal, Optional


class Settings(BaseSettings):
    # Claude / Anthropic
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")
    anthropic_model: str = Field(default="claude-3-5-haiku-20241022", alias="ANTHROPIC_MODEL")
    ai_provider: Literal["anthropic"] = Field(default="anthropic", alias="AI_PROVIDER")
    max_stories: int = Field(default=12, alias="MAX_STORIES")
    briefing_style: str = Field(default="concise", alias="BRIEFING_STYLE")
    port: int = Field(default=8001, alias="PORT")

    # LangSmith (optional – tracing is enabled when these are set)
    langsmith_tracing: Optional[str] = Field(default=None, alias="LANGSMITH_TRACING")
    langsmith_api_key: Optional[str] = Field(default=None, alias="LANGSMITH_API_KEY")
    langsmith_project: Optional[str] = Field(default=None, alias="LANGSMITH_PROJECT")
    langsmith_endpoint: Optional[str] = Field(default=None, alias="LANGSMITH_ENDPOINT")

    class Config:
        env_file = str(ENV_FILE)
        extra = "ignore"


settings = Settings()

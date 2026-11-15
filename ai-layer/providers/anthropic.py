"""Claude provider using LangChain ChatAnthropic (LangSmith tracing automatic)."""
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from config import settings


async def generate(prompt: str, options: dict = None) -> str:
    options = options or {}
    if not settings.anthropic_api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")

    model_name = options.get("model") or settings.anthropic_model
    temperature = options.get("temperature", 0.35)
    max_tokens = options.get("maxTokens", 16384)

    llm = ChatAnthropic(
        model=model_name,
        temperature=temperature,
        max_tokens=max_tokens,
        api_key=settings.anthropic_api_key,
    )

    # LangSmith tracing is enabled automatically via environment variables
    # (LANGSMITH_TRACING=true + LANGSMITH_API_KEY)
    message = await llm.ainvoke([HumanMessage(content=prompt)])

    text = message.content
    if isinstance(text, list):
        # Handle multi-block content
        text = "\n".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in text
        )
    text = (text or "").strip()
    if not text:
        raise RuntimeError("Claude returned no text")
    return text

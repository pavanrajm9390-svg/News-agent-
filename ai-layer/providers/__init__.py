from .anthropic import generate as anthropic_generate

PROVIDERS = {
    "anthropic": anthropic_generate,
}


def get_provider(name: str = None):
    from config import settings
    name = name or settings.ai_provider
    if name not in PROVIDERS:
        raise ValueError(f"Unknown provider: {name}")
    return PROVIDERS[name]

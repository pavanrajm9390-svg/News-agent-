"""Prompt builder for Claude news briefings."""
from typing import List, Dict, Any

CATEGORY_ORDER = ["world", "tech", "business", "science", "health", "sports", "general"]


def select_articles(articles: List[Dict[str, Any]], max_per_category: int = 8) -> List[Dict[str, Any]]:
    by_cat: Dict[str, List] = {}
    for i, art in enumerate(articles, start=1):
        cat = (art.get("category") or "general").lower()
        by_cat.setdefault(cat, []).append({"index": i, "article": art, "category": cat})

    selected = []
    for cat in CATEGORY_ORDER:
        items = by_cat.get(cat, [])[:max_per_category]
        selected.extend(items)

    for cat, items in by_cat.items():
        if cat not in CATEGORY_ORDER:
            selected.extend(items[:max_per_category])

    return selected


def build_briefing_prompt(articles: List[Dict[str, Any]], options: Dict[str, Any] = None) -> str:
    options = options or {}
    max_stories = options.get("maxStories", 12)
    style = options.get("style", "concise")

    selected = select_articles(articles)
    categories = sorted(
        {item["category"] for item in selected},
        key=lambda c: CATEGORY_ORDER.index(c) if c in CATEGORY_ORDER else 999,
    )

    lines = []
    for item in selected:
        art = item["article"]
        summary = (art.get("summary") or "")[:300]
        lines.append(
            f"[{item['index']}] Title: {art.get('title', '')}\n"
            f"Source: {art.get('source_name') or 'Unknown'}\n"
            f"Source category: {item['category']}\n"
            f"Published: {art.get('published_at') or 'N/A'}\n"
            f"URL: {art.get('url', '')}\n"
            f"Summary: {summary}\n"
            f"---"
        )
    article_list = "\n".join(lines)

    return f"""You are an expert news editor creating a factual daily briefing from RSS articles.

TASK:
Select up to {max_stories} important and diverse stories from the articles below.

AVAILABLE CATEGORIES FROM FEEDS: {', '.join(categories)}

RULES:
- Use only the available categories listed above, in that order. Do not create a section for a category with no selected articles.
- Put each story in its source category. Include at least one relevant story from each available category when the story limit permits.
- Cluster duplicate coverage and choose the best representative article.
- Use only facts present in the supplied article titles and summaries. Do not invent events, figures, or quotes.
- Copy each story's source name and URL exactly from its article. Use its bracketed article number for article_index and selected_indexes.
- Write clearly and neutrally. Output valid JSON with no markdown fences.

OUTPUT FORMAT:
{{
  "title": "Daily Briefing – YYYY-MM-DD",
  "summary": "2-3 sentence overview of the selected stories",
  "sections": [
    {{
      "category": "one of the available categories above",
      "stories": [
        {{
          "headline": "Clear headline",
          "summary": "2-4 sentence summary",
          "why_it_matters": "One sentence",
          "source": "Exact source name",
          "url": "Exact article URL",
          "article_index": 1
        }}
      ]
    }}
  ],
  "selected_indexes": [1]
}}

STYLE: {style}

ARTICLES:
{article_list}

Generate the JSON now:"""

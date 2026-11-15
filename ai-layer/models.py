from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class ArticleInput(BaseModel):
    id: Optional[str] = None
    title: str
    url: str
    summary: Optional[str] = None
    published_at: Optional[str] = None
    source_name: Optional[str] = None
    category: Optional[str] = None


class BriefingRequest(BaseModel):
    articles: List[ArticleInput]
    options: Optional[Dict[str, Any]] = None


class Story(BaseModel):
    headline: str
    summary: str
    why_it_matters: Optional[str] = None
    source: str
    url: str
    article_index: int


class Section(BaseModel):
    category: str
    stories: List[Story]


class BriefingResponse(BaseModel):
    title: str
    summary: Optional[str] = None
    sections: List[Section] = []
    selected_indexes: List[int] = []
    markdown: str
    provider: str
    generated_at: str

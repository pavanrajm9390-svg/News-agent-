-- Sources
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'rss',
  category TEXT DEFAULT 'general',
  is_active INTEGER DEFAULT 1,
  last_fetched_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Raw articles
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  source_id TEXT,
  title TEXT NOT NULL,
  url TEXT UNIQUE,
  summary TEXT,
  content TEXT,
  published_at TEXT,
  fetched_at TEXT DEFAULT (datetime('now')),
  image_url TEXT,
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

-- AI-generated briefings
CREATE TABLE IF NOT EXISTS briefings (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT,
  content_markdown TEXT,
  content_json TEXT,
  status TEXT DEFAULT 'draft',
  ai_provider TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  posted_at TEXT
);

-- Link briefing <-> articles
CREATE TABLE IF NOT EXISTS briefing_articles (
  briefing_id TEXT,
  article_id TEXT,
  rank INTEGER,
  PRIMARY KEY (briefing_id, article_id),
  FOREIGN KEY (briefing_id) REFERENCES briefings(id),
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Delivery log
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  briefing_id TEXT,
  channel TEXT,
  status TEXT,
  response TEXT,
  posted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (briefing_id) REFERENCES briefings(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_briefings_date ON briefings(date);

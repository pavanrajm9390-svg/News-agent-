const fs = require('fs');
const path = require('path');
const db = require('./index');
const { v4: uuidv4 } = require('uuid');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);
console.log('✅ Database schema applied');

// Seed default reliable free sources
const defaultSources = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
  { name: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'tech' },
  { name: 'The Guardian Science', url: 'https://www.theguardian.com/science/rss', category: 'science' },
  { name: 'The Guardian Sport', url: 'https://www.theguardian.com/sport/rss', category: 'sports' },
  { name: 'The Guardian Politics', url: 'https://www.theguardian.com/politics/rss', category: 'politics' },
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss', category: 'world' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', category: 'world' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'tech' },
  { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', category: 'world' },
  { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world' },
  { name: 'Google News Top', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', category: 'general' },
];

const insert = db.prepare(`
  INSERT INTO sources (id, name, url, type, category, is_active)
  SELECT ?, ?, ?, 'rss', ?, 1
  WHERE NOT EXISTS (SELECT 1 FROM sources WHERE url = ?)
`);

const insertMany = db.transaction((sources) => {
  let added = 0;
  for (const source of sources) {
    added += insert.run(uuidv4(), source.name, source.url, source.category, source.url).changes;
  }
  return added;
});

const added = insertMany(defaultSources);
console.log(`✅ Added ${added} default RSS sources`);

console.log('Database ready at data/news.db');

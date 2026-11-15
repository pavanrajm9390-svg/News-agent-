const db = require('../index');
const { v4: uuidv4 } = require('uuid');

function upsert(article) {
  const existing = db.prepare('SELECT id FROM articles WHERE url = ?').get(article.url);
  if (existing) return existing.id;

  const id = uuidv4();
  db.prepare(`
    INSERT INTO articles (id, source_id, title, url, summary, content, published_at, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    article.source_id || null,
    article.title,
    article.url,
    article.summary || null,
    article.content || null,
    article.published_at || null,
    article.image_url || null
  );
  return id;
}

function getRecent(hours = 36) {
  return db.prepare(`
    SELECT a.*, s.name as source_name, s.category
    FROM articles a
    LEFT JOIN sources s ON a.source_id = s.id
    WHERE a.fetched_at >= datetime('now', ?)
    ORDER BY a.published_at DESC
  `).all(`-${hours} hours`);
}

function getByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return db.prepare(`
    SELECT a.*, s.name as source_name
    FROM articles a
    LEFT JOIN sources s ON a.source_id = s.id
    WHERE a.id IN (${placeholders})
  `).all(...ids);
}

function cleanOld(days = 14) {
  const result = db.prepare(`
    DELETE FROM articles
    WHERE fetched_at < datetime('now', ?)
  `).run(`-${days} days`);
  return result.changes;
}

module.exports = {
  upsert,
  getRecent,
  getByIds,
  cleanOld
};

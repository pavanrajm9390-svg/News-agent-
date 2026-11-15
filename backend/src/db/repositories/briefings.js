const db = require('../index');
const { v4: uuidv4 } = require('uuid');

function create({ date, title, content_markdown, content_json, ai_provider, articleIds = [] }) {
  const id = uuidv4();

  const insertBriefing = db.transaction(() => {
    db.prepare(`
      INSERT INTO briefings (id, date, title, content_markdown, content_json, status, ai_provider)
      VALUES (?, ?, ?, ?, ?, 'draft', ?)
    `).run(id, date, title || `Briefing ${date}`, content_markdown, content_json, ai_provider);

    const link = db.prepare(`
      INSERT INTO briefing_articles (briefing_id, article_id, rank)
      VALUES (?, ?, ?)
    `);

    articleIds.forEach((articleId, index) => {
      link.run(id, articleId, index + 1);
    });
  });

  insertBriefing();
  return getById(id);
}

function getById(id) {
  const briefing = db.prepare('SELECT * FROM briefings WHERE id = ?').get(id);
  if (!briefing) return null;

  const articles = db.prepare(`
    SELECT a.*, ba.rank, s.name as source_name
    FROM briefing_articles ba
    JOIN articles a ON ba.article_id = a.id
    LEFT JOIN sources s ON a.source_id = s.id
    WHERE ba.briefing_id = ?
    ORDER BY ba.rank
  `).all(id);

  return { ...briefing, articles };
}

function getLatest(limit = 10) {
  return db.prepare(`
    SELECT * FROM briefings
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
}

function getByDate(date) {
  return db.prepare('SELECT * FROM briefings WHERE date = ? ORDER BY created_at DESC').all(date);
}

function updateStatus(id, status, posted_at = null) {
  if (posted_at) {
    db.prepare(`
      UPDATE briefings SET status = ?, posted_at = ? WHERE id = ?
    `).run(status, posted_at, id);
  } else {
    db.prepare(`UPDATE briefings SET status = ? WHERE id = ?`).run(status, id);
  }
  return getById(id);
}

module.exports = {
  create,
  getById,
  getLatest,
  getByDate,
  updateStatus
};

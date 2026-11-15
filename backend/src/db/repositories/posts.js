const db = require('../index');
const { v4: uuidv4 } = require('uuid');

function create({ briefing_id, channel, status, response }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO posts (id, briefing_id, channel, status, response)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, briefing_id, channel, status, response || null);
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
}

function getByBriefing(briefingId) {
  return db.prepare('SELECT * FROM posts WHERE briefing_id = ? ORDER BY posted_at DESC').all(briefingId);
}

module.exports = {
  create,
  getByBriefing
};

const db = require('../index');
const { v4: uuidv4 } = require('uuid');

function getAll() {
  return db.prepare(`
    SELECT s.* FROM sources s
    WHERE s.rowid = (SELECT MIN(other.rowid) FROM sources other WHERE other.url = s.url)
    ORDER BY s.name
  `).all();
}

function getActive() {
  return db.prepare(`
    SELECT s.* FROM sources s
    WHERE s.is_active = 1
      AND s.rowid = (SELECT MIN(other.rowid) FROM sources other WHERE other.url = s.url)
    ORDER BY s.name
  `).all();
}

function getById(id) {
  return db.prepare('SELECT * FROM sources WHERE id = ?').get(id);
}

function create({ name, url, type = 'rss', category = 'general' }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO sources (id, name, url, type, category, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(id, name, url, type, category);
  return getById(id);
}

function update(id, fields) {
  const allowed = ['name', 'url', 'type', 'category', 'is_active', 'last_fetched_at'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) return getById(id);

  values.push(id);
  db.prepare(`UPDATE sources SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return getById(id);
}

function toggleActive(id) {
  const source = getById(id);
  if (!source) return null;
  return update(id, { is_active: source.is_active ? 0 : 1 });
}

function remove(id) {
  db.prepare('DELETE FROM sources WHERE id = ?').run(id);
}

module.exports = {
  getAll,
  getActive,
  getById,
  create,
  update,
  toggleActive,
  remove
};

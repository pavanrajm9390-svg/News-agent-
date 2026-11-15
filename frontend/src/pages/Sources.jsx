import React, { useEffect, useState } from 'react';
import { createSource, getSources, toggleSource } from '../services/api';
import { CATEGORY_ORDER, distinctSources, groupSources } from '../services/categories';

const emptyForm = { name: '', url: '', category: 'science' };

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setSources(distinctSources(await getSources()));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try {
      await toggleSource(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    setError('');
    let url;
    try {
      url = new URL(form.url);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      setError('Enter a valid http or https RSS URL.');
      return;
    }
    if (sources.some((source) => source.url === url.href)) {
      setError('This feed is already listed.');
      return;
    }
    setSaving(true);
    try {
      await createSource({ name: form.name.trim(), url: url.href, category: form.category });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading sources…</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>News Sources</h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Briefing categories follow the active RSS feeds. Disable a feed to leave it out of future runs.
      </p>

      {error && <div className="card" role="alert">{error}</div>}

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Add an RSS feed</h2>
        <form className="source-form" onSubmit={handleAdd}>
          <input aria-label="Feed name" placeholder="Feed name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input aria-label="RSS URL" placeholder="https://example.com/rss" required type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
          <select aria-label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {CATEGORY_ORDER.map((category) => <option key={category} value={category.toLowerCase()}>{category}</option>)}
          </select>
          <button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add feed'}</button>
        </form>
      </div>

      {groupSources(sources).map(([category, feeds]) => (
        <section className="source-category" key={category}>
          <div className="category-heading">
            <h2>{category}</h2>
            <span>{feeds.filter((feed) => feed.is_active).length} active / {feeds.length} feeds</span>
          </div>
          {feeds.map((source) => (
            <div key={source.id} className="card source-row">
              <div className="source-details">
                <div style={{ fontWeight: 600 }}>{source.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                  {source.last_fetched_at ? `Last fetched ${new Date(source.last_fetched_at).toLocaleString()}` : 'Not fetched yet'}
                </div>
                <div className="source-url">{source.url}</div>
              </div>
              <div className="source-actions">
                <span className={`badge ${source.is_active ? 'active' : 'inactive'}`}>{source.is_active ? 'Active' : 'Off'}</span>
                <button className="secondary" onClick={() => handleToggle(source.id)}>{source.is_active ? 'Disable' : 'Enable'}</button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

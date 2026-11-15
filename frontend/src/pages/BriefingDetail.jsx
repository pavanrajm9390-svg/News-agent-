import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBriefing, postBriefing } from '../services/api';
import { CATEGORY_ORDER, categoryLabel } from '../services/categories';

function safeArticleUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
export default function BriefingDetail() {
  const { id } = useParams();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getBriefing(id)
      .then(setBriefing)
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePost = async () => {
    setPosting(true);
    setMsg('');
    try {
      await postBriefing(id);
      setMsg('✅ Posted to Telegram');
      const updated = await getBriefing(id);
      setBriefing(updated);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || err.message));
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (!briefing) return <p>Briefing not found. <Link to="/">Back</Link></p>;

  let saved = {};
  try {
    saved = JSON.parse(briefing.content_json || '{}');
  } catch {
    // Older records may not contain valid structured content.
  }
  const sections = Array.isArray(saved.sections)
    ? saved.sections
        .filter((section) => Array.isArray(section?.stories) && section.stories.length > 0)
        .sort((left, right) => CATEGORY_ORDER.indexOf(categoryLabel(left.category)) - CATEGORY_ORDER.indexOf(categoryLabel(right.category)))
    : [];
  const incomplete = sections.length === 0;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: '#94a3b8' }}>← Back to Dashboard</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>{briefing.title}</h1>
          <div style={{ color: '#64748b', marginTop: 4 }}>
            {briefing.date} · {briefing.ai_provider} · <span className={`badge ${incomplete ? 'incomplete' : briefing.status}`}>{incomplete ? 'incomplete' : briefing.status}</span>
          </div>
        </div>
        {briefing.status !== 'posted' && !incomplete && (
          <button onClick={handlePost} disabled={posting}>
            {posting ? 'Posting…' : 'Send to Telegram'}
          </button>
        )}
      </div>

      {msg && <div className="card">{msg}</div>}

      {!incomplete && (
        <nav className="topic-list" aria-label="Briefing categories">
          {sections.map((section, index) => (
            <a className="topic-pill" href={`#category-${index}`} key={`${section.category}-${index}`}>
              {categoryLabel(section.category)} <span>{section.stories.length}</span>
            </a>
          ))}
        </nav>
      )}
      {incomplete ? (
        <div className="card">This briefing was incomplete. Generate a new briefing from the Dashboard.</div>
      ) : (
        <div className="card briefing-content">
          {saved.summary && <p className="briefing-summary">{saved.summary}</p>}
          {sections.map((section, sectionIndex) => (
            <section className="briefing-section" id={`category-${sectionIndex}`} key={`${section.category || 'section'}-${sectionIndex}`}>
              <h2>{categoryLabel(section.category)}</h2>
              {(section.stories || []).map((story, storyIndex) => {
                const sourceUrl = safeArticleUrl(story.url);
                return (
                  <article className="briefing-story" key={`${story.headline || 'story'}-${storyIndex}`}>
                    <h3>{story.headline || 'Untitled story'}</h3>
                    <p>{story.summary}</p>
                    {story.why_it_matters && <p><strong>Why it matters:</strong> {story.why_it_matters}</p>}
                    {sourceUrl && (
                      <a className="briefing-source" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                        {story.source || 'Read source'} ↗
                      </a>
                    )}
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      )}

      {briefing.articles && briefing.articles.length > 0 && (
        <>
          <h3 style={{ margin: '2rem 0 1rem', color: '#94a3b8' }}>Source Articles</h3>
          {briefing.articles.map((a) => (
            <div key={a.id} className="card" style={{ fontSize: '0.9rem' }}>
              <a href={a.url} target="_blank" rel="noreferrer">{a.title}</a>
              <div style={{ color: '#64748b', marginTop: 4 }}>
                {a.source_name} · Rank #{a.rank}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

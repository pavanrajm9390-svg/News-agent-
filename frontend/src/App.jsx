import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sources from './pages/Sources';
import BriefingDetail from './pages/BriefingDetail';
import { getHealth, getSources } from './services/api';
import { distinctSources, groupSources } from './services/categories';

export default function App() {
  const [online, setOnline] = useState(false);
  const [health, setHealth] = useState(null);
  const [sources, setSources] = useState([]);
  const location = useLocation();
  const selectedCategory = new URLSearchParams(location.search).get('category');
  const topics = groupSources(distinctSources(sources).filter((source) => source.is_active));

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      getHealth().then((status) => { if (mounted) { setOnline(true); setHealth(status); } }).catch(() => { if (mounted) { setOnline(false); setHealth(null); } });
      getSources().then((items) => { if (mounted) setSources(items); }).catch(() => {});
    };
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span><strong>News Pulse</strong><small>Autonomous news agent</small></span>
        </Link>

        <nav className="side-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `side-link ${isActive && !selectedCategory ? 'selected' : ''}`}>
            <span className="nav-symbol">▦</span> Dashboard
          </NavLink>
          <NavLink to="/sources" className={({ isActive }) => `side-link ${isActive ? 'selected' : ''}`}>
            <span className="nav-symbol">◔</span> Sources
          </NavLink>
        </nav>

        {topics.length > 0 && (
          <div className="sidebar-topics">
            <div className="sidebar-label">CATEGORIES</div>
            <nav aria-label="Categories">
              {topics.map(([category, feeds]) => (
                <Link
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className={`side-link topic-side-link ${location.pathname === '/' && selectedCategory === category ? 'selected' : ''}`}
                >
                  <span className="topic-dot" />{category}<span className="side-count">{feeds.length}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        <div className="sidebar-footer">
          <span className={`status-dot ${online ? 'online' : 'offline'}`} />
          <span><strong>Backend {online ? 'online' : 'offline'}</strong><small>{online ? 'Briefing service ready' : 'Start the backend to load data'}</small></span>
        </div>
      </aside>

      <div className="app-main">
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard scheduler={health?.scheduler} />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/briefings/:id" element={<BriefingDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

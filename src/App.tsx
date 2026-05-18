import { useState, useEffect } from 'react';
import { PROJECTS } from './data/projects';
import type { Project } from './data/projects';
import Header from './components/Header';
import Card from './components/Card';
import Modal from './components/Modal';
import StatsBar from './components/StatsBar';
import Toolbar from './components/Toolbar';
import Timeline from './components/Timeline';
import SiteFooter from './components/SiteFooter';
import './styles/global.css';

export default function App() {
  const [filter, setFilter] = useState('all');
  const [sortByScore, setSortByScore] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = PROJECTS.filter(p => {
    if (filter === 'online') return p.status === 'online';
    if (filter === 'offline') return p.status !== 'online';
    return true;
  });

  const sorted = sortByScore
    ? [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0))
    : filtered;

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'j') setActiveIndex(i => Math.min(i + 1, sorted.length - 1));
      if (e.key === 'k') setActiveIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Enter' && activeIndex >= 0 && sorted[activeIndex]) setSelected(sorted[activeIndex]);
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [activeIndex, sorted]);

  return (
    <div className="app">
      <Header />

      <StatsBar projects={PROJECTS} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
        <Timeline projects={PROJECTS} />

        <Toolbar
          activeFilter={filter}
          onFilterChange={setFilter}
          sortByScore={sortByScore}
          onSortByScoreChange={setSortByScore}
        />

        <div className="grid">
          {sorted.map((p, i) => (
            <div
              key={p.name}
              style={{ outline: activeIndex === i ? '2px solid var(--accent)' : 'none', borderRadius: 10 }}
            >
              <Card project={p} onClick={() => setSelected(p)} />
            </div>
          ))}
        </div>
      </div>

      <SiteFooter />

      {selected && (
        <Modal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
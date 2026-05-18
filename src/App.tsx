import { useState, useEffect } from 'react';
import { PROJECTS } from './data/projects';
import type { Project } from './data/projects';
import Header from './components/Header';
import Card from './components/Card';
import Modal from './components/Modal';
import Slideshow from './components/Slideshow';
import ExportPanel from './components/ExportPanel';
import AlertToast from './components/AlertToast';
import StatsBar from './components/StatsBar';
import Toolbar from './components/Toolbar';
import CountdownTimer from './components/CountdownTimer';
import TechCloud from './components/TechCloud';
import ThemePanel from './components/ThemePanel';
import Timeline from './components/Timeline';
import IncubatorStatus from './components/IncubatorStatus';
import TrendChart from './components/TrendChart';
import SiteFooter from './components/SiteFooter';
import './styles/global.css';

export default function App() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [alert, setAlert] = useState({ title: '', message: '' });
  const [filter, setFilter] = useState('all');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [uv, setUv] = useState(0);
  const [pv, setPv] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [sortByScore, setSortByScore] = useState(false);
  const [scoreMap, setScoreMap] = useState<{[key: string]: number}>({});

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('accent');
    if (saved) document.documentElement.style.setProperty('--accent', saved);
  }, []);

  useEffect(() => {
    fetch('/showcase/stats.json')
      .then(r => r.ok ? r.json() : null)
      .then(s => {
        if (!s) return;
        let _uv = 0, _pv = 0;
        PROJECTS.forEach(p => { if (s[p.name]) { _uv += s[p.name].uv || 0; _pv += s[p.name].pv || 0; } });
        setUv(_uv); setPv(_pv);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    PROJECTS.forEach(async p => {
      try {
        const r = await fetch(`/showcase/scores/${p.name}.json`);
        if (r.ok) {
          const s = await r.json();
          setScoreMap(m => ({ ...m, [p.name]: s.totalScore || 0 }));
        }
      } catch {}
    });
  }, []);

  useEffect(() => {
    const check = () => {
      PROJECTS.forEach(async p => {
        if (!p.url) return;
        try { await fetch(p.url, { method: 'HEAD', mode: 'no-cors' }); }
        catch { setAlert({ title: '项目宕机告警', message: `${p.name} 已离线超过 5 分钟` }); }
      });
    };
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = PROJECTS.filter(p => {
    if (filter === 'online') return p.status === 'online';
    if (filter === 'offline') return p.status !== 'online';
    return true;
  });

  const sorted = sortByScore
    ? [...filtered].sort((a, b) => (scoreMap[b.name] || 0) - (scoreMap[a.name] || 0))
    : filtered;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selected) {
        if (e.key === 'Escape') setSelected(null);
        return;
      }
      if (e.key === 'j') setActiveIndex(i => Math.min(i + 1, sorted.length - 1));
      if (e.key === 'k') setActiveIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Enter' && activeIndex >= 0 && sorted[activeIndex]) setSelected(sorted[activeIndex]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, activeIndex, sorted]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
      <Header
        onSlideshow={() => setSlideshowOpen(true)}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onExport={() => setExportOpen(true)}
      />

      <div style={{ marginBottom: 16 }}>
        <StatsBar projects={PROJECTS} uv={uv} pv={pv} />
      </div>

      <Timeline projects={PROJECTS} />

      <CountdownTimer />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <Toolbar
          projects={PROJECTS}
          activeFilter={filter}
          onFilterChange={setFilter}
          sortByScore={sortByScore}
          onSortByScoreChange={setSortByScore}
        />
      </div>

      <TechCloud projects={PROJECTS} />

      <div>
          <TrendChart projects={PROJECTS} />
          <div className="grid" style={{ marginTop: 16 }}>
            {sorted.map((p, i) => (
              <div key={p.name} style={{ outline: activeIndex === i ? '2px solid var(--accent)' : 'none', borderRadius: 10 }}>
                <Card project={p} onClick={() => setSelected(p)} />
              </div>
            ))}
          </div>
        </div>

      {selected && <Modal project={selected} onClose={() => setSelected(null)} />}
      <Slideshow projects={PROJECTS} isOpen={slideshowOpen} onClose={() => setSlideshowOpen(false)} />
      <ExportPanel isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <ThemePanel isOpen={themeOpen} onClose={() => setThemeOpen(false)} />
      <AlertToast title={alert.title} message={alert.message} onDismiss={() => setAlert({ title: '', message: '' })} />

      <SiteFooter />
    </div>
  );
}
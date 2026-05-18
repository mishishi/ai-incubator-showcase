import { useState } from 'react';
import type { Project } from '../data/projects';

interface Props {
  projects: Project[];
  activeFilter: string;
  onFilterChange: (f: string) => void;
  sortByScore: boolean;
  onSortByScoreChange: (v: boolean) => void;
}

export default function Toolbar({ activeFilter, onFilterChange, sortByScore, onSortByScoreChange }: Props) {
  const [query, setQuery] = useState('');

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', flex: 1, minWidth: 180 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索项目..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13 }}
        />
      </div>

      {['all', 'online', 'offline'].map(f => (
        <button key={f} className={`filter-btn${activeFilter === f ? ' active' : ''}`} onClick={() => onFilterChange(f)}>
          {f === 'all' ? '全部' : f === 'online' ? '在线' : '离线'}
        </button>
      ))}
      <button
        onClick={() => onSortByScoreChange(!sortByScore)}
        className={`filter-btn${sortByScore ? ' active' : ''}`}
      >
        评分排序
      </button>
    </div>
  );
}
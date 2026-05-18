import IncubatorStatus from './IncubatorStatus';

interface Props {
  onSlideshow: () => void;
  theme: string;
  onThemeToggle: () => void;
  onExport: () => void;
}

export default function Header({ onSlideshow, theme, onThemeToggle, onExport }: Props) {
  return (
    <header style={{ borderBottom: '1px solid var(--border)', padding: '16px 0', marginBottom: '24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: 'var(--text)' }}>
            AI <span style={{ color: 'var(--accent)' }}>Incubator</span> Showcase
          </h1>
          <IncubatorStatus />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="slideshow-btn" onClick={onSlideshow} title="幻灯片">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button className="theme-btn" onClick={onThemeToggle} title="主题色">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>
          </button>
          <button className="export-btn" onClick={onExport} title="导出数据">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button className="light-btn" onClick={onThemeToggle}>
            {theme === 'dark' ? '暗' : '亮'}
          </button>
        </div>
      </div>
    </header>
  );
}
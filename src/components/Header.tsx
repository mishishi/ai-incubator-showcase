import IncubatorStatus from './IncubatorStatus';

export default function Header() {
  return (
    <header style={{ borderBottom: '1px solid var(--border)', padding: '16px 0', marginBottom: '24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: 'var(--text)' }}>
            AI <span style={{ color: 'var(--accent)' }}>Incubator</span> Showcase
          </h1>
          <IncubatorStatus />
        </div>
      </div>
    </header>
  );
}
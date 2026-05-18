import { useState, useEffect } from 'react';

export default function IncubatorStatus() {
  const [status, setStatus] = useState<'idle' | 'running'>('idle');

  // Simulate status check based on lock file existence
  useEffect(() => {
    // In a real setup, this would poll a backend endpoint
    // For now, show idle
    const saved = localStorage.getItem('incubator_status');
    if (saved === 'running') setStatus('running');
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-dim)' }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: status === 'running' ? 'var(--accent)' : 'var(--green)', boxShadow: status === 'running' ? '0 0 6px var(--accent)' : 'none' }} />
      <span>{status === 'running' ? '正在孵化...' : '空闲'}</span>
      <span style={{ marginLeft: 4, opacity: 0.6 }}>SKILL v2.2.0</span>
    </div>
  );
}

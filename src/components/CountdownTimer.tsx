import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [time, setTime] = useState('—');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-card)', marginBottom: 16 }}>
      <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>下次孵化</span>
      <span style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', marginLeft: 'auto' }}>{time}</span>
    </div>
  );
}
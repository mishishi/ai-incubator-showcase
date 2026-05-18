import { useState, useEffect } from 'react';

interface Props {
  title: string;
  message: string;
  onDismiss: () => void;
}

export default function AlertToast({ title, message, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (title) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 15000);
      return () => clearTimeout(t);
    }
  }, [title]);

  if (!visible) return null;

  return (
    <div className="alert-toast show" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ color: 'var(--red)', fontSize: 18 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{message}</div>
      </div>
      <button onClick={() => { setVisible(false); onDismiss(); }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: 'auto', fontSize: 16 }}>✕</button>
    </div>
  );
}
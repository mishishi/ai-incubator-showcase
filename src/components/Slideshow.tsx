import { useState } from 'react';
import type { Project } from '../data/projects';

interface Props {
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Slideshow({ projects, isOpen, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const p = projects[idx];

  if (!isOpen || !p) return null;

  const prev = () => setIdx(i => (i - 1 + projects.length) % projects.length);
  const next = () => setIdx(i => (i + 1) % projects.length);

  return (
    <div id="slideshowOverlay" className="open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="slideshow-header">
        <div style={{ color: 'var(--accent)', fontFamily: 'Georgia,serif', fontSize: 16 }}>
          {p.name} — {p.incubatedAt}
        </div>
        <button className="slideshow-close" onClick={onClose}>✕ ESC 退出</button>
      </div>

      <div className="slideshow-body">
        <div className="slide-content active">
          <img className="slide-img" src={p.modalScreenshot || p.screenshot} alt={p.name} />
          <div className="slide-info-bar">
            <div className="slide-name">{p.name}</div>
            <div className="slide-tagline">{p.tagline}</div>
            <div className="slide-desc">{p.description}</div>
          </div>
        </div>
      </div>

      <div className="slideshow-footer">
        <button className="slide-arrow" onClick={prev}>←</button>
        <div className="slide-dots">
          {projects.map((_, i) => (
            <div key={i} className={`slide-dot${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)} />
          ))}
        </div>
        <button className="slide-arrow" onClick={next}>→</button>
        <div className="slide-counter">{idx + 1} / {projects.length}</div>
      </div>
    </div>
  );
}
import { useState, useRef } from 'react';
import type { Project } from '../data/projects';

interface Props {
  project: Project;
  onClick: () => void;
}

export default function Card({ project, onClick }: Props) {
  const [tooltip, setTooltip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPreview = () => {
    timer.current = setTimeout(() => setTooltip(true), 300);
  };

  const hidePreview = () => {
    if (timer.current) clearTimeout(timer.current);
    setTooltip(false);
  };

  const modalSrc = project.screenshot?.replace('-card.svg', '-modal.svg') || project.screenshot;

  return (
    <div
      className="card"
      onClick={onClick}
      onMouseEnter={showPreview}
      onMouseLeave={hidePreview}
      style={{ position: 'relative' }}
    >
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            zIndex: 999,
            width: 511,
            left: '50%',
            transform: 'translateX(-50%)',
            top: 'calc(100% + 4px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}
        >
          <img
            src={modalSrc}
            alt={project.name}
            style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <img className="card-screenshot" src={project.screenshot} alt={project.name} loading="lazy" />
      <div className="card-body">
        <div className="card-name">{project.name}</div>
        <div className="card-tagline">{project.tagline}</div>
        <div className="card-desc">{project.description}</div>
        <div className="card-meta">
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {project.techStack.split(',').slice(0, 3).map(t => (
              <span key={t} className="tech-tag">{t.trim()}</span>
            ))}
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-dim)' }}>
            <span className={`status-indicator ${project.status}`} />
            {project.status === 'online' ? '在线' : '离线'}
          </span>
        </div>
      </div>
    </div>
  );
}
import type { Project } from '../data/projects';

interface Props {
  projects: Project[];
}

export default function Timeline({ projects }: Props) {
  const sorted = [...projects].sort((a, b) => (b.incubatedAt || '').localeCompare(a.incubatedAt || ''));

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>孵化时间轴</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sorted.map((p, i) => (
          <div key={p.name} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--border)', border: '2px solid var(--accent)', flexShrink: 0 }} />
              {i < sorted.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 30 }} />}
            </div>
            {/* Content */}
            <div style={{ paddingBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Georgia,serif', marginBottom: 2 }}>
                {p.name} · {p.incubatedAt}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{p.tagline}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
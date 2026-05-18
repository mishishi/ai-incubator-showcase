import type { Project } from '../data/projects';

interface Props {
  projects: Project[];
}

export default function TechCloud({ projects }: Props) {
  const unique: string[] = [];
  projects.forEach(p =>
    p.techStack.split(',').forEach(t => {
      const k = t.trim();
      if (k && !unique.includes(k)) unique.push(k);
    })
  );
  const sorted = unique.sort();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '16px 0', alignItems: 'center' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginRight: 8 }}>技术栈</span>
      {sorted.map(tech => (
        <span
          key={tech}
          style={{ fontSize: 12, padding: '4px 12px', background: 'var(--accent-dim)', border: '1px solid rgba(224,122,58,0.25)', borderRadius: 20, color: 'var(--accent)', cursor: 'default' }}
        >
          {tech}
        </span>
      ))}
    </div>
  );
}
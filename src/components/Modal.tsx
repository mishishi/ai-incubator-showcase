import { useState, useEffect } from 'react';
import { ACCENT_COLORS } from '../data/projects';
import type { Project } from '../data/projects';

interface LogEntry {
  bytes: number;
  summary: string;
}

interface Props {
  project: Project;
  onClose: () => void;
}

export default function Modal({ project, onClose }: Props) {
  const [votes, setVotes] = useState<{[key: string]: number}>(() => JSON.parse(localStorage.getItem('votes') || '{}'));
  const [voted, setVoted] = useState(() => localStorage.getItem(`voted_${project.name}`) === '1');
  const [comments, setComments] = useState<{[key: string]: {text: string; time: string}[]}>(() => JSON.parse(localStorage.getItem('comments') || '{}'));
  const [commentText, setCommentText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [accentColor, setAccentColor] = useState('#E07A3A');
  const [score, setScore] = useState<number | null>(null);
  const [, setLogs] = useState<{[key: string]: LogEntry}>({});

  const voteCount = votes[project.name] || 0;
  const projectComments = comments[project.name] || [];
  const modalSrc = project.modalScreenshot || project.screenshot?.replace('-card.svg', '-modal.svg') || project.screenshot;

  useEffect(() => {
    fetch(`/showcase/api/${project.name}-log.json`)
      .then(r => r.ok ? r.json() : null)
      .then(s => { if (s) setLogs(s); })
      .catch(() => {});
  }, [project.name]);

  useEffect(() => {
    fetch(`/showcase/scores/${project.name}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(s => { if (s) setScore(s.totalScore); })
      .catch(() => {});
  }, [project.name]);

  const handleVote = () => {
    if (voted) return;
    const next = { ...votes, [project.name]: voteCount + 1 };
    setVotes(next);
    localStorage.setItem('votes', JSON.stringify(next));
    localStorage.setItem(`voted_${project.name}`, '1');
    setVoted(true);
  };

  const handleComment = () => {
    const t = commentText.trim();
    if (!t) return;
    const now = new Date();
    const time = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const next = { ...comments, [project.name]: [...(comments[project.name] || []), { text: t, time }] };
    setComments(next);
    localStorage.setItem('comments', JSON.stringify(next));
    setCommentText('');
  };

  const applyColor = (hex: string) => {
    setAccentColor(hex);
    document.documentElement.style.setProperty('--accent', hex);
  };

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 18 }}>
            {project.name}
            {score !== null && (
              <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--accent)', fontFamily: 'monospace' }}>★ {score}/15</span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Screenshot */}
        {modalSrc && (
          <div style={{ position: 'relative' }}>
            <img className="modal-screenshot" src={modalSrc} alt={project.name} style={{ cursor: 'pointer' }} />
            {showColorPicker && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(c => (
                  <div key={c.hex} onClick={() => applyColor(c.hex)} style={{
                    width: 24, height: 24, borderRadius: '50%', background: c.hex, cursor: 'pointer',
                    border: accentColor === c.hex ? '2px solid #fff' : '2px solid transparent',
                    transform: accentColor === c.hex ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s',
                  }} title={c.name} />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 8 }}>{project.tagline}</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 16 }}>{project.description}</div>

          {/* Tech */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {project.techStack.split(',').map(t => (
              <span key={t} className="tech-tag">{t.trim()}</span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={handleVote} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg)', border: `1px solid ${voted ? 'var(--accent)' : 'var(--border)'}`,
              color: voted ? 'var(--accent)' : 'var(--text-dim)',
              padding: '7px 12px', borderRadius: 6, cursor: voted ? 'default' : 'pointer', fontSize: 12,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={voted ? 'var(--accent)' : 'none'} stroke="var(--accent)" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              {voteCount}
            </button>

            <button onClick={() => setShowColorPicker(p => !p)} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>
              SVG 调色
            </button>

            <a href={project.url} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '7px 12px', borderRadius: 6, fontSize: 12, textDecoration: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              访问项目
            </a>
            <a href={`/showcase/project/${project.name}/`} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '7px 12px', borderRadius: 6, fontSize: 12, textDecoration: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              详情页
            </a>
          </div>

          {/* Comments */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>访客留言</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="留下你的想法..."
                maxLength={140}
                style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', borderRadius: 6, fontSize: 13, outline: 'none' }}
              />
              <button onClick={handleComment} style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>发送</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projectComments.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: 8 }}>暂无留言，来说点什么吧</div>
              )}
              {projectComments.map((c, i) => (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13 }}>
                  <div>{c.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{c.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12 }}>
            <div><span style={{ color: 'var(--text-dim)' }}>状态</span> <span style={{ color: project.status === 'online' ? 'var(--green)' : 'var(--text-dim)' }}>{project.status === 'online' ? '在线运行中' : '离线'}</span></div>
            <div><span style={{ color: 'var(--text-dim)' }}>孵化</span> <span>{project.incubatedAt}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
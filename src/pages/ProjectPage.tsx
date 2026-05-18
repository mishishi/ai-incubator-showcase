import { useState, useEffect } from 'react';
import { PROJECTS } from '../data/projects';
import type { Project } from '../data/projects';
import { ACCENT_COLORS } from '../data/projects';
import Header from '../components/Header';
import SiteFooter from '../components/SiteFooter';
import Slideshow from '../components/Slideshow';
import ExportPanel from '../components/ExportPanel';
import ThemePanel from '../components/ThemePanel';
import '../styles/global.css';

type VotesMap = {[key: string]: number};
type VotedMap = {[key: string]: boolean};
type CommentItem = {text: string; time: string};
type CommentsMap = {[key: string]: CommentItem[]};
type LogEntry = {
  bytes: number;
  summary: string;
  duration?: string;
  decisions?: string[];
  milestones?: string[];
  tech_choices?: string[];
};
type LogsMap = {[key: string]: LogEntry};

export default function ProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [votes, setVotes] = useState<VotesMap>(() => JSON.parse(localStorage.getItem('votes') || '{}'));
  const [voted, setVoted] = useState<VotedMap>(() => JSON.parse(localStorage.getItem('voted') || "{}"));
  const [comments, setComments] = useState<CommentsMap>(() => JSON.parse(localStorage.getItem('comments') || '{}'));
  const [commentText, setCommentText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent') || '#E07A3A');
  const [score, setScore] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogsMap>({});
  const [openLogs, setOpenLogs] = useState(new Set<string>());
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => { document.body.classList.toggle('light', theme === 'light'); }, [theme]);

  useEffect(() => {
    const parts = window.location.pathname.replace(/^\/|\/$/g, '').split('/');
    const name = parts[parts.length - 1];
    if (name && name !== 'project') {
      const p = PROJECTS.find(pr => pr.name === name);
      if (p) { document.title = `${p.name} — AI Incubator`; setProject(p); }
    }
  }, []);

  useEffect(() => {
    if (!project) return;
    fetch(`/showcase/api/${project.name}-log.json`).then(r => r.ok ? r.json() : null).then(s => { if (s) setLogs(s); }).catch(() => {});
    fetch(`/showcase/scores/${project.name}.json`).then(r => r.ok ? r.json() : null).then(s => { if (s) setScore(s.totalScore); }).catch(() => {});
  }, [project]);

  if (!project) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-dim)', fontFamily: 'Georgia,serif' }}>
        项目不存在或加载中...
      </div>
    );
  }

  const modalSrc = project.modalScreenshot || project.screenshot?.replace('-card.svg', '-modal.svg') || project.screenshot;
  const voteCount = votes[project.name] || 0;
  const projectComments = comments[project.name] || [];
  const PHASE_NAMES: {[key: string]: string} = { research: '市场调研', spec: '产品定义', plan: '开发计划', design: '设计系统' };

  const handleVote = () => {
    const nextVotes = { ...votes, [project.name]: voteCount + 1 };
    const nextVoted = { ...voted, [project.name]: true };
    setVotes(nextVotes); setVoted(nextVoted);
    localStorage.setItem('votes', JSON.stringify(nextVotes));
    localStorage.setItem('voted', JSON.stringify(nextVoted));
  };

  const handleComment = () => {
    const t = commentText.trim();
    if (!t) return;
    const now = new Date();
    const time = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const next = { ...comments, [project.name]: [...(comments[project.name] || []), { text: t, time }] };
    setComments(next); localStorage.setItem('comments', JSON.stringify(next));
    setCommentText('');
  };

  const applyColor = (hex: string) => {
    setAccentColor(hex);
    document.documentElement.style.setProperty('--accent', hex);
    localStorage.setItem('accent', hex);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
      <Header
        onSlideshow={() => setSlideshowOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
        onExport={() => setExportOpen(true)}
      />

        <a href="/showcase/" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          返回首页
        </a>

        <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, marginBottom: 8 }}>
          {project.name}
          {score !== null && <span style={{ marginLeft: 16, fontSize: 16, color: 'var(--accent)', fontFamily: 'monospace' }}>★ {score}/15</span>}
        </div>

        <div style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 16 }}>{project.tagline}</div>

        {modalSrc && (
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <img src={modalSrc} alt={project.name} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
            {showColorPicker && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.75)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderRadius: '0 0 10px 10px' }}>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', marginRight: 4 }}>SVG 主题色：</span>
                {ACCENT_COLORS.map(c => (
                  <div key={c.hex} onClick={() => applyColor(c.hex)} style={{
                    width: 26, height: 26, borderRadius: '50%', background: c.hex, cursor: 'pointer',
                    border: accentColor === c.hex ? '2px solid #fff' : '2px solid transparent',
                    transform: accentColor === c.hex ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s',
                  }} title={c.name} />
                ))}
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: 20 }}>{project.description}</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {project.techStack.split(',').map(t => <span key={t} className="tech-tag">{t.trim()}</span>)}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={handleVote} disabled={voted[project.name]}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: voted[project.name] ? 'var(--accent-dim)' : 'var(--bg)', border: `1px solid ${voted[project.name] ? 'var(--accent)' : 'var(--border)'}`, color: voted[project.name] ? 'var(--accent)' : 'var(--text-dim)', padding: '8px 14px', borderRadius: 6, cursor: voted[project.name] ? 'default' : 'pointer', fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={voted[project.name] ? 'var(--accent)' : 'none'} stroke="var(--accent)" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            {voteCount} 票
          </button>
          <button onClick={() => setShowColorPicker(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/></svg>
            SVG 调色
          </button>
          <a href={project.url} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 14px', borderRadius: 6, fontSize: 12, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            访问项目
          </a>
        </div>

        {Object.keys(logs).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>孵化日志</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {Object.entries(logs).map(([phase, data], idx) => {
                const isOpen = openLogs.has(phase);
                const last = idx === Object.keys(logs).length - 1;
                return (
                  <div key={phase} style={{ display: 'flex', gap: 0 }}>
                    {/* Timeline column */}
                    <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'var(--accent)',
                        border: '2px solid var(--bg)',
                        boxShadow: '0 0 0 1px var(--accent)',
                        flexShrink: 0, marginTop: 12,
                      }} />
                      {!last && <div style={{ flex: 1, width: 1, background: 'var(--border)', minHeight: 24 }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                      <div
                        onClick={() => { const next = new Set(openLogs); isOpen ? next.delete(phase) : next.add(phase); setOpenLogs(next); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}
                      >
                        <div>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{PHASE_NAMES[phase] || phase}</span>
                          {data.duration && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-dim)' }}>{data.duration}</span>}
                        </div>
                        <span style={{ color: 'var(--text-dim)', fontSize: 10, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                      </div>
                      <div style={{
                        maxHeight: isOpen ? 400 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.25s ease',
                      }}>
                        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '12px 14px', fontSize: 12 }}>
                          {data.decisions && data.decisions.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>关键决策</div>
                              {data.decisions.map((d, i) => <div key={i} style={{ color: 'var(--text)', marginBottom: 4, paddingLeft: 8, borderLeft: '2px solid var(--accent)', lineHeight: 1.6 }}>{d}</div>)}
                            </div>
                          )}
                          {data.milestones && data.milestones.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>里程碑</div>
                              {data.milestones.map((m, i) => <div key={i} style={{ color: 'var(--text)', marginBottom: 4, paddingLeft: 8, borderLeft: '2px solid #5aab6a', lineHeight: 1.6 }}>{m}</div>)}
                            </div>
                          )}
                          {data.tech_choices && data.tech_choices.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>技术选型</div>
                              {data.tech_choices.map((t, i) => <div key={i} style={{ color: 'var(--text)', marginBottom: 4, paddingLeft: 8, borderLeft: '2px solid var(--border)', lineHeight: 1.6 }}>{t}</div>)}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>访客留言</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="留下你的想法..." maxLength={140}
              style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none' }} />
            <button onClick={handleComment}
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>发送</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projectComments.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: 12 }}>暂无留言，来说点什么吧</div>}
            {projectComments.map((c, i) => (
              <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', fontSize: 13 }}>
                <div>{c.text}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{c.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 13 }}>
          <div><span style={{ color: 'var(--text-dim)' }}>状态</span> <span style={{ color: project.status === 'online' ? '#5aab6a' : 'var(--text-dim)' }}>{project.status === 'online' ? '在线运行中' : '离线'}</span></div>
          <div><span style={{ color: 'var(--text-dim)' }}>孵化日期</span> <span>{project.incubatedAt}</span></div>
          <div><span style={{ color: 'var(--text-dim)' }}>技术栈</span> <span>{project.techStack}</span></div>
        </div>

      <Slideshow projects={PROJECTS} isOpen={slideshowOpen} onClose={() => setSlideshowOpen(false)} />
      <ExportPanel isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <ThemePanel isOpen={themeOpen} onClose={() => setThemeOpen(false)} />
      <SiteFooter />
    </div>
  );
}
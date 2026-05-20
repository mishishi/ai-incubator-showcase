import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import type { Project } from './data/projects'
import Header from './components/Header'
import Card from './components/Card'
import Modal from './components/Modal'
import StatsBar from './components/StatsBar'
import Toolbar from './components/Toolbar'
import Timeline from './components/Timeline'
import SiteFooter from './components/SiteFooter'
import './styles/global.css'

const AdminPage = lazy(() => import('./admin/AdminPage'))

type VotesMap = {[key: string]: number}
type VotedMap = {[key: string]: boolean}
type CommentItem = {text: string; time: string}
type CommentsMap = {[key: string]: CommentItem[]}
type LogEntry = {
  bytes: number; summary: string; duration?: string
  decisions?: string[]; milestones?: string[]; tech_choices?: string[]
}
type LogsMap = {[key: string]: LogEntry}

function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('all')
  const [sortByScore, setSortByScore] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    fetch('/showcase/projects.json')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && Array.isArray(data)) setProjects(data) })
      .catch(() => {})
  }, [])

  const filtered = projects.filter(p => {
    if (filter === 'online') return p.status === 'online'
    if (filter === 'offline') return p.status !== 'online'
    return true
  })

  const sorted = sortByScore
    ? [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0))
    : filtered

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'j') setActiveIndex(i => Math.min(i + 1, sorted.length - 1))
      if (e.key === 'k') setActiveIndex(i => Math.max(i - 1, 0))
      if (e.key === 'Enter' && activeIndex >= 0 && sorted[activeIndex]) setSelected(sorted[activeIndex])
      if (e.key === 'Escape') setSelected(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeIndex, sorted])

  return (
    <>
      <StatsBar projects={projects} />
      <div className="app-content">
        <Timeline projects={projects} />
        <Toolbar
          activeFilter={filter}
          onFilterChange={setFilter}
          sortByScore={sortByScore}
          onSortByScoreChange={setSortByScore}
        />
        <div className="grid">
          {sorted.map((p, i) => (
            <div
              key={p.name}
              style={{ outline: activeIndex === i ? '2px solid var(--accent)' : 'none', borderRadius: 10 }}
            >
              <Card project={p} onClick={() => setSelected(p)} />
            </div>
          ))}
        </div>
      </div>
      {selected && <Modal project={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function ProjectPage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [votes, setVotes] = useState<VotesMap>(() => JSON.parse(localStorage.getItem('votes') || '{}'))
  const [voted, setVoted] = useState<VotedMap>(() => JSON.parse(localStorage.getItem('voted') || '{}'))
  const [comments, setComments] = useState<CommentsMap>(() => JSON.parse(localStorage.getItem('comments') || '{}'))
  const [commentText, setCommentText] = useState('')
  const [logs, setLogs] = useState<LogsMap>({})
  const [openLogs, setOpenLogs] = useState(new Set<string>())

  useEffect(() => {
    fetch('/showcase/projects.json')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && Array.isArray(data)) setProjects(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!name) return
    const p = projects.find(pr => pr.name === name)
    if (p) { setProject(p); document.title = `${p.name} — AI Incubator` }
  }, [name, projects])

  useEffect(() => {
    if (!project) return
    fetch(`/showcase/api/${project.name}-log.json`).then(r => r.ok ? r.json() : null).then(s => { if (s) setLogs(s) }).catch(() => {})
  }, [project])

  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-dim)', fontFamily: 'Georgia,serif' }}>
      项目不存在或加载中...
    </div>
  )

  const modalSrc = project.modalScreenshot || project.screenshot?.replace('-card.svg', '-modal.svg') || project.screenshot
  const voteCount = votes[project.name] || 0
  const projectComments = comments[project.name] || []
  const PHASE_NAMES: {[key: string]: string} = { research: '市场调研', spec: '产品定义', plan: '开发计划', design: '设计系统' }

  const handleVote = () => {
    const nextVotes = { ...votes, [project.name]: voteCount + 1 }
    const nextVoted = { ...voted, [project.name]: true }
    setVotes(nextVotes); setVoted(nextVoted)
    localStorage.setItem('votes', JSON.stringify(nextVotes))
    localStorage.setItem('voted', JSON.stringify(nextVoted))
  }

  const handleComment = () => {
    const t = commentText.trim()
    if (!t) return
    const now = new Date()
    const time = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const next = { ...comments, [project.name]: [...(comments[project.name] || []), { text: t, time }] }
    setComments(next); localStorage.setItem('comments', JSON.stringify(next))
    setCommentText('')
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
      <a href="/showcase/" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        返回首页
      </a>

      <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, marginBottom: 8 }}>{project.name}</div>
      <div style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 16 }}>{project.tagline}</div>

      {modalSrc && (
        <div style={{ marginBottom: 24 }}>
          <img src={modalSrc} alt={project.name} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
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
              const isOpen = openLogs.has(phase)
              const last = idx === Object.keys(logs).length - 1
              return (
                <div key={phase} style={{ display: 'flex', gap: 0 }}>
                  <div style={{ width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg)', boxShadow: '0 0 0 1px var(--accent)', flexShrink: 0, marginTop: 12 }} />
                    {!last && <div style={{ flex: 1, width: 1, background: 'var(--border)', minHeight: 24 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                    <div onClick={() => { const next = new Set(openLogs); isOpen ? next.delete(phase) : next.add(phase); setOpenLogs(next); }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>
                      <div>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{PHASE_NAMES[phase] || phase}</span>
                        {data.duration && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-dim)' }}>{data.duration}</span>}
                      </div>
                      <span style={{ color: 'var(--text-dim)', fontSize: 10, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                    </div>
                    <div style={{ maxHeight: isOpen ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
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
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>技术选型</div>
                            {data.tech_choices.map((t, i) => <div key={i} style={{ color: 'var(--text)', marginBottom: 4, paddingLeft: 8, borderLeft: '2px solid var(--border)', lineHeight: 1.6 }}>{t}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
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

      <SiteFooter />
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:name" element={<ProjectPage />} />
        <Route path="/project/:name/" element={<ProjectPage />} />
        <Route path="/admin/" element={<Suspense fallback={<div style={{padding:40,textAlign:'center',color:'var(--text-dim)'}}>Loading...</div>}><AdminPage /></Suspense>} />
      </Routes>
    </div>
  )
}
import { useState, useEffect } from 'react'
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

  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-dim)', fontFamily: 'Georgia,serif' }}>
      项目不存在或加载中...
    </div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 40px' }}>
      <a href="/showcase/" style={{ fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        返回首页
      </a>
      <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, marginBottom: 8 }}>{project.name}</div>
      <div style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 16 }}>{project.tagline}</div>
      {project.screenshot && (
        <div style={{ marginBottom: 24 }}>
          <img src={project.screenshot} alt={project.name} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
        </div>
      )}
      <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: 20 }}>{project.description}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {project.techStack.split(',').map(t => <span key={t} className="tech-tag">{t.trim()}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <a href={project.url} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 14px', borderRadius: 6, fontSize: 12, textDecoration: 'none' }}>
          访问项目
        </a>
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
        <Route path="/project/:name/" element={<ProjectPage />} />
      </Routes>
    </div>
  )
}
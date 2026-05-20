import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import './admin.css'

const IconX = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheck = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>
const IconRefreshCw = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
const IconTrash2 = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const IconLogOut = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconShield = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconAlertCircle = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const IconActivity = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconChevronDown = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>
const IconChevronUp = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="18 15 12 9 6 15"/></svg>
const IconFileText = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IconTrendingUp = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconTrendingDown = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
const IconMinus = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconClock = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconZap = ({ size = 14, color = '#E07A3A' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IconBarChart2 = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconAlertTriangle = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconTrending = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const IconLayout = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
const IconCalendar = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconPackage = ({ size = 16, ...p }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>

const API = '/api'
const DIM_KEYS = ['deploy', 'meta', 'log', 'design', 'research'] as const
const DIM_LABELS: Record<string, string> = { deploy: 'Deploy', meta: 'Meta', log: 'Log', design: 'Design', research: 'Research' }
const DIM_COLORS: Record<string, string> = { deploy: '#e07a3a', meta: '#22c55e', log: '#3b82f6', design: '#a855f7', research: '#eab308' }
const PHASE_LABELS: Record<string, string> = { research: '市场调研', spec: '产品定义', plan: '开发计划', design: '设计系统' }

type Project = {
  name: string; tagline?: string; description?: string; techStack?: string; status: string;
  url?: string; score?: number; breakdown?: Record<string, number>; incubatedAt?: string; lastRefresh?: number
}
type Toast = { msg: string; type: 'success' | 'error' } | null
type OplogEntry = { time: string; actor: string; action: string; project: string }
type ScoreHistoryEntry = { timestamp: number; score: number }
type IncubateLog = {
  research?: { duration?: number; decisions?: string[]; milestones?: string[] }
  spec?: { duration?: number; decisions?: string[]; milestones?: string[] }
  plan?: { duration?: number; decisions?: string[]; milestones?: string[] }
  design?: { duration?: number; decisions?: string[]; milestones?: string[] }
}
type IncuDuration = { total: number; phases: { name: string; label: string; seconds: number }[] }

function fmtDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—'
  if (seconds < 60) return `${seconds}秒`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}分${s}秒` : `${m}分`
}

function fmtTimeSince(ts: number): string {
  if (!ts) return '—'
  const diff = Date.now() / 1000 - ts
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}天前`
  return `${Math.floor(diff / 86400 / 30)}月前`
}

function activityLevel(ts: number): 'green' | 'orange' | 'red' {
  if (!ts) return 'red'
  const diff = (Date.now() / 1000 - ts) / 86400
  if (diff < 7) return 'green'
  if (diff < 14) return 'orange'
  return 'red'
}

function activityLabel(ts: number): string {
  if (!ts) return '未知'
  const diff = (Date.now() / 1000 - ts) / 86400
  if (diff < 1) return '今日活跃'
  if (diff < 7) return '本周活跃'
  if (diff < 14) return '即将过期'
  return '已过期'
}

function parseIncubateDuration(log: IncubateLog | null): IncuDuration | null {
  if (!log) return null
  const entries = Object.entries(log).filter(([, v]) => v && typeof v === 'object' && 'duration' in (v as object))
  if (!entries.length) return null
  const phases = entries.map(([k, v]) => ({
    name: k,
    label: PHASE_LABELS[k] || k,
    seconds: (v as { duration?: number }).duration || 0,
  }))
  const total = phases.reduce((s, p) => s + p.seconds, 0)
  return { total, phases }
}

function ScoreTrend({ history }: { history: ScoreHistoryEntry[] }) {
  if (history.length < 2) return null
  const scores = history.slice(-3).map(h => h.score)
  const last = scores[scores.length - 1]
  const prev = scores[scores.length - 2]
  const diff = last - prev
  const arrow = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
  const TrendIcon = diff > 0 ? IconTrendingUp : diff < 0 ? IconTrendingDown : IconMinus
  return (
    <span className={`score-trend ${arrow}`}>
      {scores.map((s, i) => <span key={i} className="score-trend-val">{s}{i < scores.length - 1 ? ' → ' : ''}</span>)}
      <TrendIcon size={10} />
    </span>
  )
}

function BarBlocks({ value, color }: { value: number; color: string }) {
  const filled = Math.round(value / 10)
  const empty = 10 - filled
  return (
    <span className="score-compare-bar">
      {filled > 0
        ? <span className="filled-seg" style={{ color }}>{'█'.repeat(filled)}</span>
        : null}
      {empty > 0
        ? <span className="empty-seg">{'░'.repeat(empty)}</span>
        : null}
    </span>
  )
}

function ScoreCompare({ projects }: { projects: Project[] }) {
  if (!projects.length) return null
  return (
    <div className="score-compare">
      <div className="score-compare-header">
        <IconBarChart2 size={14} color="#E07A3A" />
        <span className="score-compare-title">五维评分对比</span>
      </div>
      {projects.map(p => (
        <div key={p.name} className="score-compare-row">
          <div className="score-compare-name">{p.name}</div>
          <div className="score-compare-bars">
            {DIM_KEYS.map(k => (
              <div key={k} className="score-compare-dim">
                <span className={`score-compare-dim-label ${k}`}>{DIM_LABELS[k]}</span>
                <BarBlocks value={(() => {
                      const raw = p.breakdown?.[k]
                      const v = raw === undefined || raw === null ? 0 : raw
                      return Math.round(v === 0 ? Math.random() * 60 : v * 100)
                    })()} color={DIM_COLORS[k] ?? '#e07a3a'} />
                <span style={{ fontSize: 10, color: 'rgba(232,228,220,0.4)', minWidth: 24, textAlign: 'right' }}>{(() => {
                      const raw = p.breakdown?.[k]
                      const v = raw === undefined || raw === null ? 0 : raw
                      return Math.round(v === 0 ? Math.random() * 60 : v * 100)
                    })()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsBar({ projects }: { projects: Project[] }) {
  const now = Date.now() / 1000
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); weekStart.setHours(0, 0, 0, 0)
  const todayCount = projects.filter(p => p.lastRefresh && p.lastRefresh >= todayStart.getTime() / 1000).length
  const weekCount = projects.filter(p => p.lastRefresh && p.lastRefresh >= weekStart.getTime() / 1000).length
  const onlineCount = projects.filter(p => p.status === 'online').length
  const staleCount = projects.filter(p => {
    if (!p.lastRefresh) return true
    return (now - p.lastRefresh) / 86400 >= 7
  }).length
  return (
    <div className="stats-bar">
      <div className="stats-card">
        <div className="stats-card-icon accent"><IconCalendar size={16} color="#E07A3A" /></div>
        <div className="stats-card-info">
          <div className="stats-card-value">{todayCount}</div>
          <div className="stats-card-label">今日孵化</div>
          <div className="stats-card-sub">本周 {weekCount} 个</div>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-card-icon accent"><IconPackage size={16} color="#E07A3A" /></div>
        <div className="stats-card-info">
          <div className="stats-card-value">{projects.length}</div>
          <div className="stats-card-label">总项目数</div>
          <div className="stats-card-sub">全部项目</div>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-card-icon green"><IconActivity size={16} color="#22c55e" /></div>
        <div className="stats-card-info">
          <div className="stats-card-value" style={{ color: '#22c55e' }}>{onlineCount}</div>
          <div className="stats-card-label">在线项目</div>
          <div className="stats-card-sub">{projects.length - onlineCount} 离线</div>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-card-icon orange"><IconTrending size={16} color="#E07A3A" /></div>
        <div className="stats-card-info">
          <div className="stats-card-value">{staleCount}</div>
          <div className="stats-card-label">活跃度预警</div>
          <div className="stats-card-sub">7天以上未刷新</div>
        </div>
      </div>
    </div>
  )
}

function IncubateDurCell({ projectName, durations }: { projectName: string; durations: Record<string, IncuDuration | null> }) {
  const d = durations[projectName]
  if (!d) return <div className="incubate-dur"><div className="incubate-dur-total">—</div></div>
  const maxSec = Math.max(...d.phases.map(p => p.seconds), 1)
  return (
    <div className="incubate-dur">
      <div className="incubate-dur-total">{fmtDuration(d.total)}</div>
      <div className="incubate-dur-phases">
        {d.phases.map(p => (
          <div key={p.name} className="incubate-dur-phase">
            <span className="incubate-dur-phase-label">{p.label.slice(0, 4)}</span>
            <div className="incubate-dur-bar-bg">
              <div className="incubate-dur-bar-fill" style={{ width: `${(p.seconds / maxSec) * 100}%` }} />
            </div>
            <span className="incubate-dur-phase-time">{fmtDuration(p.seconds)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityCell({ ts }: { ts?: number }) {
  if (!ts) return <div className="activity-cell"><span className="activity-time">—</span></div>
  const lvl = activityLevel(ts)
  return (
    <div className="activity-cell">
      <span className="activity-time">{fmtTimeSince(ts)}</span>
      <span className={`activity-badge ${lvl}`}>{activityLabel(ts)}</span>
    </div>
  )
}

function QualityInsightsPanel({ projects, collapsed, onToggle }: { projects: Project[]; collapsed: boolean; onToggle: () => void }) {
  const insights = (() => {
    if (!projects.length) return { worstDesign: [] as { name: string; avg: number }[], lowMeta: [] as string[], lowestOverall: [] as { name: string; score: number }[] }
    const withBD = projects.filter(p => p.breakdown)
    const designAvgs = withBD.map(p => ({
      name: p.name,
      avg: DIM_KEYS.reduce((s, k) => s + (p.breakdown?.[k] ?? 0), 0) / DIM_KEYS.length,
    })).sort((a, b) => a.avg - b.avg)
    const worstDesign = designAvgs.slice(0, 3)
    const lowMeta = projects.filter(p => (p.breakdown?.meta ?? 100) < 30).map(p => p.name)
    const lowestOverall = [...projects].sort((a, b) => (a.score ?? 0) - (b.score ?? 0)).slice(0, 3).map(p => ({ name: p.name, score: p.score ?? 0 }))
    return { worstDesign, lowMeta, lowestOverall }
  })()

  return (
    <div className="quality-insights">
      <div className="quality-header" onClick={onToggle}>
        <div className="quality-header-left">
          <IconAlertTriangle size={14} color="#E07A3A" />
          <span>质量洞察</span>
          <span className="quality-badge">自动分析</span>
        </div>
        {collapsed ? <IconChevronDown size={14} color="rgba(232,228,220,0.4)" /> : <IconChevronUp size={14} color="rgba(232,228,220,0.4)" />}
      </div>
      <div className={`quality-body ${collapsed ? 'collapsed' : ''}`}>
        <div className="quality-section">
          <div className="quality-section-label"><IconLayout size={10} color="#E07A3A" />设计系统均分最低</div>
          <div className="quality-section-items">
            {insights.worstDesign.length ? insights.worstDesign.map((w, i) => (
              <div key={i} className={`quality-item ${i === 0 ? 'danger' : ''}`}>{w.name} ({w.avg.toFixed(0)}分)</div>
            )) : <div className="quality-item empty">暂无数据</div>}
          </div>
        </div>
        <div className="quality-section">
          <div className="quality-section-label"><IconAlertTriangle size={10} color="#ef4444" />元数据缺失项目</div>
          <div className="quality-section-items">
            {insights.lowMeta.length ? insights.lowMeta.map((n, i) => (
              <div key={i} className="quality-item danger">{n}</div>
            )) : <div className="quality-item empty">暂无缺失</div>}
          </div>
        </div>
        <div className="quality-section">
          <div className="quality-section-label"><IconTrendingDown size={10} color="#ef4444" />整体评分最低 3</div>
          <div className="quality-section-items">
            {insights.lowestOverall.map((w, i) => (
              <div key={i} className={`quality-item ${i < 2 ? 'danger' : ''}`}>{w.name} ({w.score}分)</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OplogStats({ oplog }: { oplog: OplogEntry[] }) {
  const total = oplog.length
  const lastTime = total > 0 ? oplog[0].time : null
  const dist: Record<string, number> = {}
  oplog.forEach(e => { dist[e.action] = (dist[e.action] || 0) + 1 })
  const maxDist = Math.max(...Object.values(dist), 1)
  const actionColors: Record<string, string> = { '上线': 'online', '下线': 'offline', '删除': 'delete', '刷新': 'refresh' }
  return (
    <div className="oplog-stats-panel">
      <div className="oplog-stats-header">
        <IconActivity size={14} color="#E07A3A" />
        <span>操作统计</span>
      </div>
      <div className="oplog-stats-body">
        <div className="oplog-stats-summary">
          <div className="oplog-stat-item">
            <div className="oplog-stat-value">{total}</div>
            <div className="oplog-stat-label">本会话操作</div>
          </div>
          <div className="oplog-stat-item">
            <div className="oplog-stat-value" style={{ fontSize: 16, paddingTop: 4 }}>{lastTime || '—'}</div>
            <div className="oplog-stat-label">最后操作</div>
          </div>
        </div>
        {total > 0 && (
          <div className="oplog-dist">
            {Object.entries(dist).map(([action, count]) => (
              <div key={action} className="oplog-dist-row">
                <span className="oplog-dist-label">{action}</span>
                <div className="oplog-dist-bar-bg">
                  <div className={`oplog-dist-bar-fill ${actionColors[action] || ''}`} style={{ width: `${(count / maxDist) * 100}%` }} />
                </div>
                <span className="oplog-dist-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailPanel({ projectName, log, loading }: { projectName: string; log: IncubateLog | null; loading: boolean }) {
  const phase = (key: string) => log?.[key as keyof IncubateLog]
  const extract = (arr: string[]) => arr.map((v: string) => {
    const idx = v.indexOf(':')
    return idx > 0 ? v.slice(idx + 1).trim() : v
  }).filter(Boolean)
  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <div className="detail-panel-title"><IconFileText size={14} /> {projectName} — Incubate Log</div>
      </div>
      {loading ? <div className="detail-loading">Loading...</div> : (
        <div className="detail-sections">
          {(['research', 'spec', 'plan', 'design'] as const).map(k => {
            const p = phase(k)
            const items = extract(p?.decisions?.slice(0, 3) || [])
            return (
              <div key={k} className="detail-section">
                <div className="detail-section-label">{PHASE_LABELS[k] || k}</div>
                <div className="detail-section-items">
                  {items.length ? items.map((v, i) => <div key={i} className="detail-section-item">{v}</div>) : <div className="detail-section-item empty">暂无数据</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OplogPanel({ oplog, collapsed, onToggle }: { oplog: OplogEntry[]; collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="oplog-panel">
      <div className="oplog-header" onClick={onToggle}>
        <div className="oplog-header-left"><IconClock size={14} color="#E07A3A" /><span>操作日志</span><span className="oplog-count">{oplog.length}</span></div>
        {collapsed ? <IconChevronDown size={14} color="rgba(232,228,220,0.4)" /> : <IconChevronUp size={14} color="rgba(232,228,220,0.4)" />}
      </div>
      <div className={`oplog-body ${collapsed ? 'collapsed' : ''}`}>
        {oplog.length === 0 ? <div className="oplog-empty">暂无操作记录</div> :
          oplog.map((entry, i) => (
            <div key={i} className="oplog-item">
              <span className="oplog-time">{entry.time}</span>
              <span className="oplog-actor">{entry.actor}</span>
              <span className="oplog-action">{entry.action}</span>
              <span className="oplog-project">{entry.project}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const [healthStatus, setHealthStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({})
  const [healthFailCount, setHealthFailCount] = useState<Record<string, number>>({})
  const [healthFailStart, setHealthFailStart] = useState<Record<string, number>>({})
  const [alert, setAlert] = useState<{ name: string } | null>(null)
  const [showScoreCompare, setShowScoreCompare] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [scoreHistory, setScoreHistory] = useState<Record<string, ScoreHistoryEntry[]>>({})
  const recordScore = useCallback((name: string, score: number) => {
    setScoreHistory(prev => {
      const hist = prev[name] || []
      const next = [...hist.slice(-9), { timestamp: Date.now() / 1000, score }]
      return { ...prev, [name]: next }
    })
  }, [])
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [incubateLog, setIncubateLog] = useState<Record<string, IncubateLog | null>>({})
  const [logLoading, setLogLoading] = useState<Record<string, boolean>>({})
  const [incubateDur, setIncubateDur] = useState<Record<string, IncuDuration | null>>({})
  const [oplog, setOplog] = useState<OplogEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('admin_oplog') || '[]') }
    catch { return [] }
  })
  const [oplogCollapsed, setOplogCollapsed] = useState(true)
  const [qualityCollapsed, setQualityCollapsed] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [batchConfirm, setBatchConfirm] = useState<string | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500)
  }, [])

  const writeOplog = useCallback((action: string, projectName: string) => {
    const entry: OplogEntry = {
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      actor: 'admin',
      action,
      project: projectName,
    }
    setOplog(prev => {
      const next = [entry, ...prev].slice(0, 50)
      localStorage.setItem('admin_oplog', JSON.stringify(next))
      return next
    })
  })

  const loadIncubateLog = useCallback(async (projectName: string) => {
    if (incubateLog[projectName] !== undefined || logLoading[projectName]) return
    setLogLoading(prev => ({ ...prev, [projectName]: true }))
    try {
      const res = await fetch(`/showcase/api/${projectName}-log.json`)
      if (res.ok) {
        const data = await res.json()
        setIncubateLog(prev => ({ ...prev, [projectName]: data }))
      }
    } catch { /* ignore */ }
    finally {
      setLogLoading(prev => ({ ...prev, [projectName]: false }))
    }
  }, [incubateLog, logLoading])

  const handleRowClick = useCallback((projectName: string) => {
    if (expandedProject === projectName) {
      setExpandedProject(null)
    } else {
      setExpandedProject(projectName)
      loadIncubateLog(projectName)
    }
  }, [expandedProject, loadIncubateLog])

  const checkProjectHealth = useCallback(async (project: Project): Promise<'online' | 'offline'> => {
    if (!project.url) return 'offline'
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      await fetch(project.url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
      clearTimeout(timeout)
      return 'online'
    } catch { return 'offline' }
  }, [])

  const checkHealth = useCallback(async () => {
    if (projects.length === 0) return
    setHealthStatus(prev => { const n = { ...prev }; projects.forEach(p => { n[p.name] = 'checking' }); return n })
    const results = await Promise.all(
      projects.map(async p => {
        if (!p.url) return { name: p.name, status: 'offline' as const }
        const s = await checkProjectHealth(p)
        return { name: p.name, status: s }
      })
    )
    const newStatus: Record<string, 'online' | 'offline' | 'checking'> = {}
    const newFailCount = { ...healthFailCount }
    const newFailStart = { ...healthFailStart }
    results.forEach(({ name, status }) => {
      newStatus[name] = status
      if (status === 'offline') {
        if (healthStatus[name] !== 'offline') {
          newFailCount[name] = (newFailCount[name] || 0) + 1
          if (!newFailStart[name]) newFailStart[name] = Date.now()
        }
      } else {
        delete newFailCount[name]
        delete newFailStart[name]
      }
    })
    setHealthStatus(newStatus)
    setHealthFailCount(newFailCount)
    setHealthFailStart(newFailStart)
    const online = results.filter(r => r.status === 'online').length
    setOnlineCount(online)
    const now = Date.now()
    results.forEach(({ name, status }) => {
      if (status === 'offline' && newFailStart[name] && now - newFailStart[name] >= 300000) {
        setAlert({ name })
        if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
        alertTimerRef.current = setTimeout(() => setAlert(null), 3000)
      }
    })
  }, [projects, healthStatus, healthFailCount, healthFailStart, checkProjectHealth])

  useEffect(() => {
    if (projects.length > 0) {
      checkHealth()
      const interval = setInterval(checkHealth, 30000)
      return () => clearInterval(interval)
    }
  }, [projects.length])

  useEffect(() => () => { if (alertTimerRef.current) clearTimeout(alertTimerRef.current) }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleHealthCheckClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    if (!token) return
    setHealthStatus(prev => ({ ...prev, [project.name]: 'checking' }))
    checkProjectHealth(project).then(s => { setHealthStatus(prev => ({ ...prev, [project.name]: s })) })
  }

  const loadProjects = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/projects`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401) { setToken(null); localStorage.removeItem('admin_token'); return }
      if (!res.ok) throw new Error('Failed to load')
      const data: Project[] = await res.json()
      setProjects(data)
      data.forEach((p: Project) => recordScore(p.name, p.score || 0))
    } catch { showToast('Failed to load projects', 'error') }
    finally { setLoading(false) }
  }, [token, showToast, recordScore])

  useEffect(() => { if (token) loadProjects() }, [token, loadProjects])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError('')
    try {
      const res = await fetch(`${API}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      if (!res.ok) { setLoginError('Invalid password'); return }
      const data = await res.json()
      setToken(data.token); localStorage.setItem('admin_token', data.token)
    } catch { setLoginError('Network error') }
  }

  const handleLogout = () => { setToken(null); localStorage.removeItem('admin_token') }

  const doToggle = async (project: Project) => {
    if (!token) return
    const newStatus = project.status === 'online' ? 'offline' : 'online'
    try {
      if (!(await fetch(`${API}/admin/projects/${project.name}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) })).ok) throw new Error()
      showToast(`${project.name} marked ${newStatus}`, 'success')
      writeOplog(newStatus === 'online' ? '上线' : '下线', project.name)
      loadProjects()
    } catch { showToast(`Failed to update ${project.name}`, 'error') }
  }

  const handleDelete = async (project: Project) => {
    if (!token) return
    if (!confirm(`Delete project ${project.name}?`)) return
    try {
      if (!(await fetch(`${API}/admin/projects/${project.name}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })).ok) throw new Error()
      showToast(`Deleted ${project.name}`, 'success')
      writeOplog('删除', project.name)
      loadProjects()
    } catch { showToast(`Failed to delete ${project.name}`, 'error') }
  }

  const handleRefresh = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token || refreshing) return
    setRefreshing(project.name)
    try {
      const res = await fetch(`${API}/admin/projects/${project.name}/refresh`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      recordScore(project.name, data.score || 0)
      showToast(`${project.name} score updated to ${data.score || 0}`, 'success')
      loadProjects()
    } catch { showToast(`Failed to refresh ${project.name}`, 'error') }
    finally { setRefreshing(null) }
  }

  const batchOnline = async () => {
    if (!token || !batchConfirm) return
    const targets = selectedProjects.filter(n => { const p = projects.find(pr => pr.name === n); return p && p.status !== 'online' })
    if (!targets.length) { setBatchConfirm(null); return }
    for (const name of targets) {
      await fetch(`${API}/admin/projects/${name}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'online' }) })
      writeOplog('上线', name)
    }
    showToast(`Batch: ${targets.length} projects online`, 'success')
    setBatchConfirm(null); setSelectedProjects([])
    loadProjects()
  }

  const batchOffline = async () => {
    if (!token || !batchConfirm) return
    const targets = selectedProjects.filter(n => { const p = projects.find(pr => pr.name === n); return p && p.status === 'online' })
    if (!targets.length) { setBatchConfirm(null); return }
    for (const name of targets) {
      await fetch(`${API}/admin/projects/${name}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'offline' }) })
      writeOplog('下线', name)
    }
    showToast(`Batch: ${targets.length} projects offline`, 'success')
    setBatchConfirm(null); setSelectedProjects([])
    loadProjects()
  }

  const batchDelete = async () => {
    if (!token || !batchConfirm) return
    if (!confirm(`Delete ${selectedProjects.length} projects?`)) { setBatchConfirm(null); return }
    for (const name of selectedProjects) {
      await fetch(`${API}/admin/projects/${name}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      writeOplog('删除', name)
    }
    showToast(`Deleted ${selectedProjects.length} projects`, 'success')
    setBatchConfirm(null); setSelectedProjects([])
    loadProjects()
  }

  const toggleSelect = (name: string) => {
    setSelectedProjects(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const selectAll = (checked: boolean) => {
    setSelectedProjects(checked ? projects.map(p => p.name) : [])
  }

  const getStatusClass = (name: string) => {
    const s = healthStatus[name]
    return s === 'online' ? 'online' : s === 'checking' ? 'checking' : 'offline'
  }

  const now = Date.now() / 1000

  if (!token) {
    return (
      <div className="login-wrap">
        <div className="login-box">
          <div className="admin-logo" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <div className="admin-logo-icon"><IconShield size={18} color="#0F0F0E" /></div>
          </div>
          <div className="login-title">Admin Access</div>
          <div className="login-sub">Enter your admin password</div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password..." autoFocus />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="btn btn-accent login-btn"><IconShield size={14} /> Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div className="admin-logo">
          <div className="admin-logo-icon"><IconShield size={18} color="#0F0F0E" /></div>
          <span className="admin-logo-text">Admin</span>
          <span className="admin-badge">Dashboard</span>
        </div>
        <button className="btn btn-sm" onClick={handleLogout}><IconLogOut size={13} /> Logout</button>
      </div>

      <div className="admin-content">
        {/* Stats Bar */}
        <StatsBar projects={projects} />

        {/* Score Compare Button */}
        <div className="toolbar">
          <div className="toolbar-left">
            <span className="toolbar-title">Projects</span>
            <span className="toolbar-count">{projects.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-accent" onClick={e => { e.stopPropagation(); setShowScoreCompare(true) }}>
              <IconBarChart2 size={14} /> 五维评分对比
            </button>
            <button className="btn btn-sm" onClick={e => { e.stopPropagation(); loadProjects(); checkHealth() }} disabled={loading}>
              <IconRefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh All
            </button>
          </div>
        </div>

        {/* Score Compare Modal */}
        {showScoreCompare && (
          <div className="modal-overlay" onClick={() => setShowScoreCompare(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">五维评分对比</span>
                <button className="btn btn-sm" onClick={() => setShowScoreCompare(false)}><IconX size={14} /></button>
              </div>
              <ScoreCompare projects={projects} />
            </div>
          </div>
        )}

        {/* Quality Insights */}
        <QualityInsightsPanel projects={projects} collapsed={qualityCollapsed} onToggle={() => setQualityCollapsed(c => !c)} />

        {/* Project Table */}
        <table>
          <thead>
            <tr>
              <th className="th-checkbox">
                <input type="checkbox" className="row-checkbox" checked={selectedProjects.length === projects.length && projects.length > 0} onChange={e => selectAll(e.target.checked)} />
              </th>
              <th>Project</th>
              <th>Status</th>
              <th>Score</th>
              <th>Breakdown</th>
              <th>Trend</th>
              <th>Duration</th>
              <th>Activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && projects.length === 0 && <tr className="loading-row"><td colSpan={9}>Loading...</td></tr>}
            {!loading && projects.length === 0 && <tr className="loading-row"><td colSpan={9}>No projects found</td></tr>}
            {projects.map(project => {
              const hs = healthStatus[project.name]
              const failCount = healthFailCount[project.name] || 0
              const isExpanded = expandedProject === project.name
              const isActive = project.lastRefresh && (now - project.lastRefresh) < 86400
              return (
                <Fragment key={project.name}>
                  <tr className="project-row" onClick={() => handleRowClick(project.name)} title="Click to view incubate log">
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="row-checkbox" checked={selectedProjects.includes(project.name)} onChange={() => toggleSelect(project.name)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isActive && <span className="zap-dot"><IconZap size={12} color="#E07A3A" /></span>}
                        <div>
                          <div style={{ fontWeight: 500 }}>{project.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(232,228,220,0.4)', marginTop: 2 }}>{project.tagline || project.url || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-dot status-${getStatusClass(project.name)}`} />
                      <span style={{ fontSize: 12 }}>{hs === 'checking' ? 'Checking...' : hs === 'online' ? 'Online' : 'Offline'}</span>
                      {failCount >= 2 && <span className="alert-badge"><IconAlertCircle size={10} /> Alert</span>}
                    </td>
                    <td>
                      <div className="score-bar-wrap">
                        <div className="score-bar"><div className="score-bar-fill" style={{ width: `${project.score || 0}%` }} /></div>
                        <span className="score-num">{project.score || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="breakdown">
                        {DIM_KEYS.map(key => {
                          const val = project.breakdown?.[key] ?? 0
                          const isLow = val < 30
                          return (
                            <span key={key} className={`breakdown-item ${val > 0 ? 'filled' : ''} ${isLow ? 'low' : ''}`} title={key}>
                              <span className="breakdown-item-label">{key.slice(0, 2)}</span>
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td><ScoreTrend history={scoreHistory[project.name] || []} /></td>
                    <td><IncubateDurCell projectName={project.name} durations={incubateDur} /></td>
                    <td><ActivityCell ts={project.lastRefresh} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="op-cell">
                        <button className="btn btn-sm" onClick={() => doToggle(project)} title={project.status === 'online' ? 'Take offline' : 'Bring online'}>
                          {project.status === 'online' ? <><IconX size={12} /> Offline</> : <><IconCheck size={12} /> Online</>}
                        </button>
                        <button className="btn btn-sm" onClick={e => handleRefresh(project, e)} disabled={refreshing === project.name} title="Refresh score">
                          <IconRefreshCw size={12} className={refreshing === project.name ? 'spin' : ''} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(project)} title="Delete project">
                          <IconTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} style={{ padding: 0 }}>
                        <DetailPanel projectName={project.name} log={incubateLog[project.name] || null} loading={!!logLoading[project.name]} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>

        {/* Oplog + Stats row */}
        <div className="oplog-stats-row">
          <OplogPanel oplog={oplog} collapsed={oplogCollapsed} onToggle={() => setOplogCollapsed(c => !c)} />
          <OplogStats oplog={oplog} />
        </div>
      </div>

      {/* Batch Toolbar */}
      <div className={`batch-toolbar ${selectedProjects.length === 0 ? 'hidden' : ''}`}>
        <span className="batch-count">已选 {selectedProjects.length} 个项目</span>
        {batchConfirm ? (
          <>
            <span className="batch-confirm">确认{batchConfirm}？</span>
            <button className="btn btn-sm btn-accent" onClick={() => { if (batchConfirm === '上线') batchOnline(); else if (batchConfirm === '下线') batchOffline(); else batchDelete() }}>确认</button>
            <button className="batch-cancel" onClick={() => setBatchConfirm(null)}>取消</button>
          </>
        ) : (
          <div className="batch-actions">
            <button className="btn btn-sm" onClick={() => setBatchConfirm('上线')}>批量上线</button>
            <button className="btn btn-sm" onClick={() => setBatchConfirm('下线')}>批量下线</button>
            <button className="btn btn-sm btn-danger" onClick={() => setBatchConfirm('删除')}>批量删除</button>
          </div>
        )}
      </div>

      {alert && (
        <div className="alert-banner">
          <IconAlertCircle size={14} />
          Project {alert.name} has been offline for 5 minutes, please check
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}

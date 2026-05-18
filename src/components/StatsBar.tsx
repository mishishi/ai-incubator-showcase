import type { Project } from '../data/projects';

interface Props {
  projects: Project[];
  uv: number;
  pv: number;
}

export default function StatsBar({ projects, uv, pv }: Props) {
  const online = projects.filter(p => p.status === 'online').length;
  const rate = projects.length > 0 ? Math.round((online / projects.length) * 100) : 0;
  const sorted = [...projects].sort((a, b) => (b.incubatedAt || '').localeCompare(a.incubatedAt || ''));
  const firstDate = sorted.length ? new Date(sorted[sorted.length - 1].incubatedAt) : new Date();
  const days = Math.floor((new Date().getTime() - firstDate.getTime()) / 86400000) + 1;

  return (
    <div className="stats-panel">
      <StatCard label="已孵化" value={projects.length} sub="项目总数" accent />
      <StatCard label="在线" value={online} sub="正常运行" />
      <StatCard label="成功率" value={`${rate}%`} sub="在线 / 总数" />
      <StatCard label="技能版本" value="v2.2.0" sub="AI Incubator" />
      <StatCard label="总访问UV" value={uv || '—'} sub="独立IP" />
      <StatCard label="总访问PV" value={pv || '—'} sub="页面浏览" />
      <StatCard label="最近孵化" value={sorted[0]?.name || '—'} sub={sorted[0]?.incubatedAt || '—'} accent />
      <StatCard label="累计孵化" value={days} sub="天" />
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: boolean }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value${accent ? ' accent' : ''}`}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
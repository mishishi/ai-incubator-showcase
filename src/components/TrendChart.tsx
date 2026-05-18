import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Project } from '../data/projects';

interface Props {
  projects: Project[];
}

export default function TrendChart({ projects }: Props) {
  const data = useMemo(() => {
    const firstDate = new Date('2026-05-16');
    const today = new Date();
    const days = Math.ceil((today.getTime() - firstDate.getTime()) / 86400000) + 1;

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      let total = 0, online = 0;
      projects.forEach(p => {
        if (p.incubatedAt && p.incubatedAt <= dateStr) {
          total++;
          if (p.status === 'online') online++;
        }
      });
      const rate = total > 0 ? Math.round((online / total) * 100) : 0;
      return {
        date: `${d.getMonth()+1}/${d.getDate()}`,
        rate,
        online,
        total,
      };
    });
  }, [projects]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>孵化成功率趋势</div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 16px 8px 4px' }}>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={36} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--text)' }}
              labelStyle={{ color: 'var(--text-dim)', fontSize: 11 }}
            />
            <Line type="monotone" dataKey="rate" stroke="#E07A3A" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#E07A3A' }} />
            <Line type="monotone" dataKey="online" stroke="#5aab6a" strokeWidth={1.5} dot={{ r: 3, fill: '#5aab6a' }} activeDot={{ r: 4, fill: '#5aab6a' }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, padding: '8px 16px 0', fontSize: 11, color: 'var(--text-dim)' }}>
          <span><span style={{ color: '#5aab6a' }}>●</span> 成功项目</span>
          <span><span style={{ color: '#E07A3A' }}>●</span> 成功率</span>
        </div>
      </div>
    </div>
  );
}
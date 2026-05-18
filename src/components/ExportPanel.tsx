import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportPanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const download = (data: object, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <>
      <div className="theme-overlay open" onClick={onClose} />
      <div className="export-panel open">
        <h3>导出数据</h3>
        <div className="export-item">
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>项目数据（JSON）</span>
          <button className="export-download" onClick={() => import('../data/projects').then(m => download(m.PROJECTS, 'projects.json'))}>下载</button>
        </div>
        <div className="export-item">
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>投票数据（JSON）</span>
          <button className="export-download" onClick={() => download(JSON.parse(localStorage.getItem('votes') || '{}'), 'votes.json')}>下载</button>
        </div>
        <div className="export-item">
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>留言数据（JSON）</span>
          <button className="export-download" onClick={() => download(JSON.parse(localStorage.getItem('comments') || '{}'), 'comments.json')}>下载</button>
        </div>
        <div className="export-item">
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>全部数据</span>
          <button className="export-download" onClick={() => import('../data/projects').then(m => download({ projects: m.PROJECTS, votes: JSON.parse(localStorage.getItem('votes') || '{}'), comments: JSON.parse(localStorage.getItem('comments') || '{}') }, 'showcase-export.json'))}>打包下载</button>
        </div>
      </div>
    </>
  );
}
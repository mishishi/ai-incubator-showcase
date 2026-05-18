export interface Project {
  name: string;
  tagline: string;
  description: string;
  techStack: string;
  status: 'online' | 'offline';
  url: string;
  screenshot: string;
  modalScreenshot?: string;
  incubatedAt: string;
  github?: string;
  demo?: string;
  doc?: string;
}

export const PROJECTS: Project[] = [
  {
    name: 'inkflow',
    tagline: 'AI 节点式故事图谱',
    description: '严肃创意写作工具，用 AI 思维导图方式构建故事结构，支持起承转合、三幕结构、英雄之旅等叙事框架',
    techStack: 'React,TypeScript,Tailwind,Vite',
    status: 'online',
    url: 'https://openginko.tech/inkflow/',
    screenshot: '/showcase/cards/inkflow-card.svg',
    incubatedAt: '2026-05-16',
  },
  {
    name: 'promptlab',
    tagline: '你的 AI Prompt 工作台',
    description: '面向开发者的 Prompt 工程工具，生成、结构化、版本化管理 AI Prompt，支持多平台导出',
    techStack: 'React,TypeScript,Tailwind,Vite',
    status: 'online',
    url: 'https://openginko.tech/promptlab/',
    screenshot: '/showcase/cards/promptlab-card.svg',
    incubatedAt: '2026-05-17',
  },
];

export const ACCENT_COLORS = [
  { hex: '#E07A3A', name: '琥珀' },
  { hex: '#3A8CE07A', name: '薄荷' },
  { hex: '#8B5CF6', name: '紫罗兰' },
  { hex: '#EF4444', name: '洋红' },
  { hex: '#10B981', name: '翡翠' },
  { hex: '#F59E0B', name: '向日葵' },
  { hex: '#EC4899', name: '玫瑰' },
  { hex: '#06B6D4', name: '青色' },
];
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

async function checkDeploy(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    return res.status === 200 ? 1 : 0
  } catch {
    return 0
  }
}

async function checkMeta(projectName) {
  const metaPath = path.join('/usr/share/nginx/html/showcase/api', `${projectName}-meta.json`)
  try {
    const content = await fs.promises.readFile(metaPath, 'utf8')
    const meta = JSON.parse(content)
    const tagline = meta.tagline && meta.tagline.trim().length > 0
    const description = meta.description && meta.description.trim().length > 0
    return tagline && description ? 1 : 0
  } catch {
    return 0
  }
}

async function checkLog(projectName) {
  const logPath = path.join('/usr/share/nginx/html/showcase/api', `${projectName}-log.json`)
  try {
    const content = await fs.promises.readFile(logPath, 'utf8')
    const log = JSON.parse(content)
    const phases = ['research', 'spec', 'plan', 'design']
    let filled = 0
    for (const phase of phases) {
      if (log[phase] && (log[phase].summary || log[phase].decisions?.length || log[phase].milestones?.length)) {
        filled++
      }
    }
    return filled / 4
  } catch {
    return 0
  }
}

async function checkDesign(projectName) {
  const designPath = path.join('/usr/share/nginx/html/showcase', projectName, 'design-system.md')
  try {
    const stat = await fs.promises.stat(designPath)
    return stat.size > 500 ? 1 : 0
  } catch {
    return 0
  }
}

async function checkResearch(projectName) {
  const researchPath = path.join('/usr/share/nginx/html/showcase', projectName, 'research.md')
  try {
    const stat = await fs.promises.stat(researchPath)
    return stat.size > 100 ? 1 : 0
  } catch {
    return 0
  }
}

export async function calculateScores(project) {
  const [deploy, meta, log, design, research] = await Promise.all([
    checkDeploy(project.url || `https://openginko.tech/${project.name}/`),
    checkMeta(project.name),
    checkLog(project.name),
    checkDesign(project.name),
    checkResearch(project.name),
  ])

  const score = Math.round((deploy * 0.4 + meta * 0.2 + log * 0.2 + design * 0.1 + research * 0.1) * 100)

  return {
    score,
    breakdown: { deploy, meta, log, design, research },
  }
}

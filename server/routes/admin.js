import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { calculateScores } from './scores.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = '/usr/share/nginx/html/showcase/api'
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'incubator2026'

function readProjects() {
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'))
}

function writeProjects(data) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2))
}

function authHeader(request) {
  const auth = request.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  return token === ADMIN_PASSWORD
}

export default async function adminRoutes(fastify) {
  // POST /api/admin/login
  fastify.post('/api/admin/login', async (request, reply) => {
    const { password } = request.body || {}
    if (!password || password !== ADMIN_PASSWORD) {
      return reply.status(401).send({ error: 'Invalid password' })
    }
    return { token: ADMIN_PASSWORD }
  })

  // GET /api/admin/projects
  fastify.get('/api/admin/projects', async (request, reply) => {
    if (!authHeader(request)) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const projects = readProjects()
    const withScores = await Promise.all(projects.map(async (p) => {
      const { score, breakdown } = await calculateScores(p)
      return { ...p, score, breakdown }
    }))
    return withScores
  })

  // PATCH /api/admin/projects/:name
  fastify.patch('/api/admin/projects/:name', async (request, reply) => {
    if (!authHeader(request)) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { name } = request.params
    const { status } = request.body || {}
    const projects = readProjects()
    const idx = projects.findIndex(p => p.name === name)
    if (idx === -1) {
      return reply.status(404).send({ error: 'Project not found' })
    }
    projects[idx].status = status
    writeProjects(projects)
    return projects[idx]
  })

  // DELETE /api/admin/projects/:name
  fastify.delete('/api/admin/projects/:name', async (request, reply) => {
    if (!authHeader(request)) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { name } = request.params
    const projects = readProjects()
    const idx = projects.findIndex(p => p.name === name)
    if (idx === -1) {
      return reply.status(404).send({ error: 'Project not found' })
    }
    projects.splice(idx, 1)
    writeProjects(projects)
    return { success: true }
  })

  // POST /api/admin/projects/:name/refresh
  fastify.post('/api/admin/projects/:name/refresh', async (request, reply) => {
    if (!authHeader(request)) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { name } = request.params
    const projects = readProjects()
    const idx = projects.findIndex(p => p.name === name)
    if (idx === -1) {
      return reply.status(404).send({ error: 'Project not found' })
    }
    const { score, breakdown } = await calculateScores(projects[idx])
    projects[idx].score = score
    projects[idx].breakdown = breakdown
    writeProjects(projects)
    return { ...projects[idx], score, breakdown }
  })

  // GET /api/projects (public)
  fastify.get('/api/projects', async (request, reply) => {
    const projects = readProjects()
    const withScores = await Promise.all(projects.map(async (p) => {
      const { score, breakdown } = await calculateScores(p)
      return { ...p, score, breakdown }
    }))
    return withScores
  })
}

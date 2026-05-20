import Fastify from 'fastify'
import cors from '@fastify/cors'
import adminRoutes from './routes/admin.js'

const fastify = Fastify({ logger: false })

await fastify.register(cors, { origin: true })

fastify.register(adminRoutes)

const PORT = Number(process.env.PORT) || 3002
const HOST = '0.0.0.0'

await fastify.listen({ port: PORT, host: HOST })
console.log(`Admin server running on http://${HOST}:${PORT}`)

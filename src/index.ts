
import Fastify from 'fastify'
import dotenv from 'dotenv'
dotenv.config()
const fastify = Fastify({
  logger: true
})


fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

try {
  await fastify.listen({ port: parseInt(process.env.PORT || '3000') })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
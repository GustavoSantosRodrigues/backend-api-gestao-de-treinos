import 'dotenv/config'

import Fastify from 'fastify'
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import z from 'zod'


const app = Fastify({
  logger: true
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.withTypeProvider<ZodTypeProvider>().route({
 method: 'GET',
 url: '/',
 schema: {
    description: 'hello world',
    tags: ['hello world'],
  response: {
    200: z.object({
      message: z.string(),
    
    })
   }
  },
 handler: async function handler (request, reply) {
  return { message: 'hello world' }
 }
});


app.listen({ port: 4949 });

try {
  await app.listen({ port: parseInt(process.env.PORT || '3000') })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
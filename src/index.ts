import 'dotenv/config'

import Fastify from 'fastify'
import { ZodTypeProvider, jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import z from 'zod'

import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';


const app = Fastify({
    logger: true
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Bootcamp Treinos API',
      description: 'Api para todos os treinos do bootcamp',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:8081',
        description: 'Local server'
      }
    ],
  },
  transform: jsonSchemaTransform,

});

await app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
});

const LOGIN_SCHEMA = z.object({
  username: z.string().max(32).describe('Some description for username'),
  password: z.string().max(32),
});

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
    handler: async function handler(request, reply) {
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
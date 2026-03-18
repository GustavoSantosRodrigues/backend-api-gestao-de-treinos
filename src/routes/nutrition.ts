import { fromNodeHeaders } from 'better-auth/node'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth }                from '../lib/index.js'
import { listNutritionPlans }  from '../usecases/nutrition/list-nutrition-plans.js'
import { getNutritionPlan }    from '../usecases/nutrition/get-nutrition-plan.js'
import { getNutritionDay }     from '../usecases/nutrition/get-nutrition-day.js'
import { deleteNutritionPlan } from '../usecases/nutrition/delete-nutrition-plan.js'

export const nutritionRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/nutrition/plans',
    schema: {
      tags: ['AI Nutrition'],
      operationId: 'listNutritionPlans',
      summary: 'List nutrition plans',
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        })
        if (!session) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
        }

        const plans = await listNutritionPlans(session.user.id)
        return reply.status(200).send(plans)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/nutrition/plans/:id',
    schema: {
      tags: ['AI Nutrition'],
      operationId: 'getNutritionPlan',
      summary: 'Get a nutrition plan',
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        })
        if (!session) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
        }

        const plan = await getNutritionPlan(request.params.id, session.user.id)
        if (!plan) {
          return reply.status(404).send({ error: 'Nutrition plan not found', code: 'NOT_FOUND' })
        }

        return reply.status(200).send(plan)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/nutrition/days/:id',
    schema: {
      tags: ['AI Nutrition'],
      operationId: 'getNutritionDay',
      summary: 'Get a nutrition day',
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        })
        if (!session) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
        }

        const day = await getNutritionDay(request.params.id, session.user.id)
        if (!day) {
          return reply.status(404).send({ error: 'Nutrition day not found', code: 'NOT_FOUND' })
        }

        return reply.status(200).send(day)
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/nutrition/plans/:id',
    schema: {
      tags: ['AI Nutrition'],
      operationId: 'deleteNutritionPlan',
      summary: 'Delete a nutrition plan',
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        })
        if (!session) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
        }

        await deleteNutritionPlan(request.params.id, session.user.id)
        return reply.status(204).send()
      } catch (error) {
        app.log.error(error)
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  })
}
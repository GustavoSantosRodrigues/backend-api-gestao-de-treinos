import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import {
  NotFoundError,
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { auth } from "../lib/index.js";
import {
  ErrorSchema,
  GetWorkoutDaySchema,
  GetWorkoutPlanSchema,
  ListWorkoutPlansQuerySchema,
  ListWorkoutPlansSchema,
  StartWorkoutSessionSchema,
  UpdateWorkoutPlanBodySchema,
  UpdateWorkoutSessionBodySchema,
  UpdateWorkoutSessionSchema,
  WorkoutPlanSchema,
} from "../schemas/index.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetWorkoutDay } from "../usecases/GetWorkoutDay.js";
import { GetWorkoutPlan } from "../usecases/GetWorkoutPlan.js";
import { GetExerciseLogs } from "../usecases/GetExerciseLogs.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { LogExerciseSet } from "../usecases/LogExerciseSet.js";
import { ReorderExercises } from "../usecases/ReorderExercises.js";
import { StartWorkoutSession } from "../usecases/StartWorkoutSession.js";
import { UpdateWorkoutPlan } from "../usecases/UpdateWorkoutPlan.js";
import { UpdateWorkoutSession } from "../usecases/UpdateWorkoutSession.js";

export const workoutPlanRoutes = async (app: FastifyInstance) => {
  // GET /
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "listWorkoutPlans",
      tags: ["Workout Plan"],
      summary: "List workout plans",
      querystring: ListWorkoutPlansQuerySchema,
      response: {
        200: ListWorkoutPlansSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new ListWorkoutPlans().execute({ userId: session.user.id, active: request.query.active });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // POST /
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Workout Plan"],
      operationId: "createWorkoutPlan",
      summary: "Create a workout plan",
      body: WorkoutPlanSchema.omit({ id: true }),
      response: { 201: WorkoutPlanSchema, 400: ErrorSchema, 401: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new CreateWorkoutPlan().execute({ userId: session.user.id, name: request.body.name, workoutDays: request.body.workoutDays });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // PATCH /:workoutPlanId
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:workoutPlanId",
    schema: {
      tags: ["Workout Plan"],
      operationId: "updateWorkoutPlan",
      summary: "Update a workout plan",
      params: z.object({ workoutPlanId: z.uuid() }),
      body: UpdateWorkoutPlanBodySchema,
      response: {
        200: z.object({ id: z.string(), name: z.string(), workoutPlanUpdated: z.literal(true) }),
        401: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new UpdateWorkoutPlan().execute({ userId: session.user.id, workoutPlanId: request.params.workoutPlanId, name: request.body.name, workoutDays: request.body.workoutDays });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // GET /:workoutPlanId
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId",
    schema: {
      tags: ["Workout Plan"],
      operationId: "getWorkoutPlan",
      summary: "Get a workout plan",
      params: z.object({ workoutPlanId: z.uuid() }),
      response: { 200: GetWorkoutPlanSchema, 401: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new GetWorkoutPlan().execute({ userId: session.user.id, workoutPlanId: request.params.workoutPlanId });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // GET /:workoutPlanId/days/:workoutDayId
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId/days/:workoutDayId",
    schema: {
      tags: ["Workout Plan"],
      operationId: "getWorkoutDay",
      summary: "Get a workout day",
      params: z.object({ workoutPlanId: z.uuid(), workoutDayId: z.uuid() }),
      response: { 200: GetWorkoutDaySchema, 401: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new GetWorkoutDay().execute({ userId: session.user.id, workoutPlanId: request.params.workoutPlanId, workoutDayId: request.params.workoutDayId });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // POST /:workoutPlanId/days/:workoutDayId/sessions
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:workoutPlanId/days/:workoutDayId/sessions",
    schema: {
      tags: ["Workout Plan"],
      operationId: "startWorkoutSession",
      summary: "Start a workout session",
      params: z.object({ workoutPlanId: z.uuid(), workoutDayId: z.uuid() }),
      response: { 201: StartWorkoutSessionSchema, 401: ErrorSchema, 404: ErrorSchema, 409: ErrorSchema, 422: ErrorSchema, 500: ErrorSchema },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new StartWorkoutSession().execute({ userId: session.user.id, workoutPlanId: request.params.workoutPlanId, workoutDayId: request.params.workoutDayId });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        if (error instanceof WorkoutPlanNotActiveError) return reply.status(422).send({ error: error.message, code: "WORKOUT_PLAN_NOT_ACTIVE_ERROR" });
        if (error instanceof SessionAlreadyStartedError) return reply.status(409).send({ error: error.message, code: "SESSION_ALREADY_STARTED_ERROR" });
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // PATCH /:workoutPlanId/days/:workoutDayId/sessions/:sessionId
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:workoutPlanId/days/:workoutDayId/sessions/:sessionId",
    schema: {
      tags: ["Workout Plan"],
      operationId: "updateWorkoutSession",
      summary: "Update a workout session",
      params: z.object({ workoutPlanId: z.uuid(), workoutDayId: z.uuid(), sessionId: z.uuid() }),
      body: UpdateWorkoutSessionBodySchema,
      response: { 200: UpdateWorkoutSessionSchema, 401: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new UpdateWorkoutSession().execute({ userId: session.user.id, workoutPlanId: request.params.workoutPlanId, workoutDayId: request.params.workoutDayId, sessionId: request.params.sessionId, completedAt: request.body.completedAt });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // POST /:workoutPlanId/days/:workoutDayId/sessions/:sessionId/exercises/:exerciseId/logs
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:workoutPlanId/days/:workoutDayId/sessions/:sessionId/exercises/:exerciseId/logs",
    schema: {
      tags: ["Workout Plan"],
      operationId: "logExerciseSet",
      summary: "Log an exercise set",
      params: z.object({ workoutPlanId: z.uuid(), workoutDayId: z.uuid(), sessionId: z.uuid(), exerciseId: z.uuid() }),
      body: z.object({ setNumber: z.number().int().min(1), weightInKg: z.number().min(0).optional(), repsCompleted: z.number().int().min(1) }),
      response: {
        201: z.object({ id: z.string(), workoutExerciseId: z.string(), workoutSessionId: z.string(), setNumber: z.number(), weightInKg: z.number().nullable(), repsCompleted: z.number(), createdAt: z.date() }),
        401: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new LogExerciseSet().execute({ workoutExerciseId: request.params.exerciseId, workoutSessionId: request.params.sessionId, setNumber: request.body.setNumber, weightInKg: request.body.weightInKg, repsCompleted: request.body.repsCompleted });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: "NOT_FOUND_ERROR" });
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // GET /:workoutPlanId/days/:workoutDayId/exercises/:exerciseId/logs
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:workoutPlanId/days/:workoutDayId/exercises/:exerciseId/logs",
    schema: {
      tags: ["Workout Plan"],
      operationId: "getExerciseLogs",
      summary: "Get exercise logs",
      params: z.object({ workoutPlanId: z.uuid(), workoutDayId: z.uuid(), exerciseId: z.uuid() }),
      response: {
        200: z.object({ logs: z.array(z.object({ id: z.string(), setNumber: z.number(), weightInKg: z.number().nullable(), repsCompleted: z.number(), createdAt: z.date() })) }),
        401: ErrorSchema, 500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        const result = await new GetExerciseLogs().execute({ workoutExerciseId: request.params.exerciseId });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // PATCH /days/:workoutDayId/exercises/reorder
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:workoutPlanId/days/:workoutDayId/exercises/reorder",
    schema: {
      tags: ["Workout Plan"],
      summary: "Reorder exercises",
      params: z.object({ workoutPlanId: z.string(), workoutDayId: z.string() }),
      body: z.object({ exercises: z.array(z.object({ id: z.string(), order: z.number() })) }),
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        await new ReorderExercises().execute({ workoutDayId: request.params.workoutDayId, exercises: request.body.exercises });
        return reply.status(200).send({ success: true });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });
};
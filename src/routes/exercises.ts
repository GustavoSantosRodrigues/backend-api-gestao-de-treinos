import { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";
import {ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";

const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  muscles: z.array(z.string()),
  gifUrl: z.string().nullable(),
});

export async function exercisesRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/exercises",
    schema: {
      tags: ["Exercises"],
      summary: "List exercises",
      querystring: z.object({
        muscles: z.string().optional(),
      }),
      response: {
        200: z.array(exerciseSchema),
      },
    },
    handler: async (req, reply) => {
      const { muscles } = req.query;

      const muscleList = muscles
        ? muscles.split(",").map((m) => m.trim().toLowerCase())
        : undefined;

      const exercises = await prisma.exercise.findMany({
        where: {
          ...(muscleList && {
            OR: [{ muscles: { hasSome: muscleList } }],
          }),
        },
        orderBy: { name: "asc" },
        // take: 15,
        select: { id: true, name: true, muscles: true, gifUrl: true },
      });

      return reply.send(exercises);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/exercises/:id",
    schema: {
      tags: ["Exercises"],
      summary: "Get exercise by id",
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: exerciseSchema,
        404: z.object({ error: z.string() }),
      },
    },
    handler: async (req, reply) => {
      const { id } = req.params;

      const exercise = await prisma.exercise.findUnique({
        where: { id },
        select: { id: true, name: true, muscles: true, gifUrl: true },
      });

      if (!exercise) {
        return reply.status(404).send({ error: "Exercise not found" });
      }

      return reply.send(exercise);
    },
  });
}

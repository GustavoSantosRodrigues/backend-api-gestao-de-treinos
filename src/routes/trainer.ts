import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "../lib/index.js";
import { ErrorSchema } from "../schemas/index.js";

import { LinkTrainer } from "../usecases/trainer/LinkTrainer.js";
import { GetMyStudents } from "../usecases/trainer/GetMyStudents.js";
import { RespondStudentRequest } from "../usecases/trainer/RespondStudentRequest.js";
import { GetStudentPlans } from "../usecases/trainer/GetStudentPlans.js";
import { BecomeTrainer } from "../usecases/trainer/Becometrainer.js";

export const trainerRoutes = async (app: FastifyInstance) => {
  // PATCH /trainer/become — aluno vira personal
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/become",
    schema: {
      tags: ["Trainer"],
      operationId: "becomeTrainer",
      summary: "Become a trainer",
        body: z.object({
          isTrainer: z.boolean(),
        }),
      response: {
        200: z.object({ isTrainer: z.boolean() }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const result = await new BecomeTrainer().execute({ userId: session.user.id, isTrainer: request.body.isTrainer });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // POST /trainer/link — aluno vincula personal pelo email
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/link",
    schema: {
      tags: ["Trainer"],
      operationId: "linkTrainer",
      summary: "Link a trainer by email",
      body: z.object({
        trainerEmail: z.string().email(),
      
      }),
      response: {
        200: z.object({
          id: z.string(),
          status: z.string(),
          trainerId: z.string(),
          studentId: z.string(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const result = await new LinkTrainer().execute({
          studentId: session.user.id,
          trainerEmail: request.body.trainerEmail,
        });

        return reply.status(200).send(result);
      } catch (error: any) {
        if (
          error.message === "TRAINER_NOT_FOUND" ||
          error.message === "USER_IS_NOT_TRAINER" ||
          error.message === "CANNOT_LINK_YOURSELF" ||
          error.message === "ALREADY_LINKED"
        ) {
          return reply.status(400).send({ error: error.message, code: error.message });
        }
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // GET /trainer/students — personal lista seus alunos
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/students",
    schema: {
      tags: ["Trainer"],
      operationId: "getMyStudents",
      summary: "Get my students",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            status: z.string(),
            createdAt: z.date(),
            student: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              image: z.string().nullable(),
            }),
          })
        ),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const result = await new GetMyStudents().execute({ trainerId: session.user.id });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // PATCH /trainer/students/:linkId — personal aceita ou recusa aluno
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/students/:linkId",
    schema: {
      tags: ["Trainer"],
      operationId: "respondStudentRequest",
      summary: "Accept or reject a student",
      params: z.object({
        linkId: z.string(),
      }),
      body: z.object({
        action: z.enum(["accept", "reject"]),
      }),
      response: {
        200: z.object({ status: z.string() }),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const result = await new RespondStudentRequest().execute({
          trainerId: session.user.id,
          linkId: request.params.linkId,
          action: request.body.action,
        });

        return reply.status(200).send(result);
      } catch (error: any) {
        if (error.name === "NotFoundError") {
          return reply.status(404).send({ error: error.message, code: "NOT_FOUND" });
        }
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // GET /trainer/students/:studentId/plans — personal acessa planos do aluno
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/students/:studentId/plans",
    schema: {
      tags: ["Trainer"],
      operationId: "getStudentPlans",
      summary: "Get student workout plans",
      params: z.object({
        studentId: z.string(),
      }),
      response: {
        200: z.array(z.any()),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        }

        const result = await new GetStudentPlans().execute({
          trainerId: session.user.id,
          studentId: request.params.studentId,
        });

        return reply.status(200).send(result);
      } catch (error: any) {
        if (error.name === "NotFoundError") {
          return reply.status(404).send({ error: error.message, code: "NOT_FOUND" });
        }
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });
};
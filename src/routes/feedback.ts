import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { env } from "../lib/env.js";

export const feedbackRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/discord-feedback",
    schema: {
      tags: ["Feedback"],
      operationId: "sendDiscordFeedback",
      summary: "Send feedback to Discord",
      body: z.object({
        message: z.string().min(1).max(2000),
      }),
      response: {
        200: z.object({ ok: z.boolean() }),
        500: z.object({ error: z.string(), code: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const { message } = request.body;

      const response = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        app.log.error({ status: response.status }, "Discord webhook failed");
        return reply.status(500).send({
          error: "Failed to send feedback",
          code: "DISCORD_WEBHOOK_ERROR",
        });
      }

      return reply.status(200).send({ ok: true });
    },
  });
};

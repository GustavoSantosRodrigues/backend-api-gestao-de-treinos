import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { NotFoundError } from "../errors/index.js";
import { auth } from "../lib/index.js";
import { WorkoutPlanSchema } from "../schemas/index.js";
import { ErrorsSchema } from "../schemas/index.js";
import { CreateWorkoutPlans } from "../usecases/CreateWorkoutPlans.js";

export const workoutPlanRoutes = async (app: FastifyInstance) => {
    app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/",
  schema: {
    body: WorkoutPlanSchema.omit({ id: true }),
    response: {
      201: WorkoutPlanSchema,
      400: ErrorsSchema.shape[400],
      401: ErrorsSchema.shape[401],
      404: ErrorsSchema.shape[404],
      500: ErrorsSchema.shape[500]
    },
  },
  handler: async function handler(request, reply) {
    try {
    const session = await auth.api.getSession(
      { headers: fromNodeHeaders(request.headers), }
    );
    if(!session){
      return reply.status(401).send({
        error: "Unauthorized",
        code: "UNAUTHORIZED"
      });
    }

    const createWorkoutPlans = new CreateWorkoutPlans();
    const result = await createWorkoutPlans.execute({
      userId: session.user.id,
      name: request.body.name,
      workoutDays: request.body.workoutDays,
    });
    return reply.status(201).send(result);
  }
  catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        error: error.message,
        code: "NOT_FOUND"
      });
    }
  }
  }
});
}


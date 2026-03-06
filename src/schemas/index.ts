import { z } from "zod";

import { WeekDay } from "../generated/prisma/enums.js";

export const ErrorsSchema = z.object({
    400: z.object({
        error: z.string(),
        code: z.string()
      }),
      401: z.object({
        error: z.string(),
        code: z.string()
      }),
      404: z.object({
        error: z.string(),
        code: z.string()
      }),
      500: z.object({
        error: z.string(),
        code: z.string()
      })
});
    


export const WorkoutPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    workoutDays: z.array(z.object({
        id: z.string(),
        name: z.string(),
        weekDay: z.enum(WeekDay),
        isRestDay: z.boolean(),
        estimatedDurationInSeconds: z.number(),
        exercises: z.array(z.object({
            id: z.string(),
            order: z.number(),
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            restTimeSeconds: z.number(),
        }))
    }))
});
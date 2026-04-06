import { NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      weightSuggestion?: string;
      notes?: string;
      restTimeInSeconds: number;
      exerciseId?: string; // 👈 novo
    }>;
  }>;
}

interface OutputDto {
  id: string;
  name: string;
  workoutPlanCreated: true;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
      exerciseId?: string; // 👈 novo
    }>;
  }>;
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        isActive: true,
        userId: dto.userId,
      },
    });

    const allExerciseIds = dto.workoutDays
      .flatMap((day) => day.exercises)
      .map((ex) => ex.exerciseId)
      .filter((id): id is string => !!id);

    const validExercises = await prisma.exercise.findMany({
      where: { id: { in: allExerciseIds } },
      select: { id: true },
    });

    const validIds = new Set(validExercises.map((e) => e.id));

    const sanitizedDays = dto.workoutDays.map((day) => ({
      ...day,
      coverImageUrl: day.isRest ? undefined : day.coverImageUrl,
      exercises: day.isRest ? [] : day.exercises,
    }));

    return prisma.$transaction(async (tx) => {
      if (existingWorkoutPlan) {
        await tx.workoutPlan.update({
          where: { id: existingWorkoutPlan.id },
          data: { isActive: false },
        });
      }

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          id: crypto.randomUUID(),
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: sanitizedDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              coverImageUrl: workoutDay.coverImageUrl,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weightSuggestion: exercise.weightSuggestion ?? undefined,
                  notes: exercise.notes ?? undefined,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                  exerciseId:
                    exercise.exerciseId && validIds.has(exercise.exerciseId)
                      ? exercise.exerciseId
                      : null,
                })),
              },
            })),
          },
        },
      });

      const result = await tx.workoutPlan.findUnique({
        where: { id: workoutPlan.id },
        include: {
          workoutDays: {
            include: {
              exercises: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new NotFoundError("Workout plan not found");
      }

      return {
        id: result.id,
        name: result.name,
        workoutPlanCreated: true,
        workoutDays: result.workoutDays.map((day) => ({
          name: day.name,
          weekDay: day.weekDay,
          isRest: day.isRest,
          estimatedDurationInSeconds: day.estimatedDurationInSeconds,
          coverImageUrl: day.coverImageUrl ?? undefined,
          exercises: day.exercises.map((exercise) => ({
            order: exercise.order,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weightSuggestion: exercise.weightSuggestion ?? undefined,
            notes: exercise.notes ?? undefined,
            restTimeInSeconds: exercise.restTimeInSeconds,
            exerciseId: exercise.exerciseId ?? undefined, // 👈 novo
          })),
        })),
      };
    });
  }
}

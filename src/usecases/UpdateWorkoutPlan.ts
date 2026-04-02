import { NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/index.js";
import { prisma } from "../lib/db.js";

interface ExerciseDto {
  order: number;
  name: string;
  sets: number;
  reps: number;
  weightSuggestion?: string;
  notes?: string;
  restTimeInSeconds: number;
  exerciseId?: string; // 👈 novo
}

interface WorkoutDayDto {
  weekDay: WeekDay;
  name?: string;
  isRest?: boolean;
  estimatedDurationInSeconds?: number;
  coverImageUrl?: string;
  exercises?: ExerciseDto[];
}

interface InputDto {
  userId: string;
  workoutPlanId: string;
  name?: string;
  workoutDays?: WorkoutDayDto[];
}

interface OutputDto {
  id: string;
  name: string;
  workoutPlanUpdated: true;
}

export class UpdateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: dto.workoutPlanId,
        userId: dto.userId,
        isActive: true,
      },
      include: {
        workoutDays: {
          include: { exercises: true },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    return prisma.$transaction(async (tx) => {
      if (dto.name) {
        await tx.workoutPlan.update({
          where: { id: workoutPlan.id },
          data: { name: dto.name },
        });
      }

      if (dto.workoutDays && dto.workoutDays.length > 0) {
        for (const dayDto of dto.workoutDays) {
          const existingDay = workoutPlan.workoutDays.find(
            (d) => d.weekDay === dayDto.weekDay,
          );

          if (!existingDay) continue;

          await tx.workoutDay.update({
            where: { id: existingDay.id },
            data: {
              ...(dayDto.name && { name: dayDto.name }),
              ...(dayDto.isRest !== undefined && { isRest: dayDto.isRest }),
              ...(dayDto.estimatedDurationInSeconds !== undefined && {
                estimatedDurationInSeconds: dayDto.estimatedDurationInSeconds,
              }),
              ...(dayDto.coverImageUrl && {
                coverImageUrl: dayDto.coverImageUrl,
              }),
            },
          });

          if (dayDto.exercises !== undefined) {
            await tx.workoutExercise.deleteMany({
              where: { workoutDayId: existingDay.id },
            });

            const allExerciseIds = (dto.workoutDays ?? [])
              .flatMap((day) => day.exercises ?? [])
              .map((ex) => ex.exerciseId)
              .filter((id): id is string => !!id);

            const validExercises = await prisma.exercise.findMany({
              where: { id: { in: allExerciseIds } },
              select: { id: true },
            });
            const validIds = new Set(validExercises.map((e) => e.id));

            if (dayDto.exercises.length > 0) {
              await tx.workoutExercise.createMany({
                data: dayDto.exercises.map((ex) => ({
                  id: crypto.randomUUID(),
                  workoutDayId: existingDay.id,
                  name: ex.name,
                  order: ex.order,
                  sets: ex.sets,
                  reps: ex.reps,
                  restTimeInSeconds: ex.restTimeInSeconds,
                  weightSuggestion: ex.weightSuggestion ?? null,
                  notes: ex.notes ?? null,
                  exerciseId:
                    ex.exerciseId && validIds.has(ex.exerciseId)
                      ? ex.exerciseId
                      : null,
                })),
              });
            }
          }
        }
      }

      return {
        id: workoutPlan.id,
        name: dto.name ?? workoutPlan.name,
        workoutPlanUpdated: true,
      };
    });
  }
}


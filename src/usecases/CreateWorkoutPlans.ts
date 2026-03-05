import { NotFoundError } from "../errors/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

// data transfer object
interface InputDto {
    userId: string;
    name: string;
    workoutDays: Array<{
        name: string;
        weekDay: WeekDay;
        isRestDay: boolean;
        estimatedDurationInSeconds: number;
        exercises: Array<{
            order: number;
            name: string;
            sets: number;
            reps: number;
            restTimeSeconds: number;
        }>;
    }>;
}

// export interface OutputDto {
//     id: string;
// }

export class CreateWorkoutPlans {
    async execute(dto: InputDto) {

        const existingWorkoutPlan = await prisma.workoutPlan.findFirst({
            where: {
                isActive: true
            },
        });

        // transaction to update existing workout plan
        // atomicidade
        // aced 

        return prisma.$transaction(async (tx) => {
            if (existingWorkoutPlan) {
                await tx.workoutPlan.update({
                    where: {
                        id: existingWorkoutPlan.id,
                    },
                    data: {
                        isActive: false,
                    },
                });
            }

            const workoutPlan = await tx.workoutPlan.create({
                data: {
                    name: dto.name,
                    userId: dto.userId,
                    isActive: true,
                    workoutDays: {
                        create: dto.workoutDays.map((workoutDay) => ({
                            name: workoutDay.name,
                            weekDay: workoutDay.weekDay,
                            isRestDay: workoutDay.isRestDay,
                            estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
                            exercises: {
                                create: workoutDay.exercises.map((exercise) => ({
                                    order: exercise.order,
                                    name: exercise.name,
                                    sets: exercise.sets,
                                    reps: exercise.reps,
                                    restTimeSeconds: exercise.restTimeSeconds,
                                })),
                            },
                        })),
                    },
                },
            });

            const result = await tx.workoutPlan.findUnique({
                where: {
                  id: workoutPlan.id
                },
                include: {
                    workoutDays: {
                        include: {
                            exercises: true,
                        },
                    },
                },
            });
            
            if (!result) {
                throw new NotFoundError('Workout plan not found');
            }

            return result;
        });
    }
}


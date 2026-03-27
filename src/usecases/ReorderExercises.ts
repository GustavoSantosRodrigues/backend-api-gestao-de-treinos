import { prisma } from "../lib/db.js";

interface InputDto {
  workoutDayId: string;
  exercises: Array<{
    id: string;
    order: number;
  }>;
}

export class ReorderExercises {
  async execute(dto: InputDto): Promise<void> {
    await prisma.$transaction(
      dto.exercises.map(({ id, order }) =>
        prisma.workoutExercise.update({
          where: { id, workoutDayId: dto.workoutDayId },
          data: { order },
        })
      )
    );
  }
}
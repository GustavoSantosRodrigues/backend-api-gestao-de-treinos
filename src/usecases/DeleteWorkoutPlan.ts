import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
}

export class DeleteWorkoutPlan {
  async execute(dto: InputDto): Promise<void> {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: dto.workoutPlanId,
        userId: dto.userId,
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    await prisma.workoutPlan.delete({
      where: { id: dto.workoutPlanId },
    });
  }
}
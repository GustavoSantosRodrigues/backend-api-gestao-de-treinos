import { prisma } from "../lib/db.js";

interface InputDto {
  workoutExerciseId: string;
}

interface OutputDto {
  logs: Array<{
    id: string;
    setNumber: number;
    weightInKg: number | null;
    repsCompleted: number;
    createdAt: Date;
  }>;
}

export class GetExerciseLogs {
  async execute(dto: InputDto): Promise<OutputDto> {
    const logs = await prisma.exerciseLog.findMany({
      where: {
        workoutExerciseId: dto.workoutExerciseId,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      logs: logs.map((log) => ({
        id: log.id,
        setNumber: log.setNumber,
        weightInKg: log.weightInKg,
        repsCompleted: log.repsCompleted,
        createdAt: log.createdAt,
      })),
    };
  }
}
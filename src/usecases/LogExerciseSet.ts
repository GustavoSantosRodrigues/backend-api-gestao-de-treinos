import { prisma } from "../lib/db.js";
import { NotFoundError } from "../errors/index.js";

interface InputDto {
  workoutExerciseId: string;
  workoutSessionId: string;
  setNumber: number;
  weightInKg?: number;
  repsCompleted: number;
}

interface OutputDto {
  id: string;
  workoutExerciseId: string;
  workoutSessionId: string;
  setNumber: number;
  weightInKg: number | null;
  repsCompleted: number;
  createdAt: Date;
}

export class LogExerciseSet {
  async execute(dto: InputDto): Promise<OutputDto> {
    const exercise = await prisma.workoutExercise.findUnique({
      where: { id: dto.workoutExerciseId },
    });

    if (!exercise) {
      throw new NotFoundError("Exercise not found");
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: dto.workoutSessionId },
    });

    if (!session) {
      throw new NotFoundError("Session not found");
    }

    const log = await prisma.exerciseLog.create({
      data: {
        workoutExerciseId: dto.workoutExerciseId,
        workoutSessionId: dto.workoutSessionId,
        setNumber: dto.setNumber,
        weightInKg: dto.weightInKg ?? null,
        repsCompleted: dto.repsCompleted,
      },
    });

    return {
      id: log.id,
      workoutExerciseId: log.workoutExerciseId,
      workoutSessionId: log.workoutSessionId,
      setNumber: log.setNumber,
      weightInKg: log.weightInKg,
      repsCompleted: log.repsCompleted,
      createdAt: log.createdAt,
    };
  }
}
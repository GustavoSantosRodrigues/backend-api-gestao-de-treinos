import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface InputDto {
  trainerId: string;
  studentId: string;
}

export class GetStudentPlans {
  async execute(dto: InputDto) {
    const link = await prisma.trainerStudent.findUnique({
      where: { trainerId_studentId: { trainerId: dto.trainerId, studentId: dto.studentId } },
    });

    if (!link || link.status !== "ACTIVE") {
      throw new NotFoundError("Student not found or not active");
    }

    return prisma.workoutPlan.findMany({
      where: { userId: dto.studentId },
      include: {
        workoutDays: {
          include: { exercises: true },
          orderBy: { weekDay: "asc" },
        },
      },
    });
  }
}
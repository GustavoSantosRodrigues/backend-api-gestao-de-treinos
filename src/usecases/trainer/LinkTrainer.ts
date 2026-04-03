import { prisma } from "../../lib/db.js";

interface InputDto {
  studentId: string;
  trainerEmail: string;
}

export class LinkTrainer {
  async execute(dto: InputDto) {
    const trainer = await prisma.user.findUnique({
      where: { email: dto.trainerEmail },
    });

    if (!trainer) throw new Error("TRAINER_NOT_FOUND");
    if (!trainer.isTrainer) throw new Error("USER_IS_NOT_TRAINER");
    if (trainer.id === dto.studentId) throw new Error("CANNOT_LINK_YOURSELF");

    const existing = await prisma.trainerStudent.findUnique({
      where: { trainerId_studentId: { trainerId: trainer.id, studentId: dto.studentId } },
    });

    if (existing) throw new Error("ALREADY_LINKED");

    return prisma.trainerStudent.create({
      data: { trainerId: trainer.id, studentId: dto.studentId },
    });
  }
}
import { prisma } from "../../lib/db.js";

interface InputDto {
  studentId: string;
}

export class GetMyTrainers {
  async execute(dto: InputDto) {
    const links = await prisma.trainerStudent.findMany({
      where: { studentId: dto.studentId },
      include: {
        trainer: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return links.map((l) => ({
      id: l.id,
      status: l.status,
      createdAt: l.createdAt,
      trainer: l.trainer,
    }));
  }
}

import { prisma } from "../../lib/db.js";

interface InputDto {
  trainerId: string;
}

export class GetMyStudents {
  async execute(dto: InputDto) {
    const links = await prisma.trainerStudent.findMany({
      where: { trainerId: dto.trainerId },
      include: {
        student: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return links.map((l) => ({
      id: l.id,
      status: l.status,
      createdAt: l.createdAt,
      student: l.student,
    }));
  }
}
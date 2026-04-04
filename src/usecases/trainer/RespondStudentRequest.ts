import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface InputDto {
  trainerId: string;
  linkId: string;
  action: "accept" | "reject";
}

export class RespondStudentRequest {
  async execute(dto: InputDto) {
    const link = await prisma.trainerStudent.findFirst({
      where: { id: dto.linkId, trainerId: dto.trainerId },
    });

    if (!link) throw new NotFoundError("Link not found");

    if (dto.action === "reject") {
      await prisma.trainerStudent.delete({ where: { id: dto.linkId } });
      return { status: "rejected" };
    }

    const updated = await prisma.trainerStudent.update({
      where: { id: dto.linkId },
      data: { status: "ACTIVE" },
    });

    return { status: updated.status };
  }
}
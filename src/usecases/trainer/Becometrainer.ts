import { prisma } from "../../lib/db.js";

interface InputDto {
  userId: string;
  isTrainer: boolean;
}

interface OutputDto {
  isTrainer: boolean;
}

export class BecomeTrainer {
  async execute(dto: InputDto): Promise<OutputDto> {
    await prisma.user.update({
      where: { id: dto.userId },
      data: { isTrainer: dto.isTrainer },
    });

    return { isTrainer: dto.isTrainer };
  }
}
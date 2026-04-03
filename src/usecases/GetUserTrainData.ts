import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  userId: string;
  userName: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
  isTrainer: boolean;
  incomplete?: boolean;
}

interface IncompleteOutputDto {
  isTrainer: boolean;
  incomplete: true;
}

export class GetUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto | IncompleteOutputDto | null> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      return null;
    }

    if (
      user.weightInGrams === null ||
      user.heightInCentimeters === null ||
      user.age === null ||
      user.bodyFatPercentage === null
    ) {
      return { isTrainer: user.isTrainer, incomplete: true };
    }

    return {
      userId: user.id,
      userName: user.name,
      isTrainer: user.isTrainer,
      weightInGrams: user.weightInGrams,
      heightInCentimeters: user.heightInCentimeters,
      age: user.age,
      bodyFatPercentage: user.bodyFatPercentage,
      
    };
  }
}

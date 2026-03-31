import { WeekDay } from '@/generated/prisma/enums.js';
import { prisma } from "../../lib/db.js";
import { calculatePlanAverages } from "./calculate-plan-averages.js";
import { validateNutritionDays } from "./validate-nutrition-days.js";

interface FoodInput {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealInput {
  name: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: FoodInput[];
  notes?: string;
  order: number;
}

interface NutritionDayInput {
  weekDay?: WeekDay;
  order: number;
  meals: MealInput[];
}

export interface UpdateNutritionPlanDTO {
  planId: string;
  userId: string;
  goal?: string;
  notes?: string;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  days?: NutritionDayInput[];
}

export async function updateNutritionPlan(dto: UpdateNutritionPlanDTO) {
  const existing = await prisma.nutritionPlan.findUnique({
    where: { id: dto.planId },
  });

  if (!existing || existing.userId !== dto.userId) {
    throw new Error("Plano não encontrado.");
  }

  if (dto.days) {
    validateNutritionDays(dto.days);
  }

  return prisma.$transaction(async (tx) => {
    
    const planTotals = dto.days
      ? calculatePlanAverages(dto.days)
      : {
          ...(dto.totalCalories !== undefined && {
            totalCalories: dto.totalCalories,
          }),
          ...(dto.totalProtein !== undefined && {
            totalProtein: dto.totalProtein,
          }),
          ...(dto.totalCarbs !== undefined && { totalCarbs: dto.totalCarbs }),
          ...(dto.totalFat !== undefined && { totalFat: dto.totalFat }),
        };

    await tx.nutritionPlan.update({
      where: { id: dto.planId },
      data: {
        ...(dto.goal !== undefined && { goal: dto.goal?.trim() }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
        ...planTotals,
      },
    });

    if (dto.days) {
      await tx.nutritionDay.deleteMany({
        where: { nutritionPlanId: dto.planId },
      });

      for (const day of dto.days) {
        await tx.nutritionDay.create({
          data: {
            nutritionPlanId: dto.planId,
            weekDay: day.weekDay ?? null,
            order: day.order,
            totalCalories: day.meals.reduce((s, m) => s + m.calories, 0),
            totalProtein: day.meals.reduce((s, m) => s + m.protein, 0),
            totalCarbs: day.meals.reduce((s, m) => s + m.carbs, 0),
            totalFat: day.meals.reduce((s, m) => s + m.fat, 0),
            meals: {
              create: day.meals.map((meal) => ({
                name: meal.name.trim(),
                time: meal.time?.trim() || null,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                notes: meal.notes?.trim() || null,
                order: meal.order,
                foods: JSON.stringify(
                  meal.foods.map((f) => ({
                    ...f,
                    name: f.name.trim(),
                    unit: f.unit.trim(),
                  })),
                ),
              })),
            },
          },
        });
      }
    }

    return tx.nutritionPlan.findUnique({
      where: { id: dto.planId },
      include: {
        days: {
          orderBy: { order: "asc" },
          include: { meals: { orderBy: { order: "asc" } } },
        },
      },
    });
  });
}

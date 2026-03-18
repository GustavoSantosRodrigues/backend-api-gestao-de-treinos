-- CreateTable
CREATE TABLE "NutritionPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "coverImageUrl" TEXT,
    "notes" TEXT,
    "totalCalories" INTEGER NOT NULL,
    "totalProtein" INTEGER NOT NULL,
    "totalCarbs" INTEGER NOT NULL,
    "totalFat" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionDay" (
    "id" TEXT NOT NULL,
    "nutritionPlanId" TEXT NOT NULL,
    "weekDay" "WeekDay",
    "order" INTEGER NOT NULL,
    "totalCalories" INTEGER NOT NULL,
    "totalProtein" INTEGER NOT NULL,
    "totalCarbs" INTEGER NOT NULL,
    "totalFat" INTEGER NOT NULL,

    CONSTRAINT "NutritionDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "nutritionDayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time" TEXT,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "foods" TEXT NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NutritionPlan_userId_idx" ON "NutritionPlan"("userId");

-- CreateIndex
CREATE INDEX "NutritionDay_nutritionPlanId_idx" ON "NutritionDay"("nutritionPlanId");

-- CreateIndex
CREATE INDEX "Meal_nutritionDayId_idx" ON "Meal"("nutritionDayId");

-- AddForeignKey
ALTER TABLE "NutritionPlan" ADD CONSTRAINT "NutritionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionDay" ADD CONSTRAINT "NutritionDay_nutritionPlanId_fkey" FOREIGN KEY ("nutritionPlanId") REFERENCES "NutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_nutritionDayId_fkey" FOREIGN KEY ("nutritionDayId") REFERENCES "NutritionDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

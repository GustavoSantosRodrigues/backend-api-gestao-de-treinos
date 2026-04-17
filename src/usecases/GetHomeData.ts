import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { WeekDay } from "../generated/prisma/index.js";
import { prisma } from "../lib/db.js";

dayjs.extend(utc);

const WEEKDAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId?: string;
  todayWorkoutDay?: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRest: boolean;
    weekDay: WeekDay;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercisesCount: number;
    sessionStatus: "not_started" | "in_progress" | "completed";
    sessionId?: string;
  };
  workoutStreak: number;
  consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    }
  >;
}

export class GetHomeData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const currentDate = dayjs(dto.date);

    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      include: {
        workoutDays: {
          include: {
            exercises: {
              orderBy: {
                order: "asc",
              },
            },
            sessions: true,
          },
        },
      },
    });

    const todayWeekDay = WEEKDAY_MAP[currentDate.day()];
    const todayWorkoutDay = workoutPlan?.workoutDays.find(
      (day) => day.weekDay === todayWeekDay,
    );

    const weekStart = dayjs.utc(dto.date).day(0).startOf("day");
    const weekEnd = dayjs.utc(dto.date).day(6).endOf("day");

    const weekSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: { workoutPlanId: workoutPlan?.id },
        OR: [
          {
            startedAt: {
              gte: weekStart.toDate(),
              lte: weekEnd.toDate(),
            },
          },
          {
            completedAt: {
              gte: weekStart.toDate(),
              lte: weekEnd.toDate(),
            },
          },
        ],
      },
    });

    const consistencyByDay: Record<
      string,
      { workoutDayCompleted: boolean; workoutDayStarted: boolean }
    > = {};

    for (let i = 0; i < 7; i++) {
      const day = weekStart.add(i, "day");
      const dateKey = day.format("YYYY-MM-DD");

      const daySessions = weekSessions.filter(
        (s) => dayjs.utc(s.startedAt).format("YYYY-MM-DD") === dateKey,
      );

      const workoutDayStarted = daySessions.length > 0;
      const workoutDayCompleted = weekSessions.some(
        (s) =>
          s.completedAt !== null &&
          dayjs.utc(s.completedAt).format("YYYY-MM-DD") === dateKey,
      );

      consistencyByDay[dateKey] = { workoutDayCompleted, workoutDayStarted };
    }

    let workoutStreak = 0;

    if (workoutPlan) {
      workoutStreak = await this.calculateStreak(workoutPlan.id);
    }

    const todaySession = todayWorkoutDay?.sessions.find((s) => {
      const sessionDate = dayjs(s.startedAt).format("YYYY-MM-DD");
      return sessionDate === currentDate.format("YYYY-MM-DD");
    });

    const sessionStatus = !todaySession
      ? "not_started"
      : todaySession.completedAt
        ? "completed"
        : "in_progress";

    return {
      activeWorkoutPlanId: workoutPlan?.id,
      todayWorkoutDay:
        todayWorkoutDay && workoutPlan
          ? {
              workoutPlanId: workoutPlan.id,
              id: todayWorkoutDay.id,
              name: todayWorkoutDay.name,
              isRest: todayWorkoutDay.isRest,
              weekDay: todayWorkoutDay.weekDay,
              estimatedDurationInSeconds:
                todayWorkoutDay.estimatedDurationInSeconds,
              coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
              exercisesCount: todayWorkoutDay.exercises.length,
              sessionStatus,
              sessionId: todaySession?.id,
            }
          : undefined,
      workoutStreak,
      consistencyByDay,
    };
  }

  private async calculateStreak(workoutPlanId: string): Promise<number> {
    return prisma.workoutSession.count({
      where: {
        workoutDay: { workoutPlanId },
        completedAt: { not: null },
      },
    });
  }
}

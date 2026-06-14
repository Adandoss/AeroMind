export interface DailyActivityBucket {
  dayName: string;
  date: string;
  lessonsCompleted: number;
  minutesStudied: number;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildDailyActivityBuckets(referenceDate: Date = new Date()): DailyActivityBucket[] {
  const dailyActivity: DailyActivityBucket[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(referenceDate);
    date.setDate(referenceDate.getDate() - i);

    dailyActivity.push({
      dayName: WEEKDAY_NAMES[date.getDay()],
      date: date.toISOString().split("T")[0],
      lessonsCompleted: 0,
      minutesStudied: 0,
    });
  }

  return dailyActivity;
}

export function aggregateProgressIntoDailyActivity(
  buckets: DailyActivityBucket[],
  progressItems: Array<{ completedAt: Date; durationMin: number }>,
): DailyActivityBucket[] {
  const result = buckets.map((b) => ({ ...b }));

  for (const item of progressItems) {
    const dateStr = item.completedAt.toISOString().split("T")[0];
    const bucket = result.find((d) => d.date === dateStr);
    if (bucket) {
      bucket.lessonsCompleted += 1;
      bucket.minutesStudied += item.durationMin;
    }
  }

  return result;
}

export function computeCourseProgressPercent(completedLessons: number, totalLessons: number): number {
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
}

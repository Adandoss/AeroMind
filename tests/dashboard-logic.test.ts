import { describe, it, expect } from "vitest";
import {
  aggregateProgressIntoDailyActivity,
  buildDailyActivityBuckets,
  computeCourseProgressPercent,
} from "@/lib/dashboard-logic";

describe("computeCourseProgressPercent", () => {
  it("returns rounded percentage", () => {
    expect(computeCourseProgressPercent(1, 3)).toBe(33);
    expect(computeCourseProgressPercent(2, 4)).toBe(50);
  });

  it("returns 0 when there are no lessons", () => {
    expect(computeCourseProgressPercent(0, 0)).toBe(0);
  });
});

describe("buildDailyActivityBuckets", () => {
  it("creates seven consecutive day buckets", () => {
    const referenceDate = new Date("2026-06-14T12:00:00.000Z");
    const buckets = buildDailyActivityBuckets(referenceDate);

    expect(buckets).toHaveLength(7);
    expect(buckets[0].date).toBe("2026-06-08");
    expect(buckets[6].date).toBe("2026-06-14");
    expect(buckets.every((b) => b.lessonsCompleted === 0 && b.minutesStudied === 0)).toBe(true);
  });
});

describe("aggregateProgressIntoDailyActivity", () => {
  it("sums completed lessons and minutes into matching day buckets", () => {
    const buckets = buildDailyActivityBuckets(new Date("2026-06-14T12:00:00.000Z"));

    const aggregated = aggregateProgressIntoDailyActivity(buckets, [
      { completedAt: new Date("2026-06-12T18:00:00.000Z"), durationMin: 25 },
      { completedAt: new Date("2026-06-12T20:00:00.000Z"), durationMin: 15 },
      { completedAt: new Date("2026-06-14T09:00:00.000Z"), durationMin: 30 },
    ]);

    const thursday = aggregated.find((d) => d.date === "2026-06-12");
    const saturday = aggregated.find((d) => d.date === "2026-06-14");

    expect(thursday?.lessonsCompleted).toBe(2);
    expect(thursday?.minutesStudied).toBe(40);
    expect(saturday?.lessonsCompleted).toBe(1);
    expect(saturday?.minutesStudied).toBe(30);
  });
});

import { describe, it, expect } from "vitest";
import { mapCurriculumWithLessonStatus } from "@/lib/curriculum-logic";

const sampleModules = [
  {
    id: "mod-1",
    title: "Module 1: Foundations",
    order: 1,
    lessons: [
      { id: "lesson-preview", title: "Preview", durationMin: 10, order: 1, isFreePreview: true },
      { id: "lesson-locked", title: "Locked lesson", durationMin: 20, order: 2, isFreePreview: false },
    ],
  },
];

describe("mapCurriculumWithLessonStatus", () => {
  it("locks paid lessons for guests but keeps free previews open", () => {
    const result = mapCurriculumWithLessonStatus(sampleModules, {
      hasAccess: false,
      completedLessonIds: new Set(),
    });

    expect(result[0].lessons[0].isLocked).toBe(false);
    expect(result[0].lessons[1].isLocked).toBe(true);
  });

  it("unlocks all lessons for enrolled users", () => {
    const result = mapCurriculumWithLessonStatus(sampleModules, {
      hasAccess: true,
      completedLessonIds: new Set(),
    });

    expect(result[0].lessons.every((l) => !l.isLocked)).toBe(true);
  });

  it("marks completed lessons", () => {
    const result = mapCurriculumWithLessonStatus(sampleModules, {
      hasAccess: true,
      completedLessonIds: new Set(["lesson-locked"]),
    });

    expect(result[0].lessons[0].isCompleted).toBe(false);
    expect(result[0].lessons[1].isCompleted).toBe(true);
  });
});

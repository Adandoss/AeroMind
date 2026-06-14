export interface CurriculumLessonInput {
  id: string;
  title: string;
  durationMin: number;
  order: number;
  isFreePreview: boolean;
}

export interface CurriculumModuleInput {
  id: string;
  title: string;
  order: number;
  lessons: CurriculumLessonInput[];
}

export function mapCurriculumWithLessonStatus(
  modules: CurriculumModuleInput[],
  options: { hasAccess: boolean; completedLessonIds: Set<string> },
) {
  const { hasAccess, completedLessonIds } = options;

  return modules.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      ...l,
      isCompleted: completedLessonIds.has(l.id),
      isLocked: !l.isFreePreview && !hasAccess,
    })),
  }));
}

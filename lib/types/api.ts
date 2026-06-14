import type { Category } from "@/lib/types/enums";

export function getErrorMessage(error: unknown, fallback = "An error occurred"): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  priceCents: number;
  weeks: number;
  rating: number | null;
  ratingCount: number;
  instructor: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  isEnrolled?: boolean;
}

export interface CoursesResponse {
  courses: CourseListItem[];
  totalCount: number;
  pagesCount: number;
  page: number;
  limit: number;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  durationMin: number;
  order: number;
  isFreePreview: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface CurriculumModule {
  id: string;
  title: string;
  order: number;
  lessons: CurriculumLesson[];
}

export interface CurriculumResponse {
  courseId: string;
  title?: string;
  modules: CurriculumModule[];
}

export interface LessonDetail {
  id: string;
  title: string;
  content: string;
  durationMin: number;
  moduleId: string;
}

export interface AdminLesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  durationMin: number;
  order: number;
  isFreePreview: boolean;
}

export interface AdminModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: AdminLesson[];
}

export interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  priceCents: number;
  weeks: number;
  rating: number | null;
  ratingCount: number;
  instructor: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  modules?: AdminModule[];
  _count?: { modules: number };
}

export interface DailyActivity {
  dayName: string;
  date: string;
  lessonsCompleted: number;
  minutesStudied: number;
}

export interface EnrolledCourseSummary {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  instructor: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

export interface DashboardResponse {
  user: { name: string; email: string };
  subscription: { plan: string; status: string; currentPeriodEnd: string } | null;
  enrolledCourses: EnrolledCourseSummary[];
  dailyActivity: DailyActivity[];
  stats: {
    totalCompletedLessonsAllTime: number;
    totalHoursStudiedAllTime: number;
  };
}

export type CourseWhereFilter = {
  published: boolean;
  OR?: Array<{ title: { contains: string } } | { description: { contains: string } }>;
  category?: Category;
  priceCents?: number | { gt: number };
  rating?: { gte: number };
};

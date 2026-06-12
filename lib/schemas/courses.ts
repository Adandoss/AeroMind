import { z } from "zod";
import { Category } from "@/lib/types/enums";

export const CoursesQuerySchema = z.object({
  q: z.string().optional().default(""),
  category: z.nativeEnum(Category).optional(),
  price: z.enum(["free", "paid", "all"]).optional().default("all"),
  rating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1).catch(1),
  limit: z.coerce.number().int().min(1).default(6).catch(6),
});

export type CoursesQuery = z.infer<typeof CoursesQuerySchema>;

export const AdminCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long").regex(/^[a-z0-9-]+$/, "Slug must be URL-safe (lowercase, numbers, and hyphens only)"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.nativeEnum(Category, { message: "Invalid category" }),
  priceCents: z.coerce.number().int().nonnegative("Price cannot be negative"),
  weeks: z.coerce.number().int().positive("Duration in weeks must be positive"),
  instructor: z.string().min(2, "Instructor name must be at least 2 characters long"),
  published: z.boolean().default(false),
});

export type AdminCourseInput = z.infer<typeof AdminCourseSchema>;

export const AdminModuleSchema = z.object({
  title: z.string().min(2, "Module title must be at least 2 characters long"),
  courseId: z.string().min(1, "Course ID is required"),
  order: z.coerce.number().int().positive("Order must be a positive integer"),
});

export type AdminModuleInput = z.infer<typeof AdminModuleSchema>;

export const AdminLessonSchema = z.object({
  title: z.string().min(2, "Lesson title must be at least 2 characters long"),
  moduleId: z.string().min(1, "Module ID is required"),
  content: z.string().min(5, "Lesson content must be at least 5 characters long"),
  durationMin: z.coerce.number().int().positive("Duration in minutes must be positive"),
  order: z.coerce.number().int().positive("Order must be a positive integer"),
  isFreePreview: z.boolean().default(false),
});

export type AdminLessonInput = z.infer<typeof AdminLessonSchema>;

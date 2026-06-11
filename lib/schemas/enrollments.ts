import { z } from "zod";

export const EnrollmentCreateSchema = z.object({
  courseId: z.string().min(1, "Course ID is required to enroll"),
});

export type EnrollmentCreateInput = z.infer<typeof EnrollmentCreateSchema>;

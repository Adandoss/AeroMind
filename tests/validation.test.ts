import { describe, it, expect } from "vitest";
import { CoursesQuerySchema, AdminCourseSchema, AdminModuleSchema, AdminLessonSchema } from "@/lib/schemas/courses";
import { CheckoutSchema } from "@/lib/schemas/checkout";
import { EnrollmentCreateSchema } from "@/lib/schemas/enrollments";
import { Category, Plan } from "@/generated/prisma/client";

describe("CoursesQuerySchema", () => {
  it("should validate empty query params with default values", () => {
    const result = CoursesQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("");
      expect(result.data.price).toBe("all");
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(6);
    }
  });

  it("should validate and coerce correct query params", () => {
    const result = CoursesQuerySchema.safeParse({
      q: "Swiss",
      category: "DESIGN",
      price: "free",
      rating: "4.5",
      page: "2",
      limit: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("Swiss");
      expect(result.data.category).toBe(Category.DESIGN);
      expect(result.data.price).toBe("free");
      expect(result.data.rating).toBe(4.5);
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should fail on invalid category or pricing", () => {
    const result = CoursesQuerySchema.safeParse({
      category: "INVALID_CAT",
      price: "expensive",
    });
    expect(result.success).toBe(false);
  });
});

describe("CheckoutSchema", () => {
  it("should validate valid card and plan details", () => {
    const result = CheckoutSchema.safeParse({
      plan: "PROFESSIONAL",
      cardNumber: "1234567812345678",
      cvc: "123",
      expiry: "12/28",
    });
    expect(result.success).toBe(true);
  });

  it("should fail on incorrect card length", () => {
    const result = CheckoutSchema.safeParse({
      plan: "PROFESSIONAL",
      cardNumber: "1234",
      cvc: "123",
      expiry: "12/28",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Card number must be exactly 16 digits");
    }
  });

  it("should fail on invalid expiry date format", () => {
    const result = CheckoutSchema.safeParse({
      plan: "PROFESSIONAL",
      cardNumber: "1234567812345678",
      cvc: "123",
      expiry: "13/28", // Month 13 is invalid
    });
    expect(result.success).toBe(false);
  });
});

describe("EnrollmentCreateSchema", () => {
  it("should validate non-empty courseId", () => {
    const result = EnrollmentCreateSchema.safeParse({
      courseId: "course-123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail on empty courseId", () => {
    const result = EnrollmentCreateSchema.safeParse({
      courseId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("Admin Course/Module/Lesson CRUD Schemas", () => {
  it("should validate correct AdminCourseSchema", () => {
    const result = AdminCourseSchema.safeParse({
      title: "New Course",
      slug: "new-course-101",
      description: "This is a detailed course description containing more than ten characters.",
      category: "INTERFACE",
      priceCents: "4900",
      weeks: "4",
      instructor: "Jane Smith",
      published: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weeks).toBe(4);
      expect(result.data.priceCents).toBe(4900);
    }
  });

  it("should fail on unsafe course slug", () => {
    const result = AdminCourseSchema.safeParse({
      title: "New Course",
      slug: "Invalid Slug!",
      description: "This is a detailed course description containing more than ten characters.",
      category: "INTERFACE",
      priceCents: 4900,
      weeks: 4,
      instructor: "Jane Smith",
    });
    expect(result.success).toBe(false);
  });

  it("should validate correct AdminModuleSchema", () => {
    const result = AdminModuleSchema.safeParse({
      title: "Module 1",
      courseId: "course-id",
      order: "1",
    });
    expect(result.success).toBe(true);
  });

  it("should validate correct AdminLessonSchema", () => {
    const result = AdminLessonSchema.safeParse({
      title: "Lesson 1",
      moduleId: "module-id",
      content: "This is the content of the lesson.",
      durationMin: "15",
      order: "2",
      isFreePreview: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMin).toBe(15);
      expect(result.data.order).toBe(2);
    }
  });
});

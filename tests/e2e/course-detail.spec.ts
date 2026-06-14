import { test, expect } from "@playwright/test";
import { loginAsStudent } from "./helpers/auth";

test.describe("Course detail", () => {
  test("shows syllabus for guests without entering lessons", async ({ page }) => {
    await page.goto("/courses/advanced-swiss-typography");

    await expect(page.getByRole("heading", { name: "Advanced Swiss Typography" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Course Syllabus" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enroll in Course" })).toBeVisible();
  });

  test("shows continue option for an enrolled student", async ({ page }) => {
    await loginAsStudent(page);
    await page.goto("/courses/advanced-swiss-typography");

    await expect(page.getByRole("link", { name: "Go to Course" })).toBeVisible();
  });
});

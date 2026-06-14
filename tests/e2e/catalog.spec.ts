import { test, expect } from "@playwright/test";

test.describe("Course catalog", () => {
  test("lists seeded courses", async ({ page }) => {
    await page.goto("/courses");

    await expect(page.getByText("Advanced Swiss Typography")).toBeVisible();
    await expect(page.getByText("AeroMind: UI/UX Masterclass")).toBeVisible();
  });

  test("opens a course detail page", async ({ page }) => {
    await page.goto("/courses");
    await page.locator('a[href="/courses/advanced-swiss-typography"]').first().click();

    await expect(page).toHaveURL("/courses/advanced-swiss-typography");
    await expect(page.getByRole("heading", { name: "Advanced Swiss Typography" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Course Syllabus" })).toBeVisible();
  });
});

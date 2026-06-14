import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("shows hero and featured courses", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Master New Skills at Your Own Pace" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore Courses" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured Courses" })).toBeVisible();
    await expect(page.getByText("Advanced Swiss Typography")).toBeVisible();
  });

  test("navigates to the course catalog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Explore Courses" }).click();

    await expect(page).toHaveURL("/courses");
    await expect(page.getByRole("heading", { name: /courses/i })).toBeVisible();
  });
});

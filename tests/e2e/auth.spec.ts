import { test, expect } from "@playwright/test";
import { loginAsStudent } from "./helpers/auth";

test.describe("Authentication", () => {
  test("redirects guests away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in a seeded student and shows the dashboard", async ({ page }) => {
    await loginAsStudent(page);

    await expect(page.getByRole("heading", { name: "Welcome back, Alex Fischer" })).toBeVisible();
    await expect(page.getByText("Continue your precision learning path.")).toBeVisible();
  });
});

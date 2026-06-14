import { Page } from "@playwright/test";

export async function loginAsStudent(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("alex@aeromind.dev");
  await page.getByLabel("Password").fill("Student123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("/dashboard");
}

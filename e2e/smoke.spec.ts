import { expect, test } from "@playwright/test"

test("landing page renders the hero and nav", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Train")
  await expect(page.getByRole("link", { name: "Member login" })).toBeVisible()
})

test("admin can sign in with the demo account and reach the dashboard", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("button", { name: /Gym owner \/ Admin/ }).click()
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
})

test("protected areas redirect to login when signed out", async ({ page }) => {
  await page.goto("/portal")
  await expect(page).toHaveURL(/\/login$/)
})

import {
  test as base,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

export { expect, type Page };

export const PASSWORD = "Passw0rd!";

// fails any test that throws an uncaught error in the page
export const test = base.extend<{ pageErrors: void }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await use();
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});

export const uniqueEmail = (prefix: string) =>
  `${prefix}-${Date.now()}@example.com`;

// waits for hydration so clicks reach react
export const visit = (page: Page, path: string) =>
  page.goto(path, { waitUntil: "networkidle" });

export async function productPath(request: APIRequestContext, index = 0) {
  const response = await request.get("/api/product/search?q=e");
  const results: { product: { _id: string } }[] = await response.json();
  return `/product/${results[index].product._id}`;
}

export async function signUp(page: Page, name: string, email: string) {
  await visit(page, "/signin");
  await page.getByRole("tab", { name: "Create account" }).click();
  const form = page.getByRole("form", { name: "Create account" });
  await form.getByLabel("First and last name").fill(name);
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Password").fill(PASSWORD);
  await form.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
  await expect(page).toHaveURL("/");
}

export async function deleteAccount(page: Page) {
  await visit(page, "/profile");
  await page.getByRole("button", { name: "Delete account" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("status", { name: "Notifications" }),
  ).toContainText("Account deleted");
}

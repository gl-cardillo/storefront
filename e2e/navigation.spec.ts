import { test, expect, visit } from "./fixtures";

test("logged out pages redirect to sign in", async ({ page }) => {
  for (const path of ["/cart", "/profile"]) {
    await page.goto(path);
    await expect(page).toHaveURL("/signin");
  }
});

test("search suggests products and opens the results", async ({ page }) => {
  await visit(page, "/");
  const search = page.getByRole("combobox", { name: "Search products" });
  await search.fill("phone");
  await expect(
    page
      .getByRole("listbox", { name: "Search suggestions" })
      .getByRole("option")
      .first(),
  ).toBeVisible();

  await search.press("Enter");
  await expect(page).toHaveURL("/search?q=phone");
  await expect(page.getByRole("main").getByRole("link")).toHaveCount(3);
});

test("a suggestion can be opened with the keyboard", async ({ page }) => {
  await visit(page, "/");
  const search = page.getByRole("combobox", { name: "Search products" });
  await search.fill("phone");
  const first = page.getByRole("option").first();
  await expect(first).toBeVisible();
  const name = await first.textContent();

  await search.press("ArrowDown");
  await expect(first).toHaveAttribute("aria-selected", "true");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/product\//);
  await expect(
    page.getByRole("heading", { name: name! }).first(),
  ).toBeVisible();
});

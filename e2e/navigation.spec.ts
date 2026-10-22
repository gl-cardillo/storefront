import { test, expect, visit } from "./fixtures";

test("logged out pages redirect to sign in", async ({ page }) => {
  for (const path of ["/cart", "/profile"]) {
    await page.goto(path);
    await expect(page).toHaveURL("/signin");
  }
});

test("the hero carousel moves between slides", async ({ page }) => {
  await visit(page, "/");
  const carousel = page.getByRole("region", { name: "Featured" });
  const dot = (n: number) =>
    carousel.getByRole("button", { name: `Go to slide ${n}` });
  await expect(dot(1)).toHaveAttribute("aria-current", "true");

  await carousel.getByRole("button", { name: "Next slide" }).click();
  await expect(dot(2)).toHaveAttribute("aria-current", "true");
  await expect(
    carousel.getByRole("link", { name: "See phones" }),
  ).toBeVisible();

  await carousel.getByRole("button", { name: "Previous slide" }).click();
  await expect(dot(1)).toHaveAttribute("aria-current", "true");
  await carousel.getByRole("link", { name: "Shop shoes" }).click();
  await expect(page).toHaveURL("/category/clothes/Shoes");
});

test("the category menu narrows down to a subcategory", async ({ page }) => {
  await visit(page, "/category/books");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Books");
  const menu = page.getByRole("navigation", { name: "Categories" });
  await menu.getByRole("link", { name: "Fantasy" }).click();
  await expect(page).toHaveURL("/category/books/Fantasy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fantasy");
  await expect(menu.getByRole("link", { name: "Fantasy" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("main").getByRole("listitem")).not.toHaveCount(0);
});

test("products can be sorted and filtered from the url", async ({ page }) => {
  await visit(page, "/category/electronics");
  const prices = async () =>
    (
      await page
        .getByRole("main")
        .getByRole("listitem")
        .getByText(/^£[\d.]+$/)
        .allTextContents()
    ).map((price) => Number(price.slice(1)));

  await page.getByLabel("Sort by").selectOption("Price: low to high");
  await expect(page).toHaveURL(/sort=price-asc/);
  const sorted = await prices();
  expect(sorted).toEqual([...sorted].sort((a, b) => a - b));

  await page.getByLabel("Price").selectOption("£500 and over");
  await expect(page).toHaveURL(/price=500-/);
  await expect(page.getByText(/^\d+ of \d+ products$/)).toBeVisible();
  expect((await prices()).every((price) => price >= 500)).toBe(true);

  // the choices come back from the url after a reload
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByLabel("Sort by")).toHaveValue("price-asc");
  await expect(page.getByLabel("Price")).toHaveValue("500-");

  await page.getByLabel("Price").selectOption("Under £25");
  await expect(
    page.getByRole("heading", { name: "No products match these filters" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL("/category/electronics?sort=price-asc");
  await expect(page.getByRole("main").getByText(/^£[\d.]+$/)).not.toHaveCount(
    0,
  );
});

test("a search without results says so", async ({ page }) => {
  await page.goto("/search?q=zzzqqq");
  await expect(
    page.getByRole("heading", { name: "No products found" }),
  ).toBeVisible();
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

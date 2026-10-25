import {
  test,
  expect,
  expectNoViolations,
  visit,
  productPath,
} from "./fixtures";

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test("public pages have no accessibility violations", async ({
      page,
      request,
    }) => {
      const paths = [
        "/",
        "/category/books",
        "/category/books/Fantasy",
        "/search?q=phone",
        "/search?q=zzzqqq",
        await productPath(request),
        "/signin",
        "/no-such-page",
      ];
      for (const path of paths) {
        await test.step(path, async () => {
          await visit(page, path);
          await expectNoViolations(page);
        });
      }
    });

    test("account pages have no accessibility violations", async ({ page }) => {
      await visit(page, "/signin");
      await page.getByRole("button", { name: "Try the demo account" }).click();
      await expect(page).toHaveURL("/");
      for (const path of ["/cart", "/checkout", "/profile"]) {
        await test.step(path, async () => {
          await visit(page, path);
          await expectNoViolations(page);
        });
      }
    });

    test("open menus and dialogs have no accessibility violations", async ({
      page,
      request,
    }) => {
      await visit(page, "/");
      await page
        .getByRole("combobox", { name: "Search products" })
        .fill("phone");
      await expect(page.getByRole("option").first()).toBeVisible();
      await expectNoViolations(page);

      await visit(page, await productPath(request));
      await page.getByRole("button", { name: "Add to Cart" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expectNoViolations(page);
    });

    test("phone layouts have no accessibility violations", async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      for (const path of ["/", "/category/books", await productPath(request)]) {
        await test.step(path, async () => {
          await visit(page, path);
          await expectNoViolations(page);
        });
      }
    });
  });
}

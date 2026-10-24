import {
  test,
  expect,
  deleteAccount,
  productPath,
  signUp,
  uniqueEmail,
  visit,
} from "./fixtures";

test("a user can review a product once", async ({ page, request }) => {
  const text = `Browser test review ${Date.now()}`;
  const product = await productPath(request, 5);
  const leaveReview = page.getByRole("heading", { name: "Leave a review" });
  const reviewed = page.getByText("You reviewed this product");

  await signUp(page, "Review Tester", uniqueEmail("e2e-reviews"));
  await visit(page, product);
  await expect(leaveReview).toBeVisible();

  await test.step("show every missing field at once", async () => {
    await page.getByRole("button", { name: "Add review" }).click();
    await expect(page.getByText("Select a star")).toBeVisible();
    await expect(
      page.getByText("Review must be at least 2 characters"),
    ).toBeVisible();
  });

  await test.step("post the review", async () => {
    await page.getByRole("button", { name: "Rate 4 stars" }).click();
    await page.getByLabel("Your review").fill(text);
    await page.getByRole("button", { name: "Add review" }).click();
    await expect(reviewed).toBeVisible();
    await expect(leaveReview).toHaveCount(0);
    await expect(page.getByText(text)).toBeVisible();
    await page.reload();
    await expect(reviewed).toBeVisible();
  });

  await test.step("deleting the account removes the review", async () => {
    await deleteAccount(page);
    await visit(page, product);
    await expect(page.getByText(text)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Write a review" }),
    ).toBeVisible();
  });
});

test("logged out shoppers are asked to sign in", async ({ page, request }) => {
  await visit(page, await productPath(request));
  await page.getByRole("button", { name: "Add to Cart" }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in to continue" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Not now" }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Write a review" }).click();
  await dialog.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/signin");
});

test("the gallery switches images", async ({ page, request }) => {
  const response = await request.get("/api/product/search?q=e");
  const results: { product: { _id: string; picUrl2?: string } }[] =
    await response.json();
  const withGallery = results.find(({ product }) => product.picUrl2);
  test.skip(!withGallery, "no product with more than one image");
  await visit(page, `/product/${withGallery!.product._id}`);
  const thumbnails = page.getByRole("button", { name: /^Show image/ });
  await thumbnails.nth(1).click();
  await expect(thumbnails.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(thumbnails.nth(0)).toHaveAttribute("aria-pressed", "false");
});

test("a product suggests others like it", async ({ page, request }) => {
  const path = await productPath(request);
  await visit(page, path);
  const links = page
    .getByRole("region", { name: "More like this" })
    .getByRole("link");
  await expect(links.first()).toBeVisible();
  expect(await links.count()).toBeLessThanOrEqual(4);
  const hrefs = await links.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href")),
  );
  expect(hrefs).not.toContain(path);

  await links.first().click();
  await expect(page).toHaveURL(hrefs[0]!);
});

test("a product page has its own link preview", async ({ page, request }) => {
  const path = await productPath(request);
  await visit(page, path);
  const name = await page.getByRole("heading", { level: 1 }).textContent();
  const meta = (property: string) =>
    page.locator(`meta[property="${property}"]`);

  await expect(page).toHaveTitle(`${name} | Storefront`);
  await expect(meta("og:title")).toHaveAttribute("content", name!);
  await expect(meta("og:url")).toHaveAttribute(
    "content",
    new RegExp(`${path}$`),
  );
  await expect(meta("og:image")).toHaveAttribute(
    "content",
    /^https:\/\/.+\/products\/.+\.(jpg|png)$/,
  );
  expect(
    (await page.locator('meta[name="description"]').getAttribute("content"))!
      .length,
  ).toBeLessThanOrEqual(160);

  // client side navigation swaps the tags back to the defaults
  await page
    .getByRole("banner")
    .getByRole("link", { name: "storefront" })
    .click();
  await expect(page).toHaveURL("/");
  await expect(page).toHaveTitle("Storefront");
  await expect(meta("og:url")).toHaveCount(0);
});

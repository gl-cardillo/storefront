import {
  test,
  expect,
  PASSWORD,
  deleteAccount,
  productPath,
  signUp,
  uniqueEmail,
  visit,
} from "./fixtures";

test("sign up, shop, edit profile, log in and delete", async ({
  page,
  request,
}) => {
  const email = uniqueEmail("e2e-account");
  const product = await productPath(request);
  const cart = page.getByRole("link", { name: /^Cart/ });
  const increase = page.getByRole("button", { name: "Increase quantity" });
  const decrease = page.getByRole("button", { name: "Decrease quantity" });

  await test.step("sign up and stay logged in", async () => {
    await signUp(page, "Step Seven", email);
    await page.reload();
    await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
  });

  await test.step("add to cart from the product page", async () => {
    await visit(page, product);
    await increase.click();
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(cart).toHaveAccessibleName("Cart, 2 items");
  });

  await test.step("change quantities in the basket", async () => {
    await visit(page, "/cart");
    await expect(page.getByText("Subtotal (2 items)")).toBeVisible();
    await increase.click();
    await expect(page.getByText("Subtotal (3 items)")).toBeVisible();
    await expect(cart).toHaveAccessibleName("Cart, 3 items");
    await decrease.click();
    await expect(page.getByText("Subtotal (2 items)")).toBeVisible();
    await expect(cart).toHaveAccessibleName("Cart, 2 items");
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("Your basket is empty")).toBeVisible();
    await expect(cart).toHaveAccessibleName("Cart");
  });

  await test.step("stop at the quantity limit", async () => {
    await visit(page, product);
    for (let i = 0; i < 8; i++) await increase.click();
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(cart).toHaveAccessibleName("Cart, 9 items");
    await visit(page, "/cart");
    await increase.click();
    await expect(page.getByText("The limit is 9")).toBeVisible();
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("Your basket is empty")).toBeVisible();
  });

  await test.step("edit the profile", async () => {
    await visit(page, "/profile");
    await expect(
      page.getByRole("heading", { name: "Welcome Step" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Show details" }).click();
    await page.getByRole("button", { name: "Edit details" }).click();
    await expect(page.getByLabel("Name")).toHaveValue("Step Seven");
    await page.getByLabel("City").fill("Leeds");
    await page.getByLabel("Date of birth").fill("1990-01-15");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByText("City: Leeds")).toBeVisible();
    await expect(page.getByText(/Date of birth:.*1990/)).toBeVisible();
  });

  await test.step("log out to the home page", async () => {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  await test.step("log in", async () => {
    await visit(page, "/signin");
    await page.getByRole("tab", { name: "Sign in" }).click();
    const form = page.getByRole("form", { name: "Sign in" });
    await form.getByLabel("Email").fill(email);
    await form.getByLabel("Password").fill("wrong-password");
    await form.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Credentials are incorrect")).toBeVisible();
    await form.getByLabel("Password").fill(PASSWORD);
    await form.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  await test.step("cancel keeps the account", async () => {
    await visit(page, "/profile");
    await page.getByRole("button", { name: "Delete account" }).click();
    const dialog = page.getByRole("dialog", { name: "Delete your account?" });
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Delete account" }),
    ).toBeVisible();
  });

  await test.step("delete the account", async () => {
    await deleteAccount(page);
    const login = await request.post("/api/auth/login", {
      data: { emailLogin: email, passwordLogin: PASSWORD },
    });
    expect(login.status()).toBe(400);
  });
});

test("the demo account button logs in", async ({ page }) => {
  await visit(page, "/signin");
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("an invalid token logs the user out", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("token_amazon_lc", JSON.stringify("bad-token")),
  );
  await page.goto("/cart");
  await expect(page).toHaveURL("/signin");
  expect(
    await page.evaluate(() => localStorage.getItem("token_amazon_lc")),
  ).toBeNull();
});

test("the sign in tabs work with the arrow keys", async ({ page }) => {
  await visit(page, "/signin");
  const signIn = page.getByRole("tab", { name: "Sign in" });
  const createAccount = page.getByRole("tab", { name: "Create account" });
  await expect(signIn).toHaveAttribute("aria-selected", "true");
  await signIn.focus();
  await page.keyboard.press("ArrowRight");
  await expect(createAccount).toBeFocused();
  await expect(createAccount).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("form", { name: "Create account" }),
  ).toBeVisible();
  await expect(page.getByRole("form", { name: "Sign in" })).toBeHidden();
});

import {
  test,
  expect,
  PASSWORD,
  deleteAccount,
  expectNoViolations,
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
    await expect(
      page.getByRole("status", { name: "Notifications" }),
    ).toContainText("Added to your basket");
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

    // a failed save is rolled back and explained
    await page.route("**/api/cart/addToCart", (route) =>
      route.request().method() === "PUT"
        ? route.fulfill({
            status: 500,
            json: { message: "Could not update your basket" },
          })
        : route.continue(),
    );
    await increase.click();
    await expect(
      page.getByRole("status", { name: "Notifications" }),
    ).toContainText("Could not update your basket");
    await expect(page.getByText("Subtotal (2 items)")).toBeVisible();
    await page.unroute("**/api/cart/addToCart");

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
      page.getByRole("heading", { name: "Welcome, Step" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Edit details" }).click();
    await expect(page.getByLabel("Name")).toHaveValue("Step Seven");
    await page.getByLabel("City").fill("Leeds");
    await page.getByLabel("Date of birth").fill("1990-01-15");
    await page.getByRole("button", { name: "Update" }).click();
    const details = page.getByRole("definition");
    await expect(details.filter({ hasText: "Leeds" })).toBeVisible();
    await expect(details.filter({ hasText: "1990" })).toBeVisible();
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

test("the chosen currency survives a reload", async ({ page, request }) => {
  await visit(page, "/signin");
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
  await visit(page, "/profile");
  await page.getByRole("button", { name: "€" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "€" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await visit(page, await productPath(request));
  await expect(page.getByText(/^€\d/).first()).toBeVisible();
});

test("a basket that fails to load can be retried", async ({ page }) => {
  await visit(page, "/signin");
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await expect(page.getByRole("link", { name: "Account" })).toBeVisible();

  let fail = true;
  await page.route("**/api/cart/getCartProduct", (route) =>
    fail ? route.fulfill({ status: 500, json: {} }) : route.continue(),
  );
  await visit(page, "/cart");
  await expect(
    page.getByRole("heading", { name: "We couldn't load your basket" }),
  ).toBeVisible({ timeout: 15_000 });

  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Order summary" }),
  ).toBeVisible();
});

test("products can be saved to the wishlist", async ({ page }) => {
  await signUp(page, "Wishlist Tester", uniqueEmail("e2e-wishlist"));
  await visit(page, "/category/books");
  // the category menu is a list too, product cards are the items with a heading
  const card = page
    .getByRole("main")
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading") })
    .first();
  const name = (await card.getByRole("heading").textContent())!.trim();
  const heart = (scope = page.getByRole("main")) =>
    scope.getByRole("button", { name: `Save ${name}`, exact: true });

  await heart(card).click();
  await expect(heart(card)).toHaveAttribute("aria-pressed", "true");

  await card.getByRole("link").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
  await expect(heart()).toHaveAttribute("aria-pressed", "true");

  await visit(page, "/profile");
  const saved = page.getByRole("region", { name: "Saved items" });
  await expect(saved.getByRole("heading", { name })).toBeVisible();
  await heart(saved).click();
  await expect(saved.getByText("Nothing saved yet")).toBeVisible();
  // removed on the server too, not just on screen
  await page.reload();
  await expect(saved.getByText("Nothing saved yet")).toBeVisible();

  await deleteAccount(page);
});

test("saving two products at once keeps both", async ({ page }) => {
  await signUp(page, "Wishlist Racer", uniqueEmail("e2e-wishlist-race"));
  await visit(page, "/category/electronics");
  const hearts = page.getByRole("main").getByRole("button", { name: /^Save / });
  let saved = 0;
  page.on("response", (response) => {
    const { pathname } = new URL(response.url());
    if (
      pathname === "/api/wishlist" &&
      response.request().method() === "POST"
    ) {
      saved += 1;
    }
  });
  // the second click goes out while the first request is still running
  await hearts.nth(0).click();
  await hearts.nth(1).click();
  await expect(hearts.nth(0)).toHaveAttribute("aria-pressed", "true");
  await expect(hearts.nth(1)).toHaveAttribute("aria-pressed", "true");

  // the hearts fill straight away, a reload before both replies would cancel a save
  await expect.poll(() => saved).toBe(2);
  await page.reload({ waitUntil: "networkidle" });
  await expect(hearts.nth(0)).toHaveAttribute("aria-pressed", "true");
  await expect(hearts.nth(1)).toHaveAttribute("aria-pressed", "true");

  await deleteAccount(page);
});

test("a basket can be checked out", async ({ page, request }) => {
  const cart = page.getByRole("link", { name: /^Cart/ });
  await signUp(page, "Checkout Tester", uniqueEmail("e2e-checkout"));
  const orders = page.getByRole("region", { name: "Orders" });
  await visit(page, "/profile");
  await expect(orders.getByText("No orders yet")).toBeVisible();

  await visit(page, await productPath(request));
  const name = await page.getByRole("heading", { level: 1 }).textContent();
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(cart).toHaveAccessibleName("Cart, 1 items");

  await visit(page, "/cart");
  await page.getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL("/checkout");
  const form = page.getByRole("form", { name: "Delivery address" });
  // the name comes from the account, the rest isn't on the profile yet
  await expect(form.getByLabel("Full name")).toHaveValue("Checkout Tester");
  await expect(page.getByText("Subtotal (1 item)")).toBeVisible();

  await page.getByRole("button", { name: "Place order" }).click();
  await expect(form.getByText("Address is required")).toBeVisible();
  await expect(form.getByText("City is required")).toBeVisible();
  await expect(form.getByText("Postcode is required")).toBeVisible();

  await form.getByLabel("Address").fill("1 Test Street");
  await form.getByLabel("City").fill("London");
  await form.getByLabel("Postcode").fill("E1 6AN");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders\/[0-9a-f]{24}$/);
  const orderUrl = page.url();
  const confirmation = async () => {
    await expect(
      page.getByRole("heading", { name: "Thanks for your order" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: name! })).toBeVisible();
    await expect(page.getByText("1 Test Street")).toBeVisible();
    await expect(page.getByText("Subtotal (1 item)")).toBeVisible();
  };
  await confirmation();
  await expect(cart).toHaveAccessibleName("Cart");
  // the order comes from the server, not just the checkout's cache
  await page.reload({ waitUntil: "networkidle" });
  await confirmation();
  await expectNoViolations(page);

  // going back skips the finished checkout
  await page.goBack();
  await expect(page).toHaveURL("/cart");

  await visit(page, "/checkout");
  await expect(
    page.getByRole("heading", { name: "Your basket is empty" }),
  ).toBeVisible();

  // the profile lists it and links back to the confirmation
  await visit(page, "/profile");
  const number = orderUrl.slice(-8).toUpperCase();
  await orders
    .getByRole("link", { name: new RegExp(`^Order ${number}`) })
    .click();
  await expect(page).toHaveURL(orderUrl);
  await confirmation();

  await deleteAccount(page);
});

test("an unknown order says so", async ({ page }) => {
  await visit(page, "/signin");
  await page.getByRole("button", { name: "Try the demo account" }).click();
  await expect(page).toHaveURL("/");
  for (const id of ["000000000000000000000000", "not-an-id"]) {
    await visit(page, `/orders/${id}`);
    await expect(
      page.getByRole("heading", { name: "Order not found" }),
    ).toBeVisible();
  }
});

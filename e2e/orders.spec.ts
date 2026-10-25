import type { APIRequestContext } from "@playwright/test";
import { test, expect, PASSWORD, uniqueEmail } from "./fixtures";
import type { Order, Product } from "@/types";

const ADDRESS = {
  name: "Order Tester",
  address: "1 Test Street",
  city: "London",
  postcode: "E1 6AN",
};

async function newUser(request: APIRequestContext) {
  const response = await request.post("/api/auth/signup", {
    data: {
      name: "Order Tester",
      email: uniqueEmail("e2e-orders"),
      password: PASSWORD,
    },
  });
  const { token } = await response.json();
  return { Authorization: `Bearer ${token}` };
}

test("a basket becomes an order", async ({ request }) => {
  const headers = await newUser(request);
  const results: { product: Product }[] = await (
    await request.get("/api/product/search?q=e")
  ).json();
  const { product } = results[0];
  const productId = product._id;

  await test.step("an empty basket can't be ordered", async () => {
    const response = await request.post("/api/orders", {
      headers,
      data: ADDRESS,
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: "Your basket is empty" });
  });

  await request.post("/api/cart/addToCart", {
    headers,
    data: { productId, quantity: 2 },
  });

  await test.step("the address is required", async () => {
    const response = await request.post("/api/orders", {
      headers,
      data: { ...ADDRESS, city: " " },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: "City is required" });
  });

  let order: Order;
  await test.step("placing the order empties the basket", async () => {
    const response = await request.post("/api/orders", {
      headers,
      // a price sent by the client is ignored
      data: { ...ADDRESS, total: 0.01 },
    });
    expect(response.status()).toBe(201);
    order = (await response.json()).order;
    expect(order.items).toEqual([
      {
        productId,
        name: product.name,
        price: product.price,
        picUrl: product.picUrl,
        quantity: 2,
      },
    ]);
    expect(order.total).toBe(Math.round(product.price * 2 * 100) / 100);
    expect(order.address).toEqual(ADDRESS);

    const me = await (await request.get("/api/user/me", { headers })).json();
    expect(me.cart).toEqual([]);
  });

  await test.step("the order can be read back", async () => {
    const { orders } = await (
      await request.get("/api/orders", { headers })
    ).json();
    expect(orders.map((o: Order) => o.id)).toEqual([order.id]);
    const one = await request.get(`/api/orders/${order.id}`, { headers });
    expect((await one.json()).order.id).toBe(order.id);
  });

  await test.step("other users can't see it", async () => {
    const stranger = await newUser(request);
    const response = await request.get(`/api/orders/${order.id}`, {
      headers: stranger,
    });
    expect(response.status()).toBe(404);
    await request.delete("/api/user/deleteAccount", { headers: stranger });
  });

  await test.step("deleting the account deletes its orders", async () => {
    await request.delete("/api/user/deleteAccount", { headers });
    // the token still verifies after deletion, so it can look for leftovers
    const { orders } = await (
      await request.get("/api/orders", { headers })
    ).json();
    expect(orders).toEqual([]);
  });
});

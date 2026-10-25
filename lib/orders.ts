import { isValidObjectId } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import User from "@/models/User";
import { getProductsById } from "@/lib/products";
import type { CheckoutInput } from "@/utils/schemas";

type CreateOrderResult =
  | { order: InstanceType<typeof Order> }
  | { error: "user-not-found" | "empty-basket" };

// prices come from the database, never from the request
export async function createOrder(
  userId: string,
  address: CheckoutInput,
): Promise<CreateOrderResult> {
  const { connection } = await dbConnect();
  // the order and the emptied basket are saved together or not at all
  return connection.transaction(async (session) => {
    const user = await User.findById(userId).session(session);
    if (!user) return { error: "user-not-found" as const };

    const products = await getProductsById(
      user.cart.map((item) => item.productId),
    );
    const byId = new Map(products.map((product) => [product.id, product]));
    // products deleted since they were added are left out
    const items = user.cart.flatMap(({ productId, quantity }) => {
      const product = byId.get(productId);
      if (!product) return [];
      const { name, price, picUrl } = product;
      return [{ productId, name, price, picUrl, quantity }];
    });
    if (items.length === 0) return { error: "empty-basket" as const };

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const [order] = await Order.create(
      [
        {
          userId,
          items,
          address,
          total: Math.round(total * 100) / 100,
        },
      ],
      { session },
    );
    user.set("cart", []);
    await user.save({ session });
    return { order };
  });
}

export async function getOrders(userId: string) {
  await dbConnect();
  return Order.find({ userId }).sort({ createdAt: -1 });
}

// someone else's order is reported as not found, not forbidden
export async function getOrder(userId: string, orderId: string) {
  if (!isValidObjectId(orderId)) return null;
  await dbConnect();
  return Order.findOne({ _id: orderId, userId });
}

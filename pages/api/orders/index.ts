import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/utils/auth";
import { checkoutSchema } from "@/utils/schemas";
import { createOrder, getOrders } from "@/lib/orders";
import { methodNotAllowed, parseBody } from "@/lib/api";

// GET lists the user's orders, POST turns the basket into an order
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!["GET", "POST"].includes(req.method ?? "")) {
    return methodNotAllowed(res, ["GET", "POST"]);
  }
  const token = verifyToken(req);
  if (!token) {
    return res.status(401).json({ message: "User not logged in" });
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json({ orders: await getOrders(token.id) });
    }

    const address = parseBody(checkoutSchema, req, res);
    if (!address) return;
    const result = await createOrder(token.id, address);
    if ("error" in result) {
      return result.error === "empty-basket"
        ? res.status(400).json({ message: "Your basket is empty" })
        : res.status(404).json({ message: "User not found" });
    }
    return res.status(201).json({ order: result.order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sorry, try again later" });
  }
}

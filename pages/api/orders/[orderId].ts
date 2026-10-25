import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/utils/auth";
import { getOrder } from "@/lib/orders";
import { methodNotAllowed } from "@/lib/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const token = verifyToken(req);
  if (!token) {
    return res.status(401).json({ message: "User not logged in" });
  }

  try {
    const order = await getOrder(token.id, String(req.query.orderId));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sorry, try again later" });
  }
}

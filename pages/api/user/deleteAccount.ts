import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { verifyToken } from "@/utils/auth";
import { methodNotAllowed } from "@/lib/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") return methodNotAllowed(res, ["DELETE"]);
  const token = verifyToken(req);
  if (!token) {
    return res.status(401).json({ message: "User not logged in" });
  }

  try {
    const { connection } = await dbConnect();
    // the account, its reviews and its orders go together or not at all
    const deleted = await connection.transaction(async (session) => {
      const user = await User.findByIdAndDelete(token.id, { session });
      if (user) {
        await Review.deleteMany({ userId: user.id }, { session });
        await Order.deleteMany({ userId: user.id }, { session });
      }
      return user;
    });
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sorry, try again later" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import { wishlistSchema } from "@/utils/schemas";
import { getProductById, getProductsWithRatings } from "@/lib/products";
import { methodNotAllowed, parseBody } from "@/lib/api";
import { MAX_WISHLIST } from "@/utils/constants";

// GET lists the saved products, POST and DELETE return the updated user
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!["GET", "POST", "DELETE"].includes(req.method ?? "")) {
    return methodNotAllowed(res, ["GET", "POST", "DELETE"]);
  }
  const token = verifyToken(req);
  if (!token) {
    return res.status(401).json({ message: "User not logged in" });
  }

  try {
    await dbConnect();

    if (req.method === "GET") {
      const user = await User.findById(token.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const products = await getProductsWithRatings(user.wishlist);
      return res.status(200).json({ products });
    }

    const body = parseBody(wishlistSchema, req, res);
    if (!body) return;
    const { productId } = body;

    // single atomic updates, so saving two products at once can't conflict
    if (req.method === "DELETE") {
      const user = await User.findByIdAndUpdate(
        token.id,
        { $pull: { wishlist: productId } },
        { returnDocument: "after" },
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    }

    if (!(await getProductById(productId))) {
      return res.status(404).json({ message: "Product not found" });
    }
    // only matches when the product isn't saved yet and there is room
    const user = await User.findOneAndUpdate(
      {
        _id: token.id,
        wishlist: { $ne: productId },
        [`wishlist.${MAX_WISHLIST - 1}`]: { $exists: false },
      },
      { $push: { wishlist: { $each: [productId], $position: 0 } } },
      { returnDocument: "after" },
    );
    if (user) return res.status(200).json(user);

    // no match, find out why
    const current = await User.findById(token.id);
    if (!current) {
      return res.status(404).json({ message: "User not found" });
    }
    if (current.wishlist.includes(productId)) {
      return res.status(200).json(current);
    }
    return res
      .status(400)
      .json({ message: `You can save up to ${MAX_WISHLIST} items` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sorry, try again later" });
  }
}

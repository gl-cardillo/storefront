import { isValidObjectId, type HydratedDocument } from "mongoose";
import dbConnect from "@/utils/dbConnect";
import Product, { type ProductDocument } from "@/models/Product";
import { getAverageRatings } from "@/lib/reviews";

type ProductDoc = HydratedDocument<ProductDocument>;

async function withRatings(products: ProductDoc[]) {
  const averages = await getAverageRatings(products.map((p) => p.id));
  return products.map((product) => ({
    product,
    reviewAverage: averages.get(product.id) ?? 0,
  }));
}

export async function getProductById(productId: string) {
  // findById throws a CastError on malformed ids, treat them as not found
  if (!isValidObjectId(productId)) return null;
  await dbConnect();
  return Product.findById(productId);
}

export async function getProductsById(productIds: string[]) {
  await dbConnect();
  return Product.find({ _id: { $in: productIds.filter(isValidObjectId) } });
}

// keeps the order of the ids and skips products that no longer exist
export async function getProductsWithRatings(productIds: string[]) {
  const products = await getProductsById(productIds);
  const byId = new Map(products.map((product) => [product.id, product]));
  return withRatings(productIds.flatMap((id) => byId.get(id) ?? []));
}

export async function getProductsByCategory(categoryId: string) {
  await dbConnect();
  return withRatings(await Product.find({ categoryId }));
}

export async function getProductsBySubcategory(subcategory: string) {
  await dbConnect();
  return withRatings(await Product.find({ subcategory }));
}

// same subcategory first, topped up from the category when it has too few
export async function getRelatedProducts(product: ProductDoc, limit = 4) {
  await dbConnect();
  const others = { _id: { $ne: product._id } };
  const related = await Product.find({
    ...others,
    subcategory: product.subcategory,
  }).limit(limit);
  if (related.length < limit) {
    const topUp = await Product.find({
      ...others,
      categoryId: product.categoryId,
      subcategory: { $ne: product.subcategory },
    }).limit(limit - related.length);
    related.push(...topUp);
  }
  return withRatings(related);
}

export async function searchProducts(query: string) {
  await dbConnect();
  // escape regex characters so the query is matched literally
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const products = await Product.find({
    name: { $regex: escaped, $options: "i" },
  });
  return withRatings(products);
}

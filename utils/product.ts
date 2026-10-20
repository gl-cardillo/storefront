import type { Product } from "@/types";

// book and game covers are portrait, show them whole instead of cropping
export const isCover = (product: Product) =>
  product.categoryId === "books" || product.subcategory === "Videogame";

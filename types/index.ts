// shapes as the client receives them, so dates are ISO strings

export interface Product {
  _id: string;
  name: string;
  price: number;
  manufacturer: string;
  picUrl: string;
  picUrl2?: string;
  picUrl3?: string;
  description: string;
  description2?: string;
  description3?: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
}

export interface ProductWithRating {
  product: Product;
  reviewAverage: number;
}

export interface Review {
  _id: string;
  id: string;
  productId: string;
  userId: string;
  reviewAuthor: string;
  text: string;
  rating: number;
  date: string;
  date_formatted: string;
}

export interface ReviewSummary {
  reviews: Review[];
  // index is the star count, index 0 is unused
  ratingArray: (number | null)[];
  average: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartProduct {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  picUrl: string;
  quantity: number;
}

export interface Order {
  _id: string;
  id: string;
  userId: string;
  items: OrderItem[];
  address: { name: string; address: string; city: string; postcode: string };
  total: number;
  createdAt: string;
  createdAt_formatted: string;
}

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  cart: CartItem[];
  wishlist: string[];
  address?: string;
  city?: string;
  postcode?: string;
  dateOfBirth?: string;
  firstName: string;
  dateOfBirth_formatted: string;
  dateOfBirth_toISODate: string;
}

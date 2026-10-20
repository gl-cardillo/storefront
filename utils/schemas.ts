import { z } from "zod";
import { MAX_CART_QUANTITY } from "./constants";

const nameField = z
  .string()
  .min(2, "name must be at least 2 characters")
  .max(50, "name must be at most 50 characters")
  .regex(/^[a-zA-Z0-9 _]*$/, "Special character not allowed.");

export const signupSchema = z.object({
  name: nameField,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "email is a required field")
    .pipe(z.email("email must be a valid email")),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .max(15, "password must be at most 15 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?])[A-Za-z\d@$!%*#?]{8,}$/,
      "Password must be eight characters, at least one letter, one number and one special character(@$!%*#?)",
    ),
});

export const loginSchema = z.object({
  emailLogin: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .pipe(z.email("emailLogin must be a valid email")),
  passwordLogin: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: nameField,
  address: z.string().max(50, "address must be at most 50 characters"),
  city: z.string().max(30, "city must be at most 30 characters"),
  postcode: z.string().max(10, "postcode must be at most 10 characters"),
  // empty string when the date input is cleared
  dateOfBirth: z
    .string()
    .refine(
      (value) => value === "" || new Date(value) <= new Date(),
      "Are you from the future?",
    ),
});

export const reviewSchema = z.object({
  review: z.string().min(2, "Review must be at least 2 characters"),
});

// api request bodies

// the test account logs in without a password
export const loginRequestSchema = z.object({
  emailLogin: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Credentials are incorrect")),
  passwordLogin: z.string().optional(),
});

export const reviewRequestSchema = reviewSchema.extend({
  rating: z
    .number("Select a star")
    .int("Select a star")
    .min(1, "Select a star")
    .max(5, "Select a star"),
});

const productIdField = z.string().min(1, "productId is required");

export const addToCartSchema = z.object({
  productId: productIdField,
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(MAX_CART_QUANTITY, `The limit is ${MAX_CART_QUANTITY}`),
});

export const updateCartSchema = z.object({
  productId: productIdField,
  n: z.enum(["+1", "-1"]),
});

export const removeFromCartSchema = z.object({
  productId: productIdField,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

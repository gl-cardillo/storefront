import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { DateTime } from "luxon";

// destructured so plain node scripts can import the models too
const { Schema, model, models } = mongoose;

// a copy of the product at checkout, later price changes don't rewrite old orders
const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    picUrl: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    address: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postcode: { type: String, required: true },
    },
    // in pounds, like product prices
    total: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

// a user's orders, newest first
orderSchema.index({ userId: 1, createdAt: -1 });

orderSchema.virtual("createdAt_formatted").get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_FULL);
});

export type OrderDocument = InferSchemaType<typeof orderSchema>;

const Order =
  (models.Order as Model<OrderDocument> | undefined) ??
  model<OrderDocument>("Order", orderSchema);

export default Order;

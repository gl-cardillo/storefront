import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { DateTime } from "luxon";

// destructured so plain node scripts can import the models too
const { Schema, model, models } = mongoose;

const cartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 9 },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    // stored lowercased, the unique index relies on it
    email: { type: String, required: true, lowercase: true, trim: true },
    // only loaded when asked for with select("+password")
    password: { type: String, required: true, select: false },
    cart: { type: [cartItemSchema], default: [] },
    // product ids, newest first, existing users load it as an empty array
    wishlist: { type: [String], default: [] },
    city: { type: String },
    dateOfBirth: { type: Date },
    postcode: { type: String },
    address: { type: String },
  },
  {
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      // never send the password hash, even when it was selected
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, "password");
        return ret;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.virtual("dateOfBirth_formatted").get(function () {
  if (!this.dateOfBirth) return null;
  return DateTime.fromJSDate(this.dateOfBirth).toLocaleString(
    DateTime.DATE_SHORT,
  );
});

userSchema.virtual("dateOfBirth_toISODate").get(function () {
  if (!this.dateOfBirth) return null;
  return DateTime.fromJSDate(this.dateOfBirth).toISODate();
});

userSchema.virtual("firstName").get(function () {
  return this.name.split(" ")[0];
});

export type UserDocument = InferSchemaType<typeof userSchema>;

const User =
  (models.User as Model<UserDocument> | undefined) ??
  model<UserDocument>("User", userSchema);

export default User;

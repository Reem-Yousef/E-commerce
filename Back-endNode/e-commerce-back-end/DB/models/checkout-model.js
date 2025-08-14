import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: Number,
      price: Number,
    },
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  phoneNumbers: [{ type: String, required: true }],
  totalAmount: Number,
  deliveryStatus: {
    type: String,
    enum: ["pending", "shipped", "delivered"],
    default: "pending",
  },
  orderedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
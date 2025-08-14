import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"]
  },
  comment: {
    type: String,
    required: [true, "Review comment is required"],
    trim: true,
    minlength: [5, "Comment must be at least 5 characters"],
    maxlength: [500, "Comment must not exceed 500 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
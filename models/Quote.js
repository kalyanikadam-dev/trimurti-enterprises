import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    requirements: {
      quantity: String,
      capacity: String,
      materials: [String],
      color: String,
      details: String,
    },
    otp: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model("Quote", quoteSchema);

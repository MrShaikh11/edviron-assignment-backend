import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema(
  {
    collect_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    collect_request_id: { type: String, required: true },

    order_amount: { type: Number, required: true },
    transaction_amount: { type: Number, required: true },
    payment_mode: { type: String },
    payment_details: { type: String },
    bank_reference: { type: String },
    payment_message: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "USER_DROPPED"],
      default: "pending",
      required: true,
    },
    error_message: { type: String },
    payment_time: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const OrderStatus =
  mongoose.models.OrderStatus ||
  mongoose.model("OrderStatus", orderStatusSchema);
export default OrderStatus;

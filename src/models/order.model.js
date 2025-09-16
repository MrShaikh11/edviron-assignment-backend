import mongoose from "mongoose";

const studentInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  email: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    school_id: { type: mongoose.Schema.Types.Mixed, required: true },
    trustee_id: { type: String, required: true },
    student_info: { type: studentInfoSchema, required: true },
    gateway_name: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;

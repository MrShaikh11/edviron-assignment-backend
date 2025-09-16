import express from "express";
import OrderStatus from "../models/orderStatus.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const { order_info } = payload;

    if (!order_info?.order_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing order_id" });
    }

    // ✅ Update the matching OrderStatus row
    const updatedOrder = await OrderStatus.findOneAndUpdate(
      { collect_id: order_info.order_id }, // match by collect_request_id
      {
        transaction_amount: order_info.transaction_amount,
        payment_mode: order_info.payment_mode,
        payment_details: order_info.payment_details,
        bank_reference: order_info.bank_reference,
        payment_message: order_info.payment_message,
        status: order_info.status,
        error_message: order_info.error_message,
        payment_time: order_info.payment_time,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: `No order found with collect_id = ${order_info.order_id}`,
      });
    }

    // ✅ Reply success
    res.status(200).json({
      success: true,
      message: "OrderStatus updated successfully",
      data: updatedOrder,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

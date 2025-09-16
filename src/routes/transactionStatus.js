import express from "express";
import OrderStatus from "../models/orderStatus.model.js";
import Order from "../models/order.model.js";

const router = express.Router();

// GET /transaction-status/:order_id
router.get("/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;

    // Find the OrderStatus entry
    const statusDoc = await OrderStatus.findOne({ order_id });
    if (!statusDoc) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Optionally populate order info
    const orderDoc = await Order.findById(order_id).lean();

    res.status(200).json({
      success: true,
      data: {
        status: statusDoc.status,
      },
    });
  } catch (err) {
    console.error("Error fetching transaction status:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

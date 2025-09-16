import express from "express";
import paymentService from "../services/paymentService.js";
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";
import protect from "../middleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { amount, callback_url, trustee_id, student_info, gateway_name } =
      req.body;

    if (!amount || !callback_url) {
      return res.status(400).json({
        success: false,
        message: "amount and callback_url are required",
      });
    }

    // 1) Create Order (strict schema as per docs)
    const order = await Order.create({
      school_id: process.env.SCHOOL_ID,
      trustee_id,
      student_info,
      gateway_name,
    });

    // 2) Call payment gateway API to create collect request
    let gatewayResp;
    try {
      gatewayResp = await paymentService.createCollectRequest({
        amount,
        callback_url,
      });
    } catch (err) {
      // cleanup if gatewafy fails
      await Order.findByIdAndDelete(order._id).catch(() => {});
      console.error(
        "Payment gateway call failed:",
        err.response?.data || err.message
      );
      return res.status(502).json({
        success: false,
        message: "Payment gateway error",
        details: err.message,
      });
    }

    const collect_request_id = gatewayResp.collect_request_id;
    const collect_request_url = gatewayResp.collect_request_url;

    if (!collect_request_id || !collect_request_url) {
      await Order.findByIdAndDelete(order._id).catch(() => {});
      return res.status(502).json({
        success: false,
        message: "Unexpected response from payment gateway",
        raw: gatewayResp,
      });
    }

    // 3) Create OrderStatus entry (pending)
    const orderStatus = await OrderStatus.create({
      collect_id: order._id, // reference to our Order
      collect_request_id, // external PG ID
      order_amount: Number(amount),
      transaction_amount: Number(amount),
      status: "PENDING",
      payment_mode: "",
      payment_details: "",
      bank_reference: "",
      payment_message: "",
      error_message: "",
      payment_time: null,
    });

    // 4) Respond with payment URL
    return res.status(201).json({
      success: true,
      message: "Payment link created",
      collect_request_id,
      collect_request_url,
      order_id: order._id,
      order_status_id: orderStatus._id,
    });
  } catch (err) {
    console.error("create-payment error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      details: err.message,
    });
  }
});

export default router;

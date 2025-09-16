// routes/transactions.route.js
import express from "express";
import Order from "../models/order.model.js";
import OrderStatus from "../models/orderStatus.model.js";

const router = express.Router();

// GET /transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Order.aggregate([
      {
        $lookup: {
          from: "orderstatuses", // confirm this is the actual collection name
          localField: "_id",
          foreignField: "order_id", // use order_id (not collect_id)
          as: "statusInfo",
        },
      },
      {
        $unwind: {
          path: "$statusInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          collect_id: "$_id",
          school_id: 1,
          gateway: "$gateway_name",
          order_amount: "$statusInfo.order_amount",
          transaction_amount: "$statusInfo.transaction_amount",
          status: "$statusInfo.status",
          custom_order_id: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// GET /transactions/school/schoolId

router.get("/school/:schoolId", async (req, res) => {
  try {
    const { schoolId } = req.params;

    const transactions = await Order.aggregate([
      {
        $match: { school_id: schoolId }, // filter orders by school
      },
      {
        $lookup: {
          from: "orderstatuses", // collection name in Mongo (plural lowercase)
          localField: "_id",
          foreignField: "order_id",
          as: "statusInfo",
        },
      },
      {
        $unwind: {
          path: "$statusInfo",
          preserveNullAndEmptyArrays: true, // show even if no status yet
        },
      },
      {
        $project: {
          collect_id: "$_id",
          school_id: 1,
          gateway: "$gateway_name",
          order_amount: 1,
          transaction_amount: "$statusInfo.transaction_amount",
          status: "$statusInfo.status",
          custom_order_id: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error("Error fetching transactions by school:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

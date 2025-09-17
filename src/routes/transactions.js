// routes/transactions.route.js
import express from "express";
import Order from "../models/order.model.js";

const router = express.Router();

// GET /transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Order.aggregate([
      {
        $lookup: {
          from: "orderstatuses", // collection name
          localField: "_id", // Order._id
          foreignField: "collect_id", // matches OrderStatus.collect_id
          as: "statusInfo",
        },
      },
      {
        $unwind: {
          path: "$statusInfo",
          preserveNullAndEmptyArrays: true, // keep Orders even if no status
        },
      },
      {
        $project: {
          _id: 0, // hide Mongo _id
          collect_id: "$_id", // ✅ collect_id
          school_id: 1, // ✅ school_id
          gateway: "$gateway_name", // ✅ gateway
          order_amount: "$statusInfo.order_amount", // ✅ order_amount
          transaction_amount: "$statusInfo.transaction_amount", // ✅ transaction_amount
          status: "$statusInfo.status", // ✅ status
          custom_order_id: 1, // ✅ custom_order_id
        },
      },
    ]);

    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err.message);
    res.status(500).json({ success: false, error: err.message });
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

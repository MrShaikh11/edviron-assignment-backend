import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/db.js";
import webhookRoutes from "./routes/webhook.js";
import authRoutes from "./routes/auth.js";
import createPaymentRoutes from "./routes/createPayment.js";
import transactionsRoute from "./routes/transactions.js";
import transactionStatusRoute from "./routes/transactionStatus.js";
dotenv.config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/create-payment", createPaymentRoutes);
app.use("/api/transactions", transactionsRoute);
app.use("/api/transaction-status", transactionStatusRoute);

// test route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running...");
});

// connect DB
connectDB();

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { getEnvValue } from "./config/env.config.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";

const app = express();

app.use(
  cors({
    origin: getEnvValue("CLIENT_URL", "http://localhost:3000"),
    credentials: true
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "BikeXpert API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/public", publicRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

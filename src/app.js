const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { notFoundMiddleware, errorMiddleware } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const recordRoutes = require("./routes/recordRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const settingRoutes = require("./routes/settingRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

module.exports = app;

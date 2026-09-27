import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/db.js";
import "./models/index.js";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import reportRoutes from "./routes/reports.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "hospital-management-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT || 5000);
sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch(err => { console.error("Database startup failed:", err); process.exit(1); });

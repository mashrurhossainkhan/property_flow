import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactsRouter from "./routes/contacts.routes";
import leadsRouter from "./routes/leads.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://property-flow-4o8t.vercel.app",
  ...(process.env.FRONTEND_URLS || "").split(",")
].map((origin) => origin.trim().replace(/\/+$/, "")).filter(Boolean);

app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "success",
    message: "PropertyFlow AI Backend is running"
  });
});

app.use("/api/contacts", contactsRouter);
app.use("/api/leads", leadsRouter);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

export default app;

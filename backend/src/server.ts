import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactsRouter from "./routes/contacts.routes";
import leadsRouter from "./routes/leads.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: "http://localhost:3000"
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

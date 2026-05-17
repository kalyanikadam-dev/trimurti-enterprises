import express from "express";

import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import productsRouter from "./routes/products.js";
import quotesRouter from "./routes/quotes.js";
import contactsRouter from "./routes/contacts.js";
import adminRouter from "./routes/admin.js";
import ordersRouter from "./routes/orders.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests, please try again later." }
});

// Apply rate limiter to all API routes
app.use("/api", apiLimiter);

// General Middleware
app.use(
  cors({
    origin: [
      "https://trimurti-enterprises-frontend.vercel.app", 
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ].filter(Boolean), // Allow specific origins based on environment
    credentials: true,
  }),
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Sinde Backend API running!" });
});

// API Routes

app.use("/api/products", productsRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", ordersRouter);

// Prisma connect test
import prisma from "./prisma.js";
prisma.$connect()
  .then(() => console.log("Neon DB (PostgreSQL) connected via Prisma"))
  .catch((err) => console.error("Prisma connection error:", err));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error", stack: err.stack });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

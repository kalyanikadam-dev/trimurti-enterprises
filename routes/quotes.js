import express from "express";
import { createQuote } from "../controllers/quoteController.js";
import {
  verifyQuoteOTP,
  getAdminQuotes,
} from "../controllers/authController.js";
import { simpleAdminAuth } from "../middleware/simpleAuth.js";
import {
  updateQuoteStatus,
  deleteQuote,
} from "../controllers/quoteAdminController.js";

const router = express.Router();

router.post("/", createQuote);
router.post("/verify", verifyQuoteOTP);
router.get("/admin", getAdminQuotes);
router.put("/:id/status", simpleAdminAuth, updateQuoteStatus);
router.delete("/:id", simpleAdminAuth, deleteQuote);

export default router;

import express from "express";
import {
  createOrder,
  getAdminOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { simpleAdminAuth } from "../middleware/simpleAuth.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/admin", simpleAdminAuth, getAdminOrders);
router.put("/:id/status", simpleAdminAuth, updateOrderStatus);
router.delete("/:id", simpleAdminAuth, deleteOrder);

export default router;

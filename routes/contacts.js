import express from "express";
import { createContact } from "../controllers/contactController.js";
import {
  verifyContactOTP,
  getAdminContacts,
} from "../controllers/authController.js";
import {
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/", createContact);
router.post("/verify", verifyContactOTP);
router.get("/admin", getAdminContacts);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;

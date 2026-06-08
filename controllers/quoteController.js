import prisma from "../prisma.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const createQuote = async (req, res) => {
  try {
    console.log("📥 Incoming Body:", req.body);

    // ✅ Validate email (MAIN FIX)
    if (!req.body.email) {
      console.error("❌ Email is missing");
      return res.status(400).json({ error: "Email is required" });
    }

    const { name, email, phone, message, requirements } = req.body;

    // ✅ Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Create quote
    const quote = await prisma.quote.create({
      data: {
        name,
        email,
        phone,
        message,
        quantity: requirements?.quantity,
        capacity: requirements?.capacity,
        materials: requirements?.materials || [],
        color: requirements?.color,
        details: requirements?.details,
        otp: otp.toString(),
        expiresAt,
      },
    });

    console.log("⚠️ Mail disabled, using OTP fallback directly for:", quote.email);

    res.status(201).json({
      message: "Quote submitted (Email failed, using OTP fallback)",
      quoteId: quote.id,
      otpSent: false,
      otp: otp.toString(),
    });
  } catch (error) {
    console.error("❌ ERROR:", error.message);

    res.status(500).json({
      error: error.message,
    });
  }
};

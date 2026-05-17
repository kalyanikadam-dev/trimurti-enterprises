import Quote from "../models/Quote.js";
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

    // ✅ Create quote
    const quote = new Quote(req.body);
    await quote.save();

    // ✅ Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    quote.otp = otp;
    quote.expiresAt = expiresAt;
    await quote.save();

    console.log("📧 Sending OTP to:", quote.email);

    // ✅ Use SAME transporter (as working API)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Verify transporter
    await transporter.verify();
    console.log("✅ Transporter verified");

    // ✅ Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: quote.email,
      subject: "Your Quote OTP - Trimurti Enterprises",
      html: `
        <h2 style="color:#d97706;text-align:center;">Your OTP</h2>
        <p style="font-size:32px;font-weight:bold;text-align:center;letter-spacing:8px;">
          ${otp}
        </p>
        <p style="text-align:center;">Valid for 10 minutes only.</p>
      `,
    };

    // ✅ Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    // ✅ Response
    res.status(201).json({
      message: "Quote submitted & OTP sent",
      quoteId: quote._id,
      otpSent: true,
    });
  } catch (error) {
    console.error("❌ ERROR:", error.message);

    res.status(500).json({
      error: error.message,
    });
  }
};

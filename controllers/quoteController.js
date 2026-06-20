import prisma from "../prisma.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const createQuote = async (req, res) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const { name, email, phone, message, requirements } = req.body;

    // Create quote record in the database
    const quote = await prisma.quote.create({
      data: {
        name,
        email,
        phone,
        message,
        quantity: requirements?.quantity || null,
        capacity: requirements?.capacity || null,
        materials: requirements?.materials || [],
        color: requirements?.color || null,
        details: requirements?.details || null,
        otp: otp.toString(),
        expiresAt,
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log("✅ Transporter verified");

      // ==========================
      // Send OTP to Customer
      // ==========================
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: quote.email,
        subject: "Your Quote OTP - Trimurti Enterprises",
        html: `
          <h2 style="color:#d97706;text-align:center;">Your OTP</h2>
          <p style="font-size:32px;font-weight:bold;text-align:center;letter-spacing:8px;">
            ${otp}
          </p>
          <p style="text-align:center;">
            Valid for 10 minutes only.
          </p>
        `,
      });

      console.log("✅ OTP email sent to customer");

      // ==========================
      // Send Quote Details to Admin
      // ==========================
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        replyTo: quote.email,
        subject: `New Quote Request - ${quote.name}`,
        html: `
          <h2>New Quote Request Received</h2>

          <p><strong>Name:</strong> ${quote.name}</p>
          <p><strong>Email:</strong> ${quote.email}</p>
          <p><strong>Phone:</strong> ${quote.phone || "N/A"}</p>
          <p><strong>Message:</strong> ${quote.message || "N/A"}</p>

          <hr>

          <h3>Requirements</h3>

          <p><strong>Quantity:</strong> ${quote.quantity || "N/A"}</p>
          <p><strong>Capacity:</strong> ${quote.capacity || "N/A"}</p>
          <p><strong>Materials:</strong> ${quote.materials?.length
            ? quote.materials.join(", ")
            : "N/A"
          }</p>
          <p><strong>Color:</strong> ${quote.color || "N/A"}</p>
          <p><strong>Details:</strong> ${quote.details || "N/A"}</p>
        `,
      });

      console.log("✅ Admin notification email sent");

      res.status(201).json({
        message: "Quote submitted and emails sent successfully",
        quoteId: quote.id,
        otpSent: true,
      });

    } catch (emailError) {
      console.error(
        "📧 Email failed to send:",
        emailError.message
      );

      res.status(201).json({
        message: "Quote submitted but email sending failed",
        quoteId: quote.id,
        otpSent: false,
        otp: otp.toString(),
      });
    }

  } catch (error) {
    console.error("❌ Submit quote error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
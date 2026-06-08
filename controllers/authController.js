import prisma from "../prisma.js";
import nodemailer from "nodemailer";

export const verifyQuoteOTP = async (req, res) => {
  try {
    const { quoteId, otp } = req.body;

    if (!quoteId || !otp) {
      return res.status(400).json({ error: "quoteId and otp required" });
    }

    const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    if (quote.otp !== otp.toString() || new Date() > quote.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP and mark as verified
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        otp: null,
        expiresAt: null,
        verified: true,
      },
    });

    // Send congratulations email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: quote.email,
        subject: "🎉 Requirement Confirmed - Trimurti Enterprises",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #10b981; text-align: center; margin-bottom: 20px;">🎉 Requirement Confirmed!</h2>
            <p>Dear <strong>${quote.name}</strong>,</p>
            <p>Thank you for verifying your contact details. Your quote requirement has been successfully submitted and confirmed. Here are the details of your request:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 150px;">Product</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${quote.message || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Quantity</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${quote.quantity || "N/A"} Piece</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Capacity</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${quote.capacity || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Materials</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${quote.materials?.join(", ") || "N/A"}</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Color</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${quote.color || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Additional Details</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${quote.details || "N/A"}</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">We will get in touch with you shortly at <strong>+91 ${quote.phone}</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center;">Trimurti Enterprises Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Congratulations email sent to:", quote.email);
    } catch (emailError) {
      console.error("❌ Failed to send congratulations email:", emailError.message);
    }

    res.json({
      message: "Quote verified successfully",
      quoteId: quote.id,
      verified: true,
    });
  } catch (error) {
    console.error("Verify Quote OTP error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAdminQuotes = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token !== "admin123") {
      return res
        .status(401)
        .json({ error: "Unauthorized - use Bearer admin123" });
    }

    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(quotes);
  } catch (error) {
    console.error("Get admin quotes error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyContactOTP = async (req, res) => {
  try {
    const { contactId, otp } = req.body;

    if (!contactId || !otp) {
      return res.status(400).json({ error: "contactId and otp required" });
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (contact.otp !== otp.toString() || new Date() > contact.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP and mark as verified
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        otp: null,
        expiresAt: null,
        verified: true,
      },
    });

    res.json({
      message: "Contact verified successfully",
      contactId: contact.id,
    });
  } catch (error) {
    console.error("Verify Contact OTP error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAdminContacts = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token !== "admin123") {
      return res
        .status(401)
        .json({ error: "Unauthorized - use Bearer admin123" });
    }

    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(contacts);
  } catch (error) {
    console.error("Get admin contacts error:", error);
    res.status(500).json({ error: error.message });
  }
};

import prisma from "../prisma.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status },
    });

    if (status === "confirmed") {
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
        subject: "Order Confirmed - Trimurti Enterprises",
        html: `
          <h1>✅ Order Confirmed!</h1>
          <p>Dear ${quote.name},</p>
          <p>Your order has been confirmed:</p>
          <ul>
            <li>Product: ${quote.message.split("Quote for ")[1] || "N/A"}</li>
            <li>Quantity: ${quote.quantity || "N/A"}</li>
            <li>Capacity: ${quote.capacity || "N/A"}</li>
            <li>Materials: ${quote.materials?.join(", ") || "N/A"}</li>
            <li>Color: ${quote.color || "N/A"}</li>
            <li>Details: ${quote.details || "N/A"}</li>
          </ul>
          <p>Phone: +91 ${quote.phone}</p>
          <p>Company: ${quote.message.split("from ")[1] || "N/A"}</p>
          <p>We will contact you shortly.</p>
          <p>Trimurti Enterprises</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ message: "Status updated", quote: updatedQuote });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.quote.delete({ where: { id } });
    res.json({ message: "Quote deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

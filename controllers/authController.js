import prisma from "../prisma.js";

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

    res.json({
      message: "Quote verified successfully",
      quoteId: quote.id,
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

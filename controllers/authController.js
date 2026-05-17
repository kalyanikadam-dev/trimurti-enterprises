import Quote from "../models/Quote.js";
import Contact from "../models/Contact.js";

export const verifyQuoteOTP = async (req, res) => {
  try {
    const { quoteId, otp } = req.body;

    if (!quoteId || !otp) {
      return res.status(400).json({ error: "quoteId and otp required" });
    }

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    if (quote.otp != otp || new Date() > quote.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP
    quote.otp = undefined;
    quote.expiresAt = undefined;
    quote.verified = true;
    await quote.save();

    res.json({
      message: "Quote verified successfully",
      quoteId: quote._id,
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

    const quotes = await Quote.find({}).sort({ createdAt: -1 });
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

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    if (contact.otp != otp || new Date() > contact.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP
    contact.otp = undefined;
    contact.expiresAt = undefined;
    contact.verified = true;
    await contact.save();

    res.json({
      message: "Contact verified successfully",
      contactId: contact._id,
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

    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Get admin contacts error:", error);
    res.status(500).json({ error: error.message });
  }
};

import Contact from "../models/Contact.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body; // Primarily toggle verified

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Simple auth check (same as getAdminContacts)
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (verified !== undefined) {
      contact.verified = verified;
    }

    await contact.save();
    res.json({ message: "Contact updated", contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Simple auth check
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Generate 4-digit OTP for user
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Save OTP to contact
    contact.otp = otp;
    contact.expiresAt = expiresAt;
    await contact.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email OTP ONLY to user
    const userMailOptions = {
      from: `"Trimurti Enterprises" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: "We Received Your Inquiry - Trimurti Enterprises",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color:#d97706; text-align:center;">
            Thank You for Contacting Us 🙏
          </h2>
          <p>Dear <strong>${contact.name}</strong>,</p>
          <p>
            We have received your inquiry successfully. Our team will contact you 
            <strong>as soon as possible</strong>.
          </p>
          <hr/>
          <p>
            Thank you for choosing <strong>Trimurti Enterprises</strong>.
          </p>
          <p>
            Regards,<br/>
            <strong>Trimurti Enterprises Team</strong>
          </p>
        </div>
      `,
    };

    // Admin notification (no details in user email)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // holder email
      subject: `📩 New Inquiry from ${contact.name}`,
      html: `
    <h2>New Contact Inquiry</h2>
    
    <p><strong>Name:</strong> ${contact.name}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    <p><strong>Phone:</strong> ${contact.phone}</p>
    
    <p><strong>Message:</strong></p>
    <p>${contact.message}</p>

    <hr/>

    <p><strong>Contact ID:</strong> ${contact._id}</p>
  `,
    };

    // Send emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(201).json({
      message: "Contact submitted & OTP sent",
      contactId: contact._id,
      otpSent: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

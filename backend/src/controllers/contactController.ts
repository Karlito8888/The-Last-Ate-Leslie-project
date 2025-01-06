import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email';

// Email transport configuration
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Contact request type
interface ContactRequest {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export const sendContactMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, message, subject = 'New contact message' } = req.body as ContactRequest;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Send to commercial admin
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: EMAIL_CONFIG.commercialEmail,
      subject: subject,
      html: `
        <h3>New contact message</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Send confirmation to user
    await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: 'Message confirmation',
      html: `
        <h3>Thank you for contacting us</h3>
        <p>We have received your message and will respond as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
}; 
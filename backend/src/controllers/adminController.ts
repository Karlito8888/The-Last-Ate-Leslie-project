import { Request, Response } from 'express';
import { User } from '../models/User';
import { Newsletter } from '../models/Newsletter';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email';
import { getNewsletterTemplate } from '../templates/newsletter';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Get users list
export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error while retrieving users:', error);
    return res.status(500).json({
      success: false,
      message: 'Error while retrieving users'
    });
  }
};

// Send newsletter
export const sendNewsletter = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { subject, content } = req.body;

    // Validation
    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get newsletter subscribers
    const subscribers = await User.find({ newsletter: true }).select('email');
    const recipientEmails = subscribers.map(user => user.email);

    if (recipientEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users subscribed to the newsletter'
      });
    }

    // Generate HTML with template
    const htmlContent = getNewsletterTemplate(subject, content);

    // Send newsletter
    await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      bcc: recipientEmails, // Using BCC for privacy
      subject: subject,
      html: htmlContent,
      text: content // Text version for clients that don't support HTML
    });

    // Save newsletter in database
    await Newsletter.create({
      subject,
      content: htmlContent, // Save complete HTML version
      sentBy: req.user.id,
      recipientCount: recipientEmails.length,
      recipients: recipientEmails
    });

    return res.status(200).json({
      success: true,
      message: 'Newsletter sent successfully',
      data: {
        recipientCount: recipientEmails.length
      }
    });

  } catch (error) {
    console.error('Error while sending newsletter:', error);
    return res.status(500).json({
      success: false,
      message: 'Error while sending newsletter'
    });
  }
};

// Get newsletter history
export const getNewsletterHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const skip = (page - 1) * limit;

    const newsletters = await Newsletter.find()
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sentBy', 'username email');

    const total = await Newsletter.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        newsletters,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error while retrieving newsletter history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error while retrieving newsletter history'
    });
  }
}; 
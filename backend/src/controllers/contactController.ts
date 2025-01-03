import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email';

// Configuration du transporteur email
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Type pour la requête de contact
interface ContactRequest {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export const sendContactMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, message, subject = 'Nouveau message de contact' } = req.body as ContactRequest;

    // Validation basique
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nom, email et message sont requis'
      });
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Envoi à l'admin commercial
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: EMAIL_CONFIG.commercialEmail, // Email de l'admin commercial
      subject: subject,
      html: `
        <h3>Nouveau message de contact</h3>
        <p><strong>De:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Envoi d'une confirmation à l'utilisateur
    await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: 'Confirmation de votre message',
      html: `
        <h3>Merci de nous avoir contacté</h3>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p><strong>Votre message:</strong></p>
        <p>${message}</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
}; 
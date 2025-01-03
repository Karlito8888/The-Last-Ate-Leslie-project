import { Request, Response } from 'express';
import { User } from '../models/User';
import { Newsletter } from '../models/Newsletter';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email';
import { getNewsletterTemplate } from '../templates/newsletter';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Obtenir la liste des utilisateurs
export const getUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Envoyer une newsletter
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

    // Récupérer les utilisateurs inscrits à la newsletter
    const subscribers = await User.find({ newsletter: true }).select('email');
    const recipientEmails = subscribers.map(user => user.email);

    if (recipientEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun utilisateur inscrit à la newsletter'
      });
    }

    // Générer le HTML avec le template
    const htmlContent = getNewsletterTemplate(subject, content);

    // Envoi de la newsletter
    await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      bcc: recipientEmails, // Utilisation de BCC pour la confidentialité
      subject: subject,
      html: htmlContent,
      text: content // Version texte pour les clients qui ne supportent pas le HTML
    });

    // Sauvegarder la newsletter dans la base de données
    await Newsletter.create({
      subject,
      content: htmlContent, // On sauvegarde la version HTML complète
      sentBy: req.user.id,
      recipientCount: recipientEmails.length,
      recipients: recipientEmails
    });

    return res.status(200).json({
      success: true,
      message: 'Newsletter envoyée avec succès',
      data: {
        recipientCount: recipientEmails.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la newsletter:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la newsletter'
    });
  }
};

// Obtenir l'historique des newsletters
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
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
}; 
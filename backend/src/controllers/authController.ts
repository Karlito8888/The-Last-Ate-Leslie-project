import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import nodemailer from 'nodemailer';
import { JWT_CONFIG } from '../config/jwt';
import { EMAIL_CONFIG } from '../config/email';
import { ApiResponse, AuthResponse, UserResponse } from '../types/api';
import { JwtPayload } from '../types/jwt';
import { isPasswordValid, isUsernameValid } from '../utils/validation';
import { AUTH_CONSTANTS } from '../config/constants';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

const handleError = (res: Response, status: number, message: string, errors?: string[]): Response => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

const formatUserResponse = (user: any): UserResponse => {
  const response: UserResponse = {
    username: user.username,
    email: user.email
  };

  // Ajout conditionnel des champs optionnels
  if (user.role) response.role = user.role;
  if (user.newsletter !== undefined) response.newsletter = user.newsletter;
  if (user.fullName) response.fullName = user.fullName;
  if (user.birthDate) response.birthDate = user.birthDate;
  if (user.mobilePhone) response.mobilePhone = user.mobilePhone;
  if (user.landline) response.landline = user.landline;
  if (user.address) response.address = user.address;

  return response;
};

export const register = async (req: Request, res: Response<ApiResponse<AuthResponse>>): Promise<Response> => {
  try {
    const { username, email, password, newsletter } = req.body;

    const errors: string[] = [];

    if (!username || !email || !password) {
      return handleError(res, 400, 'Username, email et mot de passe sont requis');
    }

    if (!isUsernameValid(username)) {
      errors.push('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères et uniquement des lettres, chiffres, tirets et underscores');
    }

    if (!AUTH_CONSTANTS.EMAIL_REGEX.test(email)) {
      errors.push('Format d\'email invalide');
    }

    if (!isPasswordValid(password)) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial');
    }

    if (errors.length > 0) {
      return handleError(res, 400, 'Données d\'inscription invalides', errors);
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return handleError(res, 400, 'Utilisateur déjà existant');
    }

    const user = new User({ username, email, password, newsletter });
    await user.save();

    const token = jwt.sign({ userId: user.id } as JwtPayload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

    return res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return handleError(res, 500, 'Erreur lors de l\'inscription');
  }
};

export const login = async (req: Request, res: Response<ApiResponse<AuthResponse>>): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return handleError(res, 400, 'Email et mot de passe requis');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return handleError(res, 401, 'Email ou mot de passe incorrect');
    }

    const token = jwt.sign({ userId: user.id } as JwtPayload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

    return res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    return handleError(res, 500, 'Erreur lors de la connexion');
  }
};

export const forgotPassword = async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email || !AUTH_CONSTANTS.EMAIL_REGEX.test(email)) {
      return handleError(res, 400, 'Email invalide');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({ email });
    if (!user) {
      return handleError(res, 404, 'Aucun compte associé à cet email');
    }

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + AUTH_CONSTANTS.RESET_TOKEN_EXPIRY);
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      text: `Pour réinitialiser votre mot de passe, cliquez sur ce lien : ${resetURL}`
    });

    return res.json({
      success: true,
      message: 'Email de réinitialisation envoyé'
    });
  } catch (error) {
    return handleError(res, 500, 'Erreur lors de l\'envoi de l\'email');
  }
};

export const resetPassword = async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return handleError(res, 400, 'Mot de passe requis');
    }

    if (!isPasswordValid(password)) {
      return handleError(res, 400, 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial');
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return handleError(res, 400, 'Token invalide ou expiré');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    return handleError(res, 500, 'Erreur lors de la réinitialisation');
  }
}; 
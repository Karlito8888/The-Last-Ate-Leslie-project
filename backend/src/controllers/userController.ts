import { Request, Response } from 'express';
import { User } from '../models/User';
import { isValidDate, isValidAddress, isValidMobilePhone, isValidLandline } from '../utils/profileValidation';
import { isUsernameValid, isPasswordValid } from '../utils/validation';
import { AUTH_CONSTANTS, UAE_NAME_CONSTANTS } from '../config/constants';
import { UserResponse } from '../types/api';

const sendSuccess = <T>(res: Response, data?: T, message = 'Succès'): Response => {
  return res.json({ success: true, message, data });
};

const sendError = (res: Response, status: number, message: string): Response => {
  return res.status(status).json({ success: false, message });
};

const formatUserResponse = (user: any): UserResponse => ({
  username: user.username,
  email: user.email,
  role: user.role,
  newsletter: user.newsletter,
  fullName: user.fullName,
  birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : undefined,
  mobilePhone: user.mobilePhone,
  landline: user.landline,
  address: user.address
});

const isValidNamePart = (name: string): boolean => {
  return name.length >= UAE_NAME_CONSTANTS.MIN_LENGTH &&
         name.length <= UAE_NAME_CONSTANTS.MAX_LENGTH &&
         UAE_NAME_CONSTANTS.ALLOWED_CHARS.test(name);
};

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return sendError(res, 404, 'Utilisateur non trouvé');
    
    return sendSuccess(res, formatUserResponse(user));
  } catch {
    return sendError(res, 500, 'Erreur serveur');
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { fullName, birthDate, address, mobilePhone, landline, newsletter } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'Utilisateur non trouvé');

    // Validations
    if (fullName) {
      if (fullName.firstName && !isValidNamePart(fullName.firstName)) {
        return sendError(res, 400, 'Format de prénom invalide');
      }
      if (fullName.familyName && !isValidNamePart(fullName.familyName)) {
        return sendError(res, 400, 'Format de nom de famille invalide');
      }
      if (fullName.gender && !['male', 'female'].includes(fullName.gender)) {
        return sendError(res, 400, 'Format de genre invalide');
      }
    }

    if (birthDate && !isValidDate(birthDate)) {
      return sendError(res, 400, 'Format de date de naissance invalide');
    }

    if (address && !isValidAddress(address)) {
      return sendError(res, 400, 'Format d\'adresse invalide');
    }

    if (mobilePhone && !isValidMobilePhone(mobilePhone)) {
      return sendError(res, 400, 'Format de numéro de mobile invalide');
    }

    if (landline && !isValidLandline(landline)) {
      return sendError(res, 400, 'Format de numéro fixe invalide');
    }

    // Mise à jour
    if (fullName) {
      user.fullName = user.fullName || {};
      Object.assign(user.fullName, fullName);
    }
    if (birthDate) user.birthDate = new Date(birthDate);
    if (address) {
      user.address = user.address || {};
      Object.assign(user.address, address);
    }
    if (mobilePhone) user.mobilePhone = mobilePhone;
    if (landline) user.landline = landline;
    if (typeof newsletter === 'boolean') user.newsletter = newsletter;

    await user.save();
    return sendSuccess(res, formatUserResponse(user), 'Profil mis à jour avec succès');
  } catch {
    return sendError(res, 500, 'Erreur lors de la mise à jour du profil');
  }
};

export const updateUsername = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username } = req.body;
    if (!username) return sendError(res, 400, 'Nom d\'utilisateur requis');
    if (!isUsernameValid(username)) return sendError(res, 400, 'Format de nom d\'utilisateur invalide');

    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.id !== req.user.id) {
      return sendError(res, 400, 'Ce nom d\'utilisateur est déjà pris');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    ).select('-password');

    return sendSuccess(res, formatUserResponse(user), 'Nom d\'utilisateur mis à jour avec succès');
  } catch {
    return sendError(res, 500, 'Erreur lors de la mise à jour du nom d\'utilisateur');
  }
};

export const updateEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email requis');
    if (!AUTH_CONSTANTS.EMAIL_REGEX.test(email)) return sendError(res, 400, 'Format d\'email invalide');

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.id !== req.user.id) {
      return sendError(res, 400, 'Cet email est déjà utilisé');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    ).select('-password');

    return sendSuccess(res, formatUserResponse(user), 'Email mis à jour avec succès');
  } catch {
    return sendError(res, 500, 'Erreur lors de la mise à jour de l\'email');
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Les mots de passe actuel et nouveau sont requis');
    }

    if (!isPasswordValid(newPassword)) {
      return sendError(res, 400, 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial');
    }

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'Utilisateur non trouvé');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 401, 'Mot de passe actuel incorrect');

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, undefined, 'Mot de passe mis à jour avec succès');
  } catch {
    return sendError(res, 500, 'Erreur lors de la mise à jour du mot de passe');
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { password } = req.body;
    if (!password) return sendError(res, 400, 'Le mot de passe est requis pour supprimer le compte');

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'Utilisateur non trouvé');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, 'Mot de passe incorrect');

    await User.findByIdAndDelete(req.user.id);
    return sendSuccess(res, undefined, 'Compte supprimé avec succès');
  } catch {
    return sendError(res, 500, 'Erreur lors de la suppression du compte');
  }
}; 
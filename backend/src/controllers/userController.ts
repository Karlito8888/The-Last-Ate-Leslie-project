import { Request, Response } from 'express';
import { User } from '../models/User';
import { isValidDate, isValidAddress, isValidMobilePhone, isValidLandline } from '../utils/profileValidation';
import { isUsernameValid, isPasswordValid } from '../utils/validation';
import { AUTH_CONSTANTS, UAE_NAME_CONSTANTS } from '../config/constants';
import { UserResponse } from '../types/api';

const sendSuccess = <T>(res: Response, data?: T, message = 'Success'): Response => {
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
    if (!user) return sendError(res, 404, 'User not found');
    
    return sendSuccess(res, formatUserResponse(user));
  } catch {
    return sendError(res, 500, 'Server error');
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { fullName, birthDate, address, mobilePhone, landline, newsletter } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    // Validations
    if (fullName) {
      if (fullName.firstName && !isValidNamePart(fullName.firstName)) {
        return sendError(res, 400, 'Invalid first name format');
      }
      if (fullName.familyName && !isValidNamePart(fullName.familyName)) {
        return sendError(res, 400, 'Invalid family name format');
      }
      if (fullName.gender && !['male', 'female'].includes(fullName.gender)) {
        return sendError(res, 400, 'Invalid gender format');
      }
    }

    if (birthDate && !isValidDate(birthDate)) {
      return sendError(res, 400, 'Invalid birth date format');
    }

    if (address && !isValidAddress(address)) {
      return sendError(res, 400, 'Invalid address format');
    }

    if (mobilePhone && !isValidMobilePhone(mobilePhone)) {
      return sendError(res, 400, 'Invalid mobile phone format');
    }

    if (landline && !isValidLandline(landline)) {
      return sendError(res, 400, 'Invalid landline format');
    }

    // Update
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
    return sendSuccess(res, formatUserResponse(user), 'Profile updated successfully');
  } catch {
    return sendError(res, 500, 'Error updating profile');
  }
};

export const updateUsername = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username } = req.body;
    if (!username) return sendError(res, 400, 'Username is required');
    if (!isUsernameValid(username)) return sendError(res, 400, 'Invalid username format');

    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.id !== req.user.id) {
      return sendError(res, 400, 'This username is already taken');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    ).select('-password');

    return sendSuccess(res, formatUserResponse(user), 'Username updated successfully');
  } catch {
    return sendError(res, 500, 'Error updating username');
  }
};

export const updateEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required');
    if (!AUTH_CONSTANTS.EMAIL_REGEX.test(email)) return sendError(res, 400, 'Invalid email format');

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.id !== req.user.id) {
      return sendError(res, 400, 'This email is already in use');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    ).select('-password');

    return sendSuccess(res, formatUserResponse(user), 'Email updated successfully');
  } catch {
    return sendError(res, 500, 'Error updating email');
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current and new passwords are required');
    }

    if (!isPasswordValid(newPassword)) {
      return sendError(res, 400, 'New password must contain at least 8 characters, one uppercase letter and one special character');
    }

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 401, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, undefined, 'Password updated successfully');
  } catch {
    return sendError(res, 500, 'Error updating password');
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { password } = req.body;
    if (!password) return sendError(res, 400, 'Password is required to delete account');

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, 'Incorrect password');

    await User.findByIdAndDelete(req.user.id);
    return sendSuccess(res, undefined, 'Account deleted successfully');
  } catch {
    return sendError(res, 500, 'Error deleting account');
  }
};

export const updateNewsletter = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { newsletter } = req.body;
    
    if (typeof newsletter !== 'boolean') {
      return sendError(res, 400, 'Newsletter value must be a boolean');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { newsletter },
      { new: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, formatUserResponse(user), 'Newsletter preference updated successfully');
  } catch {
    return sendError(res, 500, 'Error updating newsletter preference');
  }
}; 
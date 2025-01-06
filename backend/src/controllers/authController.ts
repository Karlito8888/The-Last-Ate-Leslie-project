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

  // Optional fields conditional addition
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
      return handleError(res, 400, 'Username, email and password are required');
    }

    if (!isUsernameValid(username)) {
      errors.push('Username must be between 3 and 50 characters and contain only letters, numbers, dashes and underscores');
    }

    if (!AUTH_CONSTANTS.EMAIL_REGEX.test(email)) {
      errors.push('Invalid email format');
    }

    if (!isPasswordValid(password)) {
      errors.push('Password must contain at least 8 characters, one uppercase letter and one special character');
    }

    if (errors.length > 0) {
      return handleError(res, 400, 'Invalid registration data', errors);
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return handleError(res, 400, 'User already exists');
    }

    const user = new User({ username, email, password, newsletter });
    await user.save();

    const token = jwt.sign({ userId: user.id } as JwtPayload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return handleError(res, 500, 'Error during registration');
  }
};

export const login = async (req: Request, res: Response<ApiResponse<AuthResponse>>): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return handleError(res, 400, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return handleError(res, 401, 'Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id } as JwtPayload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: formatUserResponse(user)
      }
    });
  } catch (error) {
    return handleError(res, 500, 'Error during login');
  }
};

export const forgotPassword = async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email || !AUTH_CONSTANTS.EMAIL_REGEX.test(email)) {
      return handleError(res, 400, 'Invalid email');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({ email });
    if (!user) {
      return handleError(res, 404, 'No account associated with this email');
    }

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + AUTH_CONSTANTS.RESET_TOKEN_EXPIRY);
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      text: `To reset your password, click on this link: ${resetURL}`
    });

    return res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    return handleError(res, 500, 'Error sending email');
  }
};

export const resetPassword = async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return handleError(res, 400, 'Password is required');
    }

    if (!isPasswordValid(password)) {
      return handleError(res, 400, 'Password must contain at least 8 characters, one uppercase letter and one special character');
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return handleError(res, 400, 'Invalid or expired token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    return handleError(res, 500, 'Error during password reset');
  }
}; 
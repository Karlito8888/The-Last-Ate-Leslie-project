import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { JWT_CONFIG } from '../config/jwt';

type AuthUser = Omit<IUser, 'password' | 'comparePassword'>;

declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    const data = jwt.verify(token, JWT_CONFIG.secret) as any;
    const user = await User.findById(data.userId).select('-password').lean();
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    req.user = {
      ...user,
      id: user._id.toString()
    };
    
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    });
  }
};

export const restrictTo = (...roles: ('user' | 'admin')[]) => (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  if (!roles.includes(req.user.role || 'user')) {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé'
    });
  }
  next();
}; 
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JWT_CONFIG } from '../config/jwt';

// Declaration to extend Request
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
      };
    }
  }
}

// Authentication middleware
export const protect = (req: Request, res: Response, next: NextFunction): Response | void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized'
      });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.secret) as { userId: string };
    req.user = { id: decoded.userId };
    return next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized'
    });
  }
};

// Admin verification middleware
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user?.role || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access forbidden'
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
}; 
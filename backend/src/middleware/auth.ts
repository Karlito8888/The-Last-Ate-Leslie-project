import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    // Vérifier le header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Extraire et vérifier le token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };

    // Vérifier l'utilisateur
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Admin verification middleware
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const user = await User.findById(req.user?.id);
    
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
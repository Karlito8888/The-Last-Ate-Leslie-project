import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    // Vérifier le header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authentication failed: No token provided');
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
      console.log('Authentication failed: User not found for token:', decoded);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log pour le débogage
    console.log('Authentication successful for:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
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
    
    // Log pour le débogage
    console.log('Admin check for user:', {
      id: user?._id,
      email: user?.email,
      role: user?.role
    });

    if (!user?.role || user.role !== 'admin') {
      console.log('Admin access denied for user:', user?.email);
      return res.status(403).json({ 
        success: false,
        message: 'Access forbidden'
      });
    }

    console.log('Admin access granted for:', user.email);
    return next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
}; 
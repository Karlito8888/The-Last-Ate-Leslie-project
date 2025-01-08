import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  updateUsername,
  updateEmail,
  updatePassword,
  deleteProfile,
  updateNewsletter
} from '../controllers/userController';

const router = express.Router();

// Routes protégées (nécessitent une authentification)
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Specific update routes
router.put('/username', updateUsername);
router.put('/email', updateEmail);
router.put('/password', updatePassword);
router.put('/newsletter', updateNewsletter);

// Delete account
router.delete('/', deleteProfile);

export default router; 
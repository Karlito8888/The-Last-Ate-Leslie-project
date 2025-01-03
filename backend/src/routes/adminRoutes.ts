import express from 'express';
import { protect, isAdmin } from '../middleware/auth';
import { 
  getProfile,
  updateProfile,
  updateUsername,
  updateEmail,
  updatePassword,
  deleteProfile
} from '../controllers/userController';
import {
  getUsers,
  sendNewsletter,
  getNewsletterHistory
} from '../controllers/adminController';

const router = express.Router();

// Toutes les routes admin nécessitent d'être authentifié et admin
router.use(protect);
router.use(isAdmin);

// Routes de gestion des utilisateurs
router.get('/users', getUsers);

// Routes du profil admin
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/username', updateUsername);
router.put('/profile/email', updateEmail);
router.put('/profile/password', updatePassword);
router.delete('/profile', deleteProfile);

// Route newsletter
router.post('/newsletter', sendNewsletter);
router.get('/newsletter/history', getNewsletterHistory);

export default router; 
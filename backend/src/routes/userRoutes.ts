import express from 'express';
import { getProfile, updateProfile, updateUsername, updateEmail, updatePassword, deleteProfile } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Routes protégées par authentification
router.use(protect);

// Routes du profil
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/username', updateUsername);
router.put('/profile/email', updateEmail);
router.put('/profile/password', updatePassword);
router.delete('/profile', deleteProfile);

export default router; 
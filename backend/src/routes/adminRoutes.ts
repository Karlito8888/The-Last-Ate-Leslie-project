import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getMessages,
  updateMessageStatus,
  deleteMessage
} from '../controllers/adminController';

const router = express.Router();

// Toutes les routes admin nécessitent une authentification et des droits admin
router.use(authenticate);
router.use(isAdmin);

// Routes de gestion des utilisateurs
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Routes de gestion des messages
router.get('/messages', getMessages);
router.put('/messages/:id/status', updateMessageStatus);
router.delete('/messages/:id', deleteMessage);

export default router; 
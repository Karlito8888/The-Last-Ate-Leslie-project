import express from 'express';
import { sendContactMessage } from '../controllers/contactController';

const router = express.Router();

// Route pour envoyer un message de contact
router.post('/', sendContactMessage);

export default router; 
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// Configuration des variables d'environnement
dotenv.config();

export const app = express();

// Middleware de base
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Route de base
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API Backend ATE Leslie Project'
  });
});

// Gestion des erreurs
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue!',
    errors: [{ field: 'server', message: err.message }]
  });
});

// Gestion des routes non trouvées
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Configuration MongoDB et démarrage du serveur uniquement si ce n'est pas un test
if (process.env.NODE_ENV !== 'test') {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ate-leslie-db';
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion MongoDB:', err));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
} 
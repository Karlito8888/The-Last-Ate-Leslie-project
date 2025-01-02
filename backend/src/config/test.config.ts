import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement de test
dotenv.config({
  path: path.join(__dirname, '../../.env.test')
});

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ate-leslie-test'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret-key'
  }
}; 
import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const admins = [
  {
    username: 'admin1',
    email: 'admin1@example.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    username: 'admin2',
    email: 'admin2@example.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    username: 'admin3',
    email: 'admin3@example.com',
    password: 'Admin123!',
    role: 'admin'
  }
];

async function initAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connecté à MongoDB');

    for (const adminData of admins) {
      const existingAdmin = await User.findOne({ email: adminData.email });
      if (!existingAdmin) {
        await User.create(adminData);
        console.log(`Admin créé : ${adminData.email}`);
      } else {
        console.log(`Admin existe déjà : ${adminData.email}`);
      }
    }

    console.log('Initialisation des admins terminée');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initAdmins(); 
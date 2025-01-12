import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connecté à MongoDB Atlas');

    const users = await User.find({}, 'email role');
    console.log('\nUtilisateurs dans la base :');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUsers(); 
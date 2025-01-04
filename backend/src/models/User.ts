import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isValidMobilePhone, isValidLandline } from '../utils/profileValidation';

export interface IUserName {
  honorificTitle?: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  gender?: 'male' | 'female';
}

export interface IAddress {
  unit?: string;
  buildingName?: string;
  street?: string;
  dependentLocality?: string;
  poBox?: string;
  city?: string;
  emirate?: string;
}

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  newsletter?: boolean;
  fullName?: IUserName;
  birthDate?: Date;
  mobilePhone?: string;
  landline?: string;
  address?: IAddress;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userNameSchema = new mongoose.Schema({
  honorificTitle: {
    type: String,
    enum: ['Sheikh', 'Sayyid', 'Al Haj'],
    required: false
  },
  firstName: {
    type: String,
    required: false,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  fatherName: {
    type: String,
    required: false,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  familyName: {
    type: String,
    required: false,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  gender: {
    type: String,
    required: false,
    enum: ['male', 'female']
  }
});

const addressSchema = new mongoose.Schema({
  unit: {
    type: String,
    trim: true,
    maxlength: 50
  },
  buildingName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  street: {
    type: String,
    trim: true,
    required: false,
    maxlength: 100
  },
  dependentLocality: {
    type: String,
    trim: true,
    maxlength: 100
  },
  poBox: {
    type: String,
    trim: true,
    match: /^[0-9]+$/,
    maxlength: 10
  },
  city: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50
  },
  emirate: {
    type: String,
    required: false,
    enum: ['AD', 'DU', 'SH', 'AJ', 'UAQ', 'RAK', 'FJR']
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: false
  },
  newsletter: {
    type: Boolean,
    required: false
  },
  fullName: {
    type: userNameSchema,
    required: false
  },
  birthDate: {
    type: Date,
    required: false
  },
  mobilePhone: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || isValidMobilePhone(v);
      },
      message: 'Format de numéro de mobile invalide. Format attendu : +971-XX-XXXXXXX'
    }
  },
  landline: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || isValidLandline(v);
      },
      message: 'Format de numéro fixe invalide. Format attendu : +971-X-XXXXXXX'
    }
  },
  address: {
    type: addressSchema,
    required: false
  },
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpires: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Méthode virtuelle pour obtenir le nom complet formaté
userSchema.virtual('formattedFullName').get(function(this: IUser) {
  if (!this.fullName) return '';
  
  const { honorificTitle, firstName, fatherName, familyName, gender } = this.fullName;
  if (!firstName || !fatherName || !familyName || !gender) return '';
  
  const prefix = gender === 'male' ? 'bin' : 'bint';
  const parts = [
    honorificTitle,
    firstName,
    `${prefix} ${fatherName}`,
    familyName
  ].filter(Boolean); // Supprime les valeurs undefined/null
  
  return parts.join(' ');
});

// Hash le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 
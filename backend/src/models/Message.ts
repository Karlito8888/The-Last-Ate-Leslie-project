import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  name: string;
  email: string;
  subject: string;
  content: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved'],
    default: 'new'
  }
}, {
  timestamps: true
});

export const Message = mongoose.model<IMessage>('Message', messageSchema); 
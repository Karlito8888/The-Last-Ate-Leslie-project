import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  subject: string;
  content: string;
  sentAt: Date;
  sentBy: mongoose.Types.ObjectId;
  recipientCount: number;
  recipients: string[]; // Liste des emails
}

const newsletterSchema = new Schema<INewsletter>({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientCount: {
    type: Number,
    required: true,
    min: 0
  },
  recipients: [{
    type: String,
    required: true,
    trim: true
  }]
}, {
  timestamps: true
});

// Index pour améliorer les performances des recherches
newsletterSchema.index({ sentAt: -1 });
newsletterSchema.index({ sentBy: 1 });

export const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema); 
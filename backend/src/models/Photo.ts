import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  image: Buffer;
  contentType: string;
  caption: string;
  date: string;
  chapter: 'Sweet Moments' | 'Everyday Us' | 'Adventures' | 'Milestones';
  favorite: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>(
  {
    image: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    caption: { type: String, default: '' },
    date: { type: String, default: '' },
    chapter: {
      type: String,
      enum: ['Sweet Moments', 'Everyday Us', 'Adventures', 'Milestones'],
      default: 'Sweet Moments',
    },
    favorite: { type: Boolean, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

photoSchema.index({ order: 1 });

export const Photo = mongoose.model<IPhoto>('Photo', photoSchema);

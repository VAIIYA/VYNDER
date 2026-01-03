import mongoose, { Schema, Document, Model } from "mongoose";

export interface IImage extends Document {
  user: mongoose.Types.ObjectId;
  url: string;
  publicId?: string; // For cloud storage (Cloudinary, S3, etc.)
  order: number; // Display order (0-5 for up to 6 photos)
  isPrimary: boolean; // Primary profile photo
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ImageSchema.index({ user: 1, order: 1 });
ImageSchema.index({ user: 1, isPrimary: 1 });
ImageSchema.index({ user: 1 });

const Image: Model<IImage> =
  mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);

export default Image;




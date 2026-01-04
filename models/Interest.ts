import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterest extends Document {
  name: string;
  category: "lifestyle" | "hobbies" | "activities" | "preferences" | "other";
  icon?: string; // Emoji or icon identifier
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InterestSchema = new Schema<IInterest>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["lifestyle", "hobbies", "activities", "preferences", "other"],
      default: "other",
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InterestSchema.index({ name: 1 });
InterestSchema.index({ category: 1 });
InterestSchema.index({ isActive: 1 });

const Interest: Model<IInterest> =
  mongoose.models.Interest || mongoose.model<IInterest>("Interest", InterestSchema);

export default Interest;





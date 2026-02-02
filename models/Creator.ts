import mongoose from "mongoose";

type CreatorDoc = {
  name: string;
  avatar?: string;
  handle?: string;
  bio?: string;
  price?: string;
  subscribers?: number;
  createdAt?: Date;
};

const CreatorSchema = new mongoose.Schema<CreatorDoc>({
  name: { type: String, required: true },
  avatar: String,
  handle: String,
  bio: String,
  price: String,
  subscribers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default (mongoose.models.Creator as mongoose.Model<CreatorDoc>) || mongoose.model<CreatorDoc>("Creator", CreatorSchema);

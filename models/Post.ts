import mongoose from "mongoose";

type PostDoc = {
  author: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  createdAt?: Date;
};

const PostSchema = new mongoose.Schema<PostDoc>({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Creator", required: true },
  content: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default (mongoose.models.Post as mongoose.Model<PostDoc>) || mongoose.model<PostDoc>("Post", PostSchema);

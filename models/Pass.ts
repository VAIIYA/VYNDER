import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPass extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PassSchema = new Schema<IPass>(
  {
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate passes and enable efficient queries
PassSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
PassSchema.index({ createdAt: -1 });

const Pass: Model<IPass> =
  mongoose.models.Pass || mongoose.model<IPass>("Pass", PassSchema);

export default Pass;



import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILike extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
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

// Compound index to prevent duplicate likes and enable efficient queries
LikeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
LikeSchema.index({ toUser: 1, fromUser: 1 });
LikeSchema.index({ createdAt: -1 });

const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);

export default Like;





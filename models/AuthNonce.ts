import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuthNonce extends Document {
  walletAddress: string;
  nonce: string;
  issuedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthNonceSchema = new Schema<IAuthNonce>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    nonce: {
      type: String,
      required: true,
      trim: true,
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

AuthNonceSchema.index({ walletAddress: 1 });
AuthNonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AuthNonce: Model<IAuthNonce> =
  mongoose.models.AuthNonce || mongoose.model<IAuthNonce>("AuthNonce", AuthNonceSchema);

export default AuthNonce;

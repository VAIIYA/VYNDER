import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  username: string;
  bio?: string;
  age?: number;
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  interestedIn?: ("male" | "female" | "non-binary" | "all")[];
  location?: string;
  photos: string[];
  profileCompleted: boolean;
  profileCompletionPercentage: number;
  blockedUsers: mongoose.Types.ObjectId[];
  reportedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  calculateProfileCompletion(): number;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.email.includes("@gmail.com") || !this.email.includes("@google");
      },
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "prefer-not-to-say"],
    },
    interestedIn: {
      type: [String],
      enum: ["male", "female", "non-binary", "all"],
      default: [],
    },
    location: {
      type: String,
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function (photos: string[]) {
          return photos.length <= 6;
        },
        message: "Maximum 6 photos allowed",
      },
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    profileCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reportedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.calculateProfileCompletion = function (): number {
  let completed = 0;
  const total = 7;

  if (this.username) completed++;
  if (this.bio) completed++;
  if (this.age) completed++;
  if (this.gender) completed++;
  if (this.interestedIn && this.interestedIn.length > 0) completed++;
  if (this.location) completed++;
  if (this.photos && this.photos.length > 0) completed++;

  return Math.round((completed / total) * 100);
};

UserSchema.pre("save", function (next) {
  this.profileCompletionPercentage = this.calculateProfileCompletion();
  this.profileCompleted = this.profileCompletionPercentage >= 80;
  next();
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ location: 1 });
UserSchema.index({ gender: 1, interestedIn: 1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;


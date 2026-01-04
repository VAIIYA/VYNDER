import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  walletAddress: string; // Solana wallet address (PRIMARY IDENTIFIER - replaces email)
  username: string;
  bio?: string;
  age?: number;
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  interestedIn?: ("male" | "female" | "non-binary" | "all")[];
  location?: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  // Interests/Tags (like Tinder)
  interests: mongoose.Types.ObjectId[]; // References to Interest model (predefined)
  // User-defined tags (hashtags, comma-separated)
  tags: string[]; // User-defined tags like #movies, #travel, etc.
  // Photos stored separately in Image model
  photos: string[]; // Legacy - kept for backward compatibility, will be replaced by Image model
  // Enhanced profile fields
  jobTitle?: string;
  company?: string;
  school?: string;
  height?: number; // in cm
  education?: string;
  drinking?: "never" | "socially" | "often" | "prefer-not-to-say";
  smoking?: "never" | "socially" | "often" | "prefer-not-to-say";
  exercise?: "never" | "sometimes" | "often" | "daily";
  kids?: "no" | "yes" | "want" | "have" | "prefer-not-to-say";
  pets?: string[];
  languages?: string[];
  // Profile metadata
  profileCompleted: boolean;
  profileCompletionPercentage: number;
  lastActive?: Date;
  isVerified: boolean;
  // Safety
  blockedUsers: mongoose.Types.ObjectId[];
  reportedUsers: mongoose.Types.ObjectId[];
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  calculateProfileCompletion(): number;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v: string) {
          // Basic Solana address validation (base58, 32-44 chars)
          return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v);
        },
        message: "Invalid Solana wallet address",
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
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    // Interests/Tags (Tinder-style)
    interests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Interest",
      },
    ],
    // User-defined tags (hashtags, comma-separated)
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 20; // Max 20 tags
        },
        message: "Maximum 20 tags allowed",
      },
    },
    // Legacy photos array (for backward compatibility)
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
    // Enhanced profile fields
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    school: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    height: {
      type: Number,
      min: 100, // 1 meter
      max: 250, // 2.5 meters
    },
    education: {
      type: String,
      trim: true,
      enum: [
        "high-school",
        "some-college",
        "bachelors",
        "masters",
        "phd",
        "prefer-not-to-say",
      ],
    },
    drinking: {
      type: String,
      enum: ["never", "socially", "often", "prefer-not-to-say"],
    },
    smoking: {
      type: String,
      enum: ["never", "socially", "often", "prefer-not-to-say"],
    },
    exercise: {
      type: String,
      enum: ["never", "sometimes", "often", "daily"],
    },
    kids: {
      type: String,
      enum: ["no", "yes", "want", "have", "prefer-not-to-say"],
    },
    pets: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    // Profile metadata
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
  const total = 10; // Increased total for more comprehensive profile

  // Core fields
  if (this.username) completed++;
  if (this.bio) completed++;
  if (this.age) completed++;
  if (this.gender) completed++;
  if (this.interestedIn && this.interestedIn.length > 0) completed++;
  if (this.location || this.city) completed++;
  if (this.photos && this.photos.length > 0) completed++;
  // Enhanced fields
  if (this.interests && this.interests.length > 0) completed++;
  if (this.jobTitle || this.school) completed++;
  if (this.height) completed++;

  return Math.round((completed / total) * 100);
};

UserSchema.pre("save", function (next) {
  this.profileCompletionPercentage = this.calculateProfileCompletion();
  this.profileCompleted = this.profileCompletionPercentage >= 80;
  next();
});

// Indexes for performance
UserSchema.index({ walletAddress: 1 }); // Primary index for wallet lookup
UserSchema.index({ location: 1 });
UserSchema.index({ city: 1 });
UserSchema.index({ gender: 1, interestedIn: 1 });
UserSchema.index({ interests: 1 }); // For interest-based matching
UserSchema.index({ tags: 1 }); // For tag-based matching
UserSchema.index({ coordinates: "2dsphere" }); // For geolocation queries
UserSchema.index({ lastActive: -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ profileCompleted: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;



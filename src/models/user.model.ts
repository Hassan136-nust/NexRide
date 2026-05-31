import mongoose, { Document, Model, Schema } from "mongoose";

type VideoKycStatus =
  | "not_required"
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;

  role: "user" | "partner" | "admin";

  isEmailVerified: boolean;
  isPartnerVerified: boolean;

  otp?: string;
  otpExpires?: Date;

  partnerOnboardingSteps: number;

  partnerStatus:
    | "none"
    | "pending"
    | "approved"
    | "rejected"
    | "onboarding";

  partnerRejectionReason?: string;

  videoKycStatus: VideoKycStatus;
  videoKycRoomId?: string;
  videoKycRejectionReason?: string;

  socketId: string | null;

  location?: {
    type: "Point";
    coordinates: [number, number];
  };

  isOnline: boolean;

  currentRide?: mongoose.Types.ObjectId;

  lastSeen?: Date;

  avatar?: string;

  phone?: string;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "partner", "admin"],
      default: "user",
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPartnerVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: "",
    },

    otpExpires: {
      type: Date,
    },

    partnerOnboardingSteps: {
      type: Number,
      min: 0,
      max: 8,
      default: 0,
    },

    partnerStatus: {
      type: String,
      enum: [
        "none",
        "pending",
        "approved",
        "rejected",
        "onboarding",
      ],
      default: "none",
      index: true,
    },

    partnerRejectionReason: {
      type: String,
      default: "",
    },

    videoKycStatus: {
      type: String,
      enum: [
        "not_required",
        "pending",
        "in_progress",
        "approved",
        "rejected",
      ],
      default: "not_required",
    },

    videoKycRoomId: {
      type: String,
      default: "",
    },

    videoKycRejectionReason: {
      type: String,
      default: "",
    },

    socketId: {
      type: String,
      default: null,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    currentRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      default: null,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// GEO INDEX
userSchema.index({ location: "2dsphere" });

// CLEAN JSON RESPONSE
userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.otp;
  delete (ret as { __v?: number }).__v;
    return ret;
  },
});

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;
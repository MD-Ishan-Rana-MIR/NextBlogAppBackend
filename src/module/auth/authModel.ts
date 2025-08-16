import mongoose, { Schema, Document } from "mongoose";
import { AuthModelType, Role } from "./authModelType";

const authSchema = new Schema<AuthModelType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: Object.values(Role), // only "admin" or "user"
      default: Role.USER,
    },
    lastLogin: {
      type: String,
    },
    loginDeviceName: {
      type: String,
    },
  },
  { timestamps: true,versionKey:false } // adds createdAt & updatedAt automatically
);

const AuthModel = mongoose.model<AuthModelType & Document>("Auth", authSchema);

export default AuthModel;

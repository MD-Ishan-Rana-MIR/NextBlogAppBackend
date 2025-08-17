import mongoose from "mongoose";
import { OtpType } from "./otpType";

const otpSchema = new mongoose.Schema<OtpType>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    otpVerify: {
        type: Boolean,
        default: false, // initially false when OTP is generated
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expireTime: {
        type: Number,
        default: 10, // 10 minutes
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 min from creation
    },
}, { timestamps: true, versionKey: false });

const OtpModel = mongoose.model<OtpType>("Otp", otpSchema);

export default OtpModel;
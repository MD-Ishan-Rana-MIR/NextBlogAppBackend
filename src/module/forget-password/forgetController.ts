import { Request, Response } from "express";
import SendEmailUtility from "../../config/email";
import OtpModel from "./otpModel";
import AuthModel from "../auth/authModel";
import bcrypt from "bcrypt";



export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: "fail", msg: "Email are required" });
        }

        const isExistEmail = await AuthModel.findOne({ email });
        if (!isExistEmail) {
            return res.status(404).json({ status: "fail", msg: "Email not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send OTP email
        await SendEmailUtility(email, "6 Digit otp code is", otp);

        // Store OTP in DB (upsert: if email exists, replace OTP)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await OtpModel.findOneAndUpdate(
            { email },
            { otp, expiresAt, createdAt: new Date() },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            status: "success",
            msg: "OTP sent successfully",
        });
    } catch (error) {
        console.error("Send OTP error:", error);
        return res.status(500).json({ status: "error", msg: "Failed to send OTP" });
    }
};


export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ status: "fail", msg: "Email and OTP are required" });
        }

        const record = await OtpModel.findOne({ email });

        if (!record) {
            return res.status(404).json({ status: "fail", msg: "OTP not found for this email" });
        }

        // Check expiry
        if (record.expiresAt! < new Date()) {
            await OtpModel.deleteOne({ email }); // optional: remove expired OTP
            return res.status(400).json({ status: "fail", msg: "OTP has expired" });
        }

        // Check OTP match
        if (record.otp !== otp) {
            return res.status(400).json({ status: "fail", msg: "Invalid OTP" });
        }

        // ✅ Mark OTP as verified
        record.otpVerify = true;
        await record.save();

        // ✅ Optional: Update user model as verified
        await AuthModel.findOneAndUpdate(
            { email },
            { isVerified: true }
        );

        return res.status(200).json({
            status: "success",
            msg: "OTP verified successfully",
            otpVerify: record.otpVerify,
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).json({ status: "error", msg: "Failed to verify OTP" });
    }
};


export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;


        if (!password) {
            return res.status(400).json({ status: "fail", msg: "Email and new password are required" });
        }

        const otpRecord = await OtpModel.findOne({ email });

        if (!otpRecord || !otpRecord.otpVerify) {
            return res.status(400).json({ status: "fail", msg: "OTP not verified" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await AuthModel.findOneAndUpdate({ email }, { password: hashedPassword });

        // Optional: delete OTP record
        await OtpModel.deleteOne({ email });

        return res.status(200).json({ status: "success", msg: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ status: "error", msg: "Failed to reset password" });
    }
};
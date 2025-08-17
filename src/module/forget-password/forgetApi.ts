import express from "express";
import { resetPassword, sendOtp, verifyOtp } from "./forgetController";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export const forgetRouter = router


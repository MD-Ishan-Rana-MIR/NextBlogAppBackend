export interface OtpType {
    email: string;         // User email
    otp: string;
    otpVerify: boolean,           // 6-digit OTP as string
    createdAt?: Date;      // Timestamp when OTP was created
    expireTime?: number;   // Expiry time in minutes
    expiresAt?: Date;      // Exact expiry datetime
}

import { Request, Response } from "express";
import AuthModel from "./authModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import LoginModel from "./loginModel";
dotenv.config();

export const userRegistration = async (req: Request, res: Response) => {
    console.log("User registration request received:", req);
    const { email, password, name } = req.body;

    try {
        // Check if email already exists
        const isExistsEmail = await AuthModel.findOne({ email });
        if (!email || !password || !name) {
            return res.status(400).json({
                status: "fail",
                msg: "Please provide all required fields: email, password, and name",
            });
        }
        if (isExistsEmail) {
            return res.status(400).json({
                status: "fail",
                msg: "User email already exists",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new AuthModel({
            email,
            password: hashedPassword, // store hashed password
            name,
        });
        await newUser.save();

        return res.status(201).json({
            status: "success",
            msg: "User registered successfully",
            data: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            status: "error",
            msg: "Something went wrong during registration",
        });
    }
};


export const userLogin = async (req: Request, res: Response) => {
    const { email, password, deviceName, deviceType, location } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                msg: "Please provide email and password",
            });
        }

        // Find user
        const user = await AuthModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: "fail",
                msg: "Invalid email or password",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: "fail",
                msg: "Invalid email or password",
            });
        }

        // Device & location info
        const clientDeviceName =
            deviceName || req.headers["user-agent"] || "Unknown Device";
        const clientDeviceType = deviceType || "Unknown Type";

        const clientLocation = {
            ip: location?.ip || req.ip || "Unknown IP",
            country: location?.country || "Unknown Country",
            city: location?.city || "Unknown City",
        };



        await user.save();

        // ✅ Save login history in LoginModel
        await LoginModel.create({
            userId: user._id,
            name: user.name,
            email: user.email,
            deviceName: clientDeviceName,
            deviceType: clientDeviceType,
            location: clientLocation,
            loginTime: new Date(),
        });

        const activeLogins = await LoginModel.find({ userId: user._id });

        if (activeLogins.length > 2) {
            // Already logged in from 2 devices → block new login
            return res.status(403).json({
                status: "fail",
                msg: "You can only be logged in on 2 devices at the same time.",
            });
        }

        // Create JWT token
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: "1d",
        });

        // ✅ Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });



        // Send response
        return res.status(200).json({
            status: "success",
            msg: "Login successful",
            token: token,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                lastLogin: user.lastLogin,
                deviceName: clientDeviceName,
                deviceType: clientDeviceType,
                location: clientLocation,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: "error",
            msg: "Something went wrong during login",
        });
    }
};

export const userProfile = async (req: Request, res: Response) => {
    const userId = req.headers.id;
    try {
        const filter = {
            _id: userId,
        }
        const user = await AuthModel.findOne(filter).select("-password");
        if (!user) {
            return res.status(404).json({
                status: "fail",
                msg: "User not found",
            });
        }
        return res.status(200).json({
            status: "success",
            msg: "User profile retrieved successfully",
            data: user,
        });
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        return res.status(500).json({
            status: "error",
            msg: "Something went wrong while retrieving user profile",
        });

    }
};


export const userLogout = async (req: Request, res: Response) => {
    try {
        // ✅ Check if token cookie exists
        const token = req.cookies?.token;
        if (!token) {
            return res.status(400).json({
                status: "fail",
                msg: "User already logged out",
            });
        }

        // ✅ Clear the token cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            status: "success",
            msg: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            status: "error",
            msg: "Something went wrong during logout",
        });
    }
};


export const userProfileUpdate = async (req: Request, res: Response) => {
    const userId = req.headers.id as string;
    const { name } = req.body;

    try {


        const filter = { _id: userId };

        const updatedUser = await AuthModel.findOneAndUpdate(
            filter,
            { name: name },
            { new: true } // return updated document
        );

        return res.status(200).json({
            status: "success",
            msg: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            msg: "Something went wrong",
            error: error instanceof Error ? error.message : error,
        });
    }
};
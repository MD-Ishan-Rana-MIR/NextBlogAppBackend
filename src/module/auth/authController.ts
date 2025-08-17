import { Request, Response } from "express";
import AuthModel from "./authModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
    const { email, password, deviceName } = req.body;

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

        // Get device name either from request body or headers
        const clientDevice =
            deviceName || req.headers["user-agent"] || "Unknown Device";

        // Update last login & device name
        user.lastLogin = new Date().toISOString();
        (user as any).loginDeviceName = clientDevice; // ensure field exists in schema
        await user.save();

        // Create JWT token
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: "1d", // token valid for 1 day
        });

        // ✅ Set token in cookie
        res.cookie("token", token, {
            httpOnly: true, // prevent JS access
            secure: process.env.NODE_ENV === "production", // only https in prod
            sameSite: "strict", // CSRF protection
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // Send response
        return res.status(200).json({
            status: "success",
            msg: "Login successful",
            token : token,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                lastLogin: user.lastLogin,
                loginDeviceName: clientDevice,
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
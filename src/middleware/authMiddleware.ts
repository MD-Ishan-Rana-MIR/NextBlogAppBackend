import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;
        }
    }
}

interface DecodedToken {
    id: string;
    email: string;
    role?: string;
    iat: number;
    exp: number;
}

export const isLogin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ status: "fail", message: "Unauthorized access" });
        }

        const decodedRaw = jwt.verify(token, process.env.JWT_SECRET as string);

        if (typeof decodedRaw === "string") {
            return res.status(401).json({ status: "fail", message: "Invalid token payload" });
        }

        const decoded: DecodedToken = decodedRaw as DecodedToken;

        const id = decoded.id;
        const email = decoded.email;
        const role = decoded.role;
        req.headers.id = id;
        req.headers.email = email;
        req.headers.role = role;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ status: "fail", message: "Token expired" });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ status: "fail", message: "Invalid token" });
        }
        console.error("Error in isLogin middleware:", error);
        return res.status(500).json({
            status: "error",
            msg: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};


export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.headers.role;
        if (role !== "admin") {
            return res.status(403).json({ status: "fail", message: "Access denied" });
        }
        next();
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);
        return res.status(500).json({
            status: "error",
            msg: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
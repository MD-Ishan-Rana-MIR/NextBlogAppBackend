import { Document } from "mongoose";

export enum Role {
    ADMIN = "admin",
    USER = "user",
}

export interface AuthModelType extends Document {
    email: string;
    password: string;
    name?: string;        // Optional field for user name
    createdAt?: string;   // Optional field for creation date
    updatedAt?: string;   // Optional field for last update date
    isActive?: boolean;   // Optional field to indicate if the user is active
    role?: Role;          // Use Role enum instead of string for safety
    lastLogin?: string;   // Optional field for the last login timestamp
    loginDeviceName?: string; // Optional field for the device name used for login
}

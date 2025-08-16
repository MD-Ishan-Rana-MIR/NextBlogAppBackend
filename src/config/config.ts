import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

export const config = {
    port,
    dbUrl: process.env.DB_URL || "mongodb://localhost:27017/mydatabase",
    jwtSecret: process.env.JWT_SECRET
}
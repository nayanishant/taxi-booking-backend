import mongoose from "mongoose";

const DB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
    try {
        if (!DB_URI) {
            throw new Error("Please provide a valid MongoDB URI");
        }
        
        await mongoose.connect(DB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
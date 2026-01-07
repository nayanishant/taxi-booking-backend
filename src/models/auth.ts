import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const AuthSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4(),
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // role: {
    //     type: String,
    //     enum: ["user", "admin"],
    //     default: "user",
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const User = mongoose.model('User', AuthSchema);
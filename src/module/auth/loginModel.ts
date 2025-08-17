import mongoose from "mongoose";


const loginSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String,  },
    email: { type: String,  },
    password: { type: String, },
    lastLogin: { type: Date, default: Date.now },
    deviceName: { type: String, },
    deviceType: { type: String, },
    location: {
        ip: { type: String, },
        country: { type: String, },
        city: { type: String, }
    }
}, {
    timestamps: true,
    versionKey: false
});


const LoginModel = mongoose.model("Login", loginSchema);

export default LoginModel
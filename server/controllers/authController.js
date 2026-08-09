import user from "../models/user.js";
import JWT from "jsonwebtoken";

// helper to set cookies
const setSessionCookie = (res, payload) => {
    const token = JWT.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d'
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/'
    });
};

export async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email and password are required" });
    }

    const trimmedEmail = email.toLowerCase().trim();

    const existing = await user.findOne({ email: trimmedEmail });

    if (existing) {
        return res.status(400).json({ error: "An account with this email already exist" });
    }

    const User = await user.create({
        name,
        email: trimmedEmail,
        password
    });

    setSessionCookie(res, {
        userId: User._id.toString(),
        email: User.email
    });

    return res.status(201).json({
        user: {
            _id: User._id,
            name: User.name,
            email: User.email
        }
    });
}

export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const User = await user.findOne({ email: email.toLowerCase().trim() });

    if (!User) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await User.comparePassword(password);

    if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    setSessionCookie(res, {
        userId: User._id.toString(),
        email: User.email
    });

    return res.status(200).json({
        user: {
            _id: User._id,
            name: User.name,
            email: User.email
        }
    });
}

export async function logout(_req, res) {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
    });

    return res.json({ success: true });
}

export async function me(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Not authorized" });
    }

    const User = await user.findById(req.user.userId).select("-password");

    if (!User) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: User });
}
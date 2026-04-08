import { getDb } from "../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Defining saltRounds for hashing
const saltRounds = 10;

function buildUserFromBody(body) {
  const user = {
    email: body.email?.trim(),
    password: body.password,
    firstName: body.firstName?.trim(),
    phoneNumber: body.phoneNumber?.trim(),
    isAdmin: false,
    organization: null,
  };

  return user;
}

function createResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
}

function buildResetUrl(rawToken) {
  const base =
    process.env.RESET_PASSWORD_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  return `${base.replace(/\/$/, "")}/reset-password?token=${rawToken}`;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Registers user
export async function register(req, res) {
  try {
    const newUser = buildUserFromBody(req.body);

    if (
      !newUser.email ||
      !newUser.password ||
      !newUser.firstName ||
      !newUser.phoneNumber
    ) {
      return res.status(400).json({
        message: "Email, password, firstname and phonenumber required.",
      });
    }

    const db = await getDb();
    const collection = db.collection("users");

    if (await collection.findOne({ email: newUser.email })) {
      return res.status(409).json({ message: "error: Email is already in use" });
    }

    const password = newUser.password;
    delete newUser.password;
    newUser.password = await bcrypt.hash(password, saltRounds);

    await collection.insertOne(newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error registering user." });
  }
}

// Logins User
export async function login(req, res) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const db = await getDb();
    const collection = db.collection("users");
    const user = await collection.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      organization: user.organization,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    const safeUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
      organization: user.organization,
    };

    return res.status(200).json({
      token,
      user: safeUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error logging in user." });
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = req.body.email?.trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const db = await getDb();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    // Always return the same response so you do not reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        message: "If an account exists, a password reset link has been sent.",
      });
    }

    const { rawToken, hashedToken } = createResetToken();
    const passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetExpires,
        },
      }
    );

    const resetUrl = buildResetUrl(rawToken);
    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Reset your password",
      text: `You requested a password reset. Use this link to reset your password: ${resetUrl}`,
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    });

    return res.status(200).json({
      message: "If an account exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to send password reset email." });
  }
}

export async function resetPassword(req, res) {
  try {
    const token = req.body.token?.trim();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Token, password, and confirmPassword are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const db = await getDb();
    const collection = db.collection("users");

    const user = await collection.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await collection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: {
          passwordResetToken: "",
          passwordResetExpires: "",
        },
      }
    );

    return res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to reset password." });
  }
  
}

export async function forgotUsername(req, res) {
  try {
    const email = req.body.email?.trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const db = await getDb();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

    // Return the same response either way so you do not reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        message: "If an account exists, a username reminder has been sent.",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Your username reminder",
      text: `Your username for the Lost and Found Portal is: ${user.email}`,
      html: `
        <p>You requested a username reminder.</p>
        <p>Your username is: <strong>${user.email}</strong></p>
      `,
    });

    return res.status(200).json({
      message: "If an account exists, a username reminder has been sent.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to send username reminder." });
  }
}
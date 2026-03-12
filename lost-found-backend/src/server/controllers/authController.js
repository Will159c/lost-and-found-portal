import { getDb } from "../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const saltRounds = 10;

function buildUserFromBody(body) {
    const user = {
        email: body.email?.trim(),
        password: body.password,
        firstName: body.firstName?.trim(),
        phoneNumber: body.phoneNumber?.trim(),
        isAdmin: false,
        organization: "null",
    };

    return user;
}

//register
export async function register(req, res) {
  try {
    const newUser = buildUserFromBody(req.body);

    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.phoneNumber) {
      return res.status(400).json({
        message: "Email, password, firstname and phonenumber required."
      });
    }

    const db = await getDb();
    const collection = db.collection("users");

    if (await collection.findOne({ email: newUser.email })) {
      return res.status(409).json({
        message: "Email is already in use"
      });
    }

    newUser.password = await bcrypt.hash(newUser.password, saltRounds);

    await collection.insertOne(newUser);

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user." });
  }
}

//login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required."
      });
    }

    const db = await getDb();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });

        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Invalid credentials" });
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
            user: safeUser
        });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in user." });
  }
}

//forgot password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({ email: email.trim() });

    if (!user) {
      return res.json({ message: "If account exists, reset link generated." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry = Date.now() + 15 * 60 * 1000;

    await users.updateOne(
      { _id: user._id },
      { $set: { resetToken: hashedToken, resetTokenExpiry: expiry } }
    );

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    console.log("RESET LINK (DEMO):", resetURL);

    return res.json({
      message: "Reset link generated.",
      resetURL
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
}

//reset password
export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "New password required." });

    const db = await getDb();
    const users = db.collection("users");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await users.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await users.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    return res.json({ message: "Password updated successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
}

//forgot username
export async function forgotUsername(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required." });

    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({ email: email.trim() });

    if (!user) {
      return res.json({ message: "If account exists, username retrieved." });
    }

    return res.json({
      message: "Username retrieved.",
      username: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
}
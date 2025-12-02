import { getDb } from "../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Defining saltRounds for hashing
const saltRounds = 10;

// Builds user to be inserted
function buildUserFromBody(body) {
    const user = {
        email: body.email?.trim(),
        password: body.password,
        firstName: body.firstName?.trim(),
        phoneNumber: body.phoneNumber?.trim()
    };

    return user;
}

// Registers user
export async function register(req, res) {
    try {
        const newUser = buildUserFromBody(req.body);
        if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.phoneNumber) {
            return res
                .status(400)
                .json({ message: "Email, password, firstname and phonenumber required."});
        }
        const db = await getDb();
        const collection = db.collection("users");

        if (await collection.findOne({ email: newUser.email})) {
            return res
                .status(409)
                .json({ message: "error: Email is already in use"})
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
            return res
                .status(400)
                .json({ message: "Email and password required." });
        }

        const db = await getDb();
        const collection = db.collection("users");
        const user = await collection.findOne({ email: req.body.email });

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
            phoneNumber: user.phoneNumber
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        const safeUser = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            phoneNumber: user.phoneNumber
        };

        return res.status(200).json({
            token,
            user: safeUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error logging in user." });
    }
}

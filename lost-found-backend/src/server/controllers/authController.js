// This will help us connect to the database
import { getDb } from "../db/connection.js";
// This hash's passwords
import bcrypt from "bcrypt";

// Defining saltRounds for hashing
const saltRounds = 10;

// Builds user to be inserted
function buildUserFromBody(body) {
    const user = {
        email: body.email?.trim(),
        password: body.password?.trim(),
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

        newUser.passwordHash = await bcrypt.hash(newUser.password, saltRounds);
        delete newUser.password;
        
        

        await collection.insertOne(newUser);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error registering user." });
    }
}
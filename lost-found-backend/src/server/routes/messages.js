import express from "express";
import { getDb } from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js"; // Import the auth middleware

const router = express.Router();
const COLLECTION = "messages";

// GET /api/messages?with=userEmail
// ADDED requireAuth middleware
router.get("/", requireAuth, async (req, res) => {
  try {
    const withUser = req.query.with;
    const myEmail = req.user.email; // Get the securely decoded email from the token

    if (!withUser) {
      return res.status(400).json({ error: "Missing 'with' query parameter" });
    }

    const db = await getDb();

    // SECURED: Only get messages exactly between the logged-in user and 'withUser'
    const messages = await db
      .collection(COLLECTION)
      .find({
        $or: [
          { from: myEmail, to: withUser },
          { from: withUser, to: myEmail },
        ],
      })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch messages", details: err.message });
  }
});

// POST /api/messages
// ADDED requireAuth middleware
router.post("/", requireAuth, async (req, res) => {
  try {
    const { to, text } = req.body;
    const from = req.user.email; // SECURED: Force 'from' to be the logged-in user's email

    if (!to || !text) {
      return res
        .status(400)
        .json({ error: "'to' and 'text' fields are required" });
    }

    const db = await getDb();
    const doc = { from, to, text, createdAt: new Date() };
    const result = await db.collection(COLLECTION).insertOne(doc);

    res.json({ success: true, _id: result.insertedId, ...doc });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to send message", details: err.message });
  }
});

export default router;

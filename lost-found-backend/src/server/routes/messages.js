import express from "express";
import { getDb } from "../db/connection.js";
const router = express.Router();
const COLLECTION = "messages";

// GET /api/messages?with=userEmail
router.get("/", async (req, res) => {
  try {
    const withUser = req.query.with;
    // You might also need req.user if authenticated, or pass "from" from frontend
    const db = await getDb();
    // Show all messages between the logged in user (from) and withUser
    const messages = await db.collection(COLLECTION).find({
      $or: [
        { from: withUser }, // Received
        { to: withUser }    // Sent
      ]
    }).sort({ createdAt: 1 }).toArray();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages", details: err.message });
  }
});

// POST /api/messages
router.post("/", async (req, res) => {
  try {
    const { from, to, text } = req.body;
    const db = await getDb();
    const doc = { from, to, text, createdAt: new Date() };
    const result = await db.collection(COLLECTION).insertOne(doc);
    res.json({ success: true, _id: result.insertedId, ...doc });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message", details: err.message });
  }
});

export default router;

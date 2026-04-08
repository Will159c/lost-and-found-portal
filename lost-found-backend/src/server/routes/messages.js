import express from "express";
import { getDb } from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const COLLECTION = "messages";

function normalizeEmail(value) {
  return value?.trim().toLowerCase();
}

async function findUserByEmail(db, email) {
  return db.collection("users").findOne({ email });
}

function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 60000;
}

// Ping current user's presence
router.post("/presence/ping", requireAuth, async (req, res) => {
  try {
    const db = await getDb();

    await db.collection("users").updateOne(
      { email: req.user.email },
      { $set: { lastSeen: new Date() } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update presence",
      details: err.message,
    });
  }
});

// Contacts list
router.get("/contacts", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const myEmail = req.user.email;
    const meIsAdmin = !!req.user.isAdmin;

    // Non-admin: only admins
    if (!meIsAdmin) {
      const admins = await db
        .collection("users")
        .find(
          { isAdmin: true },
          {
            projection: {
              _id: 0,
              email: 1,
              firstName: 1,
              isAdmin: 1,
              lastSeen: 1,
            },
          }
        )
        .sort({ firstName: 1, email: 1 })
        .toArray();

      return res.json(
        admins.map((admin) => ({
          ...admin,
          online: isOnline(admin.lastSeen),
        }))
      );
    }

    // Admin: users who have a conversation with this admin
    const threadUsers = await db
      .collection(COLLECTION)
      .aggregate([
        {
          $match: {
            $or: [{ from: myEmail }, { to: myEmail }],
          },
        },
        {
          $project: {
            otherEmail: {
              $cond: [{ $eq: ["$from", myEmail] }, "$to", "$from"],
            },
            createdAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: "$otherEmail",
            latestCreatedAt: { $first: "$createdAt" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "email",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $match: {
            "user.isAdmin": { $ne: true },
          },
        },
        {
          $project: {
            _id: 0,
            email: "$user.email",
            firstName: "$user.firstName",
            isAdmin: "$user.isAdmin",
            lastSeen: "$user.lastSeen",
            latestCreatedAt: 1,
          },
        },
        {
          $sort: { latestCreatedAt: -1 },
        },
      ])
      .toArray();

    return res.json(
      threadUsers.map((user) => ({
        ...user,
        online: isOnline(user.lastSeen),
      }))
    );
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch contacts",
      details: err.message,
    });
  }
});

// Get conversation
router.get("/", requireAuth, async (req, res) => {
  try {
    const withUser = normalizeEmail(req.query.with);
    const myEmail = req.user.email;
    const meIsAdmin = !!req.user.isAdmin;

    if (!withUser) {
      return res.status(400).json({ error: "Missing 'with' query parameter" });
    }

    const db = await getDb();
    const otherUser = await findUserByEmail(db, withUser);

    if (!otherUser) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    if (!meIsAdmin && !otherUser.isAdmin) {
      return res.status(403).json({
        error: "Users may only message admins",
      });
    }

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
    res.status(500).json({
      error: "Failed to fetch messages",
      details: err.message,
    });
  }
});

// Send message
router.post("/", requireAuth, async (req, res) => {
  try {
    const to = normalizeEmail(req.body.to);
    const text = req.body.text?.trim();
    const from = req.user.email;
    const meIsAdmin = !!req.user.isAdmin;

    if (!to || !text) {
      return res.status(400).json({
        error: "'to' and 'text' fields are required",
      });
    }

    const db = await getDb();
    const recipient = await findUserByEmail(db, to);

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    if (!meIsAdmin && !recipient.isAdmin) {
      return res.status(403).json({
        error: "Users may only message admins",
      });
    }

    const doc = {
      from,
      to,
      text,
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTION).insertOne(doc);
    const savedDoc = { ...doc, _id: result.insertedId };

    const io = req.app.get("io");
    if (io) {
      io.to(to).emit("newMessage", savedDoc);
      io.to(from).emit("newMessage", savedDoc);
    }

    res.json({ success: true, ...savedDoc });
  } catch (err) {
    res.status(500).json({
      error: "Failed to send message",
      details: err.message,
    });
  }
});

export default router;
import express from "express";
import { getDb } from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const COLLECTION = "messages";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findUserByEmail(db, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  return db.collection("users").findOne({
    email: {
      $regex: `^${escapeRegex(normalizedEmail)}$`,
      $options: "i",
    },
  });
}

function isOnline(lastSeen) {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 60000;
}

function toContact(user, extra = {}) {
  return {
    ...extra,
    email: normalizeEmail(user.email),
    firstName: user.firstName,
    isAdmin: user.isAdmin === true,
    lastSeen: user.lastSeen,
    online: isOnline(user.lastSeen),
  };
}

function emitMessage(io, emails, payload) {
  if (!io) return;

  const rooms = [
    ...new Set(
      emails
        .flatMap((email) => {
          const rawEmail = typeof email === "string" ? email.trim() : "";
          return [rawEmail, normalizeEmail(rawEmail)];
        })
        .filter(Boolean)
    ),
  ];

  if (rooms.length === 0) return;

  let target = io;
  rooms.forEach((room) => {
    target = target.to(room);
  });

  target.emit("newMessage", payload);
}

// Ping current user's presence
router.post("/presence/ping", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const currentUser = await findUserByEmail(db, req.user.email);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    await db.collection("users").updateOne(
      { _id: currentUser._id },
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
    const currentUser = await findUserByEmail(db, req.user.email);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const myEmail = normalizeEmail(currentUser.email);
    const meIsAdmin = currentUser.isAdmin === true;

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

      return res.json(admins.map((admin) => toContact(admin)));
    }

    // Admin: users who have a conversation with this admin
    const threadUsers = await db
      .collection(COLLECTION)
      .aggregate([
        {
          $addFields: {
            fromEmail: { $toLower: "$from" },
            toEmail: { $toLower: "$to" },
          },
        },
        {
          $match: {
            $or: [{ fromEmail: myEmail }, { toEmail: myEmail }],
          },
        },
        {
          $project: {
            otherEmail: {
              $cond: [{ $eq: ["$fromEmail", myEmail] }, "$toEmail", "$fromEmail"],
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
            let: { otherEmail: "$_id" },
            pipeline: [
              {
                $addFields: {
                  normalizedEmail: { $toLower: "$email" },
                },
              },
              {
                $match: {
                  $expr: { $eq: ["$normalizedEmail", "$$otherEmail"] },
                },
              },
            ],
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
            email: { $toLower: "$user.email" },
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

    return res.json(threadUsers.map((user) => toContact(user, {
      latestCreatedAt: user.latestCreatedAt,
    })));
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

    if (!withUser) {
      return res.status(400).json({ error: "Missing 'with' query parameter" });
    }

    const db = await getDb();
    const currentUser = await findUserByEmail(db, req.user.email);
    const otherUser = await findUserByEmail(db, withUser);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    if (!otherUser) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const myEmail = normalizeEmail(currentUser.email);
    const otherEmail = normalizeEmail(otherUser.email);
    const meIsAdmin = currentUser.isAdmin === true;

    if (!meIsAdmin && !otherUser.isAdmin) {
      return res.status(403).json({
        error: "Users may only message admins",
      });
    }

    const messages = await db
      .collection(COLLECTION)
      .aggregate([
        {
          $addFields: {
            fromEmail: { $toLower: "$from" },
            toEmail: { $toLower: "$to" },
          },
        },
        {
          $match: {
            $or: [
              { fromEmail: myEmail, toEmail: otherEmail },
              { fromEmail: otherEmail, toEmail: myEmail },
            ],
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $project: {
            fromEmail: 0,
            toEmail: 0,
          },
        },
      ])
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
    const requestedRecipient = normalizeEmail(req.body.to);
    const text = req.body.text?.trim();

    if (!requestedRecipient || !text) {
      return res.status(400).json({
        error: "'to' and 'text' fields are required",
      });
    }

    const db = await getDb();
    const currentUser = await findUserByEmail(db, req.user.email);
    const recipient = await findUserByEmail(db, requestedRecipient);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const from = normalizeEmail(currentUser.email);
    const to = normalizeEmail(recipient.email);
    const meIsAdmin = currentUser.isAdmin === true;

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
    emitMessage(io, [to, recipient.email, from, currentUser.email], savedDoc);

    res.json({ success: true, ...savedDoc });
  } catch (err) {
    res.status(500).json({
      error: "Failed to send message",
      details: err.message,
    });
  }
});

export default router;

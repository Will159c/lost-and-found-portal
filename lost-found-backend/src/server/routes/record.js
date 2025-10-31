import express from "express";
// This will help us connect to the database
import { getDb } from "../db/connection.js";
// This helps convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * Utility: coerce and whitelist incoming item fields.
 */
const ALLOWED_STATUS = ["lost", "found", "claimed"];

function buildItemFromBody(body) {
  const status = (body.status || "lost").trim().toLowerCase();

  const item = {
    itemName: body.itemName?.trim(),
    description: body.description?.trim(),
    category: body.category?.trim(),
    status: ALLOWED_STATUS.includes(status) ? status : "lost", // "lost" | "found" | "claimed"
    location: body.location?.trim(),
    contactInfo: body.contactInfo?.trim(),
    imageURL: body.imageURL?.trim(),
  };
  const d = body.date ? new Date(body.date) : new Date();
  item.date = isNaN(d.getTime()) ? new Date() : d;
  return item;
}

/* GET all items */
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection("items");
    const results = await collection.find({}).sort({ date: -1 }).toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching items");
  }
});

/* GET one item */
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection("items");
    const query = { _id: new ObjectId(req.params.id) };
    const item = await collection.findOne(query);
    if (!item) return res.status(404).send("Item not found");
    res.status(200).send(item);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching item");
  }
});

/* POST create item */
router.post("/", async (req, res) => {
  try {
    const newItem = buildItemFromBody(req.body);
    if (!newItem.itemName || !newItem.description || !newItem.status) {
      return res
        .status(400)
        .send("itemName, description, and status are required");
    }
    const db = await getDb();
    const collection = db.collection("items");
    const result = await collection.insertOne(newItem);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding item");
    console.error("VALIDATION DETAILS ->", err?.errInfo?.details);

  }
});

/* PUT update item */
router.put("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection("items");
    const query = { _id: new ObjectId(req.params.id) };
    const updates = buildItemFromBody(req.body);
    const result = await collection.updateOne(query, { $set: updates });
    if (result.matchedCount === 0)
      return res.status(404).send("Item not found");
    res.status(200).send({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating item");
  }
});

/* DELETE item */
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection("items");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0)
      return res.status(404).send("Item not found");
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting item");
  }
});

export default router;

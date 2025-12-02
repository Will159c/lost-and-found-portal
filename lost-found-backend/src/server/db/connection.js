// src/server/db/connection.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let dbInstance = null;
let client = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in environment variables");
  }

  const isValid =
    uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
  if (!isValid) {
    throw new Error(
      "MONGODB_URI must start with 'mongodb://' or 'mongodb+srv://'"
    );
  }

  // Create client & connect once
  client = new MongoClient(uri);
  await client.connect();
  dbInstance = client.db(); 

  console.log("MongoDB connected");
  return dbInstance;
}


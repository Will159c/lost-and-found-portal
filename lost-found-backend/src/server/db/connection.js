// src/server/db/connection.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri?.startsWith("mongodb")) {
  throw new Error(
    'MONGODB_URI must start with "mongodb://" or "mongodb+srv://"'
  );
}

const client = new MongoClient(uri); // ← no deprecated options
let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  await client.connect();
  dbInstance = client.db(); // uses the DB in your URI if provided
  console.log("MongoDB connected");
  return dbInstance;
}

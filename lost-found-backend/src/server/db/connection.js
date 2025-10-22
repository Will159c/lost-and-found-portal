// src/server/db/connection.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

let dbInstance = null;
let client = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }

  client = new MongoClient(uri);
  await client.connect();
  dbInstance = client.db(); 
  console.log('MongoDB connected');
  return dbInstance;
}


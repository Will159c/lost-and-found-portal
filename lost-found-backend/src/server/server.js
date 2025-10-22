import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import records from "./routes/record.js";
import { getDb } from "./db/connection.js";

dotenv.config({ path: "../../config.env" });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use("/items", records); // e.g., /items routes

// Start only after DB is connected (fail fast if URI is bad)
(async () => {
  try {
    await getDb();
    app.listen(PORT, () => {
      console.log(`Server running on Port: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import records from "./routes/record.js";
import messages from "./routes/messages.js";
import { getDb } from "./db/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.use("/items", records);
app.use("/api/messages", messages);

(async () => {
  try {
    await getDb(); // Ensure DB connection before server starts
    app.listen(PORT, () => {
      console.log(`Server running on Port: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

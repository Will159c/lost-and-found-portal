import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import records from "./routes/record.js";

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5050;
const URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/record", records);

// MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // stop server if connection fails
  }
}

// Start server after DB connects
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

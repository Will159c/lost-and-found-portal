// src/server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import records from "./routes/record.js";
import auth from "./routes/auth.js";
import messages from "./routes/messages.js";

import { getDb } from "./db/connection.js";
import { ensureItemsCollection } from "./db/ensureItems.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/items", records);
app.use("/auth", auth);
app.use("/api/messages", messages);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lost and Found Portal API",
      version: "1.0.0",
      description: "API documentation for the Lost and Found Portal backend",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create HTTP server for Express + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// store io globally
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (email) => {
    if (!email) return;
    socket.join(email);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start only after DB is connected
(async () => {
  try {
    await getDb();
    await ensureItemsCollection();
    server.listen(PORT, () => {
      console.log(`Server running on Port: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import records from "./routes/record.js";
import auth from "./routes/auth.js";

import { getDb } from "./db/connection.js";
import { ensureItemsCollection } from "./db/ensureItems.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use("/items", records); // e.g., /items routes
app.use("/", auth); // auth routes

//Swagger configuration
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

//Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Start only after DB is connected (fail fast if URI is bad)
(async () => {
  try {
    await getDb();
    await ensureItemsCollection();
    app.listen(PORT, () => {
      console.log(`Server running on Port: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

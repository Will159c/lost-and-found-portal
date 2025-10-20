import express from "express";
import cors from "cors";
import morgan from "morgan";
import healthRouter from "./routes/health.js";
import itemsRouter from "./routes/items.js";

const app = express();

const allowed = [
    process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    "http://127.0.0.1:3000"
];

app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRouter);
app.use("/api/items", itemsRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Server error" });
});

export default app;

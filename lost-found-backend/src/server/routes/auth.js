import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

/* register User */
router.post("/register", register);
/* login User */
router.post("/login", login);

export default router;
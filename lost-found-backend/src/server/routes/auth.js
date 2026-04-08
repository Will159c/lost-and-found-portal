import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  forgotUsername,
} from "../controllers/authController.js";

const router = express.Router();

/* register User */
router.post("/register", register);
/* login User */
router.post("/login", login);

/* forgot/reset password */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* forgot username */
router.post("/forgot-username", forgotUsername);

export default router;
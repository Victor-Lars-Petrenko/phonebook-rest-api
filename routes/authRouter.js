import express from "express";

import {
  register,
  login,
  getCurrent,
  logout,
  updateUserSubscription,
  updateUserAvatar,
  verify,
  resendVerify,
} from "../controllers/authControllers.js";

import { authenticate } from "../middlewares/authenticate.js";

import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/logout", authenticate, logout);

authRouter.patch("/", authenticate, updateUserSubscription);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  updateUserAvatar
);

authRouter.get("/verify/:verificationToken", verify);

authRouter.post("/verify", resendVerify);

export default authRouter;

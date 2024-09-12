import express from "express";

import { verifyToken } from "../middlewares/auth-middleware.js";
import {
  signup,
  login,
  getUserData,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logout,
} from "../controllers/auth-controller.js";
import { upload } from "../util/multer.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/user-data", verifyToken, getUserData);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);

authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);
authRoutes.post("/logout", logout);

export default authRoutes;

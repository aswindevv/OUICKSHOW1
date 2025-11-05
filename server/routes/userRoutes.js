import express from "express";
import {
  getFavorites,        // ✅ Correct name (matches controller)
  getUserBookings,
  updateFavorite
} from "../controllers/userController.js";

const userRouter = express.Router();

// ✅ Get a user's bookings
userRouter.get("/bookings", getUserBookings);

// ✅ Add or remove a favorite movie
userRouter.post("/update-favorite", updateFavorite);

// ✅ Get user's favorite movies list
userRouter.get("/favorites", getFavorites);

export default userRouter;

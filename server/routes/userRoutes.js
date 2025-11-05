import express from "express";
import {
  getFavourites,
  getUserBookings,
  updateFavourite,
} from "../controllers/userController.js";

const userRouter = express.Router();

// ✅ Get user bookings
userRouter.get("/bookings", getUserBookings);

// ✅ Add or remove a movie from favourites
userRouter.post("/update-favourite", updateFavourite);

// ✅ Get all favourite movies
userRouter.get("/favourites", getFavourites);

export default userRouter;

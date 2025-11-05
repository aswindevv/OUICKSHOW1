import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// ✅ Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.auth().userId; // ✅ fixed (was req.auth)
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Favorite Movie
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId; // ✅ fixed (was req.auth)

    if (!movieId) {
      return res.status(400).json({ success: false, message: "Movie ID is required." });
    }

    const user = await clerkClient.users.getUser(userId);
    if (!user || !user.privateMetadata) {
      return res.status(404).json({ success: false, message: "User not found or metadata missing." });
    }

    if (!Array.isArray(user.privateMetadata.favorites)) {
      user.privateMetadata.favorites = [];
    }

    const favorites = user.privateMetadata.favorites;
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
    } else {
      user.privateMetadata.favorites = favorites.filter((item) => item !== movieId);
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });

    res.json({ success: true, message: "Favorite movie updated successfully." });
  } catch (error) {
    console.error("Error updating favorite movie:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Favorite Movies
export const getFavorites = async (req, res) => {
  try {
    const userId = req.auth().userId; // ✅ fixed (was req.auth)
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID missing" });
    }

    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata?.favorites || [];

    const movies = await Movie.find({ _id: { $in: favorites } });
    res.json({ success: true, movies });
  } catch (error) {
    console.error("Error fetching favorite movies:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

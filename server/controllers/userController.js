import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// ✅ Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie", select: "title poster_path release_date" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// ✅ Add or Remove Favourite Movie
export const updateFavourite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const { userId } = req.auth;

    if (!userId) return res.json({ success: false, message: "User not logged in" });
    if (!movieId) return res.json({ success: false, message: "Movie ID missing" });

    const user = await clerkClient.users.getUser(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    const favourites = Array.isArray(user.privateMetadata.favourites)
      ? user.privateMetadata.favourites
      : [];

    // ✅ Toggle logic
    if (!favourites.includes(movieId)) {
      favourites.push(movieId);
    } else {
      const index = favourites.indexOf(movieId);
      favourites.splice(index, 1);
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { ...user.privateMetadata, favourites },
    });

    res.json({ success: true, message: "Favourites updated successfully" });
  } catch (error) {
    console.error("Error updating favourite:", error);
    res.status(500).json({ success: false, message: "Failed to update favourite" });
  }
};

// ✅ Get Favourite Movies
export const getFavourites = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await clerkClient.users.getUser(userId);
    if (!user || !Array.isArray(user.privateMetadata.favourites))
      return res.json({ success: true, movies: [] });

    const favourites = user.privateMetadata.favourites;
    const movies = await Movie.find({ _id: { $in: favourites } });

    res.json({ success: true, movies });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ success: false, message: "Failed to fetch favourites" });
  }
};

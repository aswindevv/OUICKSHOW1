import express from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controllers/Showcontroller.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

// ✅ Must have a forward slash `/`
showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);
showRouter.post("/add", protectAdmin, addShow);
showRouter.get("/all", getShows);

// ✅ Critical fix: add a slash `/` and a colon `:` for the dynamic parameter
showRouter.get("/:movieId", getShow);

export default showRouter;

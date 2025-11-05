import mongoose from "mongoose";

// Define the schema for the Show model
const showSchema = new mongoose.Schema(
  {
    movie: { type: String, required: true, ref: 'Movie' },  // Reference to the Movie model
    showDateTime: { type: Date, required: true },  // The date and time of the show
    showPrice: { type: Number, required: true },  // The price of the show
    occupiedSeats: { type: Object, default: {} },  // Stores occupied seats, default is an empty object
  },
  {
    timestamps: true,  // Adds 'createdAt' and 'updatedAt' to the schema
    minimize: false,  // Ensures empty objects are not removed
  }
);

// Create the Show model using the schema
const Show = mongoose.model("Show", showSchema);

export default Show;

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, required: true }, // Clerk userId
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    bookedSeats: { type: [String], required: true },
    amount: { type: Number, required: true },
    paymentLink: { type: String, default: "" },
    isPaid: { type: Boolean, default: false }, // ✅ this is key
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

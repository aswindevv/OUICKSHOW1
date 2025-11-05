import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import Stripe from "stripe";
import { inngest } from "../inngest/index.js";

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { showId, selectedSeats } = req.body;

    if (!userId) return res.json({ success: false, message: "Not logged in" });
    if (!showId || !selectedSeats?.length)
      return res.json({ success: false, message: "Missing booking details" });

    const showData = await Show.findById(showId).populate("movie");
    if (!showData) return res.json({ success: false, message: "Show not found" });

    // ✅ Check seat availability
    const isAvailable = selectedSeats.every((seat) => !showData.occupiedSeats[seat]);
    if (!isAvailable)
      return res.json({ success: false, message: "Some seats are already booked" });

    // ✅ Create booking record
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    // ✅ Mark occupied seats
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // ✅ Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const origin = req.headers.origin || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: showData.movie.title },
            unit_amount: showData.showPrice * 100,
          },
          quantity: selectedSeats.length,
        },
      ],
      metadata: { bookingId: booking._id.toString() },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    booking.paymentLink = session.url;
    await booking.save();

    // ✅ Schedule cleanup if not paid
    await inngest.send({
      name: "app/checkpayment",
      data: { bookingId: booking._id.toString() },
    });

    console.log("✅ Stripe session created:", session.url);
    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("❌ Stripe booking error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Make sure this function exists too
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    if (!showData)
      return res.json({ success: false, message: "Show not found" });

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error("❌ Error fetching occupied seats:", error);
    res.json({ success: false, message: error.message });
  }
};

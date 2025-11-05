import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // 🧩 IMPORTANT: req.body is raw buffer because of express.raw()
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Stripe event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error("⚠️ Missing bookingId in metadata");
      return res.status(400).send("Missing bookingId");
    }

    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.error("⚠️ Booking not found:", bookingId);
        return res.status(404).send("Booking not found");
      }

      booking.isPaid = true;
      booking.paymentLink = "";
      await booking.save();

      console.log(`✅ Booking ${bookingId} marked as paid`);
    } catch (dbErr) {
      console.error("❌ Database update error:", dbErr.message);
      return res.status(500).send("Failed to update booking");
    }
  }

  res.status(200).json({ received: true });
};


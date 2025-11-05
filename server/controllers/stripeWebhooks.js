 import stripe from "stripe";
import Booking from '../models/Booking.js'; // Assuming the path from the image

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;

    // Ensure body is raw (using `rawBody` middleware if necessary)
    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                // List sessions related to the payment intent
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId
                });

                // Ensure we have a session
                if (sessionList.data.length === 0) {
                    console.error("No session found for payment intent:", paymentIntentId);
                    return response.status(400).send("No session found for payment intent");
                }

                const session = sessionList.data[0];

                // Retrieve the booking ID from metadata
                const bookingId = session.metadata.bookingId;

                if (!bookingId) {
                    console.error("Booking ID is missing in the metadata.");
                    return response.status(400).send("Booking ID missing in session metadata");
                }

                // Update the booking with the payment success status
                const booking = await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentLink: "" // Clear payment link after payment
                });

                if (!booking) {
                    console.error("Booking not found:", bookingId);
                    return response.status(400).send("Booking not found");
                }

                console.log(`Payment for booking ${bookingId} succeeded.`);
                break;
            }

            default:
                console.log('Unhandled event type:', event.type);
                break;
        }

        // Acknowledge receipt of the event
        response.json({ received: true });

    } catch (err) {
        console.error("Webhook processing error:", err);
        response.status(500).send("Internal Server Error");
    }
};

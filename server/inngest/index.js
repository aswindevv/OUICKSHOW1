import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Create an Inngest client
export const inngest = new Inngest({
  id: "movie-ticket-booking",
});

/* -------------------------------------------------------------------------- */
/*                             Clerk User Events                              */
/* -------------------------------------------------------------------------- */

// Create user
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    });
  }
);

// Delete user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

// Update user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    await User.findByIdAndUpdate(id, {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                   Release Seats if Payment Not Made                        */
/* -------------------------------------------------------------------------- */

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" }, // ✅ Correct for v3.44.3
  async ({ event, step }) => {
    const bookingId = event.data.bookingId;
    console.log(`⏳ Scheduled seat release check for booking: ${bookingId}`);

    // Wait for 10 minutes
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    // After wait, check payment status
    await step.run("check-payment-status", async () => {
      const booking = await Booking.findById(bookingId);
      if (!booking) return console.log(`⚠️ Booking not found: ${bookingId}`);

      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        if (show && booking.bookedSeats) {
          booking.bookedSeats.forEach((seat) => delete show.occupiedSeats[seat]);
          show.markModified("occupiedSeats");
          await show.save();
        }

        await Booking.findByIdAndDelete(booking._id);
        console.log(`🗑️ Released seats and deleted unpaid booking: ${bookingId}`);
      } else {
        console.log(`✅ Booking ${bookingId} was already paid.`);
      }
    });
  }
);

/* -------------------------------------------------------------------------- */
/*                              Export Functions                              */
/* -------------------------------------------------------------------------- */

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
];

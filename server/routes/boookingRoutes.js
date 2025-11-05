import express from 'express';
import { createBooking, getOccupiedSeats } from '../controllers/Bookingcontroller.js';

const bookingRouter = express.Router();

// Route to create a new booking
bookingRouter.post('/create', createBooking);

// Route to get the occupied seats for a specific show
bookingRouter.get('/seats/:showId', getOccupiedSeats);

export default bookingRouter;
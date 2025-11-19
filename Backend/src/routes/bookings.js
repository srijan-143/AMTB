// backend/src/routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.error('Stripe init error:', err);
    stripe = null;
  }
}

// Helper: validate ObjectId
function isValidObjectId(id) {
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch {
    return false;
  }
}

// Create new booking (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated token
    const { date, mealType, persons, amount } = req.body;

    // 1) Basic validation
    if (!date || !mealType || !persons || !amount) {
      return res.status(400).json({ error: 'Missing required fields: date, mealType, persons, amount' });
    }
    if (typeof persons !== 'number' || persons <= 0) {
      return res.status(400).json({ error: 'persons must be a positive number' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    // 2) Create booking
    const booking = new Booking({
      user: userId,
      date,
      mealType,
      persons,
      amount,
      status: 'pending'
    });

    await booking.save();

    // 3) If Stripe configured -> create session
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: { name: `Mess Token - ${mealType} (${date})` },
              unit_amount: Math.round(amount * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        metadata: { bookingId: booking._id.toString() }
      });

      return res.json({
        bookingId: booking._id,
        checkoutUrl: session.url
      });
    }

    // 4) No Stripe: return booking info
    return res.json({
      bookingId: booking._id,
      message: 'Booking created with status pending (payment not configured)'
    });

  } catch (err) {
    // Detailed error logging for debugging
    console.error('Booking creation failed:', err);
    // If Mongo validation or duplicate key error, surface it
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'ValidationError', details: err.message });
    }
    if (err.code && err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate key error', details: err.keyValue });
    }
    // Fallback
    return res.status(500).json({ error: 'Server error creating booking', details: err.message });
  }
});

// Get all bookings for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email studentId');
    
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
});

// Get single booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(id).populate('user', 'name email studentId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Users can only view their own bookings (unless admin)
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking });
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Failed to fetch booking', details: err.message });
  }
});

// Cancel a booking
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Users can only cancel their own bookings
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can't cancel paid bookings (or implement refund logic here)
    if (booking.status === 'paid') {
      return res.status(400).json({ error: 'Cannot cancel paid bookings. Please contact admin.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking', details: err.message });
  }
});

module.exports = router;

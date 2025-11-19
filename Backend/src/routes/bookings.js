// backend/src/routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

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

router.post('/', async (req, res) => {
  try {
    const { userId, date, mealType, persons, amount } = req.body;

    // 1) Basic validation
    if (!userId || !date || !mealType || !persons || !amount) {
      return res.status(400).json({ error: 'Missing required fields: userId, date, mealType, persons, amount' });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
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

module.exports = router;

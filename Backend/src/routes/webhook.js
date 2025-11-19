const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/', express.raw({type:'application/json'}), async (req,res)=>{
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch(err){
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if(event.type === 'checkout.session.completed'){
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;
    const booking = await Booking.findById(bookingId);
    if(booking){
      booking.status = 'paid';
      // generate ticketId, QR, PDF here or call a service
      booking.ticketId = `MTBS-${Date.now().toString().slice(-6)}`;
      await booking.save();
      // optionally trigger PDF/QR generation & email here
    }
  }
  res.json({received:true});
});

module.exports = router;

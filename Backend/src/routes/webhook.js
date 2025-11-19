const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { generateTicketId, generateTicketPDF } = require('../utils/ticketGenerator');
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
    const booking = await Booking.findById(bookingId).populate('user', 'name email studentId');
    if(booking){
      booking.status = 'paid';
      
      // Generate ticket ID
      booking.ticketId = generateTicketId();
      
      try {
        // Generate PDF ticket with QR code
        const pdfPath = await generateTicketPDF(booking);
        booking.pdfPath = pdfPath;
        
        console.log(`Ticket generated for booking ${bookingId}: ${booking.ticketId}`);
        
        // TODO: Send email with PDF attachment here
        // await sendTicketEmail(booking.user.email, pdfPath);
        
      } catch (error) {
        console.error('Error generating ticket:', error);
        // Continue saving booking even if ticket generation fails
      }
      
      await booking.save();
    }
  }
  res.json({received:true});
});

module.exports = router;

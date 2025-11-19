const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date: String,
  mealType: String,
  persons: Number,
  amount: Number,
  status: {type:String, default:'pending'}, // pending | paid | cancelled
  ticketId: String,
  pdfPath: String,
  createdAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model('Booking', BookingSchema);

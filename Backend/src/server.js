require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Webhook route BEFORE express.json() middleware
app.use('/api/webhook', require('./routes/webhook'));

app.use(express.json());

// Serve static files (tickets)
app.use('/tickets', express.static(path.join(__dirname, '../tickets')));

// 1) MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB error:", err));

// 2) Routes use
app.get('/', (req, res) => {
  res.send("MTBS backend running");
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
// Webhook already mounted before JSON middleware

// 3) Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

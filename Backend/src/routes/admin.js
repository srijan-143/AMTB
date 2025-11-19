const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Get all bookings (admin only)
router.get('/bookings', async (req, res) => {
  try {
    const { status, startDate, endDate, mealType } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (mealType) filter.mealType = mealType;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email studentId');
    
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    console.error('Admin - Error fetching all bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
});

// Get booking statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const paidBookings = await Booking.countDocuments({ status: 'paid' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Bookings by meal type
    const mealTypeStats = await Booking.aggregate([
      { $group: { _id: '$mealType', count: { $sum: 1 } } }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email studentId');

    res.json({
      statistics: {
        totalBookings,
        paidBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        mealTypeStats
      },
      recentBookings
    });
  } catch (err) {
    console.error('Admin - Error fetching statistics:', err);
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    
    res.json({ users, count: users.length });
  } catch (err) {
    console.error('Admin - Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// Update booking status (admin only)
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: pending, paid, or cancelled' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'name email studentId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking status updated', booking });
  } catch (err) {
    console.error('Admin - Error updating booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status', details: err.message });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be: student or admin' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated', user });
  } catch (err) {
    console.error('Admin - Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role', details: err.message });
  }
});

module.exports = router;

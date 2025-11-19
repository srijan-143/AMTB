import { useState, useEffect } from 'react';
import { adminAPI } from '../api/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', mealType: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        adminAPI.getStatistics(),
        adminAPI.getAllBookings(filter)
      ]);
      setStats(statsRes.data.statistics);
      setBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      alert('Booking status updated');
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Paid Bookings</h3>
          <p className="stat-number">{stats.paidBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pendingBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">₹{stats.totalRevenue}</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bookings-section">
        <h2>All Bookings</h2>
        
        <div className="filters">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filter.mealType}
            onChange={(e) => setFilter({ ...filter, mealType: e.target.value })}
          >
            <option value="">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
          
          <button onClick={fetchData} className="btn-filter">Apply Filters</button>
        </div>

        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Meal Type</th>
                <th>Persons</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Ticket ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>
                    {booking.user?.name}<br />
                    <small>{booking.user?.studentId}</small>
                  </td>
                  <td>{booking.mealType}</td>
                  <td>{booking.persons}</td>
                  <td>₹{booking.amount}</td>
                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>{booking.ticketId || '-'}</td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

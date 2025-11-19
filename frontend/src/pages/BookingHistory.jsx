import { useState, useEffect } from 'react';
import { bookingsAPI } from '../api/api';
import './BookingHistory.css';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data.bookings);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      alert('Booking cancelled successfully');
      fetchBookings(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="history-container">
      <h2>My Bookings</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found. Book your first meal!</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-item">
              <div className="booking-header">
                <h3>{booking.mealType.charAt(0).toUpperCase() + booking.mealType.slice(1)}</h3>
                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="booking-details">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Persons:</strong> {booking.persons}</p>
                <p><strong>Amount:</strong> ₹{booking.amount}</p>
                {booking.ticketId && (
                  <p><strong>Ticket ID:</strong> {booking.ticketId}</p>
                )}
                <p><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
              </div>

              {booking.status === 'pending' && (
                <button 
                  onClick={() => handleCancel(booking._id)}
                  className="btn-cancel"
                >
                  Cancel Booking
                </button>
              )}

              {booking.status === 'paid' && booking.pdfPath && (
                <a 
                  href={booking.pdfPath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-download"
                >
                  Download Ticket
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

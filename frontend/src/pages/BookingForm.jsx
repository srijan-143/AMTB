import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api/api';
import './BookingForm.css';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    date: '',
    mealType: 'breakfast',
    persons: 1,
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Meal pricing (in rupees)
  const mealPrices = {
    breakfast: 50,
    lunch: 80,
    dinner: 80
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: name === 'persons' ? parseInt(value) : value
    };

    // Recalculate amount
    if (name === 'persons' || name === 'mealType') {
      const persons = name === 'persons' ? parseInt(value) : formData.persons;
      const mealType = name === 'mealType' ? value : formData.mealType;
      updatedData.amount = mealPrices[mealType] * persons;
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Cannot book for past dates');
      return;
    }

    if (formData.persons < 1 || formData.persons > 10) {
      setError('Number of persons must be between 1 and 10');
      return;
    }

    setLoading(true);

    try {
      const response = await bookingsAPI.create(formData);
      
      if (response.data.checkoutUrl) {
        // Redirect to Stripe payment
        window.location.href = response.data.checkoutUrl;
      } else {
        // No payment configured, just show success
        alert('Booking created successfully!');
        navigate('/bookings');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Calculate amount on mount
  useState(() => {
    setFormData(prev => ({
      ...prev,
      amount: mealPrices[prev.mealType] * prev.persons
    }));
  }, []);

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h2>Book Your Meal</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Meal Type</label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleChange}
              required
            >
              <option value="breakfast">Breakfast (₹{mealPrices.breakfast})</option>
              <option value="lunch">Lunch (₹{mealPrices.lunch})</option>
              <option value="dinner">Dinner (₹{mealPrices.dinner})</option>
            </select>
          </div>

          <div className="form-group">
            <label>Number of Persons</label>
            <input
              type="number"
              name="persons"
              value={formData.persons}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
            <small>Maximum 10 persons per booking</small>
          </div>

          <div className="amount-display">
            <h3>Total Amount: ₹{formData.amount}</h3>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

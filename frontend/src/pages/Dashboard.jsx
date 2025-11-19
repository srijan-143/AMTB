import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Dashboard.css';

const weeklyMenu = [
  {
    day: 'Monday',
    breakfast: 'Poha + Masala chai',
    lunch: 'Rajma-chawal + cucumber salad',
    dinner: 'Roti + Aloo gobhi + curd'
  },
  {
    day: 'Tuesday',
    breakfast: 'Besan chilla + green chutney',
    lunch: 'Sambar + rice + cabbage poriyal',
    dinner: 'Roti + Paneer butter masala'
  },
  {
    day: 'Wednesday',
    breakfast: 'Upma + coconut chutney',
    lunch: 'Chole-bhature or chole + rice if you want it lighter',
    dinner: 'Jeera rice + dal tadka + lauki sabzi'
  },
  {
    day: 'Thursday',
    breakfast: 'Aloo paratha + curd',
    lunch: 'Vegetable pulao + boondi raita',
    dinner: 'Roti + Matar paneer'
  },
  {
    day: 'Friday',
    breakfast: 'Idli + sambar + chutney',
    lunch: 'Kadhi-khichdi',
    dinner: 'Roti + Bhindi fry + moong dal'
  },
  {
    day: 'Saturday',
    breakfast: 'Vegetable omelette (or besan omelette) + toast',
    lunch: 'Fish curry + rice (swap with veg curry if needed)',
    dinner: 'Roti + Chana masala'
  },
  {
    day: 'Sunday',
    breakfast: 'Dosa + sambar',
    lunch: 'Veg biryani + raita',
    dinner: 'Roti + Mixed veg curry + dal'
  }
];

export default function Dashboard() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  
  // Get current day (0 = Sunday, 1 = Monday, etc.)
  const currentDayIndex = new Date().getDay();
  // Convert to our menu index (0 = Monday)
  const menuIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  const todayMenu = weeklyMenu[menuIndex];

  const handleMealClick = (mealType) => {
    setSelectedMeal(mealType);
  };

  const closeMealPopup = () => {
    setSelectedMeal(null);
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome to Mess Token Booking System</h1>
        <p>Book your meals quickly and conveniently</p>
        
        {/* Today's Menu Title */}
        <h2 className="menu-title">Today's Menu - {todayMenu.day}</h2>
        
        {/* Meal Timings as horizontal strip */}
        <div className="meal-timings-strip">
          <div className="timing-item" onClick={() => handleMealClick('breakfast')}>
            <span className="timing-icon">🌅</span>
            <div className="timing-content">
              <h4>Breakfast</h4>
              <p>7:00 AM - 9:00 AM</p>
            </div>
          </div>
          <div className="timing-item" onClick={() => handleMealClick('lunch')}>
            <span className="timing-icon">☀️</span>
            <div className="timing-content">
              <h4>Lunch</h4>
              <p>12:00 PM - 2:00 PM</p>
            </div>
          </div>
          <div className="timing-item" onClick={() => handleMealClick('dinner')}>
            <span className="timing-icon">🌙</span>
            <div className="timing-content">
              <h4>Dinner</h4>
              <p>7:00 PM - 9:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Details Popup */}
      {selectedMeal && (
        <div className="meal-popup-overlay" onClick={closeMealPopup}>
          <div className="meal-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={closeMealPopup}>×</button>
            <div className="meal-popup-content">
              <div className="meal-icon-large">
                {selectedMeal === 'breakfast' && '🌅'}
                {selectedMeal === 'lunch' && '☀️'}
                {selectedMeal === 'dinner' && '🌙'}
              </div>
              <h3>{selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}</h3>
              <p className="meal-day">{todayMenu.day}</p>
              <div className="meal-items">
                {todayMenu[selectedMeal]}
              </div>
            </div>
          </div>
        </div>
      )}
      

      <div className="quick-actions">
        <Link to="/book" className="action-card">
          <div className="card-icon">🍽️</div>
          <h3>Book a Meal</h3>
          <p>Reserve your meal in advance</p>
        </Link>

        <Link to="/bookings" className="action-card">
          <div className="card-icon">📋</div>
          <h3>My Bookings</h3>
          <p>View your booking history</p>
        </Link>
      </div>

      <div className="info-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Select Date & Meal</h4>
            <p>Choose your preferred date and meal type</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Make Payment</h4>
            <p>Complete the secure online payment</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Get Your Ticket</h4>
            <p>Receive your e-ticket with QR code</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Enjoy Your Meal</h4>
            <p>Show ticket at mess counter</p>
          </div>
        </div>
      </div>
    </div>
  );
}

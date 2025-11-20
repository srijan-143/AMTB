import React, { useState, useRef, useEffect } from 'react';

const ModernDatePicker = ({ value, onChange, placeholder = "Select date", minDate = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // Next month's leading days
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const selectDate = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date) => {
    if (!minDate) return false;
    return date < minDate;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!value) return false;
    return date.toDateString() === value.toDateString();
  };

  return (
    <div className="modern-date-picker" ref={pickerRef}>
      <div 
        className="date-picker-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <span className="date-picker-value">{formatDate(value)}</span>
        ) : (
          <span className="date-picker-placeholder">{placeholder}</span>
        )}
        <span className="date-picker-icon">📅</span>
      </div>

      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="date-picker-header">
            <button 
              className="date-picker-nav-btn"
              onClick={() => navigateMonth(-1)}
            >
              ‹
            </button>
            <div className="date-picker-month-year">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button 
              className="date-picker-nav-btn"
              onClick={() => navigateMonth(1)}
            >
              ›
            </button>
          </div>

          <div className="date-picker-calendar">
            <div className="date-picker-weekdays">
              {weekdays.map(day => (
                <div key={day} className="date-picker-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="date-picker-days">
              {getDaysInMonth(currentMonth).map((dayObj, index) => (
                <button
                  key={index}
                  className={`date-picker-day ${
                    !dayObj.isCurrentMonth ? 'other-month' : ''
                  } ${
                    isSelected(dayObj.date) ? 'selected' : ''
                  } ${
                    isToday(dayObj.date) ? 'today' : ''
                  } ${
                    isDateDisabled(dayObj.date) ? 'disabled' : ''
                  }`}
                  onClick={() => !isDateDisabled(dayObj.date) && selectDate(dayObj.date)}
                  disabled={isDateDisabled(dayObj.date)}
                >
                  {dayObj.date.getDate()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDatePicker;
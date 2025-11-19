# Mess Token Booking System (MTBS)

A comprehensive web application for managing mess meal bookings in educational institutions.

## Features

### Student Features
- **User Authentication**: Secure registration and login with JWT
- **Meal Booking**: Book breakfast, lunch, or dinner in advance
- **Payment Integration**: Stripe payment gateway integration
- **E-Tickets**: Automatic generation of tickets with QR codes
- **Booking History**: View and manage all bookings
- **PDF Downloads**: Download meal tickets as PDF

### Admin Features
- **Dashboard**: Overview of all bookings and statistics
- **Booking Management**: View and update booking status
- **User Management**: Manage student accounts
- **Revenue Tracking**: Monitor total revenue and meal-wise statistics
- **Filter & Search**: Filter bookings by status, date, and meal type

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Stripe for payments
- PDFKit for PDF generation
- QRCode for QR code generation

### Frontend
- React 19
- React Router for navigation
- Axios for API calls
- CSS3 for styling
- Vite as build tool

## Project Structure

```
AMTB/
├── Backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Entry point
│   ├── tickets/             # Generated tickets (auto-created)
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/            # API integration
    │   ├── components/     # React components
    │   ├── context/        # Context providers
    │   ├── pages/          # Page components
    │   └── App.jsx         # Main app component
    ├── .env.example        # Environment variables template
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account (optional, for payments)

### Backend Setup

1. Navigate to Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a strong random string
   - (Optional) Add Stripe keys for payment integration

5. Start the server:
   ```bash
   npm run dev      # Development mode with nodemon
   # OR
   npm start        # Production mode
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with backend URL (default: `http://localhost:5000/api`)

5. Start development server:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Bookings (Protected)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all user bookings
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Admin (Protected, Admin Only)
- `GET /api/admin/bookings` - Get all bookings with filters
- `GET /api/admin/statistics` - Get booking statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/bookings/:id/status` - Update booking status
- `PATCH /api/admin/users/:id/role` - Update user role

### Webhooks
- `POST /api/webhook` - Stripe webhook for payment confirmation

## Default User Roles

- **student**: Default role for all registered users
- **admin**: Can be set manually in database or via admin panel

## Meal Pricing

- Breakfast: ₹50 per person
- Lunch: ₹80 per person
- Dinner: ₹80 per person

## Meal Timings

- Breakfast: 7:00 AM - 9:00 AM
- Lunch: 12:00 PM - 2:00 PM
- Dinner: 7:00 PM - 9:00 PM

## Development Notes

- Tickets are stored in `Backend/tickets/` directory
- QR codes contain ticket ID and booking ID for verification
- PDF tickets include student details, booking info, and QR code
- Webhook URL needs to be configured in Stripe dashboard for production

## Future Enhancements

- Email notifications with ticket attachments
- SMS notifications
- Mobile app
- Menu display for each meal
- Feedback and rating system
- Multi-language support
- Analytics dashboard
- Automated refund processing

## License

MIT License

## Contact

For issues or questions, please contact the development team.

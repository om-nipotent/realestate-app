# PropEase — Full-Stack Real Estate Management System

A production-ready Real Estate Buyer–Seller Management Platform with property listings, identity verification, visit scheduling, AI price predictions, and admin moderation. Built to be India's Most Trusted Property Platform with zero brokerage fees.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Maps | Leaflet.js (OpenStreetMap) |
| Real-time | Socket.io |
| File Storage | Multer (local) + Cloudinary (cloud) |
| Email | Nodemailer (SMTP) |

---

## Project Structure

```
propease-project/
├── backend/                    # Node.js + Express API
│   ├── config/                 # DB, Cloudinary, constants
│   ├── controllers/            # Route handler logic
│   ├── middleware/             # Auth, roleCheck, upload, rateLimit, errors
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/               # Business logic (email, priceEngine, recommendations)
│   ├── socket/                 # Socket.io real-time handlers
│   ├── utils/                  # Helpers, validators, API response utils
│   ├── uploads/                # Local file uploads (git-ignored)
│   ├── .env.example            # Environment variable template
│   └── server.js               # Entry point
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── api/                # Axios API call modules
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Navbar, Footer, Modal, Loader, ProtectedRoute
│   │   │   ├── property/       # PropertyCard, Filters, Map, Images, PriceSuggestion
│   │   │   └── dashboard/      # SellerStats, InquiryList, VisitCalendar
│   │   ├── context/            # React Context (Auth, Property)
│   │   ├── hooks/              # Custom hooks (useAuth, useSocket)
│   │   ├── pages/              # Page components
│   │   │   ├── buyer/          # BuyerDashboard, BuyerVerification
│   │   │   ├── seller/         # SellerDashboard, CreateProperty, EditProperty
│   │   │   └── admin/          # AdminDashboard, AdminVerifications, AdminProperties
│   │   └── utils/              # Formatters, validators
│   └── index.html
│
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, SMTP credentials, Cloudinary keys
```

### 3. Start Development

```bash
# Terminal 1 — Start backend
cd backend
npm run dev

# Terminal 2 — Start frontend
cd frontend
npm run dev
```

Backend runs on: http://localhost:5000
Frontend runs on: http://localhost:5173

---

## Core Modules

### Authentication & Security
- JWT-based authentication with secure httpOnly cookies
- bcrypt password hashing (10 rounds)
- Rate limiting on auth endpoints (10 req/15 min)
- Helmet.js for security headers
- Input validation with express-validator
- XSS protection and MongoDB injection prevention

### User Roles & Permissions

| Feature | Buyer | Seller | Admin |
|---------|-------|--------|-------|
| Browse properties | ✅ | ✅ | ✅ |
| Send inquiries | ✅ (verified) | — | — |
| Schedule visits | ✅ (verified) | — | — |
| Create listings | — | ✅ (verified) | — |
| Manage own listings | — | ✅ | — |
| Review verifications | — | — | ✅ |
| Moderate properties | — | — | ✅ |
| Platform analytics | — | — | ✅ |

### Identity Verification Workflow
1. User uploads government ID + address proof
2. System validates file type and size
3. Admin reviews documents in Admin Panel
4. Status updated: Pending → Verified or Rejected
5. Email notification sent to user
6. Verified users unlock full platform features

### AI Prediction & Future Price Forecast Engine
- Analyzes active properties utilizing dynamic location-based regression modelling.
- Groups and calculates datasets aggressively by area/locality for highly granular logic.
- Predicts future property valuations for 1, 3, and 5-year intervals with transparent explainability metrics.
- Computes intelligent investment scores, area growth potential, and expected rental yields.

### Map Integration (Leaflet.js)
- OpenStreetMap tiles (no API key required)
- Custom markers for properties
- Click marker to see property popup
- Nearby facilities overlay (schools, hospitals, transport)
- Coordinate picking when creating listings (click on map)

---

## API Reference

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/forgot-password
PUT    /api/v1/auth/reset-password/:token
PUT    /api/v1/auth/change-password
```

### Properties
```
GET    /api/v1/properties              # Browse with filters
GET    /api/v1/properties/featured     # Featured listings
GET    /api/v1/properties/nearby       # Near coordinates
GET    /api/v1/properties/:id          # Property detail
POST   /api/v1/properties             # Create (seller, verified)
PUT    /api/v1/properties/:id         # Update (seller, own)
DELETE /api/v1/properties/:id         # Delete (seller, own)
GET    /api/v1/properties/seller/listings  # Seller's own
PUT    /api/v1/properties/:id/featured    # Toggle (admin)
```

### Verifications
```
POST   /api/v1/verifications/submit      # Submit documents
GET    /api/v1/verifications/my-status   # Own status
GET    /api/v1/verifications             # All (admin)
PUT    /api/v1/verifications/:id/review  # Approve/reject (admin)
```

### Inquiries
```
POST   /api/v1/inquiries              # Send inquiry (verified buyer)
GET    /api/v1/inquiries/buyer        # Buyer's inquiries
GET    /api/v1/inquiries/seller       # Seller's received inquiries
PUT    /api/v1/inquiries/:id/reply    # Reply (seller)
PUT    /api/v1/inquiries/:id/read     # Mark read (seller)
```

### Visits
```
POST   /api/v1/visits                 # Request visit (verified buyer)
GET    /api/v1/visits/buyer           # Buyer's visits
GET    /api/v1/visits/seller          # Seller's visit requests
PUT    /api/v1/visits/:id/respond     # Approve/reject/suggest (seller)
PUT    /api/v1/visits/:id/cancel      # Cancel (buyer)
PUT    /api/v1/visits/:id/complete    # Mark completed (seller)
```

### Analytics
```
GET    /api/v1/analytics/seller           # Seller dashboard analytics
POST   /api/v1/analytics/price-suggestion # Price estimation
GET    /api/v1/analytics/trending-areas   # Trending cities
GET    /api/v1/analytics/popular-properties
GET    /api/v1/analytics/market-stats
```

### Admin
```
GET    /api/v1/admin/dashboard        # Stats overview
GET    /api/v1/admin/users            # All users
PUT    /api/v1/admin/users/:id/status # Activate/deactivate
GET    /api/v1/admin/properties       # All properties
PUT    /api/v1/admin/properties/:id/status
PUT    /api/v1/admin/properties/:id/featured
GET    /api/v1/admin/fraud-alerts
GET    /api/v1/admin/activity
```

---

## Database Schema Overview

### User
```
name, email (unique), phone, password (hashed), role, avatar,
verificationStatus (pending|verified|rejected), isActive,
searchHistory[], viewedProperties[], lastLogin, timestamps
```

### Property
```
title, description, price, pricePerSqft, area, propertyType,
status (pending|active|sold|inactive), bedrooms, bathrooms,
furnishing, amenities[], images[], seller (ref),
location: { address, city, state, country, pincode, coordinates (GeoJSON) },
views, featured, timestamps
```

### Verification
```
user (ref), documentType, documents[], status, adminNotes,
reviewedBy (ref), reviewedAt, timestamps
```

### Inquiry
```
property (ref), buyer (ref), seller (ref), message, contactPhone,
preferredVisitDate, status, reply, repliedAt, timestamps
```

### Visit
```
property (ref), buyer (ref), seller (ref), requestedDate, requestedTime,
status, sellerNotes, buyerNotes, confirmedDate, confirmedTime, timestamps
```

### Notification
```
user (ref), title, message, type, relatedId, isRead, timestamps
```

---

## Security Checklist

- [x] Passwords hashed with bcrypt (10 rounds)
- [x] JWT stored in httpOnly cookies
- [x] Rate limiting on all endpoints
- [x] Helmet.js security headers
- [x] CORS configured for allowed origins
- [x] Input validation on all routes
- [x] File type validation on uploads
- [x] File size limits (5MB)
- [x] MongoDB injection prevention (express-mongo-sanitize)
- [x] XSS protection (xss-clean)
- [x] Role-based access control on all protected routes
- [x] Ownership verification before property edits/deletes

---

## Production Deployment Notes

1. **Backend Deploy (Render)**: A `render.yaml` blueprint is already included for seamless, 1-click deployment.
2. **Frontend Deploy (Vercel)**: A `vercel.json` configuration is included to handle fallback routing for React Router.
3. Use MongoDB Atlas for database.
4. Use Cloudinary for image/document storage.
5. Set strong `JWT_SECRET` (32+ random characters).
6. Configure real SMTP credentials (SendGrid, AWS SES, etc.).
7. Set `CLIENT_URL` to your frontend domain (e.g., your Vercel URL).

---

## License

MIT License — Built for production use.

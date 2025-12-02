# GoPal — Travel Buddy & Meetup Platform

**Travel Buddy & Meetup Platform** is a comprehensive subscription-based social travel application designed to connect travelers worldwide. It fosters meaningful connections by helping users find compatible companions for upcoming trips. The platform transforms solo journeys into shared adventures by allowing users to **create travel plans**, **discover matches**, **send trip requests**, and **manage itineraries**.

With **role-based access control**, **secure authentication**, and **premium subscription features**, it serves as a bridge between social networking and travel planning, empowering users to explore the world together.

---

## Live Link

```
https://go-pal-server.vercel.app/
```

## Features

- **User Authentication & Roles**: Secure Login/Register with JWT (Traveler & Admin roles).
- **Profile Management**: Detailed traveler profiles with interests, bio, and image upload.
- **Travel Plan Management**: Create, update, and manage detailed itineraries with budgets and dates.
- **Smart Matching System**: Find travel buddies based on destination, dates, and interests.
- **Trip Request System**: Users can request to join trips, and hosts can accept or reject requests.
- **Review & Rating System**: Post-trip reviews to build community trust.
- **Premium Subscriptions**: Integration with Stripe for premium features and verified badges.
- **Admin Dashboard**: Comprehensive management of users, travel plans, and platform content.
- **Responsive Design**: Optimized for seamless usage across devices.

## Technologies Used

- **Node.js**
- **Express.js**
- **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL**
- **Zod** (Validation)
- **JWT** (Authentication)
- **Bcrypt** (Security)
- **Multer** (File Upload)
- **Stripe** (Payment Gateway)

## Installation & Setup

#### Follow these steps to set up the project locally.

```
git clone https://github.com/MukitHossen7/GoPal-Server.git

```

```
cd GoPal-Server
```

```
npm install
```

```
npm run dev
```

```
Make sure you have a postgressql Database Url connection string set in your `.env` file:
```

```
DATABASE_URL="postgresql://user:password@localhost:5432/travel_db"
PORT=3000
NODE_ENV="development"
JWT_SECRET="your_jwt_secret"
STRIPE_SECRET_KEY="your_stripe_secret_key"
```

## Project Structure

```base
src/
 ├─ config/              # Configuration (Multer, etc.)
 ├─ middlewares/         # Auth, Validation, Error Handling
 ├─ modules/
 │   ├─ auth/            # Authentication Logic
 │   ├─ users/           # User Profile & Management
 │   ├─ travelPlans/     # Travel Itineraries & Matching
 │   ├─ tripRequest/     # Trip Joining Requests
 │   ├─ reviews/         # Rating & Review System
 │   ├─ payments/        # Stripe Subscription Logic
 ├─ routes/
 │   └─ index.ts         # Main Route Entry Point
 ├─ utils/               # Utility functions
 ├─ app.ts               # Express App Setup
 └─ server.ts            # Server Entry Point
```

## API Endpoints

### Auth Endpoints

```
POST	/api/auth/login	User login
GET	   /api/auth/me	Get logged-in user info (via Auth module)
POST	/api/auth/refresh-token	Generate new access token
POST	/api/auth/change-password	Change password (Admin only)
POST	/api/auth/forgot-password	Initiate password reset
POST	/api/auth/reset-password	Reset password
```

### User Endpoints

```
POST	 /api/users/register	Register a new user
GET	   /api/users/	Get all travelers
GET	   /api/users/me	Get my profile details
PATCH	 /api/users/update-my-profile	Update profile (with image upload)
GET	   /api/users/matches	Get matched travel buddies
```

### Travel Plans Endpoints

```
POST	/api/travel-plans/	Create a new travel plan
GET	  /api/travel-plans/	Get all travel plans
GET	  /api/travel-plans/matches	Find matching travel plans
GET	  /api/travel-plans/:id	Get single travel plan details
PATCH	/api/travel-plans/:id	Update travel plan
DELETE	/api/travel-plans/:id	Delete travel plan
```

### Trip Request Endpoints

```
POST	/api/trip-requests/request	Send a request to join a trip
GET	/api/trip-requests/incoming	Get incoming requests for my trips
PATCH	/api/trip-requests/respond	Accept or Reject a trip request
```

### Review Endpoints

```
POST	/api/reviews/	Add a review for a user/trip
GET	 /api/reviews/	Get all reviews (Admin optional)
GET	 /api/reviews/:planId	Get reviews for a specific plan
PATCH	/api/reviews/:reviewId	Update a review
DELETE	/api/reviews/:reviewId	Delete a review
```

### Payment Endpoints

```
POST	/api/payments/subscribe	Create subscription payment session
```

## Dependencies

- "bcryptjs": "^3.0.3",
- "cookie-parser": "^1.4.7",
- "cors": "^2.8.5",
- "express": "^5.1.0",
- "http-status": "^2.1.0",
- "jsonwebtoken": "^9.0.2",
- "multer": "^2.0.2",
- "multer-storage-cloudinary": "^4.0.0",
- "stripe": "^20.0.0",
- "ts-node-dev": "^2.0.0",
- "zod": "^4.1.12"

## DevDependencies

- "@prisma/client": "^6.19.0",
- "@types/cookie-parser": "^1.4.10",
- "@types/cors": "^2.8.19",
- "@types/express": "^5.0.5",
- "@types/jsonwebtoken": "^9.0.10",
- "@types/multer": "^2.0.0",
- "@types/node": "^24.10.1",
- "prisma": "^6.19.0",
- "tsx": "^4.20.6",
- "typescript": "^5.9.3"

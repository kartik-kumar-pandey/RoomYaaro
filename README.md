# Rent & Flatmate Finder

AI-powered rental platform that matches tenants with room listings using compatibility scoring, real-time chat, and interest management.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Node.js, Express.js, PostgreSQL, Prisma ORM, JWT, Socket.IO, Nodemailer |
| **Frontend** | React, Vite, Tailwind CSS, React Router, Axios, Context API, Socket.IO Client |
| **AI** | Google Gemini API (with rule-based fallback) |
| **Deployment** | Vercel (frontend), Render (backend), Neon (PostgreSQL), Cloudinary (images) |

## Features

- Role-based authentication (Owner, Tenant, Admin)
- Room listing CRUD with photo upload
- Tenant profile management
- Search & filters (location, rent, room type, furnishing)
- AI compatibility scoring with explanation (Gemini + rule engine fallback)
- Persistent compatibility score storage
- Ranked listing recommendations
- Interest request workflow (Pending → Accepted/Rejected)
- Email notifications (high match, accepted, rejected)
- Real-time chat via Socket.IO (accepted requests only)
- Admin dashboard with user/listing management

## Project Structure

```
rent project/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── prompts/
│   │   └── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── layouts/
        ├── contexts/
        └── services/
```

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, etc.
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `GEMINI_API_KEY` | Google Gemini API key |
| `SMTP_*` | Nodemailer SMTP credentials |
| `CLOUDINARY_*` | Cloudinary image upload credentials |
| `CLIENT_URL` | Frontend URL for CORS & email links |

### Frontend (.env)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |

## Default Admin

After seeding:

- **Email:** admin@rentflatmate.com
- **Password:** Admin@123456

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (Owner/Tenant) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Search listings (public) |
| GET | `/api/listings/:id` | Listing detail |
| POST | `/api/listings` | Create listing (Owner) |
| PUT | `/api/listings/:id` | Update listing (Owner) |
| DELETE | `/api/listings/:id` | Soft delete (Owner) |
| PATCH | `/api/listings/:id/fill` | Mark filled (Owner) |

### Tenant
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenant/profile` | Get profile |
| PUT | `/api/tenant/profile` | Update profile |
| GET | `/api/tenant/dashboard` | Dashboard data |
| GET | `/api/tenant/recommendations` | AI recommendations |

### Compatibility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/compatibility/:listingId` | Get/create score |

### Interest
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interest` | Express interest |
| PUT | `/api/interest/:id/accept` | Accept (Owner) |
| PUT | `/api/interest/:id/reject` | Reject (Owner) |
| GET | `/api/interest/owner` | Owner's interests |
| GET | `/api/interest/tenant` | Tenant's interests |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/rooms` | User's chat rooms |
| GET | `/api/chat/:roomId` | Room messages |

### Email Test
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test-email` | Dispatches mock test emails for High Match, Accepted, and Rejected requests using premium templates |

### Socket.IO Events
- `join-room` / `leave-room`
- `send-message` / `receive-message`
- `typing`

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform stats |
| GET | `/api/admin/users` | List users |
| DELETE | `/api/admin/user/:id` | Delete user |
| PATCH | `/api/admin/user/:id/toggle` | Enable/disable user |
| GET | `/api/admin/listings` | List all listings |
| DELETE | `/api/admin/listing/:id` | Delete listing |

## AI Compatibility Engine

### Primary: Gemini API

Prompts tenant profile + listing details to Gemini and returns `{ score, explanation }`.

### Fallback: Rule Engine

When Gemini fails:

| Factor | Weight |
|--------|--------|
| Budget Match | 60% |
| Location Match | 40% |

Scores are stored in the database and **not recomputed** on subsequent requests.

## Database Schema

Key models: `User`, `TenantProfile`, `RoomListing`, `ListingPhoto`, `CompatibilityScore`, `InterestRequest`, `ChatRoom`, `ChatMessage`, `EmailNotification`, `SavedListing`.

See `backend/prisma/schema.prisma` for the full schema.

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Images | Cloudinary |

Set environment variables on each platform. Run `npx prisma db push` against your production database before deploying the backend.

## License

MIT

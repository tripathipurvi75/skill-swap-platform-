# ⇄ SkillSwap — Exchange Skills, Not Money

A full-stack platform where users swap skills instead of paying for them.  
**"I teach you Python → you teach me Guitar"**

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router v6 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| HTTP Client | Axios |

---

## 📁 Full Folder Structure

```
skill-swap/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── userController.js      # Profile, matching, search, ratings, bookmarks
│   │   ├── swapController.js      # Swap request lifecycle
│   │   └── messageController.js   # Chat persistence
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + adminOnly
│   │   └── errorMiddleware.js     # Global error handler + AppError class
│   ├── models/
│   │   ├── User.js                # Full user schema (auth + profile + ratings)
│   │   ├── SwapRequest.js         # Swap request schema
│   │   └── Message.js             # Chat message schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── userRoutes.js          # /api/users/*
│   │   ├── swapRoutes.js          # /api/swaps/*
│   │   └── messageRoutes.js       # /api/messages/*
│   ├── seed.js                    # Demo data (5 users)
│   ├── server.js                  # Express + Socket.io entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Global auth state + hooks
│   │   │   ├── ThemeContext.jsx   # Dark/light mode
│   │   │   └── SocketContext.jsx  # Socket.io integration
│   │   ├── components/
│   │   │   └── Navbar.jsx         # Navbar + Avatar + Stars + SkillTag + shared components
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Login.jsx          # Phase 2: auth
│   │   │   ├── Register.jsx       # Phase 2: auth
│   │   │   ├── Profile.jsx        # Phase 3: skills + availability editor
│   │   │   ├── Matches.jsx        # Phase 4: smart matching UI
│   │   │   ├── SwapRequestModal.jsx # Phase 5: send request
│   │   │   ├── Swaps.jsx          # Phase 5: manage requests
│   │   │   ├── RatingModal.jsx    # Phase 6: rate users
│   │   │   ├── Search.jsx         # Phase 7: search + filter
│   │   │   ├── Chat.jsx           # Phase 7: real-time chat
│   │   │   └── Admin.jsx          # Phase 7: admin panel
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance with interceptors
│   │   ├── App.jsx                # Routes + providers
│   │   ├── main.jsx               # React entry
│   │   └── index.css              # Full design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally OR MongoDB Atlas URI

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
node seed.js        # Create 5 demo users
npm run dev         # Starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev         # Starts on http://localhost:5173
```

---

## 🔑 Demo Accounts (after running seed.js)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Arjun Sharma | arjun@demo.com | demo123 | **Admin** |
| Priya Patel | priya@demo.com | demo123 | User |
| Rahul Mehta | rahul@demo.com | demo123 | User |
| Sneha Iyer | sneha@demo.com | demo123 | User |
| Vikram Singh | vikram@demo.com | demo123 | User |

> Arjun ↔ Priya are a **perfect match** (Python/React ↔ Guitar/Yoga). Login as both to test the full swap flow.

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/auth/me` | Protected | Get own profile |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PUT | `/api/users/profile` | Protected | Update profile |
| GET | `/api/users/matches` | Protected | Smart matches |
| GET | `/api/users/search` | Protected | Search + filter |
| GET | `/api/users/:id` | Protected | Get user profile |
| POST | `/api/users/:id/rate` | Protected | Rate a user |
| POST | `/api/users/:id/bookmark` | Protected | Toggle bookmark |
| GET | `/api/users` | **Admin** | All users |

### Swaps
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/swaps` | Protected | Send request |
| GET | `/api/swaps` | Protected | My sent + received |
| PUT | `/api/swaps/:id/respond` | Protected | Accept / Reject |
| PUT | `/api/swaps/:id/cancel` | Protected | Cancel (sender) |

### Messages
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/messages` | Protected | All conversations |
| GET | `/api/messages/:userId` | Protected | Chat history |
| POST | `/api/messages/:userId` | Protected | Send (REST fallback) |

---

## 🔐 Phase Breakdown

| Phase | What's Built |
|-------|-------------|
| 1 | Project setup, Express server, MongoDB, folder structure |
| 2 | JWT auth — register, login, protected routes, bcrypt hashing |
| 3 | User profiles — skills offered/wanted, levels, availability grid |
| 4 | Smart matching algorithm — bidirectional skill overlap + scoring |
| 5 | Swap request lifecycle — send, accept, reject, cancel |
| 6 | Rating & review system — 1–5 stars, feedback, average calculation |
| 7 | Advanced — Socket.io chat, search/filter, bookmarks, dark mode, admin panel |
| 8 | Deployment ready (see below) |

---

## 🚀 Phase 8: Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → import in vercel.com
# Set env: VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render
```
1. Push backend/ to GitHub
2. New Web Service on render.com
3. Build command: npm install
4. Start command: node server.js
5. Add environment variables from .env
```

### MongoDB → Atlas
```
1. Create free cluster at mongodb.com/atlas
2. Get connection string
3. Set MONGO_URI in Render environment variables
```

---

## 🧠 Key Concepts to Know for Interviews

### Matching Algorithm
The algorithm at `/api/users/matches` finds bidirectional skill overlap:
- User A offers X → User B wants X ✅
- User B offers Y → User A wants Y ✅
- Score = overlapping skills × weight + availability overlap + rating bonus

### JWT Flow
```
Register/Login → Server signs JWT → Client stores in localStorage
→ Every request sends: Authorization: Bearer <token>
→ authMiddleware verifies signature → attaches req.user
```

### Socket.io Architecture
```
Client connects → emits user:online with userId
Server stores userId → socketId mapping
Message sent → server persists to DB → emits to receiver's socket
```

### MVC Pattern
```
Route → Middleware (auth/role) → Controller (business logic) → Model (DB)
```

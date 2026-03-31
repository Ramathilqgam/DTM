# DTMS – Digital Talent Management System
## Sprint 1: Foundation & Authentication

---

## Project Structure

```
dtms/
├── backend/                   # Python Flask API
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── routes/
│   │   │   └── auth.py
│   │   └── utils/
│   │       └── validators.py
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                  # React + Vite
    ├── src/
    │   ├── api/
    │   │   └── axiosConfig.js
    │   ├── components/layout/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── AuthCallbackPage.jsx
    │   │   └── DashboardPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── .env.example
```

---

## Setup Instructions

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Fill in your values
python run.py
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env            # Fill in your values
npm run dev
```

### 3. MongoDB
- Local: `mongod` (install from mongodb.com)
- Cloud: Create free cluster at cloud.mongodb.com and update `MONGO_URI` in backend `.env`

### 4. Google OAuth
1. Go to console.cloud.google.com
2. Create project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID and Secret into backend `.env`

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login with email + password | No |
| GET | /api/auth/google | Start Google OAuth | No |
| GET | /api/auth/google/callback | Google OAuth callback | No |
| GET | /api/auth/me | Get current user | JWT |
| POST | /api/auth/logout | Logout | JWT |

---

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Axios, React Router
- **Backend**: Python Flask, Flask-JWT-Extended, Flask-PyMongo, Flask-CORS
- **Database**: MongoDB
- **Auth**: JWT tokens + Google OAuth 2.0

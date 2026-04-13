# Mani Advocate - Case Management System

A full-stack **MEAN** (MongoDB · Express · Angular · Node.js) application for managing advocate cases, clients, hearings, and documents.

---

## Project Structure

```
mani-advocate/
├── backend/          # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/       # DB connection, environment config
│   │   ├── models/       # Mongoose schemas (Client, Case, Hearing, User)
│   │   ├── routes/       # Express route definitions
│   │   ├── controllers/  # Business logic for each route
│   │   ├── middleware/    # Auth, error handling, validation
│   │   ├── utils/        # Helper functions
│   │   └── server.ts     # App entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/         # Angular 20 application
│   └── (Angular project created via `ng new`)
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v20+
- npm v10+
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB Atlas account (free tier) or local MongoDB

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mani-advocate?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
```

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1/`

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

The app will be available at `http://localhost:4200/`

---

## API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/v1/auth/register | Register new user |
| POST   | /api/v1/auth/login    | Login user        |
| GET    | /api/v1/auth/me       | Get current user  |

### Clients
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| GET    | /api/v1/clients        | List all clients     |
| POST   | /api/v1/clients        | Create new client    |
| GET    | /api/v1/clients/:id    | Get client details   |
| PUT    | /api/v1/clients/:id    | Update client        |
| DELETE | /api/v1/clients/:id    | Delete client        |

### Cases
| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | /api/v1/cases                 | List all cases       |
| POST   | /api/v1/cases                 | Create new case      |
| GET    | /api/v1/cases/:id             | Get case details     |
| PUT    | /api/v1/cases/:id             | Update case          |
| DELETE | /api/v1/cases/:id             | Delete case          |

### Hearings
| Method | Endpoint                          | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | /api/v1/hearings                  | List all hearings     |
| POST   | /api/v1/hearings                  | Create new hearing    |
| GET    | /api/v1/hearings/:id              | Get hearing details   |
| PUT    | /api/v1/hearings/:id              | Update hearing        |
| DELETE | /api/v1/hearings/:id              | Delete hearing        |
| GET    | /api/v1/hearings/upcoming         | Get upcoming hearings |

### Dashboard
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| GET    | /api/v1/dashboard/stats   | Get dashboard stats |

---

## Tech Stack
- **Frontend:** Angular 20, Angular Material, TypeScript
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (JSON Web Tokens) + bcrypt
- **Deployment:** Vercel

---

## License
ISC

# Finance Data Processing and Access Control Backend

A RESTful backend API for a finance dashboard system with role-based access control, built with Node.js, Express, and MongoDB Atlas.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v4
- **Database:** MongoDB Atlas (Cloud) with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** express-validator
- **Password Hashing:** bcryptjs

## Project Structure
```
finance-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js    # Register & login logic
│   │   ├── userController.js    # User management logic
│   │   ├── recordController.js  # Financial records logic
│   │   └── dashboardController.js # Analytics & summary logic
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   └── roleGuard.js         # Role-based access control
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── FinancialRecord.js   # Financial record schema
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth
│   │   ├── userRoutes.js        # /api/users
│   │   ├── recordRoutes.js      # /api/records
│   │   └── dashboardRoutes.js   # /api/dashboard
│   └── app.js                   # Express app entry point
├── .env
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (free tier works fine) or local MongoDB

### 1. Clone the repository
```bash
git clone https://github.com/abhishekthatoju04/Zorvyn.git
cd Zorvyn
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file in root directory

For **MongoDB Atlas** (recommended):
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finance_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

For **local MongoDB**:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### 4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

---

## Database

This project uses **MongoDB Atlas** — a fully managed cloud database. The connection is established via Mongoose using the `MONGO_URI` environment variable. Atlas provides:
- Free M0 cluster (512MB storage)
- Automatic backups
- Global availability for deployed APIs

---

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View records | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View category totals | ❌ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| View top categories | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login and get JWT token | No |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/users | Get all users | Admin |
| GET | /api/users/me | Get current logged in user | All |
| GET | /api/users/:id | Get user by ID | Admin |
| PATCH | /api/users/:id/role | Update user role | Admin |
| PATCH | /api/users/:id/status | Activate or deactivate user | Admin |

### Financial Records
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/records | Get all records with filters | All |
| GET | /api/records/:id | Get single record | All |
| POST | /api/records | Create new record | Admin |
| PUT | /api/records/:id | Update record | Admin |
| DELETE | /api/records/:id | Soft delete record | Admin |

**Available query filters for GET /api/records:**
- `type` — filter by income or expense
- `category` — filter by category name
- `startDate` — filter from date (ISO format)
- `endDate` — filter to date (ISO format)
- `page` — page number (default: 1)
- `limit` — records per page (default: 10)

**Example:**
```
GET /api/records?type=expense&category=Rent&startDate=2024-01-01&page=1&limit=5
```

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/dashboard/summary | Total income, expenses, net balance | All |
| GET | /api/dashboard/recent | Recent transactions | All |
| GET | /api/dashboard/categories | Category wise totals | Analyst + Admin |
| GET | /api/dashboard/trends | Monthly income vs expense trends | Analyst + Admin |
| GET | /api/dashboard/top-categories | Top spending or earning categories | Analyst + Admin |

**Example requests:**
```
GET /api/dashboard/trends?year=2024
GET /api/dashboard/top-categories?type=expense&limit=5
GET /api/dashboard/recent?limit=10
```

---

## Authentication

All protected routes require a JWT token in the request header:
```
Authorization: Bearer <your_token>
```

Get the token by registering or logging in.

---

## Sample Request & Response

### Register
```json
POST /api/auth/register
{
  "name": "John Admin",
  "email": "john@example.com",
  "password": "123456",
  "role": "admin"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "64abc...",
    "name": "John Admin",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Create Financial Record
```json
POST /api/records
Authorization: Bearer <token>
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2024-01-15",
  "notes": "January salary"
}
```

### Dashboard Summary Response
```json
GET /api/dashboard/summary
{
  "success": true,
  "data": {
    "totalIncome": 15000,
    "totalExpenses": 8000,
    "netBalance": 7000,
    "totalRecords": 10,
    "incomeCount": 4,
    "expenseCount": 6
  }
}
```

---

## Assumptions Made

1. The first admin user is created via the register endpoint by passing `"role": "admin"` in the request body. In production this would be restricted.
2. Deleted records are soft deleted — marked with `isDeleted: true` and hidden from all queries but never permanently removed from the database.
3. JWT tokens expire in 7 days. After expiry the user must login again.
4. Passwords are hashed using bcryptjs with a salt round of 12 before storing in the database.
5. An admin cannot deactivate their own account or change their own role to prevent accidental lockout.

## Tradeoffs Considered

- **MongoDB Atlas over local/SQL:** Chosen for cloud availability, flexible document structure, and ease of setup. Atlas also allows the API to be deployed and accessed from anywhere without managing infrastructure.
- **Soft delete over hard delete:** Preserves data history which is critical for financial records audit trails.
- **JWT over sessions:** Stateless authentication is simpler to implement and scales better for APIs.
- **Manual password hashing in controller:** Done to avoid compatibility issues with Mongoose pre-save hooks in newer bcryptjs versions.
- **No rate limiting:** Would be added in production using `express-rate-limit` to prevent abuse.
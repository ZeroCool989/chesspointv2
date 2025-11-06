# Chesspoint Authentication Backend

Secure, production-ready authentication backend for Chesspoint.io with JWT access tokens and rotating refresh tokens.

## Features

- **Secure Authentication**: bcrypt password hashing (cost 12)
- **JWT Tokens**: Short-lived access tokens (15m) + rotating refresh tokens (7d)
- **HttpOnly Cookies**: Refresh tokens stored in secure, HttpOnly cookies
- **CORS Support**: Configured for frontend with credentials
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Zod schemas for email and password validation
- **Security Headers**: Helmet middleware for enhanced security
- **Case-Insensitive Email**: Unique email constraint with collation
- **Token Rotation**: Refresh tokens rotate on each use
- **MongoDB Atlas**: Cloud database integration

## Tech Stack

- **Node.js** 20+
- **Express** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB object modeling
- **JWT** (jsonwebtoken) - Token generation and verification
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **cookie-parser** - Cookie parsing middleware

## Project Structure

```
auth-backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.ts               # JWT verification middleware
│   │   └── logger.ts              # Request logging
│   ├── models/
│   │   └── User.ts               # User schema
│   ├── routes/
│   │   ├── auth.ts               # Auth routes (register, login, refresh, logout)
│   │   └── user.ts               # User routes (/me)
│   ├── scripts/
│   │   ├── setupDatabase.ts      # Database setup script
│   │   ├── seed.ts               # Seed test users
│   │   └── syncIndexes.ts        # Sync database indexes
│   ├── utils/
│   │   └── jwt.ts                # JWT utility functions
│   ├── validators.ts             # Zod schemas
│   ├── rateLimit.ts              # Rate limiting config
│   └── server.ts                 # Main server file
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd auth-backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chesspoint?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:3000
PORT=4001
NODE_ENV=development
```

**Important**:
- Use strong, random secrets (min 32 characters)
- Never commit `.env` to git
- Change `NODE_ENV=production` in production

### 3. Setup Database Indexes

Run the database setup script to create indexes and validation:

```bash
npm run setup-db
```

This creates:
- Unique case-insensitive index on email
- Index on refreshTokenVersion
- JSON schema validation for the users collection

### 4. Seed Test Users (Optional)

```bash
npm run seed
```

This creates test users for development:
- `admin@chesspoint.io` / `Admin123!`
- `test@chesspoint.io` / `Test123!`
- `demo@chesspoint.io` / `Demo123!`

### 5. Start the Server

**Development** (with hot reload):
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm start
```

Server will start on `http://localhost:4001` (or your configured PORT)

## API Endpoints

### Public Routes

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "JohnDoe"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "JohnDoe",
    "emailVerified": false,
    "roles": ["user"]
  }
}
```

**Sets Cookie:** `refreshToken` (HttpOnly, secure in production)

---

#### POST /auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "JohnDoe",
    "emailVerified": false,
    "roles": ["user"],
    "lastLoginAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Sets Cookie:** `refreshToken` (HttpOnly, secure in production)

---

#### POST /auth/refresh
Exchange refresh token for new access token.

**Requires Cookie:** `refreshToken`

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Sets Cookie:** New rotated `refreshToken`

---

#### POST /auth/logout
Clear refresh token and log out.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Clears Cookie:** `refreshToken`

---

### Protected Routes

#### GET /me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "JohnDoe",
    "emailVerified": false,
    "roles": ["user"],
    "createdAt": "2025-01-15T10:00:00.000Z",
    "lastLoginAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Health Check

#### GET /health
Server health status.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## Quick Test with cURL

### 1. Health Check
```bash
curl http://localhost:4001/health
```

### 2. Register a New User
```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "username": "TestUser"
  }' \
  -c cookies.txt
```

### 3. Login
```bash
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }' \
  -c cookies.txt
```

Save the `accessToken` from the response.

### 4. Access Protected Route
```bash
curl http://localhost:4001/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 5. Refresh Access Token
```bash
curl -X POST http://localhost:4001/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

### 6. Logout
```bash
curl -X POST http://localhost:4001/auth/logout \
  -b cookies.txt
```

## Frontend Integration

### Fetch API Example

```javascript
// Base URL
const API_URL = 'http://localhost:4001';

// Register
async function register(email, password, username) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: sends cookies
    body: JSON.stringify({ email, password, username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  // Store access token in memory (NOT localStorage)
  return data; // { accessToken, user }
}

// Login
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: sends cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data; // { accessToken, user }
}

// Refresh access token
async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Important: sends cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Token refresh failed');
  }

  return data.accessToken;
}

// Get current user
async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user');
  }

  return data.user;
}

// Logout
async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }

  return data;
}
```

## Security Features

1. **Password Security**
   - bcrypt with cost factor 12
   - Minimum 8 characters with mixed case and numbers
   - Never transmitted in responses

2. **Token Security**
   - Short-lived access tokens (15 minutes)
   - Refresh tokens in HttpOnly cookies (7 days)
   - Token rotation on refresh
   - Refresh token hashing in database

3. **Cookie Security**
   - `httpOnly: true` - No JavaScript access
   - `secure: true` - HTTPS only (production)
   - `sameSite: 'strict'` - CSRF protection

4. **Rate Limiting**
   - 10 requests per 15 minutes for /auth/* routes
   - 5 requests per 15 minutes for login/register

5. **Input Validation**
   - Zod schemas for all inputs
   - Email format validation
   - Password complexity requirements

6. **Error Messages**
   - Generic messages to prevent user enumeration
   - "Invalid credentials" for both email and password errors

7. **CORS**
   - Whitelist specific origins
   - Credentials support enabled
   - Preflight request handling

8. **Database Security**
   - Case-insensitive unique email index
   - JSON schema validation
   - Password hash excluded from queries by default

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets (min 32 characters, random)
- [ ] Configure `FRONTEND_ORIGIN` to your production domain
- [ ] Enable HTTPS on your server
- [ ] Use MongoDB Atlas IP whitelist
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Review and adjust rate limits
- [ ] Test CORS configuration
- [ ] Enable database replica set (if needed)
- [ ] Set up CI/CD pipeline

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_ORIGIN` matches your frontend URL exactly
- Check that `credentials: 'include'` is set in frontend requests
- Verify server is running on expected port

### Cookie Not Set
- Check that `sameSite` and `secure` settings match your environment
- In development with HTTP, `secure: false` is set automatically
- Ensure browser allows third-party cookies (if needed)

### Token Expired
- Access tokens expire after 15 minutes (configurable)
- Use `/auth/refresh` to get a new access token
- Implement automatic token refresh in frontend

### Database Connection Failed
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user has proper permissions

## 📄 License

This project is licensed under the **MIT License**.

## 🙏 Acknowledgments & Credits

### Core Dependencies

- **Express** - Fast, unopinionated web framework for Node.js
  - Repository: https://github.com/expressjs/express
  - License: MIT

- **Mongoose** - MongoDB object modeling for Node.js
  - Repository: https://github.com/Automattic/mongoose
  - License: MIT

- **jsonwebtoken** - JSON Web Token implementation
  - Repository: https://github.com/auth0/node-jsonwebtoken
  - License: MIT

- **bcrypt** - Password hashing library
  - Repository: https://github.com/kelektiv/node.bcrypt.js
  - License: MIT

- **Zod** - TypeScript-first schema validation
  - Repository: https://github.com/colinhacks/zod
  - License: MIT

- **Helmet** - Security middleware for Express
  - Repository: https://github.com/helmetjs/helmet
  - License: MIT

- **express-rate-limit** - Rate limiting middleware for Express
  - Repository: https://github.com/express-rate-limit/express-rate-limit
  - License: MIT

- **CORS** - CORS middleware for Express
  - Repository: https://github.com/expressjs/cors
  - License: MIT

- **cookie-parser** - Cookie parsing middleware
  - Repository: https://github.com/expressjs/cookie-parser
  - License: MIT

### Development Tools

- **TypeScript** - Typed superset of JavaScript
  - Repository: https://github.com/microsoft/TypeScript
  - License: Apache-2.0

- **tsx** - TypeScript execution engine
  - Repository: https://github.com/esbuild-kit/tsx
  - License: MIT

- **dotenv** - Environment variable management
  - Repository: https://github.com/motdotla/dotenv
  - License: BSD-2-Clause

---

**Chesspoint Authentication Backend** - Secure authentication for Chesspoint.io 🔐

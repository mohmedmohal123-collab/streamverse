# StreamVerse Auth Server

Authentication server for StreamVerse, migrated from ICP/Motoko to Node.js + Express + TypeScript + Supabase.

## Features Implemented

- ✅ `registerWithCredentials` - Register new user with username/email/password
- ✅ `loginWithCredentials` - Login with username/password (returns JWT token)
- ✅ `getSaltForUser` - Get salt for client-side password hashing
- ✅ `verifyGoogleOAuth` - Verify Google ID token and create/login user
- ✅ `linkGoogleAccount` - Link Google account to existing user

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 3001)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID

### 3. Set Up Supabase Database

1. Create a new Supabase project
2. Run the SQL setup script in Supabase SQL Editor:
   ```bash
   cat supabase/setup-auth.sql
   ```
   Copy the contents and run in your Supabase SQL Editor.

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### POST `/api/auth/register/credentials`
Register a new user with username, email, and client-side password hash+salt.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "passwordHash": "client-side-sha256-hash",
  "salt": "random-salt"
}
```

**Response:**
```json
{
  "__kind__": "ok",
  "ok": "user-uuid"
}
```

#### POST `/api/auth/login/credentials`
Login with username and client-side password hash.

**Request Body:**
```json
{
  "username": "johndoe",
  "passwordHash": "client-side-sha256-hash"
}
```

**Response:**
```json
{
  "__kind__": "ok",
  "ok": {
    "userId": "user-uuid",
    "token": "jwt-token"
  }
}
```

#### GET `/api/auth/salt/:username`
Get the salt for a given username (needed for client-side password hashing).

**Response:**
```json
{
  "__kind__": "ok",
  "ok": "salt-value"
}
```

#### POST `/api/auth/verify-google`
Verify a Google ID token and return/create user.

**Request Body:**
```json
{
  "idToken": "google-id-token"
}
```

**Response:**
```json
{
  "__kind__": "ok",
  "ok": {
    "userId": "user-uuid",
    "token": "jwt-token"
  }
}
```

#### POST `/api/auth/link-google`
Link a Google account to the authenticated user.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "googleSub": "google-subject-id",
  "email": "user@gmail.com"
}
```

**Response:**
```json
{
  "__kind__": "ok"
}
```

#### POST `/api/auth/verify-token`
Verify a JWT token and return user info.

**Request Body:**
```json
{
  "token": "jwt-token"
}
```

**Response:**
```json
{
  "__kind__": "ok",
  "ok": {
    "id": "user-uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "avatarUrl": "",
    "role": "user",
    "language": "en",
    "darkMode": true,
    "createdAt": 1234567890000,
    "isBanned": false
  }
}
```

## Frontend Compatibility

This server maintains API compatibility with the existing Motoko backend:

- Response format matches Motoko's `{ __kind__: 'ok' | 'err', ok?: T, err?: string }` pattern
- User ID format changed from `Principal` to `UUID` (string)
- JWT tokens replace Principal-based authentication
- All auth methods from `auth-api.mo` are implemented

## Database Schema

### Tables

- `users` - User profiles
- `credentials` - Username/password credentials
- `google_oauth_links` - Google OAuth account links

### Admin User

The system seeds an admin user:
- Username: `mostfa`
- Password: `mostfa123`
- Email: `mostfa@streamverse.com`

## Security Notes

- Passwords are hashed client-side (SHA-256) before sending to server
- JWT tokens are signed with a secret key
- Google OAuth tokens are verified using Google's official library
- Row Level Security (RLS) is enabled on Supabase tables
- Service role key is used for admin operations (never exposed to clients)

## Testing

Health check:
```bash
curl http://localhost:3001/health
```

Test registration:
```bash
curl -X POST http://localhost:3001/api/auth/register/credentials \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","passwordHash":"hash","salt":"salt"}'
```

## Next Steps

This is the first phase of the migration. Remaining modules to migrate:
- User management (users-api.mo)
- Video features (videos-api.mo)
- Social features (social-api.mo)
- Subscriptions (subscriptions-api.mo)
- Playlists (playlists-api.mo)
- Downloads (downloads-api.mo)
- Admin features (admin-api.mo)

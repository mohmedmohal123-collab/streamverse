# StreamVerse Migration Plan: ICP/Motoko → Node.js + Express + TypeScript + Supabase

## Executive Summary

This document outlines a phased migration strategy to move StreamVerse from Internet Computer (ICP) with Motoko backend to a traditional Node.js + Express + TypeScript + Supabase stack while preserving frontend compatibility.

**Current Stack**: ICP Canister (Motoko) + React Frontend  
**Target Stack**: Node.js + Express + TypeScript + Supabase + React Frontend  
**Migration Approach**: Incremental, backward-compatible migration with API adapter layer

---

## Architecture Analysis

### Current Backend Structure

```
src/backend/
├── main.mo                 # Main actor with state & mixin composition
├── types/                  # 11 type definition files
│   ├── common.mo          # Common types (UserId, VideoId, Platform, etc.)
│   ├── users.mo           # User types & roles
│   ├── videos.mo          # Video metadata & watch history
│   ├── auth.mo            # Authentication types
│   ├── social.mo          # Social features (posts, comments, reactions)
│   ├── notifications.mo   # Notification types
│   ├── subscriptions.mo   # Stripe subscription types
│   ├── playlists.mo       # Playlist types
│   ├── downloads.mo       # Download tracking types
│   └── providers.mo       # Provider analytics types
├── lib/                    # 6 business logic libraries
│   ├── users.mo           # User utilities
│   ├── auth.mo            # Auth utilities (JWT parsing, credential verification)
│   ├── videos.mo          # Video utilities
│   ├── social.mo          # Social domain logic (762 lines)
│   ├── subscriptions.mo   # Stripe integration (552 lines)
│   └── notifications.mo   # Notification logic
└── mixins/                 # 11 API mixin files
    ├── users-api.mo       # User endpoints
    ├── auth-api.mo        # Auth endpoints (credentials, Google OAuth)
    ├── videos-api.mo      # Video & watch history endpoints
    ├── admin-api.mo       # Admin management (364 lines)
    ├── social-api.mo      # Social features API
    ├── social-admin-api.mo # Content moderation
    ├── notifications-api.mo # Notification endpoints
    ├── subscriptions-api.mo # Stripe webhooks & checkout
    ├── playlists-api.mo   # Playlist management
    ├── downloads-api.mo   # Download tracking
    └── providers-api.mo   # Provider configuration
```

### Current Frontend Structure

```
src/frontend/
├── backend.ts              # Auto-generated ICP bindings (3587 lines)
├── backend.d.ts            # Type definitions
├── lib/
│   ├── backend.ts          # Backend utilities & API key management
│   ├── crypto.ts           # Client-side password hashing
│   ├── downloadService.ts  # Video download logic (643 lines)
│   └── ...
├── hooks/
│   ├── useAuth.ts          # Authentication hook (II + credentials)
│   ├── useSubscription.ts  # Subscription management
│   └── ...
└── pages/                  # React pages
```

### Key Backend Features

1. **Authentication**: Internet Identity + Credential-based + Google OAuth
2. **User Management**: Profiles, roles (user/admin), settings, ban system
3. **Video Features**: Watch history, trending, multi-provider search
4. **Social Features**: Video posts, comments, reactions, follows, notifications
5. **Subscriptions**: Stripe integration, tier system, content gating
6. **Playlists**: CRUD operations
7. **Downloads**: Tracking, daily limits, provider handling
8. **Admin**: User management, API keys, content moderation, analytics

---

## Migration Strategy

### Phase 1: Foundation Setup (Week 1-2)

**Goal**: Set up new Node.js backend with Supabase infrastructure

#### 1.1 Backend Project Setup
- Initialize Node.js project with TypeScript
- Install dependencies: `express, typescript, @types/express, supabase-js, stripe, jsonwebtoken, bcrypt`
- Set up project structure:
  ```
  src/backend-new/
  ├── src/
  │   ├── config/          # Environment configuration
  │   ├── db/              # Supabase client setup
  │   ├── middleware/      # Auth, error handling
  │   ├── routes/          # Express route handlers
  │   ├── services/        # Business logic (migrated from lib/)
  │   ├── types/           # TypeScript types (migrated from types/)
  │   └── utils/           # Utilities (migrated from lib/)
  ├── package.json
  └── tsconfig.json
  ```

#### 1.2 Supabase Database Schema
Create tables matching Motoko types:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  dark_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_banned BOOLEAN DEFAULT false,
  facebook_url TEXT,
  tiktok_url TEXT
);

-- Credentials table
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google OAuth links
CREATE TABLE google_oauth_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  google_sub TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watch history
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'vimeo', 'tiktok', 'kwai', 'dailymotion', 'archive'))
);

-- Video posts
CREATE TABLE video_posts (
  id TEXT PRIMARY KEY,
  uploader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0
);

-- Comments
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  video_id TEXT REFERENCES video_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false
);

-- Reactions
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT REFERENCES video_posts(id) ON DELETE CASCADE,
  reaction TEXT CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Follows
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Notifications
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT CHECK (kind IN ('new_follower', 'video_liked', 'video_commented', 'new_video_from_followed')),
  video_id TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- Subscriptions
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT CHECK (tier IN ('free', 'plus', 'pro')),
  plan_type TEXT CHECK (plan_type IN ('monthly', 'annual')),
  status TEXT CHECK (status IN ('active', 'canceled', 'incomplete', 'past_due')),
  current_period_end TIMESTAMP WITH TIME ZONE
);

-- Premium videos
CREATE TABLE premium_videos (
  video_id TEXT PRIMARY KEY,
  required_tier TEXT CHECK (tier IN ('free', 'plus', 'pro'))
);

-- Playlists
CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  video_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false
);

-- Download records
CREATE TABLE download_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Configuration tables
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
```

#### 1.3 TypeScript Type Migration
Convert Motoko types to TypeScript interfaces:

```typescript
// src/backend-new/src/types/common.ts
export type UserId = string;
export type VideoId = string;
export type Language = 'en' | 'ar';
export type Platform = 'youtube' | 'vimeo' | 'tiktok' | 'kwai' | 'dailymotion' | 'archive';
export type Timestamp = number; // Unix epoch in milliseconds

// src/backend-new/src/types/users.ts
export type UserRole = 'user' | 'admin';

export interface User {
  id: UserId;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  language: Language;
  darkMode: boolean;
  createdAt: Timestamp;
  isBanned: boolean;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}

// ... (migrate all type files from types/)
```

---

### Phase 2: Authentication System (Week 3)

**Goal**: Migrate authentication from Principal-based to JWT-based

#### 2.1 Authentication Architecture
- Replace Internet Identity with JWT tokens
- Keep credential-based auth (username/password)
- Keep Google OAuth integration
- Implement session management

#### 2.2 Implementation Steps

**JWT Authentication Service**:
```typescript
// src/backend-new/src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_EXPIRES_IN = '7d';

  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, this.JWT_SECRET) as { userId: string };
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    // Keep client-side hashing for compatibility
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(salt + password);
    return hash.digest('hex');
  }

  async verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
    const computedHash = await this.hashPassword(password, salt);
    return computedHash === hash;
  }
}
```

**Auth Middleware**:
```typescript
// src/backend-new/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const authService = new AuthService();
    const payload = authService.verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Check if user has admin role
  // ...
};
```

**Auth Routes**:
```typescript
// src/backend-new/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

// Register with credentials
router.post('/register/credentials', async (req, res) => {
  const { username, email, passwordHash, salt } = req.body;
  // Migrate logic from auth-api.mo registerWithCredentials
});

// Login with credentials
router.post('/login/credentials', async (req, res) => {
  const { username, passwordHash } = req.body;
  // Migrate logic from auth-api.mo loginWithCredentials
});

// Google OAuth
router.post('/verify-google', async (req, res) => {
  const { idToken } = req.body;
  // Migrate logic from auth-api.mo verifyGoogleOAuth
});

export default router;
```

#### 2.3 Frontend Compatibility Layer
Create adapter to maintain frontend compatibility:

```typescript
// src/frontend/src/lib/backend-adapter.ts
// New API client that mimics ICP actor interface

class BackendAdapter {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async call(method: string, endpoint: string, data?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      body: data ? JSON.stringify(data) : undefined
    });
    return response.json();
  }

  // User methods (mimic users-api.mo)
  async registerUser(input: RegisterInput): Promise<UserPublic> {
    return this.call('POST', '/api/users/register', input);
  }

  async getUser(userId: string): Promise<UserPublic | null> {
    return this.call('GET', `/api/users/${userId}`);
  }

  async updateProfile(input: UpdateProfileInput): Promise<UserPublic> {
    return this.call('PUT', '/api/users/profile', input);
  }

  // Auth methods (mimic auth-api.mo)
  async registerWithCredentials(username: string, email: string, passwordHash: string, salt: string): Promise<AuthResult> {
    return this.call('POST', '/api/auth/register/credentials', { username, email, passwordHash, salt });
  }

  async loginWithCredentials(username: string, passwordHash: string): Promise<AuthResult> {
    return this.call('POST', '/api/auth/login/credentials', { username, passwordHash });
  }

  // ... implement all other methods
}

export const backendAdapter = new BackendAdapter(process.env.VITE_API_URL || 'http://localhost:3001');
```

---

### Phase 3: Core User & Video Features (Week 4-5)

**Goal**: Migrate user management and video features

#### 3.1 User Management
Migrate from `users-api.mo` and `lib/users.mo`:

```typescript
// src/backend-new/src/routes/users.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

const router = Router();
const userService = new UserService();

router.post('/register', authMiddleware, async (req, res) => {
  const user = await userService.registerUser(req.userId, req.body);
  res.json(user);
});

router.get('/:userId', async (req, res) => {
  const user = await userService.getUser(req.params.userId);
  res.json(user);
});

router.put('/profile', authMiddleware, async (req, res) => {
  const user = await userService.updateProfile(req.userId, req.body);
  res.json(user);
});

router.put('/settings', authMiddleware, async (req, res) => {
  await userService.updateSettings(req.userId, req.body);
  res.json({ success: true });
});

export default router;
```

#### 3.2 Video Features
Migrate from `videos-api.mo` and `lib/videos.mo`:

```typescript
// src/backend-new/src/routes/videos.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { VideoService } from '../services/video.service';

const router = Router();
const videoService = new VideoService();

router.post('/watch-history', authMiddleware, async (req, res) => {
  await videoService.addWatchHistory(req.userId, req.body);
  res.json({ success: true });
});

router.get('/watch-history', authMiddleware, async (req, res) => {
  const history = await videoService.getWatchHistory(req.userId);
  res.json(history);
});

router.delete('/watch-history', authMiddleware, async (req, res) => {
  await videoService.clearWatchHistory(req.userId);
  res.json({ success: true });
});

router.get('/trending', async (req, res) => {
  const trending = await videoService.getTrending();
  res.json(trending);
});

router.get('/search/youtube', authMiddleware, async (req, res) => {
  const { query, maxResults } = req.query;
  const results = await videoService.searchYouTube(query as string, Number(maxResults));
  res.json(results);
});

export default router;
```

---

### Phase 4: Social Features (Week 6-7)

**Goal**: Migrate social features (posts, comments, reactions, follows)

#### 4.1 Social Features Migration
Migrate from `social-api.mo` and `lib/social.mo`:

```typescript
// src/backend-new/src/routes/social.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { SocialService } from '../services/social.service';

const router = Router();
const socialService = new SocialService();

// Video posts
router.post('/posts', authMiddleware, async (req, res) => {
  const post = await socialService.createVideoPost(req.userId, req.body);
  res.json(post);
});

router.get('/posts/:postId', async (req, res) => {
  const post = await socialService.getVideoPost(req.params.postId);
  res.json(post);
});

router.get('/posts', async (req, res) => {
  const { offset, limit } = req.query;
  const posts = await socialService.listVideoPosts(Number(offset), Number(limit));
  res.json(posts);
});

// Comments
router.post('/comments', authMiddleware, async (req, res) => {
  const comment = await socialService.addComment(req.userId, req.body);
  res.json(comment);
});

router.get('/comments/:videoId', async (req, res) => {
  const comments = await socialService.getVideoComments(req.params.videoId);
  res.json(comments);
});

// Reactions
router.post('/reactions', authMiddleware, async (req, res) => {
  await socialService.reactToVideo(req.userId, req.body);
  res.json({ success: true });
});

// Follows
router.post('/follow/:targetId', authMiddleware, async (req, res) => {
  await socialService.followUser(req.userId, req.params.targetId);
  res.json({ success: true });
});

router.delete('/follow/:targetId', authMiddleware, async (req, res) => {
  await socialService.unfollowUser(req.userId, req.params.targetId);
  res.json({ success: true });
});

// Recommendations
router.get('/recommendations', authMiddleware, async (req, res) => {
  const { limit } = req.query;
  const recommendations = await socialService.getRecommendations(req.userId, Number(limit));
  res.json(recommendations);
});

export default router;
```

---

### Phase 5: Subscription System (Week 8)

**Goal**: Migrate Stripe subscription system

#### 5.1 Stripe Integration
Migrate from `subscriptions-api.mo` and `lib/subscriptions.mo`:

```typescript
// src/backend-new/src/routes/subscriptions.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { SubscriptionService } from '../services/subscription.service';

const router = Router();
const subscriptionService = new SubscriptionService();

router.post('/checkout', authMiddleware, async (req, res) => {
  const { tier, planType, successUrl, returnUrl } = req.body;
  const session = await subscriptionService.createCheckoutSession(
    req.userId,
    tier,
    planType,
    successUrl,
    returnUrl
  );
  res.json(session);
});

router.get('/my-subscription', authMiddleware, async (req, res) => {
  const subscription = await subscriptionService.getMySubscription(req.userId);
  res.json(subscription);
});

router.post('/cancel', authMiddleware, async (req, res) => {
  await subscriptionService.cancelSubscription(req.userId);
  res.json({ success: true });
});

router.post('/webhook', async (req, res) => {
  await subscriptionService.handleStripeWebhook(req.body, req.headers['stripe-signature'] as string);
  res.json({ received: true });
});

router.post('/customer-portal', authMiddleware, async (req, res) => {
  const { returnUrl } = req.body;
  const portalUrl = await subscriptionService.createCustomerPortalSession(req.userId, returnUrl);
  res.json(portalUrl);
});

// Content gating
router.get('/can-access/:videoId', authMiddleware, async (req, res) => {
  const canAccess = await subscriptionService.canUserAccessVideo(req.userId, req.params.videoId);
  res.json(canAccess);
});

export default router;
```

---

### Phase 6: Remaining Features (Week 9)

**Goal**: Migrate playlists, downloads, notifications, admin features

#### 6.1 Playlists
```typescript
// src/backend-new/src/routes/playlists.routes.ts
// Migrate from playlists-api.mo
```

#### 6.2 Downloads
```typescript
// src/backend-new/src/routes/downloads.routes.ts
// Migrate from downloads-api.mo
```

#### 6.3 Notifications
```typescript
// src/backend-new/src/routes/notifications.routes.ts
// Migrate from notifications-api.mo
```

#### 6.4 Admin Features
```typescript
// src/backend-new/src/routes/admin.routes.ts
// Migrate from admin-api.mo and social-admin-api.mo
```

---

### Phase 7: Frontend Integration (Week 10)

**Goal**: Update frontend to use new backend while maintaining compatibility

#### 7.1 Frontend Updates

**Update useAuth hook**:
```typescript
// src/frontend/src/hooks/useAuth.ts
// Replace ICP auth with JWT-based auth

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  const loginWithCredentials = async (username: string, password: string) => {
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    
    const result = await backendAdapter.loginWithCredentials(username, passwordHash);
    
    if (result.__kind__ === 'ok') {
      // Generate JWT token on server or use returned token
      const jwtToken = await backendAdapter.getJwtToken(result.ok);
      setToken(jwtToken);
      localStorage.setItem('auth_token', jwtToken);
      setIsAuthenticated(true);
    }
    
    return result;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, token, loginWithCredentials, logout };
}
```

**Update backend.ts adapter**:
- Complete implementation of all backend methods
- Ensure type compatibility with existing frontend code
- Handle error cases consistently

#### 7.2 Configuration
Update environment variables:
```env
# .env
VITE_API_URL=http://localhost:3001
VITE_ENABLE_NEW_BACKEND=true
```

---

### Phase 8: Testing & Deployment (Week 11-12)

**Goal**: Thorough testing and production deployment

#### 8.1 Testing Strategy
- Unit tests for all services
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Load testing for subscription webhooks
- Security testing for authentication

#### 8.2 Deployment
- Deploy Node.js backend to Vercel/Railway/Render
- Configure Supabase production instance
- Set up Stripe webhooks
- Configure environment variables
- Run database migrations
- Monitor performance and errors

---

## Data Migration Plan

### Strategy: Parallel Run with Data Sync

1. **Initial Data Export**:
   - Export all data from ICP canister
   - Transform to Supabase format
   - Import to Supabase

2. **Sync Mechanism**:
   - Run both backends in parallel
   - Implement write-through cache (write to both ICP and Supabase)
   - Read from Supabase primarily, fallback to ICP

3. **Cutover**:
   - Monitor sync consistency
   - Gradually shift read traffic to Supabase
   - Eventually decommission ICP backend

### Data Mapping

| ICP/Motoko Type | Supabase Type | Notes |
|----------------|---------------|-------|
| Principal | UUID | Generate new UUID for each user |
| Timestamp (nanoseconds) | TIMESTAMP | Convert to milliseconds |
| Text | TEXT/TEXT[] | Arrays for tags, video_ids |
| Nat/Int | INTEGER | Direct mapping |
| Bool | BOOLEAN | Direct mapping |
| Variant types | TEXT with CHECK | Use enum-like strings |

---

## Risk Mitigation

### Technical Risks

1. **Authentication Breakage**
   - **Risk**: Users unable to log in after migration
   - **Mitigation**: Keep ICP auth as fallback, implement gradual migration

2. **Data Loss**
   - **Risk**: Data corruption during migration
   - **Mitigation**: Full backup before migration, test migration on staging

3. **API Incompatibility**
   - **Risk**: Frontend calls fail with new backend
   - **Mitigation**: Comprehensive adapter layer, extensive testing

4. **Stripe Webhook Failures**
   - **Risk**: Subscription payments not processed
   - **Mitigation**: Test webhooks thoroughly, implement retry logic

### Operational Risks

1. **Downtime**
   - **Risk**: Service unavailable during migration
   - **Mitigation**: Blue-green deployment, rollback plan

2. **Performance Degradation**
   - **Risk**: New backend slower than ICP
   - **Mitigation**: Performance testing, caching, optimization

---

## Success Criteria

- [ ] All user features working with new backend
- [ ] Authentication system fully functional
- [ ] Stripe subscriptions processing correctly
- [ ] Social features (posts, comments, reactions) operational
- [ ] Admin panel functional
- [ ] Data migration complete with no data loss
- [ ] Frontend fully compatible with new backend
- [ ] Performance comparable or better than ICP
- [ ] Security audit passed
- [ ] Monitoring and alerting configured

---

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Foundation | Week 1-2 | Node.js project, Supabase schema, TypeScript types |
| Phase 2: Auth | Week 3 | JWT auth system, auth middleware, auth routes |
| Phase 3: Core Features | Week 4-5 | User management, video features |
| Phase 4: Social Features | Week 6-7 | Posts, comments, reactions, follows |
| Phase 5: Subscriptions | Week 8 | Stripe integration, content gating |
| Phase 6: Remaining Features | Week 9 | Playlists, downloads, notifications, admin |
| Phase 7: Frontend Integration | Week 10 | Frontend updates, adapter layer |
| Phase 8: Testing & Deployment | Week 11-12 | Testing, deployment, monitoring |

**Total Duration**: 12 weeks

---

## Next Steps

1. **Review and Approve**: Stakeholders review this migration plan
2. **Resource Allocation**: Assign developers to each phase
3. **Environment Setup**: Create staging environments
4. **Begin Phase 1**: Start foundation setup
5. **Weekly Progress Reviews**: Track progress against timeline

---

## Appendix: File Mapping

### Motoko → TypeScript File Mapping

| Motoko File | TypeScript File | Priority |
|-------------|-----------------|----------|
| types/common.mo | types/common.ts | High |
| types/users.mo | types/users.ts | High |
| types/auth.mo | types/auth.ts | High |
| types/social.mo | types/social.ts | High |
| types/subscriptions.mo | types/subscriptions.ts | High |
| lib/users.mo | services/user.service.ts | High |
| lib/auth.mo | services/auth.service.ts | High |
| lib/social.mo | services/social.service.ts | Medium |
| lib/subscriptions.mo | services/subscription.service.ts | Medium |
| mixins/users-api.mo | routes/users.routes.ts | High |
| mixins/auth-api.mo | routes/auth.routes.ts | High |
| mixins/social-api.mo | routes/social.routes.ts | Medium |
| mixins/subscriptions-api.mo | routes/subscriptions.routes.ts | Medium |
| mixins/admin-api.mo | routes/admin.routes.ts | Low |
| main.mo | index.ts (app entry point) | High |

---

**Document Version**: 1.0  
**Last Updated**: 2025-06-22  
**Author**: Migration Analysis Team

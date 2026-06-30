# LIGHTNING TIPPING WIDGET
## Complete Technical Architecture for Vercel

**Platform:** Vercel (Full-stack)  
**Deadline:** Monday night  
**Quality:** Production-ready

---

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────┐
│              VERCEL DEPLOYMENT                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  FRONTEND (React + Next.js)                             │
│  ├─ Landing Page                                        │
│  ├─ Sign-up / Login Pages                               │
│  ├─ Creator Dashboard                                   │
│  ├─ Customize Widget Page                               │
│  ├─ Withdraw Page                                       │
│  └─ Embeddable Widget Component                         │
│                                                          │
│  BACKEND (Next.js API Routes)                           │
│  ├─ /api/auth/* (Authentication)                        │
│  ├─ /api/invoices/* (Lightning invoices)                │
│  ├─ /api/tips/* (Tip management)                        │
│  ├─ /api/creators/* (Creator data)                      │
│  ├─ /api/widgets/* (Widget configuration)               │
│  └─ /api/webhooks/* (Lightning callbacks)               │
│                                                          │
│  DATABASE (PostgreSQL on Supabase)                      │
│  ├─ creators table                                      │
│  ├─ invoices table                                      │
│  ├─ tips table                                          │
│  ├─ withdrawals table                                   │
│  └─ widget_configs table                                │
│                                                          │
│  REAL-TIME (WebSocket via Socket.io)                    │
│  └─ Live tip feed updates                               │
│                                                          │
│  EXTERNAL SERVICES                                      │
│  ├─ Alby/Voltage API (Lightning node access)            │
│  ├─ Stripe (Optional: convert sats to fiat)             │
│  └─ SendGrid (Email notifications)                      │
│                                                          │
└──────────────────────────────────────────────────────────┘

    ↓ (All on Vercel)
    
┌──────────────────────────────────────────────────────────┐
│              USER INTERACTIONS                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Creator Website                                        │
│  ├─ Embedded Widget (React component)                   │
│  └─ Real-time updates via WebSocket                     │
│                                                          │
│  Lightning Network                                      │
│  ├─ Payment processing                                  │
│  ├─ Webhook confirmations                               │
│  └─ Direct creator settlement                           │
│                                                          │
│  User's Lightning Wallet                               │
│  └─ Payment initiation & confirmation                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 PROJECT STRUCTURE

```
lightning-tipping-widget/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # App layout
│   │   ├── (auth)/
│   │   │   ├── signup/page.tsx         # Sign up
│   │   │   ├── login/page.tsx          # Login
│   │   │   └── verify/page.tsx         # Lightning verify
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx      # Main dashboard
│   │   │   ├── customize/page.tsx      # Widget customization
│   │   │   ├── withdraw/page.tsx       # Withdrawal
│   │   │   └── analytics/page.tsx      # Analytics
│   │   └── api/
│   │       ├── auth/[...nextauth].ts
│   │       ├── invoices/[...].ts
│   │       ├── tips/[...].ts
│   │       ├── creators/[...].ts
│   │       ├── widgets/[...].ts
│   │       └── webhooks/lightning.ts
│   ├── components/
│   │   ├── Widget.tsx                  # Embeddable widget
│   │   ├── Dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── TipChart.tsx
│   │   │   ├── LiveFeed.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── CustomizeWidget/
│   │   │   ├── ThemePicker.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── Preview.tsx
│   │   │   └── EmbedCodeGenerator.tsx
│   │   ├── Withdraw/
│   │   │   ├── WithdrawForm.tsx
│   │   │   ├── WithdrawalHistory.tsx
│   │   │   └── ConfirmationModal.tsx
│   │   ├── Common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── Landing/
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       ├── HowItWorks.tsx
│   │       ├── Testimonials.tsx
│   │       └── CTA.tsx
│   ├── lib/
│   │   ├── api.ts                      # API client functions
│   │   ├── hooks.ts                    # Custom React hooks
│   │   ├── socket.ts                   # WebSocket config
│   │   ├── utils.ts                    # Helper functions
│   │   └── constants.ts                # App constants
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css               # Color system
│   │   └── animations.css
│   ├── public/
│   │   ├── logo.svg
│   │   ├── icons/
│   │   └── images/
│   ├── .env.local                      # Environment variables
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── database/
│   ├── migrations/
│   │   ├── 001_create_creators.sql
│   │   ├── 002_create_invoices.sql
│   │   ├── 003_create_tips.sql
│   │   ├── 004_create_withdrawals.sql
│   │   └── 005_create_widget_configs.sql
│   └── seed.sql                        # Sample data
├── docs/
│   ├── API.md                          # API documentation
│   ├── DEPLOYMENT.md                   # Deployment guide
│   ├── ARCHITECTURE.md
│   └── TROUBLESHOOTING.md
├── README.md
└── .env.example
```

---

## 🗄️ DATABASE SCHEMA (PostgreSQL/Supabase)

### Creators Table
```sql
CREATE TABLE creators (
  id SERIAL PRIMARY KEY,
  lightning_address VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  -- Settings
  theme VARCHAR(50) DEFAULT 'dark',
  primary_color VARCHAR(7) DEFAULT '#FF8C00',
  show_live_feed BOOLEAN DEFAULT TRUE,
  show_donor_names BOOLEAN DEFAULT TRUE,
  custom_message VARCHAR(255),
  
  -- Tip Configuration
  tip_amounts JSON DEFAULT '[100, 500, 1000]',
  withdrawal_address VARCHAR(255),
  
  -- Stats
  total_sats_earned BIGINT DEFAULT 0,
  total_tips_count INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(lightning_address)
);

CREATE INDEX idx_creators_slug ON creators(slug);
CREATE INDEX idx_creators_verified ON creators(verified);
CREATE INDEX idx_creators_created_at ON creators(created_at);
```

### Invoices Table
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES creators(id),
  
  -- Lightning Fields
  payment_request VARCHAR(2000) NOT NULL,
  invoice_hash VARCHAR(255) UNIQUE,
  amount_sats BIGINT NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, settled, expired
  settled_at TIMESTAMP,
  
  -- Metadata
  source VARCHAR(100), -- 'website', 'widget', etc.
  expires_at TIMESTAMP NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_amount CHECK (amount_sats > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'settled', 'expired'))
);

CREATE INDEX idx_invoices_creator_id ON invoices(creator_id);
CREATE INDEX idx_invoices_hash ON invoices(invoice_hash);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
```

### Tips Table
```sql
CREATE TABLE tips (
  id SERIAL PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES creators(id),
  invoice_id INT NOT NULL REFERENCES invoices(id),
  
  -- Payment Details
  amount_sats BIGINT NOT NULL,
  transaction_hash VARCHAR(255),
  
  -- Sender Info
  sender_name VARCHAR(255) DEFAULT 'Anonymous',
  sender_message TEXT,
  sender_wallet VARCHAR(255),
  
  -- Metadata
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_amount CHECK (amount_sats > 0),
  CONSTRAINT unique_invoice_creator CHECK (creator_id IS NOT NULL)
);

CREATE INDEX idx_tips_creator_id ON tips(creator_id);
CREATE INDEX idx_tips_invoice_id ON tips(invoice_id);
CREATE INDEX idx_tips_received_at ON tips(received_at);
```

### Withdrawals Table
```sql
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES creators(id),
  
  -- Withdrawal Details
  amount_sats BIGINT NOT NULL,
  destination_address VARCHAR(255) NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, settled, failed
  transaction_hash VARCHAR(255),
  settled_at TIMESTAMP,
  
  -- Metadata
  reason TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_amount CHECK (amount_sats > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'settled', 'failed'))
);

CREATE INDEX idx_withdrawals_creator_id ON withdrawals(creator_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

### Widget Configs Table
```sql
CREATE TABLE widget_configs (
  id SERIAL PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES creators(id),
  
  -- Display Settings
  theme VARCHAR(50),
  primary_color VARCHAR(7),
  custom_message VARCHAR(255),
  
  -- Tip Configuration
  tip_amounts JSON,
  show_live_feed BOOLEAN,
  show_donor_names BOOLEAN,
  
  -- Customization
  width VARCHAR(50) DEFAULT '400px',
  height VARCHAR(50) DEFAULT 'auto',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(creator_id)
);
```

---

## 🔐 AUTHENTICATION

### Method 1: Lightning-Based (Recommended)
```
1. Creator enters Lightning address
2. System creates 1-sat invoice
3. Creator scans with wallet
4. Payment confirmed instantly
5. Session created (JWT token)
6. Stored in httpOnly cookie
```

### Method 2: Email Magic Link (Fallback)
```
1. Creator enters email
2. System sends magic link
3. Creator clicks link
4. Session created
5. Cookie set
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-domain.com
JWT_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_here
DATABASE_URL=postgresql://user:password@host/db
ALBY_API_KEY=your_alby_key
WEBHOOK_SECRET=your_webhook_secret
```

---

## 🌐 API ENDPOINTS

### Authentication
```
POST /api/auth/start-verification
  Body: { lightning_address: "alice@example.com" }
  Response: { invoice_id, payment_request, qr_code }

POST /api/auth/verify-payment
  Body: { invoice_id, payment_hash }
  Response: { token, creator_data }

POST /api/auth/logout
  Response: { success: true }

GET /api/auth/session
  Response: { creator_data } or 401
```

### Invoices
```
POST /api/invoices/create
  Auth: Required
  Body: { amount_sats: 500 }
  Response: { payment_request, invoice_id, qr_code, expires_at }

GET /api/invoices/:id
  Auth: Optional
  Response: { status, amount_sats, settled_at }

POST /api/webhooks/lightning
  Body: Alby webhook payload
  Response: { success: true }
```

### Tips
```
GET /api/tips?creator_id=123&limit=20
  Response: [{ id, amount_sats, sender_name, message, received_at }, ...]

POST /api/tips
  Auth: Required
  Body: { amount_sats, sender_name, message }
  Response: { tip_id, created_at }

GET /api/tips/:creator_id/stats
  Auth: Optional
  Response: {
    total_sats: 15000,
    tip_count: 30,
    average_tip: 500,
    hourly_stats: [...],
    weekly_stats: [...]
  }
```

### Creators
```
GET /api/creators/:id
  Response: { display_name, verified, total_earned, ... }

PUT /api/creators/:id
  Auth: Required (own creator)
  Body: { display_name, theme, primary_color, ... }
  Response: { updated_creator }

GET /api/creators/:id/widget-config
  Response: widget configuration
```

### Withdrawals
```
POST /api/withdrawals
  Auth: Required
  Body: { amount_sats, destination_address }
  Response: { withdrawal_id, status, transaction_hash }

GET /api/withdrawals
  Auth: Required
  Response: [{ id, amount_sats, status, settled_at }, ...]
```

---

## 🔄 REAL-TIME UPDATES (WebSocket)

### Socket.io Integration

```javascript
// Client: Connect to WebSocket
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: { token: authToken }
});

// Subscribe to tips for specific creator
socket.emit('subscribe', { creator_id: 'alice@example.com' });

// Listen for new tips
socket.on('tip_received', (data) => {
  // Update dashboard live
  addTipToFeed(data);
  updateStatsCards(data);
  playNotificationSound();
});

// Listen for withdrawal confirmations
socket.on('withdrawal_confirmed', (data) => {
  // Refresh balance, show confirmation
});
```

### Server: Broadcast Updates

```javascript
// Backend: Broadcast when payment confirmed
io.to(`creator:${creator_id}`).emit('tip_received', {
  id: tip.id,
  amount_sats: tip.amount_sats,
  sender_name: tip.sender_name,
  message: tip.sender_message,
  received_at: tip.received_at
});
```

---

## 🔌 EXTERNAL INTEGRATIONS

### Alby Lightning Node API

```javascript
// Create Invoice
const response = await fetch('https://api.getalby.com/invoices', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ALBY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: amount_sats,
    description: `Tip for ${creator.display_name}`,
    webhook: `${BASE_URL}/api/webhooks/lightning`,
    expiry: 600  // 10 minutes
  })
});

// Response
{
  "payment_request": "lnbc5u1p...",
  "payment_hash": "abc123...",
  "id": "inv_12345",
  "settled": false,
  "amount": 500
}
```

### Webhook Handler
```javascript
// POST /api/webhooks/lightning
export async function POST(req) {
  const { id, settled, amount, payment_hash } = req.body;
  
  if (settled) {
    // Find invoice
    const invoice = await db.invoice.findUnique({ where: { invoice_hash: payment_hash } });
    
    // Create tip record
    await db.tip.create({
      creator_id: invoice.creator_id,
      invoice_id: invoice.id,
      amount_sats: amount,
      transaction_hash: payment_hash
    });
    
    // Update creator stats
    await db.creator.update({
      where: { id: invoice.creator_id },
      data: {
        total_sats_earned: { increment: amount },
        total_tips_count: { increment: 1 }
      }
    });
    
    // Broadcast to connected users (WebSocket)
    io.to(`creator:${invoice.creator_id}`).emit('tip_received', {
      amount_sats: amount,
      sender_name: 'Anonymous'
    });
  }
  
  return Response.json({ success: true });
}
```

---

## 🎨 FRONTEND TECH STACK

### Core Framework
- **Next.js 14+** (React framework with built-in API routes)
- **React 18+** (UI components)
- **TypeScript** (Type safety)
- **Tailwind CSS** (Styling)

### Key Libraries
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "socket.io-client": "^4.7.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "qrcode.react": "^1.0.1",
    "next-auth": "^4.24.0",
    "supabase": "^2.38.0",
    "framer-motion": "^10.16.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0"
  }
}
```

---

## 🚀 DEPLOYMENT ON VERCEL

### 1. Connect Repository
```bash
# Initialize Git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub and push
git remote add origin https://github.com/username/lightning-tipping
git push -u origin main
```

### 2. Deploy on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
# Follow prompts
# - Link to GitHub repo
# - Set environment variables
# - Deploy!

# URL: your-app.vercel.app
```

### 3. Environment Variables (in Vercel Dashboard)
```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
JWT_SECRET=generate_secure_random_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate_secure_random_string
DATABASE_URL=postgresql://user:pass@host/db
ALBY_API_KEY=your_alby_api_key
WEBHOOK_SECRET=your_webhook_secret
```

### 4. Database Setup (Supabase)
```bash
# Create Supabase project
# Run migrations
psql $DATABASE_URL < database/migrations/001_create_creators.sql
psql $DATABASE_URL < database/migrations/002_create_invoices.sql
# ... etc for all migrations

# Seed with sample data (optional)
psql $DATABASE_URL < database/seed.sql
```

### 5. Production Checklist
```
✓ Environment variables set
✓ Database migrations run
✓ CORS configured correctly
✓ Webhook URL configured in Alby
✓ SSL certificate (automatic on Vercel)
✓ Domain configured (optional)
✓ Email notifications configured
✓ Error tracking set up (Sentry)
✓ Analytics set up (Vercel Analytics)
✓ Rate limiting enabled
```

---

## 🛡️ SECURITY

### Best Practices
- **HTTPS Only**: All traffic encrypted
- **JWT Tokens**: Secure session management
- **httpOnly Cookies**: Protected from XSS
- **CSRF Protection**: Token validation
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Server-side validation
- **Database Encryption**: Supabase default
- **Webhook Verification**: Signature check

### Rate Limiting Example
```javascript
// /api/invoices/create
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
});

export async function POST(req) {
  const { success } = await ratelimit.limit(req.user.id);
  if (!success) return new Response('Too many requests', { status: 429 });
  
  // ... create invoice
}
```

---

## 📊 MONITORING & ANALYTICS

### What to Monitor
```
✓ Invoice creation rate
✓ Payment confirmation rate
✓ Average payment time (target: < 2 sec)
✓ Live feed update latency
✓ Error rates
✓ Active creators
✓ Daily active users
✓ Withdrawal success rate
```

### Integration Examples
```javascript
// Sentry (Error tracking)
import * as Sentry from "@sentry/nextjs";
Sentry.init({...});

// Vercel Analytics (Built-in)
import { Analytics } from '@vercel/analytics/react';

// Custom event tracking
analytics.track('invoice_created', {
  amount: 500,
  creator_id: 'alice@example.com'
});
```

---

## 📱 EMBEDDABLE WIDGET CODE

### How Creators Embed (One Line!)

```html
<!-- On creator's website, place this: -->
<script src="https://your-app.vercel.app/widget.js"></script>
<lightning-widget creator-id="alice@example.com"></lightning-widget>
```

### Widget Implementation
```javascript
// Widget loads as Web Component
class LightningWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  async connectedCallback() {
    const creatorId = this.getAttribute('creator-id');
    
    // Fetch widget config
    const config = await fetch(
      `${API_URL}/api/widgets/${creatorId}`
    ).then(r => r.json());
    
    // Render widget UI
    this.render(config);
    
    // Connect WebSocket for live updates
    this.socket = io(API_URL, { auth: { creator_id: creatorId } });
    this.socket.on('tip_received', (tip) => {
      this.updateLiveFeed(tip);
    });
  }
  
  render(config) {
    // Build widget HTML with styling
    // Apply theme colors
    // Add QR code placeholder
    // Render tip amounts
  }
}

customElements.define('lightning-widget', LightningWidget);
```

---

## ✅ TESTING STRATEGY

### Unit Tests
```bash
npm install --save-dev jest @testing-library/react

# Run tests
npm run test
```

### API Testing
```bash
# Create test endpoint
POST /api/test/create-invoice
  -> Creates test invoice
  -> Returns payment request

POST /api/test/confirm-payment
  -> Simulates webhook
  -> Updates status
  -> Triggers live feed update
```

### Live Testing Checklist
```
✓ Sign up flow (with Alby testnet)
✓ Dashboard loads
✓ Customize widget
✓ Create invoice
✓ Confirm payment (< 2 sec)
✓ Tip appears in feed
✓ Withdrawal
✓ Widget embed on test site
✓ Mobile responsiveness
✓ Performance (< 1.5 sec page load)
```

---

## 📚 FILE SIZE TARGETS (Performance)

```
Landing Page Bundle: < 150KB
Dashboard Bundle: < 200KB
Widget Bundle: < 50KB (lightweight for embeds)

Lighthouse Scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90
```

---

## 🎯 DEPLOYMENT TIMELINE (Monday Night Deadline)

```
Friday:
  - [ ] Database schema & migrations
  - [ ] API endpoints (50% done)
  
Saturday:
  - [ ] API endpoints (complete)
  - [ ] Authentication flow
  - [ ] Frontend components (50%)
  
Sunday:
  - [ ] Frontend components (complete)
  - [ ] WebSocket integration
  - [ ] Testing & bug fixes
  
Monday:
  - [ ] Final testing
  - [ ] Vercel deployment
  - [ ] PowerPoint guide
  - [ ] LAUNCH! 🚀
```

---

## 🎓 SUMMARY

This is a **full-stack, production-ready application** with:
- ✅ Next.js on Vercel (easy deployment)
- ✅ PostgreSQL database (Supabase)
- ✅ Lightning Network integration (Alby)
- ✅ Real-time updates (WebSocket)
- ✅ Embeddable widget
- ✅ Excellent UI/UX
- ✅ Production security
- ✅ Monitoring & analytics

**All deployed and working by Monday night!** ⚡

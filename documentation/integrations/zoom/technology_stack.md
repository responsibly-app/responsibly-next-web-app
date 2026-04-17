---
field: Technology Stack
ref: https://developers.zoom.us/docs/build-flow/technical-design/
---

## Technology Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State / Data Fetching | TanStack Query v5 |
| Animations | Framer Motion v12, GSAP v3 |
| Component Primitives | Radix UI, shadcn/ui |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js via Next.js API Routes (Vercel Serverless Functions) |
| API Layer | oRPC v1.13 — type-safe RPC with OpenAPI generation |
| Validation | Zod v4 |
| ORM | Drizzle ORM v0.45 |
| Database | PostgreSQL (hosted on Supabase) |
| File Storage | Supabase Storage |
| Email | Nodemailer + React Email |

### Authentication

| Layer | Technology |
|---|---|
| Auth Framework | Better Auth v1.5 |
| Zoom OAuth Flow | OAuth 2.0 Authorization Code flow |
| Session Management | HTTP-only cookie sessions managed by Better Auth |
| Token Storage | Access token and refresh token stored AES-256 encrypted in PostgreSQL via Better Auth's social account table (`encryptOAuthTokens: true`) |

### Zoom Integration

**OAuth scopes requested:**
- `user:read:user` — read the user's Zoom profile
- `meeting:read:meeting` — read the user's meetings
- `meeting:write:meeting` — create, update, and delete meetings

**Zoom REST API v2 endpoints used:**
- `GET /users/me` — fetch the connected user's Zoom profile
- `GET /users/me/meetings` — list meetings (filterable by type)
- `GET /meetings/{meetingId}` — get a single meeting by ID
- `POST /users/me/meetings` — create a new meeting
- `PATCH /meetings/{meetingId}` — update an existing meeting
- `DELETE /meetings/{meetingId}` — delete a meeting
- `POST /meetings/{meetingId}/registrants` — add a registrant to a meeting

**Zoom Webhook events handled:**
- `endpoint.url_validation` — challenge-response to validate the webhook endpoint
- `meeting.participant_joined` — opens a participant session record
- `meeting.participant_left` — closes the session record and triggers auto-attendance evaluation
- `meeting.participant_put_in_waiting_room` — acknowledged, no session opened
- `meeting.ended` — closes all open sessions for participants who did not receive an individual leave event

### Hosting & Infrastructure

| Layer | Technology |
|---|---|
| Hosting | Vercel (Serverless + Edge) |
| CDN | Vercel Edge Network |
| Environment Config | Vercel Environment Variables |
| CI/CD | Vercel Git Integration (auto-deploy on push) |

### AI Features (unrelated to Zoom)

| Layer | Technology |
|---|---|
| AI SDK | Vercel AI SDK v6 |
| Models | OpenAI GPT, Azure OpenAI, Google Gemini |
| Chat UI | assistant-ui |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│           Next.js 16 App (React 19 + TanStack Query)         │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (TLS 1.2+)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Vercel Serverless Functions                 │
│              (Next.js API Routes via oRPC)                   │
│                                                              │
│  ┌──────────────────┐    ┌────────────────────────────────┐  │
│  │   Better Auth    │    │        Zoom Router             │  │
│  │  (OAuth 2.0 +    │    │  /zoom/status  /zoom/profile   │  │
│  │   session mgmt)  │    │  /zoom/meetings (CRUD)         │  │
│  └────────┬─────────┘    │  /zoom/webhook (events)        │  │
│           │               └────────────┬───────────────────┘  │
└───────────┼────────────────────────────┼─────────────────────┘
            │ encrypted tokens           │ Bearer token
            ▼                            ▼
┌─────────────────────┐      ┌──────────────────────────────┐
│  PostgreSQL          │      │      Zoom REST API v2        │
│  (Supabase)          │      │  api.zoom.us                 │
│                      │      └──────────────────────────────┘
│  - User sessions     │
│  - Encrypted OAuth   │      ┌──────────────────────────────┐
│    tokens            │◄─────│   Zoom Webhook Events        │
│  - Zoom meeting IDs  │      │  (HMAC-SHA256 verified)      │
│  - Participant       │      │  meeting.participant_joined  │
│    sessions          │      │  meeting.participant_left    │
│  - Attendance records│      │  meeting.ended               │
└──────────────────────┘      └──────────────────────────────┘
```

**OAuth Authorization Flow:**
```
User clicks "Connect Zoom"
    → Responsibly redirects to Zoom OAuth authorization endpoint
    → User grants permission on Zoom consent screen
    → Zoom redirects back to Responsibly with authorization code
    → Better Auth exchanges code for access + refresh tokens
    → Tokens stored AES-256 encrypted in PostgreSQL
    → Subsequent API calls to Zoom REST API v2 use the decrypted access token
    → Token refresh handled automatically via Better Auth
```

**Webhook Attendance Flow:**
```
Zoom sends meeting.participant_joined
    → Responsibly verifies HMAC-SHA256 signature (x-zm-signature header)
    → Participant session record opened in PostgreSQL
Zoom sends meeting.participant_left (or meeting.ended)
    → Signature verified, session record closed with calculated duration
    → Auto-attendance evaluation: if participant met the minimum duration
      threshold, attendance is marked as present in the database
```

## Application Development

Responsibly is a production web application deployed on Vercel. The development lifecycle includes:

- **Version control:** Git (GitHub), with automated deploys via Vercel Git Integration on every push to the main branch
- **Static analysis:** ESLint (eslint-config-next) and TypeScript strict mode
- **Code formatting:** Prettier with organize-imports and Tailwind CSS plugins
- **Database migrations:** Drizzle Kit — schema changes are generated and applied as versioned SQL migrations

Security-specific practices:
- Zoom OAuth tokens are encrypted at rest using Better Auth's `encryptOAuthTokens` option before being written to PostgreSQL
- Webhook payloads are verified using HMAC-SHA256 and `crypto.timingSafeEqual` before processing to prevent timing attacks
- All secrets (Zoom client secret, webhook secret token, database credentials) are stored as Vercel Environment Variables and are never committed to source

## Security

**Question 1 — Ensuring Secure Transmission of Zoom User Data**

All traffic between users and Responsibly is encrypted using HTTPS enforced by Vercel, which terminates TLS 1.2 or higher on all connections. There is no plain-HTTP path to any endpoint. All calls from Responsibly's backend to the Zoom REST API (`api.zoom.us`) are made over HTTPS. Zoom OAuth tokens are never transmitted over unencrypted channels.

**Question 2 — Verifying Event Notification Integrity with Secret Tokens**

Responsibly implements Zoom's HMAC-SHA256 webhook signature verification on every inbound webhook request. The `x-zm-signature` and `x-zm-request-timestamp` headers are validated against the Zoom Webhook Secret Token before any payload is processed. The signature comparison uses Node.js `crypto.timingSafeEqual` to prevent timing-based attacks. Requests with invalid or missing signatures are rejected without processing. The `endpoint.url_validation` challenge-response is also implemented to authenticate the webhook endpoint at registration time.

**Question 3 — Encryption of Collected and Retained Zoom Information**

Zoom OAuth access tokens and refresh tokens are stored in PostgreSQL using Better Auth's `encryptOAuthTokens: true` option, which applies AES encryption at the application layer before writing to the database. Decrypted tokens are never logged or persisted in plaintext. The encryption key is stored exclusively as a Vercel Environment Variable and is never committed to source code.

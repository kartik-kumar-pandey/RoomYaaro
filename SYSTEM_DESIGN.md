# RoomYaaro — System Design Write-up

> **Target length:** ≤ 800 words  
> **Coverage:** Compatibility scoring · LLM integration & fallback · Chat implementation · Notification flow

---

## 1. Compatibility Scoring Design

The compatibility engine exists to answer one question: *"How well does this room match this tenant?"* The answer needs to be fast, explainable, and cost-efficient.

### Score lifecycle

A score is computed **once** per `(tenant, listing)` pair and persisted in the `CompatibilityScore` table. All subsequent requests for that pair return the cached row — the LLM is never invoked twice for the same data. This keeps API costs bounded and latency near-zero for returning users.

### What is scored

The prompt instructs the model to weigh four dimensions: budget alignment, location match, move-in timing, and room type/furnishing fit. These map naturally to the fields a tenant fills in on their profile (`minBudget`, `maxBudget`, `preferredLocation`, `moveInDate`) versus the listing fields (`rent`, `location`, `availableFrom`, `roomType`, `furnishingStatus`).

The model returns a JSON object `{ score: number, explanation: string }`. The score is clamped to `[0, 100]` before storage. The explanation is shown verbatim in the UI — making the score transparent and trustworthy to users.

### How recommendations are ranked

`GET /api/tenant/recommendations` fetches all available listings and calls `getOrCreateCompatibilityScore` for each. Results are sorted descending by score and the top N are returned. This means a tenant always sees their most compatible options first, even across sessions.

---

## 2. LLM Integration & Fallback

The engine uses a **three-tier cascade** so the platform never silently fails.

```
Request
  │
  ├─ NVIDIA NIM (if NVIDIA_API_KEY is set)
  │     model: google/gemma-4-31b-it  · temp: 0.2
  │     ├─ success → store & return
  │     └─ fail    ──────────────────────────────────┐
  │                                                  ▼
  ├─ Google Gemini 1.5 Flash (if GEMINI_API_KEY is set)
  │     ├─ success → store & return
  │     └─ fail    ──────────────────────────────────┐
  │                                                  ▼
  └─ Rule Engine (always available, no API call)
        Budget score (0–60 pts) + Location score (0–40 pts)
        → deterministic, explainable, instant
```

**Why this order?** NVIDIA NIM is tried first because it provides access to larger open-weight models (Gemma 4 31B) via a REST endpoint without requiring a local GPU. Gemini is the backup because it is production-grade and familiar. The rule engine is the final safety net — it requires no network access and never throws.

**Prompt engineering choices:** Temperature is set to `0.2` to minimise hallucinated scores. The prompt explicitly restricts output to a single JSON object with no preamble, which lets a simple regex (`/\{[\s\S]*\}/`) extract the payload reliably even if the model wraps it in markdown fences.

---

## 3. Chat Implementation

Chat is **gated behind interest acceptance**. A `ChatRoom` record is only created when an owner accepts an `InterestRequest`. This prevents spam and gives chat a meaningful context — both parties already mutually agreed to connect.

### Transport

The backend runs Socket.IO alongside Express on the same HTTP server. On connection, the client authenticates via a JWT in the handshake query string. The server verifies the token before allowing any room operations.

### Room joining

```
Client emits join-room { roomId }
  → server validates the user belongs to that room (DB check)
  → server calls socket.join(roomId)
```

Only then can the client emit `send-message`. The server persists the message to `ChatMessage`, then broadcasts it to all sockets in the room with `receive-message`. This means the sender also receives their own message through the broadcast, keeping the UI logic uniform.

### Persistence

`GET /api/chat/:roomId` returns paginated historical messages for users who reconnect or load the chat on a new device. The REST layer and Socket layer share the same Prisma database, so there is no sync problem.

### Typing indicator

`typing { roomId, isTyping }` is relayed to other room members via `socket.to(roomId).emit` without any database write — it is ephemeral by design.

---

## 4. Notification Flow

Email notifications are triggered at three points in the user journey:

| Trigger | Recipient | Template |
|---------|-----------|----------|
| Compatibility score ≥ 80 | Tenant | **High Match** — encourages the tenant to express interest |
| Owner accepts interest | Tenant | **Interest Accepted** — includes chat room deep-link |
| Owner rejects interest | Tenant | **Interest Rejected** — suggests alternative listings |

### Architecture

All three triggers call `email.service.js`, which composes an HTML email with inline CSS (compatible with Gmail, Outlook, and mobile clients) and dispatches it via Nodemailer to a Brevo SMTP relay. A corresponding `EmailNotification` row is written to the database with `isSent: true` once the transport confirms delivery. This log lets admins audit what was sent and replay failed notifications.

### Why not a queue?

For the current scale (single-server, moderate user count) a fire-and-forget async call within the request handler is sufficient. Emails are sent *after* the HTTP response is committed, so they do not block the client. A queue (BullMQ/Redis) would be the natural next step when email volume grows or retries become critical.

---

## Summary

| Concern | Approach |
|---------|----------|
| Scoring cost | Cache per (tenant, listing) pair in DB |
| LLM reliability | Three-tier cascade: NIM → Gemini → Rule Engine |
| Prompt safety | Low temperature + strict JSON-only output format |
| Chat access control | Gated behind accepted interest; JWT socket auth |
| Chat latency | Socket.IO broadcast; REST fallback for history |
| Notifications | Async Nodemailer via Brevo SMTP; DB audit log |

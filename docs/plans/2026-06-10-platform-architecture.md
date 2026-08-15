# Platform Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement remaining architectural requirements for Push Notifications, Transaction Export, and Cart Save for Later.

**Architecture:** Node.js Express backend with MongoDB and an Expo React Native frontend. Use MongoDB for persistent notification queues, native streams and `fast-csv` for CSV exports, and `pdfkit` for secure receipt generation.

**Tech Stack:** React Native (Expo), Node.js, Express, MongoDB, Mongoose, pdfkit, fast-csv.

---

### Task 1: Notification Queue Model & Job Setup

**Files:**
- Create: `backend/models/NotificationJob.js`
- Create: `backend/jobs/NotificationWorker.js`

**Step 1: Write the failing test**
(Skipped in environment since no jest setup exists, but defining models conceptually)

**Step 3: Write minimal implementation**
Create `NotificationJob.js` schema with `userId`, `payload`, `status` (pending, sent, failed), `retryCount`, and `nextAttempt`.
Create `NotificationWorker.js` to poll `pending` jobs, limit concurrent sending (rate limit), increment `retryCount` on fail with backoff.

**Step 5: Commit**
`git add backend/models/NotificationJob.js backend/jobs/NotificationWorker.js`
`git commit -m "feat: add notification background job queue schema and worker"`

### Task 2: Order CSV Export Streaming

**Files:**
- Modify: `backend/routes/OrderRoutes.js`

**Step 1: Write the failing test**
(Test endpoint `/user/:userId/export/csv` returns 404)

**Step 3: Write minimal implementation**
Add `GET /user/:userid/export/csv` inside `OrderRoutes.js`. Use Mongoose `cursor()` to stream orders directly to `fast-csv` and pipe to `res`. Set `Content-Type: text/csv`.

**Step 5: Commit**
`git add backend/routes/OrderRoutes.js`
`git commit -m "feat: stream massive order datasets to csv"`

### Task 3: PDF Receipt Generation

**Files:**
- Modify: `backend/routes/OrderRoutes.js`

**Step 1: Write the failing test**
(Test endpoint `/receipt/:orderId` returns 404)

**Step 3: Write minimal implementation**
Add `GET /receipt/:orderId`. Use `pdfkit` to generate an invoice PDF containing `invoiceId`, items, amounts, and timestamps. Pipe the document to `res` with `Content-Type: application/pdf`.

**Step 5: Commit**
`git add backend/routes/OrderRoutes.js`
`git commit -m "feat: secure pdf receipt generation"`

### Task 4: Frontend Cart "Save for Later" Separation

**Files:**
- Modify: `myntra/app/(tabs)/bag.tsx`

**Step 1: Write the failing test**
(Verify UI displays active items and saved items visually separated)

**Step 3: Write minimal implementation**
Update `bag.tsx` to render two distinct lists: one for `bagItems` and one for `savedItems`. Provide UI buttons for "Move to Bag" and "Save for Later". Calculate total only on `bagItems`. Highlight item if `priceChanged` is true.

**Step 5: Commit**
`git add myntra/app/(tabs)/bag.tsx`
`git commit -m "feat: separate active cart and saved for later"`

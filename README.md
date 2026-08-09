# Nexora — Modern SaaS Analytics & Management Platform Showcase

**Nexora** is a high-performance, dark-first enterprise SaaS dashboard showcase application built with a decoupled architecture.

> [!NOTE]
> Nexora intentionally uses Go in-memory application state instead of a persistent database because this is a showcase/demo application.

---

## 🏗️ Architecture & Stack

- **Backend**: Go (`go1.26+`), Gin Web Framework, Clean Architecture (`Handler -> Service -> Store`), Centralized Concurrency-Safe In-Memory Store (`sync.RWMutex`).
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, React Router DOM.
- **Data Flow**:
```text
React Frontend
      ↓
REST API (Go Gin)
      ↓
Service Layer (Dashboard Aggregation & Business Rules)
      ↓
Thread-Safe In-Memory Store (ICM Core)
      ↓
Mock Seed Data (backend/mockdata/*.json)
```

```text
nexora/
├── backend/
│   ├── cmd/
│   │   └── server/          # Backend Server Entrypoint & Seed Data Initialization
│   ├── internal/
│   │   ├── config/          # Environment Configuration
│   │   ├── handlers/        # HTTP Request Handlers (Customers, Subscriptions, Transactions, Notifications, Dashboard, Demo)
│   │   ├── middleware/      # CORS, Request Logging, Panic Recovery
│   │   ├── routes/          # Centralized Route Architecture
│   │   ├── services/        # Business Logic & Dynamic Dashboard Aggregation Services
│   │   ├── store/           # Centralized Concurrency-Safe In-Memory Store (sync.RWMutex, IDGen, Seed Loader)
│   │   └── models/          # Domain Models & DTOs (Customer, Subscription, Transaction, Notification, User, Session, QueryParams)
│   ├── mockdata/            # Mock Datasets (users.json, customers.json, subscriptions.json, transactions.json, notifications.json)
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common & Dashboard UI Components
│   │   ├── layouts/         # AppShell, Sidebar, Header
      ├── pages/           # DashboardPage, CustomersPage, SubscriptionsPage, etc.
│   │   ├── routes/          # React Router Setup
│   │   ├── services/api/    # REST API Clients (dashboard, customers, subscriptions, transactions, notifications, demo)
│   │   ├── types/           # TypeScript API & Domain Interfaces
│   │   └── styles/          # Tailwind CSS & Design Tokens
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Start Backend (Go + Gin)

```bash
cd backend
go run ./cmd/server
```
The server starts on `http://localhost:8080` (or configured `PORT`).

### 2. Start Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
The application will run on `http://localhost:5173`.

---

## 🛰️ REST API Endpoints

### Core Foundation
- `GET /health` — Health check endpoint
- `GET /api` — Service metadata info

### Executive Dashboard
- `GET /api/dashboard` — Dynamic calculated metrics (Total Revenue, Active Customers, Subscriptions, Conversion Rate, MRR, ARR, Chart breakdown, Recent Ledger, Recent Activity)

### Customers
- `GET /api/customers` — List customers with search, status, plan, location, sorting & pagination
- `GET /api/customers/:id` — Get customer details
- `POST /api/customers` — Create customer account
- `PUT /api/customers/:id` — Update customer account
- `DELETE /api/customers/:id` — Delete customer (verifies dependent active subscriptions)

### Subscriptions
- `GET /api/subscriptions` — List subscriptions
- `GET /api/subscriptions/:id` — Get subscription details
- `POST /api/subscriptions` — Create subscription
- `PUT /api/subscriptions/:id` — Update subscription
- `DELETE /api/subscriptions/:id` — Delete subscription

### Transactions
- `GET /api/transactions` — List transaction ledger
- `GET /api/transactions/:id` — Get transaction details
- `POST /api/transactions` — Create transaction record

### Notifications
- `GET /api/notifications` — List system notifications
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `PATCH /api/notifications/:id/unread` — Mark notification as unread
- `PATCH /api/notifications/read-all` — Mark all notifications as read

### Users
- `GET /api/users` — List platform users
- `GET /api/users/:id` — Get user details

### Showcase & Demo Controls (`APP_ENV=development`)
- `GET /api/demo/state` — Metadata count of items currently in Go in-memory state
- `POST /api/demo/reset` — Reset Go in-memory application store to initial seed data

---

## 🧪 Testing & Race Detector Verification

To run unit tests across all backend packages:

```bash
cd backend
go test -v ./...
```

To run with Go race detector enabled:

```bash
go test -race ./...
```

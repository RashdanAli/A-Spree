<div align="center">

# 🛒 A-spree

### AI-Powered Retail Management System

*From warehouse to doorstep — with intelligent, expiry-driven discounts.*

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Modules Deep Dive](#-modules-deep-dive)
  - [Warehouse Management](#1-warehouse-management-module)
  - [Retail Store Management](#2-retail-store-management-module)
  - [Customer Mobile App](#3-customer-mobile-app)
  - [ML Engine — Expiry-Driven Discounts](#4-ml-engine--expiry-driven-discounts)
  - [Analytics & Admin Dashboard](#5-analytics--admin-dashboard)
- [Role-Based Access Control](#-role-based-access-control)
- [Database Schema](#-database-schema)
- [Implementation Phases](#-implementation-phases)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**A-spree** is a full-stack, AI-augmented retail management system designed for multi-branch supermarket chains. It connects three tiers of operation — a central warehouse, distributed retail branches, and end customers — through a unified platform powered by intelligent inventory control and machine-learning-driven discount targeting.

The standout feature is the **Expiry-Driven Targeted Discount Engine**: instead of blanket promotions, A-spree uses a **CatBoost propensity model** to identify *which customers* are most likely to buy *which near-expiry items* at *what discount threshold* — reducing food waste while maximising conversion. Push notifications are delivered in real time via Firebase Cloud Messaging directly to the customer's mobile device.

```
  ┌──────────────┐        Transfer Orders        ┌──────────────────┐
  │  WAREHOUSE   │ ─────────────────────────────► │  RETAIL BRANCH   │
  │  (The Hub)   │                                │  (The Branches)  │
  └──────┬───────┘                                └────────┬─────────┘
         │                                                  │
         │   Nightly ML Scan                        POS + Mobile Orders
         │   (CatBoost scores)                              │
         ▼                                                  ▼
  ┌──────────────┐        FCM Discount Push        ┌──────────────────┐
  │  ML ENGINE   │ ─────────────────────────────► │  CUSTOMER APP    │
  │  (FastAPI)   │                                │  (React Native)  │
  └──────────────┘                                └──────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Product Master Catalog** | SKU-based product registry with categories, units, and nutritional data |
| **Batch & Expiry Tracking** | Per-batch expiry monitoring with nightly automated alerts |
| **Multi-Tier Pricing Engine** | Base price → markup → promotional discounts with auto-expiry |
| **Vendor Management** | Supplier records, lead times, and restock workflows |
| **Transfer Orders** | Warehouse → Branch dispatch with status lifecycle (`PENDING → DISPATCHED → RECEIVED`) |
| **Branch Inventory** | On-shelf vs. backroom stock tracking, FIFO-based POS resolution |
| **Wastage Reporting** | Record expired, damaged, or stolen stock with full audit trail |
| **POS Interface** | Cashier-friendly checkout with SKU scanning and payment processing |
| **Customer Mobile App** | Location-based browsing, cart, mock wallet checkout, and order tracking |
| **AI Discount Engine** | CatBoost propensity model targeting near-expiry items to likely buyers |
| **Real-Time Push Notifications** | Firebase FCM delivers personalised discount alerts instantly |
| **GraphQL API** | Unified query interface for both web dashboard and mobile app |
| **RBAC** | Five distinct roles with granular access enforcement via JWT + Spring Security |
| **Analytics Dashboards** | Revenue charts, low-stock alerts, wastage breakdowns, and branch comparisons |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
│                                                                          │
│   ┌────────────────────────────┐     ┌──────────────────────────────┐   │
│   │   React Dashboard (Vite)   │     │  React Native App (Expo)     │   │
│   │   Apollo Client (GraphQL)  │     │  Apollo Client (GraphQL)     │   │
│   │   Recharts (Analytics)     │     │  Zustand (Cart State)        │   │
│   │   Roles: Admin/WH/Branch   │     │  expo-secure-store (JWT)     │   │
│   └─────────────┬──────────────┘     └──────────────┬───────────────┘   │
└─────────────────┼──────────────────────────────────┼───────────────────┘
                  │  GraphQL / REST                   │  GraphQL / REST
┌─────────────────┼──────────────────────────────────┼───────────────────┐
│                 ▼        BACKEND LAYER              ▼                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │              Spring Boot (Java) — Core Service                   │   │
│   │                                                                   │   │
│   │  • GraphQL Server (Spring for GraphQL)                           │   │
│   │  • REST Endpoints (POS, Auth, Analytics)                         │   │
│   │  • JWT Filter + Spring Security (@PreAuthorize)                  │   │
│   │  • Business Logic: Inventory, Orders, Pricing, Wastage           │   │
│   │  • Nightly Scheduler (ExpiryScheduler, PromotionExpiry)          │   │
│   │  • FCM Notification Dispatch (NotificationService)               │   │
│   │  • ML Client — REST calls to FastAPI (/predict)                  │   │
│   └───────────────────────┬─────────────────────────────────────────┘   │
│                            │                                             │
│          ┌─────────────────┼───────────────────┐                        │
│          ▼                 ▼                   ▼                        │
│   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐              │
│   │   MongoDB   │  │  FastAPI     │  │  Firebase (FCM)  │              │
│   │  (Primary   │  │  ML Service  │  │  Push Service    │              │
│   │  Database)  │  │  (Python +   │  │                  │              │
│   │             │  │  CatBoost)   │  │                  │              │
│   └─────────────┘  └──────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Expiry-Driven Discount Loop

```
  Nightly Cron (2 AM)
       │
       ▼
  ExpiryScheduler.java
  ┌────────────────────────────────────────────┐
  │ 1. Query MongoDB: batches expiring ≤ 3 days│
  │ 2. Fetch customers who bought that category│
  │ 3. Build feature vectors per customer      │
  └────────────────┬───────────────────────────┘
                   │  POST /predict  [{features}]
                   ▼
            FastAPI ML Service
            ┌───────────────────────────────┐
            │  CatBoost model.cbm           │
            │  Returns propensity score     │
            │  0.0 → 1.0 per customer       │
            └─────────────┬─────────────────┘
                          │ scores[ ]
                   ┌──────▼──────────────────┐
                   │ Filter: score > 0.8     │
                   │ Apply discount via      │
                   │ PricingService          │
                   │ Send FCM notification   │
                   │ Log to notifications{}  │
                   └─────────────────────────┘
                          │
                          ▼
                   Customer's Phone
                   🔔 "20% off Strawberries — expires tomorrow!"
```

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend — Dashboard** | React 18 + Vite | Web interface for warehouse & store management |
| **Frontend — Mobile** | React Native (Expo) | Customer-facing shopping app |
| **API Communication** | GraphQL (Apollo Client) | Unified query layer for both frontends |
| **Backend Core** | Spring Boot 3 (Java) | Business logic, GraphQL/REST server, scheduling |
| **Database** | MongoDB 7 | Document storage for products, orders, users |
| **ML Engine** | Python 3.11 + CatBoost | Propensity modelling for discount targeting |
| **ML API** | FastAPI | Lightweight REST interface for inference |
| **Push Notifications** | Firebase Cloud Messaging | Real-time alerts to customer devices |
| **Authentication** | JWT (JSON Web Tokens) | Stateless auth across web and mobile |
| **Payment** | Mock Wallet (MongoDB) | Internal fake-credit balance system |
| **Charts** | Recharts | Analytics visualisations in dashboard |
| **State Management** | Zustand | Cart and global state in React Native |
| **Secure Storage** | expo-secure-store | JWT storage on device |

---

## 📁 Repository Structure

```
a-spree/
│
├── backend/                         # Spring Boot core service
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/aspree/
│           │   ├── auth/
│           │   │   ├── AuthController.java
│           │   │   ├── JwtFilter.java
│           │   │   └── UserService.java
│           │   ├── models/          # MongoDB @Document classes
│           │   │   ├── Product.java
│           │   │   ├── Batch.java
│           │   │   ├── Branch.java
│           │   │   ├── TransferOrder.java
│           │   │   ├── Order.java
│           │   │   ├── WastageReport.java
│           │   │   └── ...
│           │   ├── services/
│           │   │   ├── ProductService.java
│           │   │   ├── BatchService.java
│           │   │   ├── PricingService.java
│           │   │   ├── TransferOrderService.java
│           │   │   ├── BranchInventoryService.java
│           │   │   ├── WastageService.java
│           │   │   ├── POSService.java
│           │   │   ├── AnalyticsService.java
│           │   │   ├── NotificationService.java
│           │   │   └── MLClient.java
│           │   ├── graphql/
│           │   │   └── resolvers/
│           │   ├── schedulers/
│           │   │   └── ExpiryScheduler.java
│           │   └── pos/
│           │       └── CartController.java
│           └── resources/
│               ├── graphql/
│               │   └── schema.graphqls
│               └── application.properties
│
├── dashboard/                       # React web dashboard
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   └── Sidebar.tsx
│       └── pages/
│           ├── Login.tsx
│           ├── Warehouse/           # Product, Batch, Vendor, Transfer
│           ├── Branch/              # Inventory, Transfers, Wastage
│           ├── POS/                 # Cashier checkout screen
│           └── Analytics/          # Super Admin charts
│
├── mobile/                          # React Native Expo app
│   ├── app.json
│   └── app/
│       ├── (auth)/
│       │   └── login.tsx
│       ├── (tabs)/
│       │   ├── index.tsx            # Home / branch selection
│       │   ├── shop.tsx             # Product catalog
│       │   ├── cart.tsx
│       │   ├── orders.tsx
│       │   └── profile.tsx
│       └── checkout.tsx
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── OrderStatusStepper.tsx
│   │   └── DealsSection.tsx
│   ├── context/
│   │   └── BranchContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useNotifications.ts
│   ├── store/
│   │   └── cartStore.ts             # Zustand store
│   └── services/
│       └── api.ts
│
├── ml/                              # Python ML microservice
│   ├── main.py                      # FastAPI app
│   ├── schemas.py
│   ├── train.py                     # CatBoost training script
│   ├── model.cbm                    # Serialised trained model
│   ├── data_pipeline.py
│   └── generate_synthetic_data.py
│
├── .env.example                     # All required environment variables
└── README.md
```

---

## 🔍 Modules Deep Dive

### 1. Warehouse Management Module

> *"The Hub"* — where products are born and inventory begins.

The Warehouse module is the authoritative source of truth for all product and stock data in the system. Everything starts here.

**Product Master Catalog**

Every sellable item is created as a `Product` document containing:

- `sku` — Auto-generated if not provided; unique across the system
- `name`, `category` (e.g., Fresh Produce, Frozen, Pantry)
- `unit_of_measurement` (kg, grams, packets, litres)
- `nutritional_info` — Exposed to the customer mobile app
- `base_price` — Foundation of the pricing tier chain

**Batch & Expiry Management**

Each product can have many `Batch` records, because the same item may arrive across different deliveries with different expiry dates. Each batch stores:

- `batch_number`, `product_id`, `quantity`
- `received_date`, `expiry_date`, `cost_price`

A Spring `@Scheduled` nightly job (`ExpiryScheduler`) scans all batches and flags those expiring **within 7 days** (yellow alert) and **within 3 days** (red alert — triggers ML targeting). This data feeds the Phase 5 ML pipeline.

**Pricing Engine**

A-spree uses a three-tier pricing model:

```
Effective Price = base_price × (1 + markup_pct) × (1 - discount_pct)
```

Warehouse Managers can call `setPromotion(productId, discountPct, expiresAt)` to run time-limited promotions. Promotions auto-expire via the nightly scheduler — no manual cleanup needed.

**Transfer Orders**

To move stock from the warehouse to a branch, a Warehouse Manager creates a Transfer Order specifying:
- Target `branch_id`
- A list of `{ product_id, batch_id, quantity }`
- Estimated delivery date

The order lifecycle:

```
  PENDING  ──(Warehouse dispatches)──►  DISPATCHED  ──(Branch confirms)──►  RECEIVED
```

On `DISPATCHED`, warehouse stock is decremented. On `RECEIVED` (handled by the Branch module), branch inventory is incremented.

---

### 2. Retail Store Management Module

> *"The Branches"* — where warehouse stock becomes shelf-ready inventory.

**Stock Receiving**

Branch Managers see all `DISPATCHED` transfer orders in their dashboard. Confirming receipt triggers `receiveTransferOrder(orderId)`, which:
1. Marks the order `RECEIVED`
2. Upserts a `branch_inventory` record for each batch
3. Tracks `on_shelf_qty` and `backroom_qty` separately

Stock can be manually promoted from backroom to shelf via a dedicated mutation.

**Wastage & Spoilage Reporting**

Staff can record stock write-offs via `reportWastage(branchId, batchId, quantity, reason)`. Valid reasons:

| Reason | Description |
|---|---|
| `EXPIRED` | Item passed its expiry date before sale |
| `DAMAGED` | Item is unsellable due to physical damage |
| `THEFT` | Inventory shrinkage attributed to theft |

Each report decrements branch inventory and creates a timestamped `wastage_report` document — feeding the analytics dashboard.

**Point of Sale (POS) Interface**

The POS is a full-screen, keyboard-friendly cashier checkout built for speed. The flow:

```
  POST /pos/cart           → Create cart session
  POST /pos/cart/{id}/item → Add item by SKU scan
                             (FIFO batch resolution: oldest expiry first)
  POST /pos/cart/{id}/checkout → Finalise, deduct inventory, return receipt
```

Supports **cash** and **mock wallet** payment types.

---

### 3. Customer Mobile App

> *"The Shopper"* — the customer-facing storefront, built with React Native + Expo.

**Location-Based Branch Selection**

On first launch, the app requests the device location using `expo-location`. It queries `nearestBranches(lat, lng, radiusKm)` and prompts the user to select their preferred branch. The selected `branch_id` is stored in `BranchContext` and **scopes every subsequent inventory query** — customers only ever see items in stock at *their* branch.

**Product Catalog & Search**

- Category chips (Fresh Produce, Frozen, Pantry, etc.) for quick filtering
- Product cards showing name, price, weight, and live stock status
- Product detail screen with full nutritional info
- Search bar with debounced `searchProducts(query, branchId)` GraphQL query

**Cart, Checkout & Mock Wallet**

Cart state is managed globally with **Zustand**. At checkout:
1. Choose **Pickup** or **Delivery** (with saved address)
2. Payment hits the Mock Wallet endpoint — deducts fake credits from the user's MongoDB balance (seeded on registration)
3. Returns an order confirmation with a unique order ID

**Order Tracking**

Real-time order status via a **GraphQL subscription** (`subscribeOrderStatus(orderId)`):

```
  Placed  ──►  Processing  ──►  Ready / Out for Delivery  ──►  Delivered
```

**User Profiles**

- Display name, email, mock wallet balance
- Saved addresses (full CRUD)
- Full order history (paginated via `myOrders`)
- **Loyalty Points** — total spend ÷ 100, displayed as a visual badge (cosmetic in v1)

---

### 4. ML Engine — Expiry-Driven Discounts

> *The brain of A-spree.* Instead of generic promotions, the system identifies the right product, the right customer, and the right moment.

**The Problem it Solves**

Food retailers lose significant revenue to spoilage when near-expiry items don't sell in time. Traditional blanket discounts are inefficient. A-spree uses **propensity modelling** to ask: *"Which customer is most likely to buy this near-expiry item if we send them a targeted discount right now?"*

**Model: CatBoost Classifier**

CatBoost (Categorical Boosting) was chosen for the following reasons:

| Reason | Detail |
|---|---|
| **Native Categorical Support** | Retail data is full of categories (Store ID, Brand, Category Name). CatBoost handles these natively — no one-hot encoding needed. |
| **Ordered Boosting** | Prevents target leakage from ordered transaction history, producing unbiased predictions. |
| **Inference Speed** | Millisecond-level predictions post-training, suitable for batch nightly jobs. |
| **Strong Baseline AUC** | Achieves strong AUC on tabular retail data with minimal hyperparameter tuning. |

**Feature Vector (per customer × product)**

| Feature | Type | Description |
|---|---|---|
| `customer_id` | Categorical | Customer identifier |
| `product_id` | Categorical | Product identifier |
| `product_category` | Categorical | e.g., Fresh Produce, Frozen |
| `brand` | Categorical | Product brand |
| `base_price` | Numerical | Product's base price |
| `discount_pct` | Numerical | Proposed discount percentage |
| `days_to_expiry` | Numerical | Days until batch expires |
| `purchase_frequency_30d` | Numerical | Times customer bought this category in last 30 days |
| `recency_days` | Numerical | Days since the customer last purchased |

**Target Label:** `purchased_with_discount` — binary (0 or 1)

**Inference Threshold:** `score > 0.8` triggers a targeted discount + push notification.

**FastAPI Microservice**

```
POST /predict
  Body: [{ customer_id, product_id, ...features }]
  Returns: [{ customer_id, product_id, score: 0.93 }]

GET /health
  Returns: { status: "ok", model: "loaded" }
```

The model is loaded once at startup from `model.cbm`. The Spring Boot backend is the **only** caller — this endpoint is never exposed to frontends.

**End-to-End Trigger Loop**

```
ExpiryScheduler (nightly)
    │
    ├─ Identify batches expiring ≤ 3 days
    ├─ Fetch customers who purchased from that category
    ├─ Build feature vectors
    ├─ POST to FastAPI /predict
    ├─ Filter scores > 0.8
    ├─ Apply discount via PricingService
    ├─ Fire FCM push notification (NotificationService)
    └─ Insert record into `notifications` collection (dedup guard)
```

---

### 5. Analytics & Admin Dashboard

> *"Mission Control"* — visibility across all branches for Super Admins and Warehouse Managers.

Four dashboard panels, all backed by MongoDB aggregation pipelines:

| Panel | Chart Type | Description |
|---|---|---|
| **Top Products** | Bar chart (Recharts) | Revenue and volume rankings by product |
| **Branch Revenue** | Line chart (Recharts) | Daily/weekly revenue grouped by branch |
| **Wastage Breakdown** | Pie chart (Recharts) | Wastage by reason (expired/damaged/theft) and by branch |
| **Low-Stock Alerts** | Urgency table | Branch inventory items below configurable threshold, colour-coded by severity |

All panels respond to a **date range picker** that re-fetches all data. Metric summary cards sit at the top of the page for quick reads.

---

## 🔐 Role-Based Access Control

A-spree implements five roles enforced at the Spring Security layer (`@PreAuthorize`) and reflected in the React dashboard (menu visibility):

| Role | Access |
|---|---|
| **Super Admin** | Full system access: all modules, all branches, analytics, user management |
| **Warehouse Manager** | Product catalog, batch management, pricing, vendors, transfer orders, warehouse analytics |
| **Branch Manager** | Incoming transfer orders, local inventory, wastage reporting, branch analytics |
| **Cashier** | POS checkout screen only |
| **Customer** | Mobile app: browse, cart, checkout, orders, profile |

JWT tokens encode the user's role. The `JwtFilter` extracts it and injects it into the Spring Security context on every request.

---

## 🗄 Database Schema

All collections live in MongoDB. Below are the key documents:

```
users           → _id, name, email, password_hash, role, wallet_balance,
                  fcm_token, saved_addresses[], loyalty_points

products        → _id, sku, name, category, unit_of_measurement,
                  nutritional_info, base_price, markup_pct, discount_pct,
                  discount_expires_at, is_archived

batches         → _id, product_id, batch_number, quantity, received_date,
                  expiry_date, cost_price, expiry_flag (none|7d|3d)

vendors         → _id, name, contact, lead_time_days, product_ids[]

warehouses      → _id, name, location, manager_id

branches        → _id, name, location, manager_id, lat, lng

branch_inventory→ _id, branch_id, product_id, batch_id, on_shelf_qty,
                  backroom_qty, last_updated

transfer_orders → _id, warehouse_id, branch_id, status, items[],
                  estimated_delivery, dispatched_at, received_at

orders          → _id, customer_id, branch_id, items[], total_amount,
                  payment_type, status, created_at

wastage_reports → _id, branch_id, batch_id, quantity, reason,
                  reported_by, timestamp

notifications   → _id, customer_id, product_id, discount_pct,
                  sent_at, opened, converted
```

**Key Compound Indexes:**

```
products:    { sku: 1 }                     (unique)
batches:     { expiry_date: 1, product_id: 1 }
orders:      { status: 1, branch_id: 1 }
branch_inv:  { branch_id: 1, product_id: 1 }
```

---

## 🗓 Implementation Phases

The project is structured into **6 sequential phases**. Each phase has a clear completion gate before the next begins.

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
Foundation  Warehouse   Branches    Customer    ML Engine   Analytics
  Auth        Hub         POS        Mobile      CatBoost    & Polish
  RBAC       Batches    Inventory     App        FastAPI     End-to-End
  MongoDB   Transfers   Wastage     Orders      FCM Loop    Dress Rehearsal
```

| Phase | Name | Gate |
|---|---|---|
| **1** | Foundation | JWT auth works; all MongoDB collections exist; dashboard and mobile shells render |
| **2** | Warehouse Management | Warehouse Manager can add products, track batches, set prices, and dispatch transfer orders |
| **3** | Retail Store Management | Branch Manager can receive stock; Cashier can complete a POS transaction; wastage can be recorded |
| **4** | Customer Mobile App | Customer can browse, add to cart, pay with mock wallet, and track order status in real time |
| **5** | ML Engine | Nightly job identifies near-expiry stock, scores customers, sends FCM notifications; tapping notification deep-links to product |
| **6** | Analytics & Polish | Full end-to-end demo runs without a bug or hardcoded value; analytics dashboard is production-ready |

---

## 📡 API Reference

### Authentication Endpoints (REST)

```
POST /auth/register   → { name, email, password, role }  → { token }
POST /auth/login      → { email, password }               → { token }
```

### POS Endpoints (REST)

```
POST /pos/cart                     → Create cart session     → { cartId }
POST /pos/cart/{id}/item           → { sku, quantity }        → { cart }
POST /pos/cart/{id}/checkout       → { paymentType }          → { receipt }
```

### ML Service Endpoints (FastAPI — internal only)

```
POST /predict   → [{ customer_id, product_id, ...features }] → [{ score }]
GET  /health    → { status, model }
```

### Key GraphQL Queries

```graphql
# Products
products(category: String, page: Int, limit: Int): [Product]
searchProducts(query: String!, branchId: ID!): [Product]

# Batches
batchesByExpiry(daysUntilExpiry: Int!): [Batch]

# Branches
nearestBranches(lat: Float!, lng: Float!, radiusKm: Float!): [Branch]

# Orders
myOrders(userId: ID!, page: Int): [Order]
subscribeOrderStatus(orderId: ID!): OrderStatusUpdate   # Subscription

# Analytics (Admin/Warehouse Manager only)
topSellingProducts(dateRange: DateRangeInput!): [ProductSalesReport]
branchRevenue(dateRange: DateRangeInput!): [BranchRevenueReport]
wastageByBranch(branchId: ID, dateRange: DateRangeInput!): [WastageReport]
lowStockAlerts(threshold: Int!): [LowStockAlert]
```

### Key GraphQL Mutations

```graphql
# Warehouse
createProduct(input: ProductInput!): Product
updateProduct(id: ID!, input: ProductInput!): Product
setPromotion(productId: ID!, discountPct: Float!, expiresAt: String!): Product

# Transfer Orders
createTransferOrder(input: TransferOrderInput!): TransferOrder
receiveTransferOrder(orderId: ID!): TransferOrder

# Inventory & Wastage
moveToShelf(branchId: ID!, batchId: ID!, qty: Int!): BranchInventory
reportWastage(branchId: ID!, batchId: ID!, quantity: Int!, reason: WastageReason!): WastageReport
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java (JDK) | 17 or 21 |
| Maven | 3.9+ |
| Node.js | 18+ |
| Python | 3.11+ |
| MongoDB | 7.0 (local or Atlas) |
| Expo CLI | Latest |
| Firebase Project | With FCM enabled |

### Clone the Repository

```bash
git clone https://github.com/your-username/a-spree.git
cd a-spree
cp .env.example .env
# Fill in all values in .env before proceeding
```

---

## ⚙️ Environment Variables

Copy `.env.example` and populate all values. **Never commit a real `.env` file.**

```bash
# ── MongoDB ──────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/aspree

# ── JWT ──────────────────────────────────────────────
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY_MS=86400000

# ── Firebase / FCM ───────────────────────────────────
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json

# ── ML Service ───────────────────────────────────────
ML_SERVICE_URL=http://localhost:8001

# ── Mock Wallet ──────────────────────────────────────
MOCK_WALLET_SEED_BALANCE=5000

# ── Backend ──────────────────────────────────────────
BACKEND_PORT=8080

# ── Dashboard ────────────────────────────────────────
VITE_API_URL=http://localhost:8080
VITE_GRAPHQL_URL=http://localhost:8080/graphql

# ── Mobile ───────────────────────────────────────────
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
```

---

## 🏃 Running the Project

### 1. Start MongoDB

```bash
# Local instance
mongod --dbpath /your/data/path

# Or use MongoDB Atlas — paste the connection string in MONGODB_URI
```

### 2. Start the Spring Boot Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080
# GraphQL playground: http://localhost:8080/graphiql
```

### 3. Start the ML FastAPI Service

```bash
cd ml
pip install -r requirements.txt

# First time: train the model
python generate_synthetic_data.py
python train.py
# → Generates model.cbm

# Start the inference server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
# Runs on http://localhost:8001
```

### 4. Start the React Dashboard

```bash
cd dashboard
npm install
npm run dev
# Runs on http://localhost:5173
```

### 5. Start the React Native Mobile App

```bash
cd mobile
npm install
npx expo start
# Scan the QR code with the Expo Go app (iOS/Android)
# Or press 'i' for iOS simulator / 'a' for Android emulator
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create a feature branch** — `git checkout -b feature/your-feature-name`
3. **Commit your changes** — `git commit -m "feat: describe your change"`
4. **Push to the branch** — `git push origin feature/your-feature-name`
5. **Open a Pull Request** with a clear description

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, no logic change
refactor: Code restructuring
test:     Adding/updating tests
chore:    Build tooling, dependencies
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ☕ Java, ⚛️ React, 🐍 Python, and a lot of 🛒 grocery data.

**A-spree** — *Smart retail, end to end.*

</div>

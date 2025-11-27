# Iron Pets Backend API

Backend API for Iron Pets MVP e-commerce platform.

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Language:** TypeScript

## Database Schema

Complete Prisma schema implementing SRS Section 5 Data Requirements:

### Core Models
- **User Management:** `User`, `UserProfile`, `Address`
- **Pet Profiles:** `Pet`
- **Product Catalog:** `Category`, `Brand`, `Product`, `ProductImage`
- **Shopping Cart:** `Cart`, `CartItem`
- **Orders:** `Order`, `OrderItem`
- **Promotions:** `PromoCode`

### Features
- UUID primary keys for all tables
- Hierarchical category structure (parent-child)
- Proper indexes for query optimization
- Cascading deletes where appropriate
- Timestamps on all tables
- JSONB for flexible data (specifications, addresses)
- Enums for status fields

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Copy environment variables
cp .env.example .env

# Edit .env and set your DATABASE_URL
# Example: postgresql://postgres:password@localhost:5432/iron_pets

# Push schema to database
npm run db:push

# Generate Prisma Client
npm run db:generate
```

### 3. Seed Database

```bash
npm run db:seed
```

This will populate the database with:
- **12 Categories** (3 main + 9 subcategories)
  - Dogs → Food, Treats, Toys
  - Cats → Food, Treats, Toys
  - Small Pets → Food, Bedding
- **10 Brands** (Royal Canin, Blue Buffalo, Purina, etc.)
- **12+ Products** across all categories
- **3 Promo Codes** (WELCOME10, FREESHIP50, SAVE20)
- **1 Demo User** (demo@ironpets.com / Demo123!)

### 4. Run Development Server

```bash
npm run dev
```

## Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema to database (without migrations)
npm run db:push

# Create a new migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (caution: deletes all data)
npm run db:reset
```

## Database Indexes

The schema includes optimized indexes for:
- **User lookups:** email, email_verified
- **Product search:** slug, sku, category_id, brand_id, price, stock
- **Orders:** order_number, user_id, status, placed_at, tracking_number
- **Cart:** user_id, session_id, expires_at
- **Categories:** slug, parent_id, is_active, sort_order

## Data Validation

All models include validation at the database level:
- **Email:** VARCHAR(255), unique
- **Passwords:** Hashed with bcrypt (cost factor 12)
- **Prices:** DECIMAL(10,2) for precision
- **Quantities:** Integer with CHECK > 0
- **UUIDs:** All IDs use UUID v4

## Relations

### User Relations
- `User` → `UserProfile` (1:1)
- `User` → `Address[]` (1:many)
- `User` → `Pet[]` (1:many)
- `User` → `Cart[]` (1:many)
- `User` → `Order[]` (1:many)

### Product Relations
- `Category` → `Category[]` (hierarchical)
- `Product` → `Category` (many:1)
- `Product` → `Brand` (many:1)
- `Product` → `ProductImage[]` (1:many)

### Order Relations
- `Order` → `OrderItem[]` (1:many)
- `OrderItem` → `Product` (many:1)

### Cart Relations
- `Cart` → `CartItem[]` (1:many)
- `CartItem` → `Product` (many:1)

## Environment Variables

See `.env.example` for all required environment variables.

**Critical:**
- Never commit `.env` to version control
- Use strong secrets for JWT tokens in production
- Keep third-party API keys secure

## Next Steps

1. Implement REST API endpoints (Express routes)
2. Add authentication middleware (JWT)
3. Implement business logic services
4. Add input validation (Zod/Joi)
5. Setup error handling
6. Add logging (Winston/Pino)
7. Write tests (Jest)
8. Setup CI/CD

## Architecture Reference

This database schema implements the complete data requirements from:
- **SRS Document:** `/workspaces/aegis/docs/iron-pets-srs.md` Section 5
- **SPARC Phase:** Architecture
- **Database Design:** Normalized relational model with PostgreSQL

---

**Status:** ✅ Database Architecture Complete
**Next Phase:** Refinement (TDD Implementation)

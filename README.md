# Iron Pets

A modern e-commerce platform for pet supplies built with Next.js and Node.js/Express.

## Overview

Iron Pets is a full-stack pet store application featuring product browsing, shopping cart, secure checkout, user authentication, and personalized pet profiles. Built using Test-Driven Development (TDD) practices with a focus on quality and maintainability.

## Features

- **Product Catalog**: Browse products by category (Dogs, Cats, Small Pets)
- **Search & Filtering**: Full-text search with filters for price, brand, and availability
- **Shopping Cart**: Persistent cart with real-time updates
- **Secure Checkout**: Multi-step checkout with Stripe payment processing
- **User Authentication**: Email-based registration with JWT sessions
- **Order Management**: Order tracking, history, and reordering
- **Pet Profiles**: Add pets for personalized product recommendations

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest, React Testing Library, Playwright (E2E)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Caching**: Redis
- **Payments**: Stripe

## Project Structure

```
iron-pets-by-jarvis/
├── src/
│   └── iron-pets/
│       ├── backend/           # Express API server
│       │   ├── prisma/        # Database schema & migrations
│       │   ├── src/
│       │   │   ├── config/    # Configuration
│       │   │   ├── middleware/# Express middleware
│       │   │   ├── modules/   # Feature modules (auth, cart, etc.)
│       │   │   ├── routes/    # API routes
│       │   │   ├── types/     # TypeScript types
│       │   │   └── utils/     # Utilities
│       │   └── tests/         # Backend tests
│       └── frontend/          # Next.js application
│           ├── src/
│           │   ├── app/       # App router pages
│           │   ├── components/# React components
│           │   ├── hooks/     # Custom hooks
│           │   ├── lib/       # Utilities
│           │   └── store/     # State management
│           └── tests/         # Frontend tests
└── docs/                      # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 15+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/iron-pets-by-jarvis.git
   cd iron-pets-by-jarvis
   ```

2. **Install backend dependencies**
   ```bash
   cd src/iron-pets/backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Backend (`src/iron-pets/backend/.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/iron_pets"
   JWT_SECRET="your-jwt-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   STRIPE_SECRET_KEY="sk_test_..."
   REDIS_URL="redis://localhost:6379"
   ```

   Frontend (`src/iron-pets/frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

5. **Set up the database**
   ```bash
   cd src/iron-pets/backend
   npm run db:push       # Push schema to database
   npm run db:generate   # Generate Prisma client
   npm run db:seed       # Seed sample data
   ```

6. **Start development servers**

   Backend (runs on port 3001):
   ```bash
   cd src/iron-pets/backend
   npm run dev
   ```

   Frontend (runs on port 3000):
   ```bash
   cd src/iron-pets/frontend
   npm run dev
   ```

7. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate` | Run database migrations |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type check with TypeScript |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## API Documentation

The API follows RESTful conventions. Key endpoints:

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset

### Products
- `GET /api/products` - List products
- `GET /api/products/:slug` - Get product details
- `GET /api/products/search` - Search products
- `GET /api/categories` - List categories

### Cart
- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item

### Orders
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/checkout/create-order` - Create order

## Testing

### Run all tests
```bash
# Backend
cd src/iron-pets/backend && npm test

# Frontend unit tests
cd src/iron-pets/frontend && npm test

# Frontend E2E tests
cd src/iron-pets/frontend && npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User** - Authentication and user data
- **Product** - Product catalog
- **Category** - Hierarchical categories
- **Brand** - Product brands
- **Cart/CartItem** - Shopping cart
- **Order/OrderItem** - Order management
- **Pet** - User pet profiles

See `src/iron-pets/backend/prisma/schema.prisma` for the complete schema.

## Documentation

Additional documentation is available in the `/docs` directory:

- [MVP PRD](docs/iron-pets-mvp-prd.md) - Product Requirements Document
- [SRS](docs/iron-pets-srs.md) - Software Requirements Specification
- [Database Architecture](docs/iron-pets-database-architecture.md) - Database design
- [Test Coverage Report](docs/test-coverage-report.md) - Testing metrics

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with the SPARC development methodology
- Developed using Test-Driven Development (TDD) practices
- Powered by Claude AI assistance

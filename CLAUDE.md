# Iron Pets - Project Guide

A full-stack e-commerce platform for pet supplies built with Next.js 14 and Express.js.

---

## Project Structure

```
src/iron-pets/
├── backend/                 # Express API (port 3001)
│   ├── prisma/              # Schema, migrations, seed
│   ├── src/
│   │   ├── app.ts           # Express app init
│   │   ├── server.ts        # Server startup
│   │   ├── common/          # errors, response, validation helpers
│   │   ├── config/          # database, env config
│   │   ├── middleware/      # auth, errorHandler, rateLimiter, validate
│   │   ├── modules/         # Feature modules (see below)
│   │   ├── routes/          # Route aggregation
│   │   ├── services/        # mock-email, mock-stripe
│   │   ├── types/           # api.types, domain.types, express.d
│   │   └── utils/           # jwt.service, email.service
│   └── tests/               # Jest tests (auth, cart, catalog, checkout, orders, pets, search, user)
└── frontend/                # Next.js 14 app (port 3000)
    ├── src/
    │   ├── app/             # App Router pages (see below)
    │   ├── components/      # React components
    │   ├── hooks/           # 11 custom hooks
    │   ├── lib/             # api client, utils, mock-data
    │   ├── store/           # Zustand stores (auth, cart)
    │   └── types/           # TypeScript types
    └── tests/               # Jest component tests + Playwright E2E
```

## Backend Modules

Each module follows: `controller.ts` / `service.ts` / `routes.ts` / `validation.ts` / `index.ts`

| Module | Purpose |
|--------|---------|
| `auth` | Register, login, logout, token refresh |
| `cart` | Add, remove, update cart items |
| `catalog` | Products, categories, brands |
| `checkout` | Payment processing, order creation |
| `orders` | Order retrieval, tracking, updates |
| `pets` | Pet profile CRUD |
| `search` | Search (placeholder - not yet implemented) |
| `user` | Profile, addresses, account settings |

## Frontend Route Groups

| Group | Pages |
|-------|-------|
| `(shop)` | Products list, product detail, categories, cart, search |
| `(auth)` | Login, register, forgot password |
| `(account)` | Dashboard, orders, pets, addresses, settings |
| `(checkout)` | Checkout, order confirmation |
| `info` | Dynamic info pages |

## Tech Stack

- **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL 15+, Redis, Stripe, Zod, JWT (bcrypt)
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, React Query, React Hook Form, Axios
- **Testing**: Jest (backend + frontend unit), Playwright (E2E with 6 browser/device configs)

## Key Commands

### Backend (`cd src/iron-pets/backend`)

```bash
npm run dev              # Dev server with hot reload
npm run build            # Build (tsc)
npm test -- --run        # Run tests (ALWAYS use --run flag)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage    # Tests with coverage report
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed sample data
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
```

### Frontend (`cd src/iron-pets/frontend`)

```bash
npm run dev              # Dev server
npm run build            # Production build
npm test -- --run        # Unit tests (ALWAYS use --run flag)
npm run test:coverage    # Tests with coverage
npm run typecheck        # TypeScript check (tsc --noEmit)
npm run lint             # ESLint
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # E2E with Playwright UI
npm run test:e2e:headed  # E2E in headed browser
```

## Database

**13 Prisma models**: User, UserProfile, Address, Pet, Category, Brand, Product, ProductImage, Cart, CartItem, Order, OrderItem, PromoCode (+ RefreshToken, PasswordResetToken)

**Schema**: `src/iron-pets/backend/prisma/schema.prisma`

## TypeScript Path Aliases

- **Backend**: `@modules/*`, `@common/*`, `@config/*`, `@middleware/*`, `@types/*`, `@utils/*`
- **Frontend**: `@/*`, `@components/*`, `@hooks/*`, `@lib/*`, `@store/*`, `@types/*`, `@app/*`

## Coverage Thresholds

Both backend and frontend require **80% minimum** for branches, functions, lines, and statements.

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/forgot-password`
- **Products**: `/api/products`, `/api/products/:slug`, `/api/products/search`, `/api/categories`
- **Cart**: `/api/cart`, `/api/cart/items`, `/api/cart/items/:id`
- **Orders**: `/api/orders`, `/api/orders/:id`, `/api/checkout/create-order`

---

## Agentic QE v3

This project uses **Agentic QE v3** - a Domain-Driven Quality Engineering platform with 13 bounded contexts, ReasoningBank learning, HNSW vector search, and Agent Teams coordination (ADR-064).

---

### CRITICAL POLICIES

#### Integrity Rule (ABSOLUTE)
- NO shortcuts, fake data, or false claims
- ALWAYS implement properly, verify before claiming success
- ALWAYS use real database queries for integration tests
- ALWAYS run actual tests, not assume they pass

**We value the quality we deliver to our users.**

#### Test Execution
- NEVER run `npm test` without `--run` flag (watch mode risk)
- Use: `npm test -- --run`, `npm run test:unit`, `npm run test:integration` when available

#### Data Protection
- NEVER run `rm -f` on `.agentic-qe/` or `*.db` files without confirmation
- ALWAYS backup before database operations

#### Git Operations
- NEVER auto-commit/push without explicit user request
- ALWAYS wait for user confirmation before git operations

---

### Quick Reference

```bash
# Run tests
npm test -- --run

# Check quality
aqe quality assess

# Generate tests
aqe test generate <file>

# Coverage analysis
aqe coverage <path>
```

### Using AQE MCP Tools

AQE exposes tools via MCP with the `mcp__agentic-qe__` prefix. You MUST call `fleet_init` before any other tool.

#### 1. Initialize the Fleet (required first step)

```typescript
mcp__agentic-qe__fleet_init({
  topology: "hierarchical",
  maxAgents: 15,
  memoryBackend: "hybrid"
})
```

#### 2. Generate Tests

```typescript
mcp__agentic-qe__test_generate_enhanced({
  targetPath: "src/services/auth.ts",
  framework: "vitest",
  strategy: "boundary-value"
})
```

#### 3. Analyze Coverage

```typescript
mcp__agentic-qe__coverage_analyze_sublinear({
  paths: ["src/"],
  threshold: 80
})
```

#### 4. Assess Quality

```typescript
mcp__agentic-qe__quality_assess({
  scope: "full",
  includeMetrics: true
})
```

#### 5. Store and Query Patterns (with learning persistence)

```typescript
// Store a learned pattern
mcp__agentic-qe__memory_store({
  key: "patterns/coverage-gap/{timestamp}",
  namespace: "learning",
  value: {
    pattern: "...",
    confidence: 0.95,
    type: "coverage-gap",
    metadata: { /* domain-specific */ }
  },
  persist: true
})

// Query stored patterns
mcp__agentic-qe__memory_query({
  pattern: "patterns/*",
  namespace: "learning",
  limit: 10
})
```

#### 6. Orchestrate Multi-Agent Tasks

```typescript
mcp__agentic-qe__task_orchestrate({
  task: "Full quality assessment of auth module",
  domains: ["test-generation", "coverage-analysis", "security-compliance"],
  parallel: true
})
```

### MCP Tool Reference

| Tool | Description |
|------|-------------|
| `fleet_init` | Initialize QE fleet (MUST call first) |
| `fleet_status` | Get fleet health and agent status |
| `agent_spawn` | Spawn specialized QE agent |
| `test_generate_enhanced` | AI-powered test generation |
| `test_execute_parallel` | Parallel test execution with retry |
| `task_orchestrate` | Orchestrate multi-agent QE tasks |
| `coverage_analyze_sublinear` | O(log n) coverage analysis |
| `quality_assess` | Quality gate evaluation |
| `memory_store` | Store patterns with namespace + persist |
| `memory_query` | Query patterns by namespace/pattern |
| `security_scan_comprehensive` | SAST/DAST scanning |

### Configuration

- **Enabled Domains**: test-generation, test-execution, coverage-analysis, quality-assessment, defect-intelligence, requirements-validation (+6 more)
- **Learning**: Enabled (transformer embeddings)
- **Max Concurrent Agents**: 8
- **Background Workers**: pattern-consolidator, routing-accuracy-monitor, coverage-gap-scanner

### V3 QE Agents

QE agents are in `.claude/agents/v3/`. Use with Task tool:

```javascript
Task({ prompt: "Generate tests", subagent_type: "qe-test-architect", run_in_background: true })
Task({ prompt: "Find coverage gaps", subagent_type: "qe-coverage-specialist", run_in_background: true })
Task({ prompt: "Security audit", subagent_type: "qe-security-scanner", run_in_background: true })
```

### Data Storage

- **Memory Backend**: `.agentic-qe/memory.db` (SQLite)
- **Configuration**: `.agentic-qe/config.yaml`

---
*Generated by AQE v3 init - 2026-03-14T08:54:31.316Z*

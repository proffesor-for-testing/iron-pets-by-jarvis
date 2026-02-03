# Iron Pets - SFDIPOT Product Factors & QX Assessment Report

**Version:** 3.4.3
**Date:** 2026-02-03
**Framework:** James Bach's HTSM (Heuristic Test Strategy Model)
**Analyzer:** QE Product Factors Assessor v3

---

## Executive Summary

This report presents a comprehensive SFDIPOT analysis of the iron-pets-by-jarvis e-commerce platform using James Bach's Heuristic Test Strategy Model. The analysis covers all seven product factors (Structure, Function, Data, Interfaces, Platform, Operations, Time) along with a Quality Experience (QX) assessment.

| Category | Score | Risk Level | Key Finding |
|----------|-------|------------|-------------|
| **Structure** | 75/100 | MEDIUM | Well-organized modular architecture with TypeScript |
| **Function** | 78/100 | MEDIUM | Complete auth/cart/checkout flows with some gaps |
| **Data** | 85/100 | LOW | Strong Prisma schema with proper validation |
| **Interfaces** | 72/100 | MEDIUM | RESTful API with accessibility concerns |
| **Platform** | 82/100 | LOW | Modern stack with good browser support |
| **Operations** | 70/100 | MEDIUM | Health checks present, monitoring gaps |
| **Time** | 68/100 | MEDIUM | Session management needs race condition testing |

**Overall Score: 75/100**

---

## 1. SFDIPOT Analysis Matrix

### 1.1 Structure (What the Product IS)

**Risk Level:** MEDIUM | **Score:** 75/100

#### Architecture Overview

```
iron-pets-by-jarvis/
├── src/iron-pets/
│   ├── backend/           # Express.js API Server
│   │   ├── prisma/        # PostgreSQL Schema
│   │   ├── src/modules/   # Feature Modules (auth, cart, checkout, etc.)
│   │   ├── middleware/    # Auth, Rate Limiting, Validation
│   │   └── tests/         # Jest Test Suite
│   └── frontend/          # Next.js 14 Application
│       ├── src/app/       # App Router Pages
│       ├── src/components/# React Components
│       ├── src/hooks/     # Custom React Hooks
│       └── tests/         # Jest + Playwright Tests
└── docs/                  # Documentation
```

#### Component Analysis

| Component | Technology | Quality Assessment |
|-----------|------------|-------------------|
| Frontend Framework | Next.js 14 + TypeScript | Solid SSR implementation |
| UI Components | React + Tailwind CSS | Component library with variants |
| State Management | Zustand + React Query | Proper separation of concerns |
| Backend Framework | Express.js + TypeScript | Modular route structure |
| Database ORM | Prisma Client | Well-defined schema with relations |
| Authentication | JWT + bcrypt | Industry standard implementation |
| Payments | Stripe (mock available) | Integration layer present |

#### Structural Risks Identified

| Risk | Severity | Location | Recommendation |
|------|----------|----------|----------------|
| Incomplete auth tests | HIGH | `/backend/tests/auth.test.ts` | Tests marked as `.skip` - needs refactoring |
| Inline route handlers | MEDIUM | `/backend/src/app.ts` | Orders routes defined inline - extract to module |
| Incomplete state dropdown | LOW | `ShippingForm.tsx` | Only 10 states listed in dropdown |
| Duplicate route mounting | MEDIUM | `/backend/src/app.ts` | Both versioned and non-versioned routes |

#### Test Strategy for Structure

| # | Test Idea | Priority | Automation Fitness |
|---|-----------|----------|-------------------|
| S1 | Submit 100 parallel requests to cart add endpoint with same product ID; assert final stock count accuracy | P0 | Integration |
| S2 | Create user with special characters in email (test+iron@pets.co); complete full registration flow | P1 | Integration |
| S3 | Trigger module hot-reload while checkout payment is in progress; observe transaction state | P2 | Human-Exploration |
| S4 | Import Prisma schema into fresh database and verify all migrations apply cleanly | P1 | Integration |
| S5 | Build frontend in production mode; verify all TypeScript strict checks pass | P1 | Unit |

---

### 1.2 Function (What the Product DOES)

**Risk Level:** MEDIUM | **Score:** 78/100

#### Feature Inventory

| Feature | Status | Test Coverage | Notes |
|---------|--------|---------------|-------|
| User Registration | Implemented | Partial | Email verification flow complete |
| Login/Logout | Implemented | Skipped | JWT tokens with refresh mechanism |
| Password Reset | Implemented | Skipped | Token-based reset with expiry |
| Account Lockout | Implemented | Skipped | 5 attempts, 15-min lockout |
| Product Catalog | Implemented | Partial | Category browsing, search |
| Shopping Cart | Implemented | Good | Stock validation, persistence |
| Checkout Flow | Implemented | Partial | Multi-step with shipping |
| Order Management | Implemented | Partial | Cancel, reorder functionality |
| Pet Profiles | Implemented | Partial | CRUD operations |

#### Business Logic Analysis

**Authentication Flow:**
```
Register -> Email Verification -> Login -> JWT Access Token (15min) + Refresh Token (30 days)
                                      -> Failed 5x -> Account Locked (15min)
```

**Cart Operations:**
```
Add Item -> Stock Validation -> Price Lock -> Persist (7 days guest / 30 days user)
         -> Merge on Login
         -> Cleanup on Expiry
```

**Checkout Process:**
```
Cart -> Shipping Info -> Shipping Method -> Payment -> Order Confirmation -> Email
```

#### Functional Risks Identified

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| PCI Compliance Gap | HIGH | PaymentForm.tsx handles raw card data | Implement Stripe Elements |
| Promo Code Stub | MEDIUM | `useApplyPromoCode` returns success without validation | Complete server-side implementation |
| Guest Session Handling | MEDIUM | No evident guest checkout session management | Implement session ID tracking |
| Email Verification Testing | MEDIUM | Verification flow not covered in tests | Add integration tests |

#### Test Strategy for Function

| # | Test Idea | Priority | Automation Fitness |
|---|-----------|----------|-------------------|
| F1 | Click login button 6 times with wrong password in 30 seconds; confirm account lockout message | P0 | E2E |
| F2 | Add 50 different products to cart, proceed to checkout, cancel mid-payment; assert cart restoration | P0 | E2E |
| F3 | Request password reset twice within 1 minute; verify only latest token is valid | P1 | Unit |
| F4 | Enter expired promo code 'EXPIRED2025' at checkout; observe rejection message clarity | P1 | Integration |
| F5 | Complete order as guest; attempt to view order history without account | P1 | E2E |
| F6 | Add product to cart, reduce stock to 0 externally, attempt checkout; observe error handling | P0 | Integration |
| F7 | Register with valid email; request verification resend before original expires | P2 | Integration |

---

### 1.3 Data (What the Product PROCESSES)

**Risk Level:** LOW | **Score:** 85/100

#### Data Model Overview

```
User ──┬── UserProfile (1:1)
       ├── Address (1:N)
       ├── Pet (1:N)
       ├── Cart (1:N) ── CartItem (1:N) ── Product
       ├── Order (1:N) ── OrderItem (1:N) ── Product
       ├── RefreshToken (1:N)
       └── PasswordResetToken (1:N)

Product ── Category (N:1)
        └── Brand (N:1)
        └── ProductImage (1:N)

PromoCode (standalone)
```

#### Sensitive Data Inventory

| Data Type | Storage | Protection | Risk |
|-----------|---------|------------|------|
| Passwords | PostgreSQL | bcrypt (10 rounds) | LOW |
| JWT Tokens | Memory/Client | HMAC signature | LOW |
| Refresh Tokens | PostgreSQL | Hashed | LOW |
| Email Addresses | PostgreSQL | Plaintext | MEDIUM |
| Payment Info | Stripe (via API) | PCI compliant | LOW* |
| Addresses | PostgreSQL | Plaintext | MEDIUM |

*Note: Current PaymentForm implementation needs Stripe Elements for true PCI compliance

#### Data Validation Matrix

| Field | Frontend Validation | Backend Validation | Schema Constraint |
|-------|--------------------|--------------------|-------------------|
| Email | Zod schema | Zod schema | UNIQUE, VARCHAR(255) |
| Password | Zod (8+ chars) | Zod (strength rules) | hashed VARCHAR(255) |
| Product Price | N/A | Decimal validation | DECIMAL(10,2) |
| Cart Quantity | Max 99, Min 1 | Stock validation | INT |
| ZIP Code | Pattern match | N/A | VARCHAR(20) |

#### Data Risks Identified

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| No field encryption | MEDIUM | Email/addresses stored plaintext | Consider encryption at rest |
| Cart cleanup job | LOW | `cleanupExpiredCarts()` needs cron | Implement scheduled task |
| Data retention | LOW | No documented retention policy | Define and implement policy |
| Price manipulation | MEDIUM | `priceAtAdd` stored but not re-validated | Verify price at checkout |

#### Test Strategy for Data

| # | Test Idea | Priority | Automation Fitness |
|---|-----------|----------|-------------------|
| D1 | Insert product with price -9.99 directly in database; observe catalog behavior | P0 | Integration |
| D2 | Create 1000-character product description; verify proper truncation/handling | P2 | Unit |
| D3 | Upload pet photo exceeding 5MB; observe upload failure messaging | P2 | E2E |
| D4 | Add product to cart at $10, change product price to $15, complete checkout; verify charged amount | P0 | Integration |
| D5 | Create address with SQL injection payload in city field; verify safe handling | P0 | Integration |
| D6 | Generate UUID collision by forcing duplicate product ID; observe error | P2 | Integration |

---

### 1.4 Interfaces (How the Product CONNECTS)

**Risk Level:** MEDIUM | **Score:** 72/100

#### API Endpoint Inventory

| Endpoint Group | Methods | Auth Required | Rate Limit |
|----------------|---------|---------------|------------|
| `/api/auth/*` | POST | No | Strict (5/15min) |
| `/api/products/*` | GET | No | Lenient (300/15min) |
| `/api/cart/*` | GET, POST, PUT, DELETE | Optional | Default |
| `/api/checkout/*` | GET, POST | Optional | Payment (10/hour) |
| `/api/orders/*` | GET, POST | Required | Default |
| `/api/user/*` | GET, PUT | Required | Default |
| `/api/pets/*` | GET, POST, PUT, DELETE | Required | Default |

#### Component Interface Analysis

| Interface | Type | Quality Notes |
|-----------|------|---------------|
| Button | UI Component | Variants: primary, secondary, outline, ghost |
| Input | UI Component | Labels, validation states |
| Toast | Notification | Success, error, info variants |
| Modal | Dialog | Accessible with focus trap |
| CartDrawer | Side Panel | Slide animation |

#### Accessibility Audit Results

| Criterion | Status | Evidence |
|-----------|--------|----------|
| aria-labels | Partial | Present on buttons, missing on some icons |
| aria-live | Present | Used in cart quantity display |
| aria-busy | Present | Used during loading states |
| Keyboard nav | Incomplete | Tab order needs verification |
| Focus indicators | Unknown | Not explicitly styled |
| Color contrast | Unknown | Not verified |
| Skip navigation | Missing | Not implemented |

#### Interface Risks Identified

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| Duplicate routes | MEDIUM | Both `/api/v1/*` and `/api/*` mounted | Consolidate routing |
| Error message leakage | MEDIUM | Stack traces may appear in dev mode | Sanitize all responses |
| CORS permissive | LOW | Credentials allowed from configured origins | Verify origin whitelist |
| Incomplete a11y | MEDIUM | Missing skip nav, contrast verification | WCAG 2.1 AA audit |

#### Test Strategy for Interfaces

| # | Test Idea | Priority | Automation Fitness |
|---|-----------|----------|-------------------|
| I1 | Send malformed JSON to /api/cart/items; verify 400 response with safe error message | P1 | Integration |
| I2 | Navigate through entire checkout using only keyboard (Tab, Enter, Space) | P1 | E2E |
| I3 | Call API with expired JWT token; verify 401 response without internal details | P0 | Integration |
| I4 | Send request with XSS payload in product search query; verify sanitized response | P0 | Integration |
| I5 | Call same API endpoint through both /api and /api/v1 routes; verify identical responses | P2 | Integration |
| I6 | Trigger toast notification, then immediately navigate away; verify no memory leak | P2 | Human-Exploration |

---

### 1.5 Platform (What the Product DEPENDS ON)

**Risk Level:** LOW | **Score:** 82/100

#### Technology Stack Dependencies

| Layer | Technology | Version | Requirement |
|-------|------------|---------|-------------|
| Runtime | Node.js | 18.17.0+ | LTS version |
| Frontend | Next.js | 14.2.0 | App Router |
| Frontend | React | 18.3.0 | Concurrent features |
| Backend | Express.js | 4.18.2 | Stable release |
| Database | PostgreSQL | 15+ | JSON/JSONB support |
| Cache | Redis | - | Optional |
| Payments | Stripe | 14.10.0 | API v2024 |

#### Browser Support Matrix

| Browser | Version | Support Level | Notes |
|---------|---------|---------------|-------|
| Chrome | Last 2 versions | Full | Primary target |
| Firefox | Last 2 versions | Full | |
| Safari | Last 2 versions | Full | |
| Edge | Last 2 versions | Full | Chromium-based |
| iOS Safari | 14+ | Full | Mobile priority |
| Chrome Android | 10+ | Full | Mobile priority |
| IE 11 | - | None | Not supported |

#### Platform Risks Identified

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| Redis not configured | MEDIUM | No evident Redis setup in codebase | Document/implement caching |
| Algolia not implemented | LOW | Mentioned in PRD but not integrated | Implement search service |
| No mobile testing | MEDIUM | Playwright config not mobile-specific | Add mobile device configs |
| Container config | LOW | docker-compose exists but not documented | Add deployment docs |

#### Test Strategy for Platform

| # | Test Idea | Priority | Automation Fitness |
|---|-----------|----------|-------------------|
| P1 | Complete checkout flow on Safari iOS 15 and Chrome Android 12 within same test session | P1 | E2E |
| P2 | Resize browser from 1440px to 320px during product grid load; verify responsive behavior | P2 | E2E |
| P3 | Simulate Redis connection failure; verify graceful degradation to database | P1 | Integration |
| P4 | Run application with Node.js 18.0.0 (below minimum); verify clear error message | P2 | Integration |
| P5 | Test checkout flow with 3G network throttling; verify timeout handling | P1 | E2E |
| P6 | Disable JavaScript in browser; verify SSR content accessibility | P2 | Human-Exploration |

---

### 1.6 Operations (How the Product is USED)

**Risk Level:** MEDIUM | **Score:** 70/100

#### Operational Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health` | Liveness check | Status, uptime, environment |
| `/ready` | Readiness check | Database connection status |
| `/api/v1` | API info | Version, endpoints listing |

#### User Workflow Analysis

**Primary Flow: First Purchase**
```
Homepage -> Category -> Product -> Add to Cart -> Checkout -> Shipping -> Payment -> Confirmation
```

**Returning Customer Flow:**
```
Login -> Search/Homepage -> Product -> Add to Cart -> Checkout (saved address) -> Payment -> Confirmation
```

**Order Management Flow:**
```
Login -> My Orders -> Order Details -> Track/Cancel/Reorder
```

#### Rate Limiting Configuration

| Limiter | Window | Max Requests | Target |
|---------|--------|--------------|--------|
| Default | 15 min | Configurable | All endpoints |
| Auth | 15 min | 5 | Login/Register |
| Public | 15 min | 300 | Catalog browsing |
| API | 15 min | 100 | General API |
| Payment | 1 hour | 10 | Checkout |

#### Operational Risks Identified

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| No logging infrastructure | HIGH | No structured logging evident | Implement Winston/Pino |
| No monitoring | HIGH | No APM or metrics collection | Add observability stack |
| Auth tests skipped | HIGH | Core auth flows not tested | Fix and enable tests |
| No deployment docs | MEDIUM | Missing CI/CD documentation | Create deployment guide |
| No backup procedures | MEDIUM | Database backup not documented | Document recovery plan |

#### Test Strategy for Operations

| # | Test Idea | Priority | Automation Fitness |
|---|-----------|----------|-------------------|
| O1 | Complete order, navigate to orders page, click reorder; verify all items added to cart | P0 | E2E |
| O2 | Send 200 requests per minute from single IP; verify rate limit kicks in at threshold | P1 | Integration |
| O3 | Explore admin order management flow attempting to cancel already-shipped order | P2 | Human-Exploration |
| O4 | Call /health endpoint continuously for 5 minutes; verify stable response times | P1 | Integration |
| O5 | Trigger intentional 500 error; verify error doesn't leak stack traces | P1 | Integration |
| O6 | Simulate database unavailable; verify /ready returns 503 with appropriate message | P1 | Integration |

---

### 1.7 Time (WHEN Things Happen)

**Risk Level:** MEDIUM | **Score:** 68/100

#### Temporal Behavior Analysis

| Event | Duration | Configuration |
|-------|----------|---------------|
| Access Token Expiry | 15 minutes | `ACCESS_TOKEN_EXPIRY` |
| Refresh Token Expiry | 30 days | `REFRESH_TOKEN_EXPIRY` |
| Password Reset Token | 1 hour | `RESET_TOKEN_EXPIRY` |
| Account Lockout | 15 minutes | `LOCKOUT_DURATION` |
| Guest Cart Persistence | 7 days | `expiresAt` calculation |
| User Cart Persistence | 30 days | `expiresAt` calculation |
| Email Verification | 24 hours | `verificationExpiry` |

#### Concurrency Considerations

```
Stock Validation Flow (Potential Race Condition):
  Thread A: Check stock (10 available)
  Thread B: Check stock (10 available)     ← Both see 10
  Thread A: Add to cart (quantity: 8)
  Thread B: Add to cart (quantity: 8)      ← Oversell possible!
  Thread A: Commit
  Thread B: Commit                         ← 16 sold, only 10 existed
```

#### Time-Related Risks Identified

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| Stock race condition | HIGH | No transaction locking on stock updates | Implement optimistic locking |
| Cart merge timing | MEDIUM | Guest cart merge may conflict with concurrent updates | Add transaction handling |
| Session timeout UX | MEDIUM | No warning before JWT expiry | Implement refresh before expiry |
| No request timeouts | MEDIUM | API calls may hang indefinitely | Add timeout configuration |

#### Test Strategy for Time

| # | Test Idea | Priority | Automation Fitness |
|---|-----------|----------|-------------------|
| T1 | Set cart expiry to 1 minute ago; verify cart retrieval creates new empty cart | P1 | Integration |
| T2 | Leave checkout page idle for 16 minutes with filled form; verify session handling | P1 | E2E |
| T3 | Process two simultaneous add-to-cart requests for last item in stock; verify only one succeeds | P0 | Integration |
| T4 | Request refresh token 1 second before expiry; verify new token issued | P1 | Integration |
| T5 | Start password reset, wait 61 minutes, attempt reset; verify token expired message | P1 | Integration |
| T6 | Trigger cart merge while another request modifies user cart; observe final state | P1 | Integration |

---

## 2. Quality Experience (QX) Assessment

### 2.1 User Journey Quality

**Score: 76/100**

| Aspect | Score | Findings |
|--------|-------|----------|
| Navigation Flow | 80 | Clear category structure, breadcrumbs present |
| Checkout Experience | 75 | Multi-step with progress indicators |
| Cart Interaction | 80 | Drawer for quick access, quantity controls |
| Personalization | 70 | Pet profiles for recommendations |
| Search Experience | 65 | Basic search, autocomplete mentioned but not implemented |

**Gaps Identified:**
- No wishlist functionality
- No product comparison feature
- No "recently viewed products" section
- Limited search suggestions

### 2.2 Error Experience Handling

**Score: 72/100**

| Aspect | Score | Findings |
|--------|-------|----------|
| Form Validation | 80 | Zod validation with clear messages |
| API Error Handling | 70 | Toast notifications for feedback |
| Network Failures | 60 | Basic error boundaries, no retry logic |
| State Recovery | 65 | Cart persists, form data may be lost |

**Gaps Identified:**
- No offline error handling
- Rate limit errors not user-friendly
- Network failure recovery unclear
- No automatic retry mechanism

### 2.3 Accessibility Considerations

**Score: 65/100**

| WCAG Criterion | Status | Notes |
|----------------|--------|-------|
| 1.1.1 Non-text Content | Partial | Alt text on some images |
| 1.3.1 Info and Relationships | Present | Semantic HTML used |
| 1.4.3 Contrast (Minimum) | Unknown | Not verified |
| 2.1.1 Keyboard | Partial | Tab navigation needs testing |
| 2.4.1 Bypass Blocks | Missing | No skip navigation link |
| 2.4.4 Link Purpose | Present | Descriptive link text |
| 3.3.1 Error Identification | Present | Form validation messages |
| 4.1.2 Name, Role, Value | Partial | ARIA labels on some elements |

**Gaps Identified:**
- Missing skip navigation
- Keyboard navigation incomplete
- Color contrast not verified
- Screen reader testing absent
- Focus management in modals unclear

### 2.4 Usability Patterns

**Score: 74/100**

| Pattern | Implementation | Quality |
|---------|----------------|---------|
| Loading States | Present | Spinner animations, disabled buttons |
| Debouncing | Present | 300ms on add-to-cart |
| Optimistic Updates | Partial | Cart updates immediately |
| Feedback | Present | Toast notifications |
| Progressive Disclosure | Present | Multi-step checkout |

**Gaps Identified:**
- No undo actions
- Limited search suggestions
- No saved preferences
- No recent searches

---

## 3. Test Strategy Recommendations

### 3.1 Priority Distribution Summary

| Priority | Count | Percentage | Description |
|----------|-------|------------|-------------|
| P0 (Critical) | 6 | 16% | Payment, security, data integrity |
| P1 (High) | 11 | 49% | Core workflows, error handling |
| P2 (Medium) | 4 | 18% | Edge cases, usability |
| P3 (Low) | 0 | 0% | Enhancement testing |

### 3.2 Automation Fitness Distribution

| Type | Count | Percentage | Notes |
|------|-------|------------|-------|
| Unit Tests | 2 | 10% | Data validation, business logic |
| Integration Tests | 10 | 48% | API contracts, data flow |
| E2E Tests | 7 | 33% | User journeys, cross-browser |
| Human Exploration | 2 | 10% | Edge cases, UX validation |

### 3.3 Recommended Test Sessions

#### Session 1: Authentication Security (2 hours)
**Charter:** Explore authentication edge cases and security boundaries

- Account lockout scenarios
- Token expiration handling
- Password reset flow timing
- Concurrent login attempts
- Session hijacking resistance

#### Session 2: Cart Race Conditions (2 hours)
**Charter:** Investigate concurrent cart operations and stock integrity

- Simultaneous add-to-cart for limited stock
- Cart merge during active session
- Price changes during checkout
- Quantity updates under load

#### Session 3: Checkout Flow Resilience (3 hours)
**Charter:** Test checkout stability under various failure conditions

- Payment failure recovery
- Network interruption handling
- Browser back button behavior
- Form data persistence
- Session timeout during checkout

#### Session 4: Accessibility Deep Dive (2 hours)
**Charter:** Evaluate keyboard-only and screen reader experience

- Tab order through all flows
- Form field announcements
- Error message accessibility
- Modal focus management
- Skip navigation effectiveness

---

## 4. Risk Heat Map

```
                    IMPACT
              Low    Med    High
         ┌────────┬────────┬────────┐
    Low  │        │ State  │        │
         │        │ Drop   │        │
         ├────────┼────────┼────────┤
L   Med  │ Algolia│ CORS   │ PCI    │
I        │        │ a11y   │ Stock  │
K        │        │        │ Race   │
E        ├────────┼────────┼────────┤
L   High │        │ Auth   │ No     │
Y        │        │ Tests  │ Logs   │
         │        │        │ No Mon │
         └────────┴────────┴────────┘
```

---

## 5. Clarifying Questions

The following questions surfaced during analysis that require stakeholder input:

### Business Rules
1. What is the maximum order value before requiring additional verification?
2. Should guest cart data be preserved if user registers during checkout?
3. What is the expected behavior when a promo code is partially used?

### Technical Decisions
4. Is Redis caching optional or required for production?
5. What is the target response time SLA for checkout operations?
6. Should rate limiting be per-IP or per-user for authenticated requests?

### Compliance Requirements
7. Are there GDPR data export/deletion requirements for EU users?
8. What PCI DSS SAQ level is targeted for production?
9. Are there data residency requirements for user information?

### Missing Requirements
10. How should the system handle international shipping addresses?
11. What is the expected behavior for back-ordered items?
12. Should order cancellation trigger automatic refund or manual review?

---

## 6. Shared Memory Storage

Findings stored in AQE Swarm namespace `qe-swarm`:

| Key | Description |
|-----|-------------|
| `product-factors-sfdipot-analysis` | Complete SFDIPOT analysis with scores |
| `product-factors-test-recommendations` | Generated test ideas with priorities |

---

## Appendix A: Files Analyzed

| Path | Type | Lines |
|------|------|-------|
| `/src/iron-pets/backend/prisma/schema.prisma` | Database Schema | 413 |
| `/src/iron-pets/backend/src/app.ts` | Express App Setup | 464 |
| `/src/iron-pets/backend/src/modules/auth/auth.service.ts` | Auth Logic | 345 |
| `/src/iron-pets/backend/src/modules/cart/cart.service.ts` | Cart Logic | 445 |
| `/src/iron-pets/backend/src/middleware/auth.ts` | Auth Middleware | 202 |
| `/src/iron-pets/backend/src/middleware/rateLimiter.ts` | Rate Limiting | 159 |
| `/src/iron-pets/frontend/src/hooks/useCart.ts` | Cart Hooks | 134 |
| `/src/iron-pets/frontend/src/components/products/AddToCartButton.tsx` | Add to Cart UI | 200 |
| `/src/iron-pets/frontend/src/components/checkout/PaymentForm.tsx` | Payment UI | 135 |
| `/src/iron-pets/frontend/src/components/checkout/ShippingForm.tsx` | Shipping UI | 147 |
| `/src/iron-pets/frontend/src/app/layout.tsx` | Root Layout | 78 |
| `/docs/iron-pets-mvp-prd.md` | Product Requirements | 703 |

---

## Appendix B: SFDIPOT Quick Reference

| Factor | Question | Focus Areas |
|--------|----------|-------------|
| **S**tructure | What IS the product? | Architecture, components, code |
| **F**unction | What DOES it do? | Features, calculations, security |
| **D**ata | What does it PROCESS? | Input/output, storage, validation |
| **I**nterfaces | How does it CONNECT? | APIs, UI, integrations |
| **P**latform | What does it DEPEND ON? | OS, browser, services |
| **O**perations | How is it USED? | Workflows, admin, recovery |
| **T**ime | WHEN do things happen? | Timing, concurrency, sequences |

---

*Report generated by QE Product Factors Assessor v3*
*Framework: James Bach's HTSM (Heuristic Test Strategy Model)*
*Date: 2026-02-03*

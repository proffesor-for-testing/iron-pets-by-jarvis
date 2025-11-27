# Software Requirements Specification (SRS)
## Iron Pets - Pet Store Web Application (MVP)

**Document Version:** 1.0
**Date:** November 26, 2025
**Status:** Draft
**Document ID:** IP-SRS-001
**Based On:** Iron Pets MVP PRD v1.0

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Data Requirements](#5-data-requirements)
6. [External Interface Requirements](#6-external-interface-requirements)
7. [System Features](#7-system-features)
8. [Appendices](#8-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the software requirements for the Iron Pets MVP e-commerce platform. It is intended for use by:

- **Development Team:** To understand what needs to be built
- **QA Team:** To create test cases and validation criteria
- **Project Managers:** To track progress against requirements
- **Stakeholders:** To validate that requirements meet business needs

### 1.2 Scope

**Product Name:** Iron Pets
**Product Type:** E-commerce Web Application
**Version:** MVP (Minimum Viable Product)

**System Boundaries:**

The Iron Pets MVP system includes:
- Customer-facing web application
- Backend API services
- Database and data storage
- Integration with third-party services (payments, shipping, email)

The system does NOT include (deferred to post-MVP):
- Mobile applications (iOS/Android)
- Admin dashboard (use database tools for MVP)
- Subscription management
- Loyalty/rewards program
- Adoption services
- Vet appointment booking

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| GMV | Gross Merchandise Volume |
| JWT | JSON Web Token |
| MVP | Minimum Viable Product |
| PCI DSS | Payment Card Industry Data Security Standard |
| REST | Representational State Transfer |
| SKU | Stock Keeping Unit |
| SRS | Software Requirements Specification |
| SSL/TLS | Secure Sockets Layer / Transport Layer Security |
| UI | User Interface |
| UX | User Experience |
| WCAG | Web Content Accessibility Guidelines |

### 1.4 References

| Document | Version | Description |
|----------|---------|-------------|
| Iron Pets MVP PRD | 1.0 | Product Requirements Document |
| Iron Pets PDR | 1.0 | Product Design Requirements |
| IEEE 830-1998 | - | IEEE Standard for SRS |

### 1.5 Document Overview

- **Section 2:** System overview, user classes, constraints, assumptions
- **Section 3:** Detailed functional requirements
- **Section 4:** Non-functional requirements (performance, security, etc.)
- **Section 5:** Data requirements and models
- **Section 6:** External interface specifications
- **Section 7:** System feature summaries
- **Section 8:** Appendices and traceability

---

## 2. Overall Description

### 2.1 Product Perspective

Iron Pets MVP is a standalone e-commerce web application that enables customers to browse, search, and purchase pet supplies online. The system integrates with external services for payment processing, shipping, and email notifications.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Iron Pets System                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Browser   │  │   Browser   │  │        Browser          │ │
│  │  (Desktop)  │  │  (Mobile)   │  │        (Tablet)         │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                     │                │
│         └────────────────┼─────────────────────┘                │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    CDN (CloudFront)                        │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Load Balancer (AWS ALB)                       │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐            │
│         ▼                    ▼                    ▼            │
│  ┌─────────────┐     ┌─────────────┐      ┌─────────────┐     │
│  │  App Server │     │  App Server │      │  App Server │     │
│  │   (ECS)     │     │   (ECS)     │      │   (ECS)     │     │
│  └──────┬──────┘     └──────┬──────┘      └──────┬──────┘     │
│         │                   │                    │             │
│         └───────────────────┼────────────────────┘             │
│                             │                                   │
│         ┌───────────────────┼───────────────────┐              │
│         ▼                   ▼                   ▼              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │  PostgreSQL │     │    Redis    │     │     S3      │      │
│  │    (RDS)    │     │ (ElastiCache)│    │  (Images)   │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Stripe    │       │   Algolia   │       │  SendGrid   │
│  (Payments) │       │  (Search)   │       │   (Email)   │
└─────────────┘       └─────────────┘       └─────────────┘
```

### 2.2 Product Functions

The Iron Pets MVP provides the following high-level functions:

| Function ID | Function Name | Description |
|-------------|---------------|-------------|
| F1 | User Management | Registration, authentication, profile management |
| F2 | Product Browsing | Category navigation, product viewing |
| F3 | Product Search | Search and filter products |
| F4 | Shopping Cart | Cart management and persistence |
| F5 | Checkout | Order placement and payment |
| F6 | Order Management | Order tracking and history |
| F7 | Pet Profiles | Pet information management |

### 2.3 User Classes and Characteristics

#### 2.3.1 Guest User
- **Description:** Unregistered visitor browsing the site
- **Permissions:** Browse products, search, add to cart, guest checkout
- **Frequency:** High (majority of initial traffic)
- **Technical Expertise:** Low to Medium

#### 2.3.2 Registered Customer
- **Description:** User with a verified account
- **Permissions:** All guest permissions + saved addresses, order history, pet profiles
- **Frequency:** Medium (target for conversion)
- **Technical Expertise:** Low to Medium

#### 2.3.3 System Administrator
- **Description:** Technical staff managing the system
- **Permissions:** Database access, server management (no UI in MVP)
- **Frequency:** Low
- **Technical Expertise:** High

### 2.4 Operating Environment

#### 2.4.1 Client Environment

| Requirement | Specification |
|-------------|---------------|
| Browsers | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Mobile Browsers | iOS Safari 14+, Chrome Android 90+ |
| JavaScript | Required (ES2020+) |
| Cookies | Required |
| Screen Resolution | Minimum 320px width |

#### 2.4.2 Server Environment

| Component | Specification |
|-----------|---------------|
| Runtime | Node.js 20 LTS |
| Framework | Express.js 4.x / Next.js 14.x |
| Database | PostgreSQL 15+ |
| Cache | Redis 7+ |
| Cloud | AWS (ECS, RDS, ElastiCache, S3, CloudFront) |

### 2.5 Design and Implementation Constraints

| Constraint ID | Constraint | Rationale |
|---------------|------------|-----------|
| C1 | Must use HTTPS for all communications | Security requirement |
| C2 | Must be PCI DSS compliant for payments | Legal requirement |
| C3 | Must not store raw credit card data | Security/Compliance |
| C4 | Must support mobile-first responsive design | 60%+ mobile traffic |
| C5 | Must use RESTful API architecture | Team expertise |
| C6 | Must complete development in 12 weeks | Business timeline |
| C7 | Budget constraint: Infrastructure < $2K/month initially | Financial |

### 2.6 Assumptions and Dependencies

#### Assumptions

| ID | Assumption |
|----|------------|
| A1 | Users have modern web browsers with JavaScript enabled |
| A2 | Users have reliable internet connectivity |
| A3 | Product data will be available from suppliers |
| A4 | Payment processor (Stripe) maintains 99.99% uptime |
| A5 | Email delivery via SendGrid is reliable |

#### Dependencies

| ID | Dependency | Impact if Unavailable |
|----|------------|----------------------|
| D1 | Stripe API | Cannot process payments |
| D2 | Algolia Search | Fallback to basic DB search |
| D3 | SendGrid | Emails queued, delayed delivery |
| D4 | Shippo API | Manual shipping rate entry |
| D5 | AWS Services | Complete system outage |

---

## 3. Functional Requirements

### 3.1 User Authentication Module (AUTH)

#### REQ-AUTH-001: User Registration
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.1

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow new users to create an account using email and password |
| Input | Email address, password, password confirmation |
| Output | User account created, verification email sent |
| Pre-conditions | User is not logged in, email is not already registered |
| Post-conditions | Account created in pending status, verification email sent |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-AUTH-001.1 | System shall validate email format (RFC 5322 compliant) |
| REQ-AUTH-001.2 | System shall require password minimum 8 characters |
| REQ-AUTH-001.3 | System shall require password to contain: uppercase, lowercase, number |
| REQ-AUTH-001.4 | System shall hash passwords using bcrypt (cost factor 12) |
| REQ-AUTH-001.5 | System shall send verification email within 2 minutes of registration |
| REQ-AUTH-001.6 | System shall reject duplicate email addresses with appropriate error |
| REQ-AUTH-001.7 | Verification links shall expire after 24 hours |

**Acceptance Criteria:**
```gherkin
Scenario: Successful user registration
  Given I am on the registration page
  And I am not logged in
  When I enter a valid email "user@example.com"
  And I enter password "SecurePass1"
  And I confirm the password
  And I click "Create Account"
  Then I should see "Verification email sent"
  And I should receive an email within 2 minutes
  And clicking the verification link should activate my account

Scenario: Registration with existing email
  Given "user@example.com" is already registered
  When I try to register with "user@example.com"
  Then I should see error "Email already registered"
  And no account should be created

Scenario: Registration with weak password
  When I enter password "weak"
  Then I should see password strength indicator
  And I should see error "Password must be at least 8 characters"
```

---

#### REQ-AUTH-002: User Login
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.1

| Attribute | Value |
|-----------|-------|
| Description | The system shall authenticate users with email and password |
| Input | Email address, password |
| Output | JWT access token, refresh token, user session created |
| Pre-conditions | User has verified account |
| Post-conditions | User is logged in, session established |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-AUTH-002.1 | System shall issue JWT access token (15-minute expiry) |
| REQ-AUTH-002.2 | System shall issue refresh token (30-day expiry) |
| REQ-AUTH-002.3 | System shall lock account after 5 failed login attempts (30-minute lockout) |
| REQ-AUTH-002.4 | System shall log all login attempts (success/failure) |
| REQ-AUTH-002.5 | System shall set secure, HttpOnly cookies for tokens |
| REQ-AUTH-002.6 | System shall merge guest cart with user cart on login |

**Acceptance Criteria:**
```gherkin
Scenario: Successful login
  Given I have a verified account
  When I enter correct email and password
  And I click "Sign In"
  Then I should be redirected to homepage
  And I should see my name in the header
  And my session should persist for 30 days

Scenario: Failed login - wrong password
  Given I have a verified account
  When I enter correct email but wrong password
  Then I should see error "Invalid email or password"
  And I should remain on login page

Scenario: Account lockout
  Given I have failed login 5 times
  When I try to login again
  Then I should see error "Account locked. Try again in 30 minutes"
```

---

#### REQ-AUTH-003: Password Reset
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.1

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to reset forgotten passwords |
| Input | Email address (request), reset token + new password (reset) |
| Output | Password reset email sent, password updated |
| Pre-conditions | Email is registered in system |
| Post-conditions | Password updated, all existing sessions invalidated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-AUTH-003.1 | System shall send reset email within 2 minutes |
| REQ-AUTH-003.2 | Reset token shall expire after 1 hour |
| REQ-AUTH-003.3 | Reset token shall be single-use |
| REQ-AUTH-003.4 | System shall invalidate all existing sessions on password reset |
| REQ-AUTH-003.5 | System shall not reveal if email exists (security) |

**Acceptance Criteria:**
```gherkin
Scenario: Request password reset
  Given I have a registered account
  When I click "Forgot Password"
  And I enter my email address
  Then I should see "If account exists, reset email sent"
  And I should receive reset email within 2 minutes

Scenario: Reset password with valid token
  Given I have a valid reset token
  When I click the reset link
  And I enter new password "NewSecure1"
  Then my password should be updated
  And I should be redirected to login page
  And all my other sessions should be logged out
```

---

#### REQ-AUTH-004: User Logout
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.1

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to terminate their session |
| Input | Logout request (authenticated) |
| Output | Session terminated, tokens invalidated |
| Pre-conditions | User is logged in |
| Post-conditions | Session ended, cookies cleared |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-AUTH-004.1 | System shall invalidate refresh token on logout |
| REQ-AUTH-004.2 | System shall clear all authentication cookies |
| REQ-AUTH-004.3 | System shall preserve cart items (as guest cart) |
| REQ-AUTH-004.4 | System shall redirect to homepage after logout |

---

#### REQ-AUTH-005: Session Management
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.1

| Attribute | Value |
|-----------|-------|
| Description | The system shall manage user sessions securely |
| Input | JWT tokens in requests |
| Output | Authenticated/unauthenticated response |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-AUTH-005.1 | Access tokens shall auto-refresh using refresh token |
| REQ-AUTH-005.2 | Sessions shall persist across browser restarts (30 days) |
| REQ-AUTH-005.3 | System shall detect and reject tampered tokens |
| REQ-AUTH-005.4 | System shall track last activity timestamp |

---

### 3.2 Product Catalog Module (CAT)

#### REQ-CAT-001: Category Navigation
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.2

| Attribute | Value |
|-----------|-------|
| Description | The system shall display hierarchical product categories |
| Input | Navigation menu interaction |
| Output | Category listing page with products |
| Pre-conditions | None |
| Post-conditions | User views category products |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CAT-001.1 | System shall display primary categories: Dogs, Cats, Small Pets |
| REQ-CAT-001.2 | System shall display subcategories: Food, Treats, Toys (per species) |
| REQ-CAT-001.3 | System shall show product count per category |
| REQ-CAT-001.4 | System shall support breadcrumb navigation |
| REQ-CAT-001.5 | Category pages shall load within 2 seconds |

**Category Structure:**
```
Dogs
├── Food (100+ products)
├── Treats (50+ products)
└── Toys (50+ products)

Cats
├── Food (100+ products)
├── Treats (50+ products)
└── Toys (50+ products)

Small Pets
├── Food (50+ products)
└── Bedding (50+ products)
```

---

#### REQ-CAT-002: Product Listing Page (PLP)
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.2

| Attribute | Value |
|-----------|-------|
| Description | The system shall display products in a grid/list format |
| Input | Category selection, pagination parameters |
| Output | Paginated product grid with key information |
| Pre-conditions | Category exists and has products |
| Post-conditions | Products displayed with pagination |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CAT-002.1 | System shall display 24 products per page (default) |
| REQ-CAT-002.2 | Each product card shall show: image, name, price, rating |
| REQ-CAT-002.3 | System shall show "Sale" badge if compare_price > price |
| REQ-CAT-002.4 | System shall show stock status (In Stock, Low Stock, Out of Stock) |
| REQ-CAT-002.5 | System shall support infinite scroll or pagination |
| REQ-CAT-002.6 | System shall allow "Quick Add to Cart" from PLP |

**Product Card Data:**
```typescript
interface ProductCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  comparePrice?: number;
  averageRating: number;
  reviewCount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  brand: string;
}
```

---

#### REQ-CAT-003: Product Detail Page (PDP)
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.2

| Attribute | Value |
|-----------|-------|
| Description | The system shall display complete product information |
| Input | Product slug/ID |
| Output | Full product details with purchase options |
| Pre-conditions | Product exists and is active |
| Post-conditions | Product details displayed |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CAT-003.1 | System shall display 3-5 product images with zoom capability |
| REQ-CAT-003.2 | System shall display product name, price, description |
| REQ-CAT-003.3 | System shall display specifications (size, weight, ingredients) |
| REQ-CAT-003.4 | System shall display stock availability |
| REQ-CAT-003.5 | System shall provide quantity selector (1-10, max stock) |
| REQ-CAT-003.6 | System shall display "Add to Cart" button |
| REQ-CAT-003.7 | System shall display average rating and review count |
| REQ-CAT-003.8 | System shall display brand name with link to brand page |
| REQ-CAT-003.9 | System shall display "Related Products" section (4-8 items) |
| REQ-CAT-003.10 | System shall display breadcrumb navigation |

**Product Detail Data:**
```typescript
interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  images: ProductImage[];
  specifications: Record<string, string>;
  brand: Brand;
  category: Category;
  averageRating: number;
  reviewCount: number;
  relatedProducts: ProductCard[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Acceptance Criteria:**
```gherkin
Scenario: View product details
  Given product "Royal Canin Adult Dog Food" exists
  When I navigate to the product page
  Then I should see product name "Royal Canin Adult Dog Food"
  And I should see at least 3 product images
  And I should see the price
  And I should see "Add to Cart" button
  And I should see related products section

Scenario: Product out of stock
  Given product is out of stock
  When I view the product page
  Then I should see "Out of Stock" message
  And "Add to Cart" button should be disabled
  And I should see "Notify When Available" option
```

---

### 3.3 Search Module (SRCH)

#### REQ-SRCH-001: Product Search
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.3

| Attribute | Value |
|-----------|-------|
| Description | The system shall provide full-text product search |
| Input | Search query string |
| Output | Ranked list of matching products |
| Pre-conditions | Search index is populated |
| Post-conditions | Search results displayed |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SRCH-001.1 | System shall search product name, description, brand, category |
| REQ-SRCH-001.2 | System shall return results within 500ms |
| REQ-SRCH-001.3 | System shall handle typos and misspellings |
| REQ-SRCH-001.4 | System shall rank results by relevance |
| REQ-SRCH-001.5 | System shall display "No results found" for zero matches |
| REQ-SRCH-001.6 | System shall suggest alternatives for zero-result queries |

---

#### REQ-SRCH-002: Search Autocomplete
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.3

| Attribute | Value |
|-----------|-------|
| Description | The system shall provide real-time search suggestions |
| Input | Partial search query (minimum 2 characters) |
| Output | List of suggested products/categories |
| Pre-conditions | User is typing in search bar |
| Post-conditions | Suggestions displayed in dropdown |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SRCH-002.1 | Suggestions shall appear within 200ms |
| REQ-SRCH-002.2 | System shall show up to 8 suggestions |
| REQ-SRCH-002.3 | Suggestions shall include product name and image |
| REQ-SRCH-002.4 | User shall navigate suggestions with keyboard |
| REQ-SRCH-002.5 | Clicking suggestion shall navigate to product/search |

---

#### REQ-SRCH-003: Search Filters
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.3

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to filter search results |
| Input | Filter selections |
| Output | Filtered product list |
| Pre-conditions | Search results exist |
| Post-conditions | Results filtered, counts updated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SRCH-003.1 | System shall filter by price range (slider) |
| REQ-SRCH-003.2 | System shall filter by brand (multi-select checkboxes) |
| REQ-SRCH-003.3 | System shall filter by rating (3+ stars, 4+ stars) |
| REQ-SRCH-003.4 | System shall filter by availability (In Stock only) |
| REQ-SRCH-003.5 | Filters shall update results without page reload |
| REQ-SRCH-003.6 | System shall show product count for each filter value |
| REQ-SRCH-003.7 | System shall allow clearing all filters |

**Filter Configuration:**
```typescript
interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  brands?: string[];
  minRating?: number;
  inStockOnly?: boolean;
}
```

---

#### REQ-SRCH-004: Search Sorting
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.3

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to sort search results |
| Input | Sort selection |
| Output | Reordered product list |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SRCH-004.1 | Default sort shall be "Relevance" |
| REQ-SRCH-004.2 | System shall support "Price: Low to High" |
| REQ-SRCH-004.3 | System shall support "Price: High to Low" |
| REQ-SRCH-004.4 | System shall support "Rating" (highest first) |
| REQ-SRCH-004.5 | System shall support "Newest" |

---

### 3.4 Shopping Cart Module (CART)

#### REQ-CART-001: Add to Cart
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.4

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow adding products to shopping cart |
| Input | Product ID, quantity |
| Output | Cart updated, confirmation shown |
| Pre-conditions | Product is in stock |
| Post-conditions | Item added to cart, cart total updated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CART-001.1 | System shall validate stock availability before adding |
| REQ-CART-001.2 | System shall show confirmation message on add |
| REQ-CART-001.3 | System shall update cart icon with item count |
| REQ-CART-001.4 | System shall prevent adding more than available stock |
| REQ-CART-001.5 | If item exists in cart, system shall increment quantity |

**Acceptance Criteria:**
```gherkin
Scenario: Add product to cart
  Given product "Dog Food" is in stock with quantity 10
  When I set quantity to 2
  And I click "Add to Cart"
  Then I should see confirmation "Added to cart"
  And cart icon should show "2"
  And cart total should include the product price × 2

Scenario: Add to cart - exceeds stock
  Given product has 5 items in stock
  And I already have 4 in my cart
  When I try to add 3 more
  Then I should see error "Only 1 more available"
```

---

#### REQ-CART-002: View Cart
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.4

| Attribute | Value |
|-----------|-------|
| Description | The system shall display shopping cart contents |
| Input | User request (cart page or mini-cart) |
| Output | Cart items with quantities, prices, totals |
| Pre-conditions | None |
| Post-conditions | Cart displayed |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CART-002.1 | System shall display product image, name, price per item |
| REQ-CART-002.2 | System shall display quantity with increment/decrement controls |
| REQ-CART-002.3 | System shall display line total (price × quantity) |
| REQ-CART-002.4 | System shall display cart subtotal |
| REQ-CART-002.5 | System shall display "Remove" option for each item |
| REQ-CART-002.6 | System shall display "Continue Shopping" link |
| REQ-CART-002.7 | System shall display "Proceed to Checkout" button |
| REQ-CART-002.8 | Empty cart shall show message with link to shop |

**Cart Item Data:**
```typescript
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  lineTotal: number;
  stockAvailable: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### REQ-CART-003: Update Cart
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.4

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow updating cart item quantities |
| Input | Cart item ID, new quantity |
| Output | Cart updated |
| Pre-conditions | Item exists in cart |
| Post-conditions | Quantity updated, totals recalculated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CART-003.1 | System shall allow quantity changes via +/- buttons |
| REQ-CART-003.2 | System shall allow direct quantity input |
| REQ-CART-003.3 | System shall validate against available stock |
| REQ-CART-003.4 | System shall recalculate totals in real-time |
| REQ-CART-003.5 | Setting quantity to 0 shall remove item |

---

#### REQ-CART-004: Remove from Cart
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.4

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow removing items from cart |
| Input | Cart item ID |
| Output | Item removed, cart updated |
| Pre-conditions | Item exists in cart |
| Post-conditions | Item removed, totals recalculated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CART-004.1 | System shall show "Remove" link/button for each item |
| REQ-CART-004.2 | System shall show brief "Undo" option (5 seconds) |
| REQ-CART-004.3 | System shall update totals immediately |

---

#### REQ-CART-005: Cart Persistence
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.4

| Attribute | Value |
|-----------|-------|
| Description | The system shall persist cart data across sessions |
| Input | None (automatic) |
| Output | Cart restored on return visit |
| Pre-conditions | User has items in cart |
| Post-conditions | Cart persisted |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CART-005.1 | Guest cart shall persist for 7 days (cookie/localStorage) |
| REQ-CART-005.2 | Registered user cart shall persist for 30 days (database) |
| REQ-CART-005.3 | On login, guest cart shall merge with user cart |
| REQ-CART-005.4 | Merge shall combine quantities (not exceed stock) |
| REQ-CART-005.5 | System shall validate stock on cart restoration |

---

### 3.5 Checkout Module (CHK)

#### REQ-CHK-001: Checkout Initiation
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.5

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to begin checkout process |
| Input | User clicks "Proceed to Checkout" |
| Output | Checkout page displayed |
| Pre-conditions | Cart has items, items are in stock |
| Post-conditions | Checkout process started |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CHK-001.1 | System shall offer guest checkout option |
| REQ-CHK-001.2 | System shall offer login option for returning customers |
| REQ-CHK-001.3 | System shall validate cart stock before proceeding |
| REQ-CHK-001.4 | System shall reserve inventory during checkout (15 min) |
| REQ-CHK-001.5 | System shall display order summary throughout checkout |

---

#### REQ-CHK-002: Shipping Information
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.5

| Attribute | Value |
|-----------|-------|
| Description | The system shall collect shipping address |
| Input | Shipping address form data |
| Output | Address validated and saved |
| Pre-conditions | Checkout initiated |
| Post-conditions | Shipping address captured |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CHK-002.1 | Form shall include: First/Last Name, Address 1 & 2, City, State, ZIP, Phone |
| REQ-CHK-002.2 | System shall validate address format |
| REQ-CHK-002.3 | System shall offer address autocomplete (optional) |
| REQ-CHK-002.4 | Logged-in users shall see saved addresses |
| REQ-CHK-002.5 | System shall allow saving address for future use |
| REQ-CHK-002.6 | All fields except Address 2 shall be required |

**Address Schema:**
```typescript
interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault?: boolean;
}
```

---

#### REQ-CHK-003: Shipping Method Selection
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.5

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow selection of shipping method |
| Input | Selected shipping option |
| Output | Shipping cost applied to order |
| Pre-conditions | Valid shipping address provided |
| Post-conditions | Shipping method selected, cost calculated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CHK-003.1 | System shall offer Standard shipping (5-7 days) - $5.99 |
| REQ-CHK-003.2 | System shall offer Expedited shipping (2-3 days) - $12.99 |
| REQ-CHK-003.3 | System shall offer free Standard shipping for orders $50+ |
| REQ-CHK-003.4 | System shall display estimated delivery dates |
| REQ-CHK-003.5 | Default selection shall be Standard shipping |

**Shipping Options:**
```typescript
interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  freeThreshold?: number;
}

const shippingOptions: ShippingOption[] = [
  { id: 'standard', name: 'Standard', description: '5-7 business days', price: 5.99, freeThreshold: 50 },
  { id: 'expedited', name: 'Expedited', description: '2-3 business days', price: 12.99 }
];
```

---

#### REQ-CHK-004: Payment Processing
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.5

| Attribute | Value |
|-----------|-------|
| Description | The system shall securely process payments |
| Input | Payment method details |
| Output | Payment authorized/captured |
| Pre-conditions | Shipping method selected |
| Post-conditions | Payment processed, order created |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CHK-004.1 | System shall accept Visa, Mastercard, Amex, Discover |
| REQ-CHK-004.2 | System shall accept PayPal |
| REQ-CHK-004.3 | System shall use Stripe for card processing (PCI compliant) |
| REQ-CHK-004.4 | System shall never store raw card data |
| REQ-CHK-004.5 | System shall display secure payment indicators |
| REQ-CHK-004.6 | System shall handle declined cards gracefully |
| REQ-CHK-004.7 | Logged-in users may save card for future use (tokenized) |

**Payment Flow:**
```
1. User enters card details in Stripe Elements (iframe)
2. Stripe tokenizes card data
3. Backend creates PaymentIntent with Stripe
4. Frontend confirms payment with token
5. Stripe processes payment
6. Backend receives webhook confirmation
7. Order marked as paid
```

---

#### REQ-CHK-005: Promo Code Application
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.5

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow applying promotional codes |
| Input | Promo code string |
| Output | Discount applied or error message |
| Pre-conditions | User is at checkout |
| Post-conditions | Valid code applied, totals updated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CHK-005.1 | System shall validate promo code against database |
| REQ-CHK-005.2 | System shall check code expiration date |
| REQ-CHK-005.3 | System shall check usage limits |
| REQ-CHK-005.4 | System shall apply discount (percentage or fixed) |
| REQ-CHK-005.5 | System shall show discount amount applied |
| REQ-CHK-005.6 | System shall allow removing applied code |
| REQ-CHK-005.7 | Only one promo code per order allowed |

---

#### REQ-CHK-006: Order Review
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.5

| Attribute | Value |
|-----------|-------|
| Description | The system shall display order summary for review |
| Input | None (data from previous steps) |
| Output | Complete order summary |
| Pre-conditions | Payment info entered |
| Post-conditions | User reviews and confirms order |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CHK-006.1 | System shall display all cart items with quantities and prices |
| REQ-CHK-006.2 | System shall display subtotal, shipping, tax, discount, total |
| REQ-CHK-006.3 | System shall display shipping address |
| REQ-CHK-006.4 | System shall display shipping method and estimated delivery |
| REQ-CHK-006.5 | System shall display payment method (last 4 digits for cards) |
| REQ-CHK-006.6 | System shall require agreement to Terms and Conditions |
| REQ-CHK-006.7 | System shall display "Place Order" button |

---

#### REQ-CHK-007: Order Confirmation
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.5

| Attribute | Value |
|-----------|-------|
| Description | The system shall confirm successful order placement |
| Input | Order placement request |
| Output | Order created, confirmation displayed and emailed |
| Pre-conditions | Payment authorized |
| Post-conditions | Order in system, inventory updated, email sent |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-CHK-007.1 | System shall create order record in database |
| REQ-CHK-007.2 | System shall generate unique order number |
| REQ-CHK-007.3 | System shall decrement product inventory |
| REQ-CHK-007.4 | System shall clear shopping cart |
| REQ-CHK-007.5 | System shall display confirmation page with order number |
| REQ-CHK-007.6 | System shall send confirmation email within 2 minutes |
| REQ-CHK-007.7 | Email shall include order details and tracking info (when available) |

---

### 3.6 Order Management Module (ORD)

#### REQ-ORD-001: Order History
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.6

| Attribute | Value |
|-----------|-------|
| Description | The system shall display user's order history |
| Input | User accesses "My Orders" |
| Output | List of past orders |
| Pre-conditions | User is logged in |
| Post-conditions | Orders displayed |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-ORD-001.1 | System shall display all orders for logged-in user |
| REQ-ORD-001.2 | Orders shall be sorted by date (newest first) |
| REQ-ORD-001.3 | Each order shall show: order number, date, status, total |
| REQ-ORD-001.4 | System shall support pagination (10 orders per page) |
| REQ-ORD-001.5 | User shall be able to click order for details |

---

#### REQ-ORD-002: Order Detail View
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.6

| Attribute | Value |
|-----------|-------|
| Description | The system shall display detailed order information |
| Input | Order ID |
| Output | Complete order details |
| Pre-conditions | User owns the order |
| Post-conditions | Order details displayed |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-ORD-002.1 | System shall display order number and date |
| REQ-ORD-002.2 | System shall display order status |
| REQ-ORD-002.3 | System shall display all ordered items with prices |
| REQ-ORD-002.4 | System shall display subtotal, shipping, tax, total |
| REQ-ORD-002.5 | System shall display shipping address |
| REQ-ORD-002.6 | System shall display tracking number (if shipped) |
| REQ-ORD-002.7 | System shall display payment method (last 4 digits) |

**Order Status Values:**
```typescript
type OrderStatus =
  | 'pending'      // Order placed, awaiting processing
  | 'processing'   // Order being prepared
  | 'shipped'      // Order shipped, tracking available
  | 'delivered'    // Order delivered
  | 'cancelled'    // Order cancelled
  | 'refunded';    // Order refunded
```

---

#### REQ-ORD-003: Order Tracking
**Priority:** P0 (Critical)
**Source:** MVP PRD Section 3.6

| Attribute | Value |
|-----------|-------|
| Description | The system shall provide shipment tracking |
| Input | Order with tracking number |
| Output | Tracking status and link |
| Pre-conditions | Order is shipped |
| Post-conditions | Tracking info displayed |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-ORD-003.1 | System shall display tracking number when available |
| REQ-ORD-003.2 | System shall provide link to carrier tracking page |
| REQ-ORD-003.3 | System shall display estimated delivery date |
| REQ-ORD-003.4 | System shall send shipping notification email |

---

#### REQ-ORD-004: Order Cancellation
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.6

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow order cancellation |
| Input | Order ID, cancellation request |
| Output | Order cancelled, refund initiated |
| Pre-conditions | Order status is 'pending' or 'processing' |
| Post-conditions | Order cancelled, inventory restored, refund initiated |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-ORD-004.1 | Cancel button shall only appear for pending/processing orders |
| REQ-ORD-004.2 | System shall confirm cancellation request |
| REQ-ORD-004.3 | System shall restore inventory on cancellation |
| REQ-ORD-004.4 | System shall initiate refund via Stripe |
| REQ-ORD-004.5 | System shall send cancellation confirmation email |

---

#### REQ-ORD-005: Reorder
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.6

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow reordering previous orders |
| Input | Order ID, reorder request |
| Output | Cart populated with order items |
| Pre-conditions | Previous order exists |
| Post-conditions | Cart contains order items (available stock) |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-ORD-005.1 | System shall add available items to cart |
| REQ-ORD-005.2 | System shall notify if items are out of stock |
| REQ-ORD-005.3 | System shall adjust quantities based on current stock |
| REQ-ORD-005.4 | System shall redirect to cart after reorder |

---

### 3.7 User Profile Module (USR)

#### REQ-USR-001: Profile Management
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.7

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to manage their profile |
| Input | Profile update form |
| Output | Profile updated |
| Pre-conditions | User is logged in |
| Post-conditions | Profile changes saved |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-USR-001.1 | User shall be able to update first name, last name |
| REQ-USR-001.2 | User shall be able to update phone number |
| REQ-USR-001.3 | User shall be able to change email (re-verification required) |
| REQ-USR-001.4 | User shall be able to change password |
| REQ-USR-001.5 | Profile updates shall save immediately |

---

#### REQ-USR-002: Address Management
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.7

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow managing saved addresses |
| Input | Address CRUD operations |
| Output | Addresses updated |
| Pre-conditions | User is logged in |
| Post-conditions | Address changes persisted |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-USR-002.1 | User shall be able to add up to 3 addresses |
| REQ-USR-002.2 | User shall be able to edit existing addresses |
| REQ-USR-002.3 | User shall be able to delete addresses |
| REQ-USR-002.4 | User shall be able to set default address |
| REQ-USR-002.5 | Default address shall auto-populate at checkout |

---

#### REQ-USR-003: Email Preferences
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.7

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow managing email preferences |
| Input | Preference toggles |
| Output | Preferences updated |
| Pre-conditions | User is logged in |
| Post-conditions | Email preferences saved |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-USR-003.1 | User shall opt in/out of marketing emails |
| REQ-USR-003.2 | Transactional emails (order confirmations) cannot be disabled |
| REQ-USR-003.3 | Preference changes shall take effect immediately |
| REQ-USR-003.4 | One-click unsubscribe link in all marketing emails |

---

#### REQ-USR-004: Account Deletion
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.7

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to delete their account |
| Input | Delete account request with confirmation |
| Output | Account and data deleted |
| Pre-conditions | User is logged in, no pending orders |
| Post-conditions | Account permanently deleted |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-USR-004.1 | System shall require password confirmation |
| REQ-USR-004.2 | System shall warn about data loss |
| REQ-USR-004.3 | System shall delete personal data |
| REQ-USR-004.4 | System shall retain anonymized order history (legal) |
| REQ-USR-004.5 | System shall send confirmation email |

---

### 3.8 Pet Profile Module (PET)

#### REQ-PET-001: Create Pet Profile
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.8

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow users to add pet profiles |
| Input | Pet information form |
| Output | Pet profile created |
| Pre-conditions | User is logged in |
| Post-conditions | Pet profile saved |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-PET-001.1 | User shall enter pet name (required) |
| REQ-PET-001.2 | User shall select species: Dog, Cat, Small Pet (required) |
| REQ-PET-001.3 | User shall enter breed (optional) |
| REQ-PET-001.4 | User shall enter age or birth date (optional) |
| REQ-PET-001.5 | User shall enter weight (optional) |
| REQ-PET-001.6 | User shall upload pet photo (optional) |
| REQ-PET-001.7 | User can add unlimited pet profiles |

**Pet Profile Schema:**
```typescript
interface PetProfile {
  id: string;
  userId: string;
  name: string;
  species: 'dog' | 'cat' | 'small_pet';
  breed?: string;
  birthDate?: Date;
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### REQ-PET-002: Edit Pet Profile
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.8

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow editing pet profiles |
| Input | Updated pet information |
| Output | Pet profile updated |
| Pre-conditions | Pet profile exists, user owns profile |
| Post-conditions | Pet profile updated |

---

#### REQ-PET-003: Delete Pet Profile
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.8

| Attribute | Value |
|-----------|-------|
| Description | The system shall allow deleting pet profiles |
| Input | Delete request |
| Output | Pet profile deleted |
| Pre-conditions | Pet profile exists, user owns profile |
| Post-conditions | Pet profile permanently deleted |

---

#### REQ-PET-004: Pet-Based Recommendations
**Priority:** P1 (High)
**Source:** MVP PRD Section 3.8

| Attribute | Value |
|-----------|-------|
| Description | The system shall show product recommendations based on pet profiles |
| Input | User's pet profiles |
| Output | Personalized product recommendations |
| Pre-conditions | User has pet profile(s) |
| Post-conditions | Relevant products displayed |

**Functional Details:**

| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-PET-004.1 | Homepage shall show "For [Pet Name]" section |
| REQ-PET-004.2 | Recommendations shall match pet species |
| REQ-PET-004.3 | Recommendations may consider age (puppy/adult/senior) |
| REQ-PET-004.4 | Users without pets see general best sellers |

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### REQ-PERF-001: Page Load Time
| Attribute | Value |
|-----------|-------|
| Requirement | Pages shall load within specified time limits |
| Measurement | Largest Contentful Paint (LCP) |

| Page Type | Target | Maximum |
|-----------|--------|---------|
| Homepage | < 2.0s | < 2.5s |
| Category Page | < 2.0s | < 2.5s |
| Product Detail | < 2.0s | < 3.0s |
| Search Results | < 1.5s | < 2.0s |
| Cart | < 1.5s | < 2.0s |
| Checkout | < 2.0s | < 2.5s |

#### REQ-PERF-002: API Response Time
| Endpoint Type | Target (p50) | Maximum (p95) |
|---------------|--------------|---------------|
| Read operations | < 200ms | < 500ms |
| Write operations | < 300ms | < 800ms |
| Search queries | < 150ms | < 300ms |
| Payment processing | < 2s | < 5s |

#### REQ-PERF-003: Concurrent Users
| Metric | Target |
|--------|--------|
| Concurrent users supported | 500 |
| Requests per second (average) | 100 |
| Requests per second (peak) | 300 |

#### REQ-PERF-004: Database Performance
| Metric | Target |
|--------|--------|
| Simple queries | < 50ms |
| Complex queries | < 200ms |
| Connection pool size | 50 connections |

---

### 4.2 Security Requirements

#### REQ-SEC-001: Authentication Security
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SEC-001.1 | Passwords shall be hashed using bcrypt (cost factor ≥ 12) |
| REQ-SEC-001.2 | JWT tokens shall use RS256 algorithm |
| REQ-SEC-001.3 | Access tokens shall expire in 15 minutes |
| REQ-SEC-001.4 | Refresh tokens shall expire in 30 days |
| REQ-SEC-001.5 | Failed login attempts shall be rate-limited (5 per 15 minutes) |
| REQ-SEC-001.6 | Account lockout after 5 failed attempts (30-minute duration) |

#### REQ-SEC-002: Data Encryption
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SEC-002.1 | All traffic shall use HTTPS (TLS 1.2+) |
| REQ-SEC-002.2 | Sensitive data at rest shall be encrypted (AES-256) |
| REQ-SEC-002.3 | Database connections shall use SSL |
| REQ-SEC-002.4 | API keys shall be stored encrypted |

#### REQ-SEC-003: Payment Security
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SEC-003.1 | System shall be PCI DSS compliant (via Stripe) |
| REQ-SEC-003.2 | Card data shall never touch our servers |
| REQ-SEC-003.3 | Card tokens shall be used for saved cards |
| REQ-SEC-003.4 | CVV shall never be stored |

#### REQ-SEC-004: Input Validation
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SEC-004.1 | All inputs shall be validated server-side |
| REQ-SEC-004.2 | SQL injection shall be prevented (parameterized queries) |
| REQ-SEC-004.3 | XSS shall be prevented (output encoding) |
| REQ-SEC-004.4 | CSRF tokens shall protect state-changing operations |

#### REQ-SEC-005: Access Control
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SEC-005.1 | Users can only access their own data |
| REQ-SEC-005.2 | Order access shall be restricted to owner |
| REQ-SEC-005.3 | API endpoints shall verify authentication |

---

### 4.3 Reliability Requirements

#### REQ-REL-001: Availability
| Metric | Target |
|--------|--------|
| Uptime | 99.5% (MVP) |
| Planned downtime | < 4 hours/month |
| Unplanned downtime | < 4 hours/month |

#### REQ-REL-002: Data Backup
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-REL-002.1 | Database shall be backed up daily |
| REQ-REL-002.2 | Backups shall be retained for 30 days |
| REQ-REL-002.3 | Point-in-time recovery shall be available |
| REQ-REL-002.4 | Backup restore shall complete within 4 hours |

#### REQ-REL-003: Error Handling
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-REL-003.1 | User-friendly error messages shall be displayed |
| REQ-REL-003.2 | Errors shall be logged with context |
| REQ-REL-003.3 | Critical errors shall trigger alerts |
| REQ-REL-003.4 | Transient failures shall be retried (3 attempts) |

---

### 4.4 Usability Requirements

#### REQ-USA-001: Accessibility
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-USA-001.1 | System shall comply with WCAG 2.1 Level AA |
| REQ-USA-001.2 | Color contrast ratio shall be ≥ 4.5:1 |
| REQ-USA-001.3 | All images shall have alt text |
| REQ-USA-001.4 | Forms shall have proper labels |
| REQ-USA-001.5 | Site shall be navigable by keyboard |
| REQ-USA-001.6 | Focus indicators shall be visible |

#### REQ-USA-002: Responsive Design
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-USA-002.1 | Site shall be fully functional at 320px width |
| REQ-USA-002.2 | Touch targets shall be ≥ 44x44 pixels |
| REQ-USA-002.3 | Text shall be readable without zooming |
| REQ-USA-002.4 | Horizontal scrolling shall be avoided |

#### REQ-USA-003: Internationalization
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-USA-003.1 | System shall use US English |
| REQ-USA-003.2 | Currency shall be USD |
| REQ-USA-003.3 | Date format shall be MM/DD/YYYY |
| REQ-USA-003.4 | Time format shall be 12-hour with AM/PM |

---

### 4.5 Scalability Requirements

#### REQ-SCALE-001: Horizontal Scaling
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SCALE-001.1 | Application shall be stateless |
| REQ-SCALE-001.2 | Sessions shall be stored in Redis |
| REQ-SCALE-001.3 | System shall support adding app servers |
| REQ-SCALE-001.4 | Auto-scaling shall trigger at 70% CPU |

#### REQ-SCALE-002: Database Scaling
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-SCALE-002.1 | Read replicas shall be supported |
| REQ-SCALE-002.2 | Connection pooling shall be used |
| REQ-SCALE-002.3 | Query performance shall be monitored |

---

### 4.6 Maintainability Requirements

#### REQ-MAINT-001: Code Quality
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-MAINT-001.1 | Code shall follow ESLint rules |
| REQ-MAINT-001.2 | Code shall be formatted with Prettier |
| REQ-MAINT-001.3 | TypeScript strict mode shall be enabled |
| REQ-MAINT-001.4 | Unit test coverage shall be ≥ 80% |

#### REQ-MAINT-002: Documentation
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-MAINT-002.1 | API shall be documented with OpenAPI 3.0 |
| REQ-MAINT-002.2 | README shall include setup instructions |
| REQ-MAINT-002.3 | Environment variables shall be documented |

#### REQ-MAINT-003: Monitoring
| Sub-Req ID | Requirement |
|------------|-------------|
| REQ-MAINT-003.1 | Application logs shall be centralized |
| REQ-MAINT-003.2 | Error tracking shall be implemented (Sentry) |
| REQ-MAINT-003.3 | Health check endpoint shall exist |
| REQ-MAINT-003.4 | Performance metrics shall be collected |

---

## 5. Data Requirements

### 5.1 Logical Data Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LOGICAL DATA MODEL                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐       ┌──────────────┐       ┌──────────────┐            │
│  │   User   │───────│   Address    │       │     Pet      │            │
│  └────┬─────┘       └──────────────┘       └──────────────┘            │
│       │                                            │                    │
│       │ 1:N                                        │                    │
│       │                                            │                    │
│  ┌────┴─────┐                                      │                    │
│  │   Cart   │                                      │                    │
│  └────┬─────┘                                      │                    │
│       │ 1:N                                        │                    │
│       │                                            │                    │
│  ┌────┴─────┐       ┌──────────────┐              │                    │
│  │ CartItem │───────│   Product    │──────────────┘                    │
│  └──────────┘       └──────┬───────┘                                   │
│                            │                                            │
│                     ┌──────┴───────┐                                   │
│                     │              │                                    │
│              ┌──────┴────┐  ┌──────┴────┐                              │
│              │  Category │  │   Brand   │                              │
│              └───────────┘  └───────────┘                              │
│                                                                          │
│  ┌──────────┐       ┌──────────────┐                                   │
│  │   Order  │───────│  OrderItem   │───────│   Product    │            │
│  └──────────┘       └──────────────┘       └──────────────┘            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Dictionary

#### 5.2.1 Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| email_verified | BOOLEAN | DEFAULT false | Email verification status |
| email_verified_at | TIMESTAMP | NULL | Verification timestamp |
| created_at | TIMESTAMP | NOT NULL | Account creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.2 User Profiles Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(users), UNIQUE | Reference to user |
| first_name | VARCHAR(100) | NULL | User's first name |
| last_name | VARCHAR(100) | NULL | User's last name |
| phone | VARCHAR(20) | NULL | Phone number |
| marketing_opt_in | BOOLEAN | DEFAULT false | Marketing email consent |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.3 Addresses Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(users) | Reference to user |
| type | VARCHAR(20) | NOT NULL | 'shipping' or 'billing' |
| first_name | VARCHAR(100) | NOT NULL | Recipient first name |
| last_name | VARCHAR(100) | NOT NULL | Recipient last name |
| address_line1 | VARCHAR(255) | NOT NULL | Street address |
| address_line2 | VARCHAR(255) | NULL | Apt, suite, etc. |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(50) | NOT NULL | State |
| zip_code | VARCHAR(20) | NOT NULL | ZIP/Postal code |
| phone | VARCHAR(20) | NOT NULL | Contact phone |
| is_default | BOOLEAN | DEFAULT false | Default address flag |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.4 Pets Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(users) | Reference to user |
| name | VARCHAR(100) | NOT NULL | Pet name |
| species | VARCHAR(20) | NOT NULL | dog, cat, small_pet |
| breed | VARCHAR(100) | NULL | Breed |
| birth_date | DATE | NULL | Date of birth |
| weight | DECIMAL(5,2) | NULL | Weight |
| weight_unit | VARCHAR(5) | DEFAULT 'lbs' | lbs or kg |
| photo_url | VARCHAR(500) | NULL | Photo URL |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.5 Categories Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Category name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly name |
| parent_id | UUID | FK(categories), NULL | Parent category |
| description | TEXT | NULL | Category description |
| image_url | VARCHAR(500) | NULL | Category image |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.6 Brands Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Brand name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly name |
| description | TEXT | NULL | Brand description |
| logo_url | VARCHAR(500) | NULL | Brand logo |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.7 Products Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | Stock keeping unit |
| name | VARCHAR(255) | NOT NULL | Product name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly name |
| short_description | VARCHAR(500) | NULL | Brief description |
| description | TEXT | NULL | Full description |
| price | DECIMAL(10,2) | NOT NULL | Current price |
| compare_price | DECIMAL(10,2) | NULL | Original price (for sales) |
| cost | DECIMAL(10,2) | NULL | Product cost |
| category_id | UUID | FK(categories) | Product category |
| brand_id | UUID | FK(brands) | Product brand |
| stock_quantity | INTEGER | DEFAULT 0 | Available stock |
| low_stock_threshold | INTEGER | DEFAULT 10 | Low stock alert |
| weight | DECIMAL(8,2) | NULL | Product weight (oz) |
| specifications | JSONB | NULL | Product specifications |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.8 Product Images Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| product_id | UUID | FK(products) | Reference to product |
| url | VARCHAR(500) | NOT NULL | Image URL |
| alt_text | VARCHAR(255) | NULL | Alt text |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| is_primary | BOOLEAN | DEFAULT false | Primary image flag |
| created_at | TIMESTAMP | NOT NULL | Creation time |

#### 5.2.9 Carts Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK(users), NULL | Registered user |
| session_id | VARCHAR(255) | NULL | Guest session ID |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |
| expires_at | TIMESTAMP | NOT NULL | Expiration time |

#### 5.2.10 Cart Items Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| cart_id | UUID | FK(carts) | Reference to cart |
| product_id | UUID | FK(products) | Reference to product |
| quantity | INTEGER | NOT NULL, CHECK > 0 | Item quantity |
| price_at_add | DECIMAL(10,2) | NOT NULL | Price when added |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.11 Orders Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_number | VARCHAR(20) | UNIQUE, NOT NULL | Display order number |
| user_id | UUID | FK(users), NULL | Registered user |
| email | VARCHAR(255) | NOT NULL | Customer email |
| status | VARCHAR(20) | NOT NULL | Order status |
| subtotal | DECIMAL(10,2) | NOT NULL | Items subtotal |
| shipping_amount | DECIMAL(10,2) | NOT NULL | Shipping cost |
| tax_amount | DECIMAL(10,2) | NOT NULL | Tax amount |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | Discount applied |
| total | DECIMAL(10,2) | NOT NULL | Order total |
| shipping_address | JSONB | NOT NULL | Shipping address JSON |
| billing_address | JSONB | NULL | Billing address JSON |
| shipping_method | VARCHAR(50) | NOT NULL | Selected shipping |
| tracking_number | VARCHAR(100) | NULL | Shipment tracking |
| tracking_url | VARCHAR(500) | NULL | Carrier tracking URL |
| payment_intent_id | VARCHAR(255) | NULL | Stripe payment intent |
| promo_code | VARCHAR(50) | NULL | Applied promo code |
| notes | TEXT | NULL | Order notes |
| placed_at | TIMESTAMP | NOT NULL | Order placed time |
| shipped_at | TIMESTAMP | NULL | Shipped time |
| delivered_at | TIMESTAMP | NULL | Delivered time |
| cancelled_at | TIMESTAMP | NULL | Cancelled time |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### 5.2.12 Order Items Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_id | UUID | FK(orders) | Reference to order |
| product_id | UUID | FK(products) | Reference to product |
| product_name | VARCHAR(255) | NOT NULL | Product name snapshot |
| product_sku | VARCHAR(50) | NOT NULL | SKU snapshot |
| price | DECIMAL(10,2) | NOT NULL | Price at purchase |
| quantity | INTEGER | NOT NULL | Quantity ordered |
| total | DECIMAL(10,2) | NOT NULL | Line total |
| created_at | TIMESTAMP | NOT NULL | Creation time |

#### 5.2.13 Promo Codes Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| code | VARCHAR(50) | UNIQUE, NOT NULL | Promo code |
| description | VARCHAR(255) | NULL | Description |
| discount_type | VARCHAR(20) | NOT NULL | 'percentage' or 'fixed' |
| discount_value | DECIMAL(10,2) | NOT NULL | Discount amount |
| min_order_value | DECIMAL(10,2) | NULL | Minimum order required |
| max_uses | INTEGER | NULL | Maximum total uses |
| uses_count | INTEGER | DEFAULT 0 | Current usage count |
| starts_at | TIMESTAMP | NOT NULL | Start date |
| expires_at | TIMESTAMP | NOT NULL | Expiration date |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

---

### 5.3 Data Validation Rules

| Field | Validation Rule |
|-------|----------------|
| Email | RFC 5322 format, max 255 chars |
| Password | Min 8 chars, uppercase, lowercase, number |
| Phone | E.164 format or US format (xxx-xxx-xxxx) |
| ZIP Code | US format (12345 or 12345-6789) |
| Price | Positive decimal, max 2 decimal places |
| Quantity | Positive integer, ≤ stock available |
| SKU | Alphanumeric + hyphens, 3-50 chars |
| URL Slug | Lowercase alphanumeric + hyphens |

---

## 6. External Interface Requirements

### 6.1 User Interfaces

#### 6.1.1 General UI Requirements
| Requirement | Description |
|-------------|-------------|
| Framework | React 18+ with Next.js 14 |
| Styling | Tailwind CSS |
| Icons | Heroicons or Lucide |
| Typography | Inter font family |
| Colors | Brand color palette (TBD by design) |

#### 6.1.2 Page Templates

| Template | Description | Key Components |
|----------|-------------|----------------|
| Marketing | Homepage, landing pages | Hero, features, CTA |
| Catalog | Category, search results | Product grid, filters, pagination |
| Product | Product detail page | Gallery, info, add to cart |
| Account | Profile, orders, pets | Sidebar nav, forms |
| Checkout | Multi-step checkout | Progress bar, forms, summary |

### 6.2 API Interfaces

#### 6.2.1 REST API Specification

| Attribute | Value |
|-----------|-------|
| Base URL | `https://api.ironpets.com/v1` |
| Format | JSON |
| Authentication | Bearer token (JWT) |
| Rate Limiting | 100 requests/minute |

#### 6.2.2 API Endpoints Summary

**Authentication**
```
POST   /auth/register          # Create account
POST   /auth/login             # Login
POST   /auth/logout            # Logout
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password
POST   /auth/refresh           # Refresh access token
GET    /auth/verify/:token     # Verify email
```

**Products**
```
GET    /products               # List products (paginated)
GET    /products/:slug         # Get product by slug
GET    /products/search        # Search products
GET    /categories             # List categories
GET    /categories/:slug       # Get category with products
GET    /brands                 # List brands
GET    /brands/:slug           # Get brand with products
```

**Cart**
```
GET    /cart                   # Get current cart
POST   /cart/items             # Add item to cart
PUT    /cart/items/:id         # Update cart item
DELETE /cart/items/:id         # Remove cart item
DELETE /cart                   # Clear cart
POST   /cart/merge             # Merge guest cart with user cart
```

**Checkout**
```
POST   /checkout/shipping-rates    # Get shipping rates
POST   /checkout/validate          # Validate cart and address
POST   /checkout/create-payment    # Create Stripe payment intent
POST   /checkout/confirm           # Confirm order
POST   /checkout/apply-promo       # Apply promo code
```

**Orders**
```
GET    /orders                 # List user orders
GET    /orders/:id             # Get order details
POST   /orders/:id/cancel      # Cancel order
POST   /orders/:id/reorder     # Reorder (add to cart)
```

**User**
```
GET    /user/profile           # Get user profile
PUT    /user/profile           # Update profile
PUT    /user/password          # Change password
DELETE /user/account           # Delete account
GET    /user/addresses         # List addresses
POST   /user/addresses         # Add address
PUT    /user/addresses/:id     # Update address
DELETE /user/addresses/:id     # Delete address
```

**Pets**
```
GET    /pets                   # List user's pets
POST   /pets                   # Add pet
GET    /pets/:id               # Get pet details
PUT    /pets/:id               # Update pet
DELETE /pets/:id               # Delete pet
```

#### 6.2.3 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 24,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      { "field": "email", "message": "Must be a valid email address" }
    ]
  }
}
```

### 6.3 Third-Party Interfaces

#### 6.3.1 Stripe (Payments)
| Attribute | Value |
|-----------|-------|
| API Version | 2023-10-16 |
| Integration | Stripe Elements (frontend), API (backend) |
| Webhooks | payment_intent.succeeded, charge.refunded |

#### 6.3.2 Algolia (Search)
| Attribute | Value |
|-----------|-------|
| Index | ironpets_products |
| Searchable Attributes | name, description, brand, category |
| Facets | category, brand, price, rating |

#### 6.3.3 SendGrid (Email)
| Attribute | Value |
|-----------|-------|
| Templates | Order confirmation, shipping, password reset |
| Sender | noreply@ironpets.com |

#### 6.3.4 Shippo (Shipping)
| Attribute | Value |
|-----------|-------|
| Carriers | USPS, FedEx, UPS |
| Features | Rate calculation, label generation, tracking |

---

## 7. System Features

### 7.1 Feature Summary Matrix

| Feature ID | Feature Name | Priority | Status |
|------------|--------------|----------|--------|
| F1 | User Authentication | P0 | MVP |
| F2 | Product Catalog | P0 | MVP |
| F3 | Product Search | P0 | MVP |
| F4 | Shopping Cart | P0 | MVP |
| F5 | Checkout & Payment | P0 | MVP |
| F6 | Order Management | P0 | MVP |
| F7 | User Profile | P1 | MVP |
| F8 | Pet Profiles | P1 | MVP |
| F9 | Social Login | P2 | Post-MVP |
| F10 | Subscriptions | P2 | Post-MVP |
| F11 | Loyalty Program | P2 | Post-MVP |
| F12 | Product Reviews | P2 | Post-MVP |

### 7.2 Feature Dependencies

```
F1 (Auth) ─────┬──────► F4 (Cart - Persistence)
               │
               ├──────► F6 (Orders)
               │
               ├──────► F7 (User Profile)
               │
               └──────► F8 (Pet Profiles)

F2 (Catalog) ──┬──────► F3 (Search)
               │
               └──────► F4 (Cart - Add Items)

F4 (Cart) ─────────────► F5 (Checkout)

F5 (Checkout) ─────────► F6 (Orders)
```

---

## 8. Appendices

### 8.1 Requirements Traceability Matrix

| Req ID | PRD Section | Feature | Test Case |
|--------|-------------|---------|-----------|
| REQ-AUTH-001 | 3.1 | F1 | TC-AUTH-001 |
| REQ-AUTH-002 | 3.1 | F1 | TC-AUTH-002 |
| REQ-AUTH-003 | 3.1 | F1 | TC-AUTH-003 |
| REQ-CAT-001 | 3.2 | F2 | TC-CAT-001 |
| REQ-CAT-002 | 3.2 | F2 | TC-CAT-002 |
| REQ-CAT-003 | 3.2 | F2 | TC-CAT-003 |
| REQ-SRCH-001 | 3.3 | F3 | TC-SRCH-001 |
| REQ-SRCH-002 | 3.3 | F3 | TC-SRCH-002 |
| REQ-CART-001 | 3.4 | F4 | TC-CART-001 |
| REQ-CART-002 | 3.4 | F4 | TC-CART-002 |
| REQ-CHK-001 | 3.5 | F5 | TC-CHK-001 |
| REQ-CHK-004 | 3.5 | F5 | TC-CHK-004 |
| REQ-ORD-001 | 3.6 | F6 | TC-ORD-001 |
| REQ-USR-001 | 3.7 | F7 | TC-USR-001 |
| REQ-PET-001 | 3.8 | F8 | TC-PET-001 |

### 8.2 Glossary

| Term | Definition |
|------|------------|
| Cart | Temporary storage for products before purchase |
| Checkout | Process of completing a purchase |
| Guest | Unauthenticated user |
| MVP | Minimum Viable Product |
| PDP | Product Detail Page |
| PLP | Product Listing Page |
| SKU | Stock Keeping Unit (unique product identifier) |

### 8.3 Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2025-11-26 | Engineering Team | Initial SRS based on MVP PRD |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

**End of Document**

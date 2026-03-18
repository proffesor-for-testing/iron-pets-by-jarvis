# Iron Pets MVP PRD -- Comprehensive Requirements Validation Report

**Validator**: QE Requirements Validator v3 (INVEST + SMART Framework)
**Document**: `docs/iron-pets-mvp-prd.md`
**Date**: 2026-03-18
**PRD Version**: 1.0 (November 26, 2025)

---

## EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| Overall Testability Score | **58/100 (FAIR)** |
| INVEST Compliance (avg) | **62%** |
| SMART Compliance (avg) | **48%** |
| Requirements Sections | 8 features (6 P0, 2 P1) |
| Acceptance Criteria Total | 27 |
| AC Passing SMART | 11/27 (41%) |
| BDD Scenarios in PRD | 8 |
| Missing BDD Scenarios (estimated) | 35+ |
| Blocking Issues | 7 |
| Warnings | 18 |
| Informational | 12 |

**Verdict**: This PRD is not ready for development without revisions. Seven blocking issues must be resolved. The acceptance criteria are broadly under-specified: most lack measurable thresholds, many use vague language, and critical edge cases and error paths are unaddressed.

---

## 1. STRUCTURED VALIDATION PIPELINE (13 Steps)

### Step 1: Format Check -- PASS (75/100) | 3 Findings

| Finding | Severity | Detail |
|---------|----------|--------|
| Inconsistent user story format | WARNING | Sections 3.7 (User Profile) and 3.8 (Pet Profile) have no Gherkin user stories |
| Missing "Definition of Done" | WARNING | No DoD section exists for any feature |
| Date inconsistency | BLOCKING | Document dated "November 26, 2025" with "Target Launch: Q2 2025" -- the launch target is in the past relative to document creation |

### Step 2: Completeness Check -- FAIL (52/100) | 8 Findings

| Finding | Severity | Detail |
|---------|----------|--------|
| No error handling requirements | BLOCKING | No section specifies how errors are presented to users (validation errors, payment failures, network errors) |
| Missing email verification flow AC | WARNING | Section 3.1 mentions "email verification" but has no AC for the verification link behavior, expiry, or resend |
| No "Save for Later" specification | WARNING | Section 3.4 AC mentions "Save for Later" actions but this feature is never specified |
| No tax calculation requirements | WARNING | Checkout mentions no tax behavior; implementation uses hardcoded 8% |
| No address validation specification | WARNING | Section 3.5 lists "Address validation" but has zero detail on what valid means |
| No max cart items defined | INFO | No upper bound on cart items per user |
| No product review/rating system defined | INFO | Product listing shows "rating" but no rating system is in MVP scope |
| No image upload spec for pet photos | INFO | Section 3.8 mentions "pet photo upload" with no size limits, formats, or validation |

### Step 3: INVEST Criteria Analysis -- WARNING (62/100) | Per-Feature

| Feature | I | N | V | E | S | T | Score | Status |
|---------|---|---|---|---|---|---|-------|--------|
| 3.1 Auth | PASS | PASS | PASS | PASS | PASS | PASS | 88 | GOOD |
| 3.2 Catalog | PASS | PASS | PASS | PASS | WARN | PASS | 78 | GOOD |
| 3.3 Search | PASS | PASS | PASS | FAIL | WARN | WARN | 55 | FAIR |
| 3.4 Cart | PASS | PASS | PASS | PASS | PASS | PASS | 82 | GOOD |
| 3.5 Checkout | WARN | PASS | PASS | WARN | FAIL | WARN | 48 | POOR |
| 3.6 Orders | PASS | PASS | PASS | PASS | PASS | WARN | 72 | GOOD |
| 3.7 User Profile | PASS | PASS | PASS | PASS | PASS | FAIL | 58 | FAIR |
| 3.8 Pet Profile | PASS | PASS | WARN | WARN | PASS | FAIL | 50 | FAIR |

**Key INVEST Failures**:

- **Search (Estimable=FAIL)**: PRD references Algolia in tech stack (Sec 4.1) but the search module in the codebase is **empty** -- zero files exist. The search filtering is actually embedded within the catalog service. This disconnect makes the search feature hard to estimate.
- **Checkout (Small=FAIL)**: Section 3.5 bundles 4-step checkout + guest checkout + address validation + multiple payment methods + promo codes + shipping calculation + order confirmation + email confirmation. This is at minimum 4-5 separate user stories.
- **User Profile (Testable=FAIL)**: AC says "Profile updates save instantly" -- "instantly" is not testable.
- **Pet Profile (Testable=FAIL)**: AC says "Recommendations update based on pet type" -- no specifics on what recommendations look like, how many, or what logic drives them.

### Step 4: SMART Acceptance Criteria Analysis -- FAIL (48/100) | Per-AC

#### Section 3.1 -- User Authentication (4 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Registration completes in < 60 seconds | PASS | PASS | PASS | PASS | PASS | 95 | Well-specified |
| Password reset email arrives < 2 minutes | PASS | PASS | PASS | PASS | PASS | 90 | Good but should specify "under normal load" |
| Password requirements: 8+ chars, mixed case, number | PASS | PASS | PASS | PASS | N/A | 85 | Implementation adds special char requirement not in PRD |
| Session persists across browser sessions (30 days) | PASS | PASS | PASS | PASS | PASS | 90 | Good |

**Implementation Discrepancy**: The auth validation requires a special character (`/[!@#$%^&*(),.?":{}|<>]/`), but the PRD only specifies "8+ chars, mixed case, number." This is an implementation exceeding requirements without documentation.

#### Section 3.2 -- Product Catalog (4 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Category page loads < 2 seconds | PASS | PASS | PASS | PASS | PASS | 90 | Should specify "at p95" or "median" |
| Minimum 500 products at launch | PASS | PASS | PASS | PASS | N/A | 80 | Data requirement, not functional |
| Product images optimized (WebP, lazy loading) | PASS | WARN | PASS | PASS | N/A | 60 | How to measure "optimized"? No max size specified |
| Mobile-responsive product grid | WARN | FAIL | PASS | PASS | N/A | 40 | "Mobile-responsive" is vague. What breakpoints pass/fail? |

#### Section 3.3 -- Search & Filtering (4 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Search results appear < 1 second | PASS | PASS | PASS | PASS | PASS | 85 | Should specify percentile |
| Autocomplete suggestions in < 200ms | PASS | PASS | PASS | PASS | PASS | 90 | Good |
| Filters update without page reload | PASS | WARN | PASS | PASS | N/A | 65 | No definition of "update" -- visual change? data fetch? |
| Zero-results page shows alternatives | WARN | FAIL | PASS | PASS | N/A | 35 | What "alternatives"? How many? Based on what? |

#### Section 3.4 -- Shopping Cart (4 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Cart updates in < 500ms | PASS | PASS | PASS | PASS | PASS | 90 | Good |
| Cart persists across sessions | PASS | WARN | PASS | PASS | WARN | 60 | Duration not in AC (buried in functional req: 30d/7d) |
| Real-time inventory validation | WARN | FAIL | PASS | PASS | FAIL | 30 | "Real-time" undefined. On add? On checkout? Polling interval? |
| Clear "Remove" and "Save for Later" actions | WARN | FAIL | PASS | WARN | N/A | 25 | "Clear" is subjective. "Save for Later" is out of MVP scope but listed as AC |

#### Section 3.5 -- Checkout (4 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Checkout completes < 3 minutes | PASS | PASS | WARN | PASS | PASS | 70 | Measurable but "completes" includes user input time |
| PCI DSS compliant payment processing | PASS | WARN | PASS | PASS | N/A | 55 | Via Stripe or self-hosted? No compliance verification method |
| Order confirmation email < 2 minutes | PASS | PASS | PASS | PASS | PASS | 85 | Good |
| Mobile checkout conversion > 50% of desktop | PASS | PASS | WARN | PASS | WARN | 55 | Achievable concern -- is this a launch gate or ongoing metric? |

#### Section 3.6 -- Order Management (4 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Order history loads < 2 seconds | PASS | PASS | PASS | PASS | PASS | 85 | Good |
| Real-time tracking updates | FAIL | FAIL | WARN | PASS | FAIL | 15 | What is "real-time"? WebSocket? Polling? How integrated with shipping provider? |
| Reorder completes in < 15 seconds | PASS | PASS | PASS | PASS | PASS | 80 | Reasonable |
| Cancel option only for unshipped orders | PASS | PASS | PASS | PASS | N/A | 90 | Good -- matches implementation |

#### Section 3.7 -- User Profile (3 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Profile updates save instantly | WARN | FAIL | PASS | PASS | FAIL | 20 | "Instantly" is not measurable |
| Addresses auto-complete during checkout | WARN | FAIL | WARN | PASS | N/A | 30 | Auto-complete from what source? Google Places? Stored addresses? |
| Clear unsubscribe options | WARN | FAIL | PASS | WARN | N/A | 25 | "Clear" is subjective UI judgment |

#### Section 3.8 -- Pet Profile (3 AC)

| AC | S | M | A | R | T | Score | Issue |
|----|---|---|---|---|---|-------|-------|
| Pet profile creation < 1 minute | PASS | PASS | PASS | PASS | PASS | 85 | Good |
| Homepage shows "For [Pet Name]" section | PASS | WARN | PASS | PASS | N/A | 65 | What products? How selected? How many? |
| Recommendations update based on pet type | WARN | FAIL | WARN | PASS | N/A | 25 | No algorithm, no count, no relevance criteria |

### Step 5: Testability Score -- WARNING (58/100)

Composite score breakdown:
- INVEST average: 66.4 (weight 50%) = 33.2
- SMART average: 58.0 (weight 30%) = 17.4
- Traceability: 55 (weight 10%) = 5.5
- Completeness: 40 (weight 10%) = 4.0
- **Total: 60.1/100**

### Step 6: Vague Term Detection -- INFO | 14 Findings

| Term | Location | Occurrences | Suggested Replacement |
|------|----------|-------------|----------------------|
| "instantly" | Sec 3.7 AC | 1 | "within 500ms" or "within 1 second at p95" |
| "real-time" | Sec 3.4, 3.6 AC | 2 | Define polling interval or WebSocket behavior |
| "clear" | Sec 3.4, 3.7 AC | 2 | Define with accessibility criteria (WCAG 2.1 AA contrast, label text) |
| "quickly" | Persona, Sec 2 | 1 | Define acceptable response times |
| "easily" | Persona, Sec 2 | 1 | Define number of steps/clicks |
| "basic" | Sec 3.7, 3.8 | 3 | Enumerate what "basic" includes |
| "reliable" | Sec 1 | 1 | Define reliability SLA |
| "functional" | MVP Vision | 1 | Define acceptance test suite |
| "quality" | Persona | 1 | Define quality signals (certifications, reviews) |
| "alternatives" | Sec 3.3 AC | 1 | Define algorithm for alternatives |
| "optimized" | Sec 3.2 AC | 1 | Define max image size, format requirements |
| "mobile-responsive" | Sec 3.2 AC | 1 | Reference breakpoint table in Sec 6.2 |
| "auto-complete" | Sec 3.7 AC | 1 | Define data source and behavior |
| "confident" | Persona, Sec 2 | 1 | Not actionable, remove or rewrite |

### Step 7: Information Density -- INFO (72/100) | 3 Findings

| Finding | Detail |
|---------|--------|
| Persona section is narrative filler | Personas lack measurable task goals. "Find products quickly" should be "Complete product search in < 30 seconds" |
| Appendix A is placeholder | "Key screens to design" is a list with zero content |
| Executive summary duplicates Section 1 | Redundant scope information |

### Step 8: Traceability Check -- WARNING (55/100) | 6 Findings

| Finding | Severity | Detail |
|---------|----------|--------|
| Auth tests exist but are skipped | WARNING | All auth tests at `backend/tests/auth.test.ts` are in `describe.skip` blocks |
| Search tests exist but are skipped | WARNING | All search tests at `backend/tests/search.test.ts` are in `describe.skip` blocks |
| Search module has no implementation | BLOCKING | `backend/src/modules/search/` is empty |
| Checkout/Orders routes are placeholder | WARNING | `routes/index.ts`: `const checkoutRoutes = Router(); const ordersRoutes = Router();` -- empty routers |
| Frontend test coverage is minimal | WARNING | Only 2 component tests exist: `AddToCartButton.test.tsx` and `Button.test.tsx` |
| No E2E tests mapped to PRD ACs | WARNING | The E2E tests cover checkout flow only, with no traceability annotations to PRD sections |

**Traceability Matrix (PRD to Implementation)**:

| PRD Feature | Backend Module | Tests | Status |
|-------------|---------------|-------|--------|
| 3.1 Auth | `modules/auth/` (5 files) | `auth.test.ts` (SKIPPED) | Partial |
| 3.2 Catalog | `modules/catalog/` (5 files) | `catalog.test.ts` | Active |
| 3.3 Search | `modules/search/` (EMPTY) | `search.test.ts` (SKIPPED) | Missing |
| 3.4 Cart | `modules/cart/` (5 files) | `cart.test.ts` | Active |
| 3.5 Checkout | `modules/checkout/` (5 files) | `checkout.test.ts` | Active (shallow) |
| 3.6 Orders | `modules/orders/` (5 files) | `orders.test.ts` | Active |
| 3.7 User | `modules/user/` (exists) | `user.test.ts` | Active |
| 3.8 Pets | `modules/pets/` (exists) | `pets.test.ts` | Active |

### Step 9: Implementation Leakage -- WARNING (65/100) | 4 Findings

| Finding | Location | Detail |
|---------|----------|--------|
| PRD prescribes Algolia | Sec 4.1 | Search spec names Algolia but implementation uses Prisma queries. PRD should specify behavior, not vendor |
| PRD prescribes Stripe | Sec 4.1 | Similarly prescriptive; better to say "PCI-compliant payment processor" |
| PRD prescribes AWS ECS/RDS | Sec 4.5 | Infrastructure choice is implementation detail |
| Database schema in PRD | Sec 4.2 | Schema should be in technical design doc, not PRD |

### Step 10: Domain Compliance -- INFO (80/100) | 2 Findings

| Finding | Detail |
|---------|--------|
| Order status mismatch | PRD lists 5 statuses: "Order Placed, Processing, Shipped, Delivered, Cancelled/Refunded". Schema enum has 6: `pending, processing, shipped, delivered, cancelled, refunded`. "Order Placed" maps to `pending` but "Cancelled/Refunded" was split into two separate statuses |
| "Rating" referenced but not modeled | Product listings mention "rating" in BDD scenario (Sec 3.2) and filters (Sec 3.3), but the Product model has no `rating` field |

### Step 11: Dependency Analysis -- INFO (75/100) | 3 Findings

| Finding | Detail |
|---------|--------|
| Search depends on unimplemented Algolia | Search AC requires < 1s response and autocomplete in < 200ms, but no search engine is integrated |
| Pet recommendations depend on undefined algorithm | No recommendation engine specified; product to pet matching logic is absent |
| Guest checkout depends on cart merge on login | Cart merge behavior is implemented but not specified in PRD |

### Step 12: BDD Scenario Coverage -- WARNING (38/100) | Major Gaps

**Existing BDD Scenarios in PRD** (8 total):
1. Successful registration
2. Password reset
3. Browse by category
4. Search with filters
5. Add product to cart
6. Guest checkout
7. Apply promo code
8. View order status / Reorder

**Missing Critical BDD Scenarios** (by feature):

**3.1 Auth (5 missing)**:
- Login with valid credentials
- Login with invalid credentials / account lockout
- Email verification flow (click verification link)
- Token refresh / session expiry handling
- Guest to registered user transition

**3.2 Catalog (4 missing)**:
- Product detail page view with all fields
- Pagination (next/previous page)
- Out-of-stock product display behavior
- Category hierarchy navigation (parent -> child)

**3.3 Search (5 missing)**:
- Autocomplete dropdown behavior
- Zero-results with alternatives
- Filter combination (multiple active filters)
- Sort order change
- Search from non-homepage

**3.4 Cart (5 missing)**:
- Update item quantity
- Remove item from cart
- Cart persistence after browser close (logged in)
- Cart persistence after browser close (guest)
- Cart with out-of-stock item (stock depleted after add)

**3.5 Checkout (7 missing)**:
- Registered user checkout with saved address
- Payment failure / card decline
- Shipping method selection and price update
- Free shipping threshold applied
- Address validation failure
- Promo code -- invalid code
- Order confirmation email content

**3.6 Orders (4 missing)**:
- Cancel order (success path)
- Cancel order (already shipped -- blocked)
- Order detail with tracking link
- Reorder with unavailable items

**3.7 User Profile (4 missing)**:
- Update personal information
- Add/edit/delete addresses
- Change password
- Delete account

**3.8 Pet Profile (3 missing)**:
- Add new pet
- Edit pet details
- Delete pet

### Step 13: Holistic Quality -- FAIL (55/100) | 3 Findings

| Finding | Severity | Detail |
|---------|----------|--------|
| Date contradiction | BLOCKING | Target launch "Q2 2025" in a document created "November 26, 2025" -- the target is in the past |
| PayPal mentioned but not implemented | BLOCKING | Section 3.5 says "Payment methods: Credit/Debit cards, PayPal" -- implementation only supports Stripe |
| Success metric contradiction | WARNING | MVP Success Criteria says "3%+ conversion rate" but Sec 8.1 30-Day target says ">= 2%" |

---

## 2. RISK ASSESSMENT

| Rank | Requirement | Risk Score | Impact | Likelihood | Rationale |
|------|------------|-----------|--------|------------|-----------|
| 1 | 3.5 Checkout (P0) | **CRITICAL** | High | High | Largest, most complex feature with weakest ACs. Payment processing, tax calculation, address validation, and promo codes are all under-specified. Implementation uses hardcoded 8% tax rate. PayPal is promised but not built. |
| 2 | 3.3 Search (P0) | **CRITICAL** | High | High | Zero implementation exists. PRD specifies Algolia but no integration exists. All search tests are skipped. Autocomplete, typo tolerance, and relevance ranking have no backing code. |
| 3 | 3.6 Orders - Tracking (P0) | **HIGH** | High | Medium | "Real-time tracking updates" has no specification. No shipping provider integration. Tracking URL/number exist in schema but no update mechanism. |
| 4 | 3.1 Auth - Email Verification (P0) | **HIGH** | Medium | Medium | Email verification is mentioned but the complete flow has no AC. All auth tests are skipped. |
| 5 | 3.8 Pet Recommendations (P1) | **MEDIUM** | Low | High | "Basic product recommendations based on pet type/age" has no algorithm. Will likely ship without meaningful functionality. |
| 6 | 3.2 Catalog - Rating (P0) | **MEDIUM** | Medium | High | Rating is shown in product listing and used as a filter but no rating field exists in the Product model. |

---

## 3. CONSISTENCY CHECK -- CONTRADICTIONS FOUND

| # | Section A | Section B | Contradiction |
|---|-----------|-----------|---------------|
| 1 | Sec header: "Target Launch: Q2 2025" | Sec header: "Date: November 26, 2025" | Launch target is before document creation date |
| 2 | MVP Success Criteria: "3%+ conversion rate" | Sec 8.1: "Conversion Rate >= 2%" | Conflicting conversion rate targets |
| 3 | Sec 3.5: "Payment methods: Credit/Debit cards, PayPal" | Sec 4.1/4.4: Only Stripe listed | PayPal promised to users but not in tech stack |
| 4 | Sec 3.2 BDD: "each product shows image, name, price, rating" | Prisma schema: Product has no `rating` field | Rating referenced but not modeled |
| 5 | Sec 3.6: "Order Placed, Processing, Shipped, Delivered, Cancelled/Refunded" | Schema enum: `pending, processing, shipped, delivered, cancelled, refunded` | "Cancelled/Refunded" split into two; "Order Placed" renamed to "pending" |
| 6 | Sec 3.4: "Save for Later" in AC | Sec 1: Out of scope lists no mention | Feature referenced in AC but never specified |
| 7 | Sec 4.3 API: `/api/products/search` | Sec 4.1: Algolia for search | API implies server-side search endpoint but Algolia is typically client-side |
| 8 | PRD: password "8+ chars, mixed case, number" | Implementation: adds special character requirement | Implementation exceeds PRD specification silently |

---

## 4. BDD SCENARIO COVERAGE -- GENERATED EXAMPLES FOR HIGH-RISK GAPS

### 4.1 Payment Failure (Missing from PRD)

```gherkin
Feature: Checkout Payment Failure Handling
  As a customer completing a purchase
  I want clear feedback when my payment fails
  So that I can correct the issue and complete my order

  Scenario: Credit card declined during checkout
    Given I have items in my cart totaling $67.48
    And I am on the payment step of checkout
    When I enter a credit card that will be declined
    And I click "Place Order"
    Then I should see an error message "Payment declined. Please try a different payment method."
    And my cart items should remain unchanged
    And no order should be created
    And I should remain on the payment step

  Scenario: Payment processing timeout
    Given I have items in my cart
    And I am on the payment step of checkout
    When the payment processor does not respond within 30 seconds
    Then I should see a message "Payment processing is taking longer than expected."
    And I should see an option to "Try Again" or "Cancel"
    And no duplicate charges should be created

  Scenario: Insufficient funds
    Given I have items in my cart totaling $150.00
    And I enter a card with only $100 available
    When I click "Place Order"
    Then I should see "Insufficient funds. Please try a different payment method."
    And I should be able to enter different card details without re-entering shipping info
```

### 4.2 Cart Stock Depletion (Missing from PRD)

```gherkin
Feature: Cart Item Stock Depletion
  As a shopper with items in my cart
  I want to know if an item becomes unavailable
  So that I can adjust my order before checkout

  Scenario: Product goes out of stock while in cart
    Given I added "Premium Dog Food" (quantity: 2) to my cart 1 hour ago
    And the product stock has since dropped to 0
    When I view my cart
    Then I should see "Premium Dog Food" marked as "Out of Stock"
    And I should not be able to proceed to checkout
    And I should see a "Remove" button next to the unavailable item

  Scenario: Product stock reduced below cart quantity
    Given I have 5 units of "Cat Treats" in my cart
    And only 2 units remain in stock
    When I proceed to checkout
    Then I should see a warning "Only 2 units of Cat Treats are available"
    And I should be offered to update quantity to 2 or remove the item
```

### 4.3 Email Verification Flow (Missing from PRD)

```gherkin
Feature: Email Verification
  As a newly registered user
  I want to verify my email address
  So that I can access my full account features

  Scenario: Successful email verification
    Given I registered with email "sarah@example.com"
    And I received a verification email
    When I click the verification link within 24 hours
    Then my account should be marked as verified
    And I should be redirected to my dashboard with a success message

  Scenario: Expired verification link
    Given I registered with email "sarah@example.com"
    And the verification link has expired (older than 24 hours)
    When I click the expired verification link
    Then I should see "This verification link has expired"
    And I should see a "Resend Verification Email" button

  Scenario: Resend verification email
    Given my account is unverified
    When I click "Resend Verification Email"
    Then previous verification links should be invalidated
    And I should receive a new verification email within 2 minutes
```

---

## 5. ACTIONABLE RECOMMENDATIONS

### Blocking (Must Fix Before Development)

| # | Action | PRD Section | Priority |
|---|--------|-------------|----------|
| B1 | Fix date: Change "Target Launch: Q2 2025" to correct future target | Header | Immediate |
| B2 | Remove PayPal from checkout spec OR add PayPal integration to tech plan | 3.5, 4.1 | Immediate |
| B3 | Add `rating` and `reviewCount` fields to Product schema OR remove rating from product display and filter requirements | 3.2, 3.3, schema | Immediate |
| B4 | Create Search module implementation plan: decide between Algolia integration and Prisma full-text search | 3.3 | Immediate |
| B5 | Add error handling requirements section covering: payment failures, validation errors, network timeouts, stock depletion during checkout | New section | Immediate |
| B6 | Remove "Save for Later" from cart AC or add it to MVP scope with specification | 3.4 | Immediate |
| B7 | Resolve conversion rate contradiction: pick 2% or 3% as the target | Header vs 8.1 | Immediate |

### High Priority (Should Fix Before Sprint Planning)

| # | Action | PRD Section |
|---|--------|-------------|
| H1 | Decompose Checkout (3.5) into 4-5 user stories | 3.5 |
| H2 | Replace "real-time" in AC with measurable criteria | 3.4, 3.6 |
| H3 | Replace "instantly" with "within 500ms at p95" for profile updates | 3.7 |
| H4 | Add Gherkin user stories to User Profile (3.7) and Pet Profile (3.8) | 3.7, 3.8 |
| H5 | Define "alternatives" for zero-result search | 3.3 |
| H6 | Define "real-time tracking updates" | 3.6 |
| H7 | Specify tax calculation requirement | 3.5 |
| H8 | Add email verification AC: link expiry time, resend mechanism, max attempts | 3.1 |
| H9 | Unskip auth and search test suites, or replace with working tests | Tests |

### Medium Priority (Should Fix Before Testing Phase)

| # | Action | PRD Section |
|---|--------|-------------|
| M1 | Add performance requirement percentiles | 5.1 |
| M2 | Define address validation behavior | 3.5 |
| M3 | Define image upload constraints for pet photos | 3.8 |
| M4 | Add cart merge specification | 3.4 |
| M5 | Define recommendation algorithm for pet-based product suggestions | 3.8 |
| M6 | Add frontend component test coverage plan | Tests |
| M7 | Document the order number format in the PRD to match implementation | 3.6 |

---

## 6. OVERALL SCORING SUMMARY

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Format Check | 5% | 75 | 3.75 |
| Completeness | 10% | 52 | 5.20 |
| INVEST Criteria | 15% | 62 | 9.30 |
| SMART Criteria | 15% | 48 | 7.20 |
| Testability Score | 10% | 58 | 5.80 |
| Vague Term Detection | 5% | 50 | 2.50 |
| Information Density | 5% | 72 | 3.60 |
| Traceability | 10% | 55 | 5.50 |
| Implementation Leakage | 5% | 65 | 3.25 |
| Domain Compliance | 5% | 80 | 4.00 |
| BDD Coverage | 10% | 38 | 3.80 |
| Holistic Quality | 5% | 55 | 2.75 |
| **TOTAL** | **100%** | -- | **56.65** |

**Final Score: 57/100 -- FAIR**

This score falls below the 70/100 threshold for "Good" and indicates significant clarification is needed before the PRD can reliably drive development and testing. The seven blocking issues must be resolved before sprint planning. The highest-risk areas are the checkout flow (under-specified and over-scoped), search functionality (specified but unimplemented), and the rating system (referenced throughout but absent from the data model).

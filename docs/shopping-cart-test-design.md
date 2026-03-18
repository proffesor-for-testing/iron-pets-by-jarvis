# Shopping Cart - Systematic Test Design
## Iron Pets E-Commerce Platform

**Date:** 2026-03-18
**SRS Reference:** REQ-CART-001 through REQ-CART-005
**Techniques Applied:** Equivalence Partitioning, Boundary Value Analysis, Decision Tables, State Transition Testing, Pairwise/Combinatorial Testing

---

## Table of Contents

1. [Technique 1: Equivalence Partitioning](#1-equivalence-partitioning)
2. [Technique 2: Boundary Value Analysis](#2-boundary-value-analysis)
3. [Technique 3: Decision Tables](#3-decision-tables)
4. [Technique 4: State Transition Testing](#4-state-transition-testing)
5. [Technique 5: Pairwise / Combinatorial Testing](#5-pairwise--combinatorial-testing)
6. [Consolidated Test Suite](#6-consolidated-test-suite)
7. [Traceability Matrix](#7-traceability-matrix)
8. [Implementation Notes](#8-implementation-notes)

---

## 1. Equivalence Partitioning

### 1.1 Add to Cart - Quantity Input (REQ-CART-001)

**Validation rule (backend):** `z.number().int().min(1)` — quantity must be integer >= 1
**Validation rule (frontend):** quantity capped at `Math.min(stock, 99)`

| Partition ID | Class | Range | Valid? | Representative Value |
|-------------|-------|-------|--------|---------------------|
| EP-Q1 | Negative integers | qty < 0 | Invalid | -1 |
| EP-Q2 | Zero | qty = 0 | Invalid (add) | 0 |
| EP-Q3 | Valid integers | 1 <= qty <= stock | Valid | 3 |
| EP-Q4 | Exceeds stock | qty > stock | Invalid | stock + 1 |
| EP-Q5 | Non-integer | decimal values | Invalid | 2.5 |
| EP-Q6 | Non-numeric | string/null/undefined | Invalid | "abc" |

**Test Cases:**

| TC ID | Partition | Input | Expected Result |
|-------|-----------|-------|-----------------|
| EP-ADD-01 | EP-Q1 | quantity: -1 | Zod validation error: "Quantity must be at least 1" |
| EP-ADD-02 | EP-Q2 | quantity: 0 | Zod validation error: "Quantity must be at least 1" |
| EP-ADD-03 | EP-Q3 | quantity: 3 (stock=10) | Item added, cart count = 3 |
| EP-ADD-04 | EP-Q4 | quantity: 11 (stock=10) | Error: "Insufficient stock" |
| EP-ADD-05 | EP-Q5 | quantity: 2.5 | Zod validation error (int constraint) |
| EP-ADD-06 | EP-Q6 | quantity: "abc" | Zod validation error (type mismatch) |

### 1.2 Update Cart - Quantity Input (REQ-CART-003)

**Validation rule:** `z.number().int().min(0)` — quantity >= 0 (0 triggers removal)

| Partition ID | Class | Range | Valid? | Representative Value |
|-------------|-------|-------|--------|---------------------|
| EP-UQ1 | Negative integers | qty < 0 | Invalid | -1 |
| EP-UQ2 | Zero (removal trigger) | qty = 0 | Valid (removes item) | 0 |
| EP-UQ3 | Valid integers | 1 <= qty <= stock | Valid | 5 |
| EP-UQ4 | Exceeds stock | qty > stock | Invalid | stock + 1 |

**Test Cases:**

| TC ID | Partition | Input | Expected Result |
|-------|-----------|-------|-----------------|
| EP-UPD-01 | EP-UQ1 | quantity: -1 | Zod validation error: "Quantity cannot be negative" |
| EP-UPD-02 | EP-UQ2 | quantity: 0 | Item removed from cart, totals recalculated |
| EP-UPD-03 | EP-UQ3 | quantity: 5 (stock=10) | Quantity updated to 5, totals recalculated |
| EP-UPD-04 | EP-UQ4 | quantity: 15 (stock=10) | Error: "Insufficient stock" |

### 1.3 Product ID Input (REQ-CART-001)

| Partition ID | Class | Valid? | Representative Value |
|-------------|-------|--------|---------------------|
| EP-PID1 | Valid existing product ID | Valid | "uuid-of-real-product" |
| EP-PID2 | Valid UUID but non-existent | Invalid | "00000000-0000-0000-0000-000000000000" |
| EP-PID3 | Empty string | Invalid | "" |
| EP-PID4 | Null/undefined | Invalid | null |

**Test Cases:**

| TC ID | Partition | Input | Expected Result |
|-------|-----------|-------|-----------------|
| EP-PID-01 | EP-PID1 | productId: valid UUID | Item added successfully |
| EP-PID-02 | EP-PID2 | productId: non-existent UUID | Error: "Product not found" |
| EP-PID-03 | EP-PID3 | productId: "" | Zod error: "Product ID is required" |
| EP-PID-04 | EP-PID4 | productId: null | Zod validation error |

### 1.4 Price Partitions (Frontend Calculations)

Tax rate: 8%, Free shipping threshold: $50

| Partition ID | Class | Range | Shipping | Tax |
|-------------|-------|-------|----------|-----|
| EP-PR1 | Below free shipping | subtotal < $50 | $5.99 | 8% |
| EP-PR2 | At free shipping threshold | subtotal = $50 | $0.00 | 8% |
| EP-PR3 | Above free shipping | subtotal > $50 | $0.00 | 8% |
| EP-PR4 | Empty cart | subtotal = $0 | $5.99 | $0.00 |

---

## 2. Boundary Value Analysis

### 2.1 Add to Cart Quantity Boundaries (Backend)

**Constraint:** `min(1)` for add, stock-limited upper bound

| BVA ID | Boundary | Value | Expected | Req |
|--------|----------|-------|----------|-----|
| BVA-AQ-01 | Below min | 0 | Rejected: "Quantity must be at least 1" | CART-001 |
| BVA-AQ-02 | At min | 1 | Accepted | CART-001 |
| BVA-AQ-03 | Above min | 2 | Accepted | CART-001 |
| BVA-AQ-04 | Below stock max | stock - 1 | Accepted | CART-001.4 |
| BVA-AQ-05 | At stock max | stock | Accepted (exact stock) | CART-001.4 |
| BVA-AQ-06 | Above stock max | stock + 1 | Rejected: "Insufficient stock" | CART-001.4 |

### 2.2 Update Quantity Boundaries (Backend)

**Constraint:** `min(0)`, 0 = remove, stock-limited upper bound

| BVA ID | Boundary | Value | Expected | Req |
|--------|----------|-------|----------|-----|
| BVA-UQ-01 | Below min | -1 | Rejected: validation error | CART-003 |
| BVA-UQ-02 | At min (removal) | 0 | Item removed | CART-003.5 |
| BVA-UQ-03 | First valid qty | 1 | Updated to 1 | CART-003 |
| BVA-UQ-04 | At stock limit | stock | Accepted | CART-003.3 |
| BVA-UQ-05 | Above stock | stock + 1 | Rejected: "Insufficient stock" | CART-003.3 |

### 2.3 Frontend Quantity Selector Boundaries

**Constraint:** `Math.min(stock, 99)` = maxQuantity, minimum 1

| BVA ID | Boundary | Scenario | Expected UI Behavior |
|--------|----------|----------|---------------------|
| BVA-FQ-01 | Decrement at min | qty=1, click "-" | Button disabled, qty stays 1 |
| BVA-FQ-02 | Increment at max (stock) | qty=stock, stock<99 | Button disabled, qty stays at stock |
| BVA-FQ-03 | Increment at max (cap) | qty=99, stock>99 | Button disabled, qty stays 99 |
| BVA-FQ-04 | Low stock warning | stock=5 | Shows "Only 5 left in stock" |
| BVA-FQ-05 | No low stock warning | stock=6 | No warning shown |
| BVA-FQ-06 | Zero stock | stock=0 | "Out of Stock" text, button disabled |

### 2.4 Cart Persistence Expiration Boundaries (REQ-CART-005)

| BVA ID | Boundary | Scenario | Expected |
|--------|----------|----------|----------|
| BVA-EX-01 | Guest cart at day 6 | Access after 6 days | Cart still accessible |
| BVA-EX-02 | Guest cart at day 7 | Access at exactly 7 days | Cart at expiration edge |
| BVA-EX-03 | Guest cart at day 8 | Access after 7+ days | Cart expired, cleaned up |
| BVA-EX-04 | User cart at day 29 | Access after 29 days | Cart still accessible |
| BVA-EX-05 | User cart at day 30 | Access at exactly 30 days | Cart at expiration edge |
| BVA-EX-06 | User cart at day 31 | Access after 30+ days | Cart expired, cleaned up |

### 2.5 Free Shipping Threshold Boundaries (Frontend)

**Rule:** Free shipping when subtotal >= $50, else $5.99

| BVA ID | Subtotal | Expected Shipping | Expected Total |
|--------|----------|-------------------|----------------|
| BVA-SH-01 | $0.00 | $5.99 | $5.99 (+ tax) |
| BVA-SH-02 | $49.99 | $5.99 | $49.99 + $4.00 + $5.99 = $59.98 |
| BVA-SH-03 | $50.00 | $0.00 (FREE) | $50.00 + $4.00 = $54.00 |
| BVA-SH-04 | $50.01 | $0.00 (FREE) | $50.01 + $4.00 = $54.01 |

### 2.6 Cumulative Quantity on Re-Add (REQ-CART-001.5)

**Rule:** Adding existing product increments qty; total must not exceed stock

| BVA ID | Cart Qty | Add Qty | Stock | Expected |
|--------|----------|---------|-------|----------|
| BVA-CQ-01 | 4 | 1 | 5 | Updated to 5 (exact limit) |
| BVA-CQ-02 | 4 | 2 | 5 | Rejected: "Insufficient stock" |
| BVA-CQ-03 | 0 | 1 | 1 | Added, qty = 1 (last unit) |
| BVA-CQ-04 | 0 | 1 | 0 | Rejected: "Insufficient stock" |

---

## 3. Decision Tables

### 3.1 Add to Cart Decision Table (REQ-CART-001)

**Conditions:**
- C1: Product exists?
- C2: Product in stock? (stockQuantity > 0)
- C3: Requested qty <= available stock?
- C4: Item already in cart?
- C5: Cart qty + requested qty <= stock?

**Actions:**
- A1: Add new item to cart
- A2: Increment existing item quantity
- A3: Show confirmation message
- A4: Update cart icon count
- A5: Return error

```
┌───────────────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Conditions                    │  R1  │  R2  │  R3  │  R4  │  R5  │  R6  │
├───────────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ C1: Product exists            │  No  │ Yes  │ Yes  │ Yes  │ Yes  │ Yes  │
│ C2: Product in stock          │  --  │  No  │ Yes  │ Yes  │ Yes  │ Yes  │
│ C3: Req qty <= stock          │  --  │  --  │  No  │ Yes  │ Yes  │ Yes  │
│ C4: Already in cart           │  --  │  --  │  --  │  No  │ Yes  │ Yes  │
│ C5: Cart+req qty <= stock     │  --  │  --  │  --  │  --  │  No  │ Yes  │
├───────────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ A1: Add new item              │      │      │      │  X   │      │      │
│ A2: Increment quantity        │      │      │      │      │      │  X   │
│ A3: Show confirmation         │      │      │      │  X   │      │  X   │
│ A4: Update cart icon          │      │      │      │  X   │      │  X   │
│ A5: Return error              │  X   │  X   │  X   │      │  X   │      │
└───────────────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Test Cases from Decision Table:**

| TC ID | Rule | Setup | Action | Expected |
|-------|------|-------|--------|----------|
| DT-ADD-01 | R1 | Product doesn't exist | POST /cart/items {productId: invalid} | 404: "Product not found" |
| DT-ADD-02 | R2 | Product exists, stock=0 | POST /cart/items {productId, qty: 1} | 400: "Insufficient stock" |
| DT-ADD-03 | R3 | stock=5 | POST /cart/items {qty: 6} | 400: "Insufficient stock" |
| DT-ADD-04 | R4 | stock=10, not in cart | POST /cart/items {qty: 3} | 200: item added, count=3 |
| DT-ADD-05 | R5 | stock=5, cart has 4 | POST /cart/items {qty: 2} | 400: "Insufficient stock" |
| DT-ADD-06 | R6 | stock=10, cart has 3 | POST /cart/items {qty: 2} | 200: qty updated to 5 |

### 3.2 Cart Merge Decision Table (REQ-CART-005.3, CART-005.4)

**Conditions:**
- C1: Guest cart exists?
- C2: Guest cart has items?
- C3: User cart exists?
- C4: Same product in both carts?
- C5: Combined quantity <= stock?

```
┌────────────────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Conditions                     │  R1  │  R2  │  R3  │  R4  │  R5  │  R6  │
├────────────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ C1: Guest cart exists          │  No  │ Yes  │ Yes  │ Yes  │ Yes  │ Yes  │
│ C2: Guest cart has items       │  --  │  No  │ Yes  │ Yes  │ Yes  │ Yes  │
│ C3: User cart exists           │  --  │  --  │  No  │ Yes  │ Yes  │ Yes  │
│ C4: Same product in both       │  --  │  --  │  --  │  No  │ Yes  │ Yes  │
│ C5: Combined qty <= stock      │  --  │  --  │  --  │  --  │  No  │ Yes  │
├────────────────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ A1: Create user cart           │      │      │  X   │      │      │      │
│ A2: Add guest items to user    │      │      │  X   │  X   │      │  X   │
│ A3: Combine quantities         │      │      │      │      │      │  X   │
│ A4: Skip item (stock limit)    │      │      │      │      │  X   │      │
│ A5: Delete guest cart          │      │  X   │  X   │  X   │  X   │  X   │
│ A6: No-op (nothing to merge)   │  X   │      │      │      │      │      │
└────────────────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Test Cases from Decision Table:**

| TC ID | Rule | Setup | Expected |
|-------|------|-------|----------|
| DT-MRG-01 | R1 | No guest cart exists | User cart unchanged |
| DT-MRG-02 | R2 | Guest cart exists but empty | Guest cart deleted, user cart unchanged |
| DT-MRG-03 | R3 | Guest has items, no user cart | User cart created with guest items |
| DT-MRG-04 | R4 | Guest has product A, user has product B | User cart has both A and B |
| DT-MRG-05 | R5 | Guest has 3x A, user has 4x A, stock=5 | Qty stays 4 (skip, stock exceeded) |
| DT-MRG-06 | R6 | Guest has 2x A, user has 3x A, stock=10 | User qty updated to 5 |

### 3.3 Shipping Cost Decision Table (Frontend — useCart hook)

```
┌──────────────────────────┬──────┬──────┬──────┐
│ Conditions               │  R1  │  R2  │  R3  │
├──────────────────────────┼──────┼──────┼──────┤
│ Cart empty               │ Yes  │  No  │  No  │
│ Subtotal >= $50          │  --  │  No  │ Yes  │
├──────────────────────────┼──────┼──────┼──────┤
│ Shipping = $5.99         │  X   │  X   │      │
│ Shipping = $0.00 (FREE)  │      │      │  X   │
└──────────────────────────┴──────┴──────┴──────┘
```

---

## 4. State Transition Testing

### 4.1 Cart Lifecycle State Model

```
                    ┌──────────────────────────────────────────────────┐
                    │                                                  │
                    ▼                                                  │
 ┌─────────┐  addItem()  ┌──────────────┐  updateItem()  ┌──────────────┐
 │  EMPTY   │───────────►│  HAS_ITEMS   │───────────────►│  HAS_ITEMS   │
 │  (new)   │            │              │◄───────────────│  (modified)  │
 └─────────┘            └──────┬───────┘  addItem()      └──────────────┘
      ▲                        │                                │
      │                        │ removeItem()                   │
      │                        │ (last item)                    │
      │                        ▼                                │
      │                  ┌──────────────┐                      │
      │                  │  EMPTY       │                      │
      │                  │  (cleared)   │◄─────────────────────┘
      │                  └──────────────┘  clearCart() /
      │                        │           updateItem(qty=0) on last item
      │                        │
      │  Timeout/Cleanup       │
      │◄───────────────────────┘
      │
      │                  ┌──────────────┐
      └──────────────────│   EXPIRED    │
                         └──────────────┘
```

**States:**
| State | Description | Entry Condition |
|-------|-------------|-----------------|
| S0: No Cart | No cart record exists | Initial state / after expiry cleanup |
| S1: Empty Cart | Cart exists, 0 items | After first access / clear cart / remove last item |
| S2: Active Cart | Cart with 1+ items | After adding items |
| S3: Expired Cart | Past expiresAt timestamp | Time elapsed beyond 7d (guest) or 30d (user) |

**Valid Transitions:**

| ID | From | Event | To | Guard | Action |
|----|------|-------|----|-------|--------|
| T1 | S0 | getCart() | S1 | — | Create cart with expiresAt |
| T2 | S1 | addItem() | S2 | Stock available | Create CartItem, update timestamp |
| T3 | S2 | addItem() | S2 | Stock available | Create or increment CartItem |
| T4 | S2 | updateItem(qty>0) | S2 | Stock available | Update CartItem quantity |
| T5 | S2 | updateItem(qty=0) | S2 or S1 | — | Remove item; S1 if last item |
| T6 | S2 | removeItem() | S2 or S1 | — | Delete item; S1 if last item |
| T7 | S2 | clearCart() | S1 | — | Delete all items |
| T8 | S1/S2 | time > expiresAt | S3 | — | Scheduled cleanup |
| T9 | S3 | cleanupExpiredCarts() | S0 | — | Delete cart and items |

**Invalid Transitions to Test:**

| ID | Attempted Transition | Expected |
|----|---------------------|----------|
| IT1 | S1: updateItem() (no items) | Error: "Item not found" |
| IT2 | S1: removeItem() (no items) | Error: "Item not found" |
| IT3 | S2: addItem() with insufficient stock | Error: "Insufficient stock", state unchanged |
| IT4 | S3: addItem() on expired cart | New cart created (old one cleaned) |

**State Transition Test Cases:**

| TC ID | Path | Steps | Expected Final State |
|-------|------|-------|---------------------|
| ST-01 | T1→T2 | New session, add 1 item | S2: Cart with 1 item |
| ST-02 | T1→T2→T3 | Add item A, add item B | S2: Cart with 2 items |
| ST-03 | T1→T2→T4 | Add item (qty=2), update to qty=5 | S2: qty=5 |
| ST-04 | T1→T2→T5 | Add 1 item, update qty to 0 | S1: Empty cart |
| ST-05 | T1→T2→T6 | Add 1 item, remove it | S1: Empty cart |
| ST-06 | T1→T2→T3→T7 | Add 2 items, clear cart | S1: Empty cart |
| ST-07 | T1→T2→T6→T2 | Add, remove, add again | S2: Cart with 1 item |
| ST-08 | T1→T2→T3→T6 | Add A, add B, remove A | S2: Cart with B only |
| ST-09 | Invalid IT1 | Empty cart, try update | Error: "Item not found" |
| ST-10 | Invalid IT3 | Add item exceeding stock | Error, cart unchanged |

### 4.2 Cart Drawer UI State Model (Frontend)

```
  ┌──────────┐  openCart() / addToCart()  ┌──────────┐
  │  CLOSED  │──────────────────────────►│   OPEN   │
  │          │◄──────────────────────────│          │
  └──────────┘  closeCart() / backdrop    └──────────┘
       ▲ │            click / X button        │
       │ │                                    │
       └─┘ toggleCart()                       │
                                              ▼
                                    Proceed to Checkout
                                    (navigate to /checkout)
```

| TC ID | Trigger | From | To | Verify |
|-------|---------|------|----|--------|
| ST-UI-01 | Click cart icon | Closed | Open | Drawer visible, items shown |
| ST-UI-02 | Click X button | Open | Closed | Drawer hidden |
| ST-UI-03 | Click backdrop | Open | Closed | Drawer hidden |
| ST-UI-04 | Add to cart success | Closed | Open | Drawer opens automatically |
| ST-UI-05 | Click "Checkout" | Open | Navigate | Route changes to /checkout |

---

## 5. Pairwise / Combinatorial Testing

### 5.1 Add to Cart - Parameter Combinations

**Parameters:**
- P1: User type — Guest, Registered
- P2: Stock status — Out of stock (0), Low stock (1-5), Normal stock (6+)
- P3: Item in cart — No, Yes (same product)
- P4: Quantity — 1 (minimum), Mid-range, Max (=stock)

Full factorial: 2 x 3 x 2 x 3 = 36 combinations
Pairwise reduction: **12 tests** cover all pairs

| PW ID | User Type | Stock Status | In Cart? | Quantity | Expected |
|-------|-----------|-------------|----------|----------|----------|
| PW-01 | Guest | Out of stock (0) | No | 1 | Rejected: insufficient stock |
| PW-02 | Guest | Low stock (3) | Yes | Max (3) | Check cumulative: may reject |
| PW-03 | Guest | Normal (20) | No | Mid (5) | Added, qty=5 |
| PW-04 | Guest | Low stock (5) | No | Max (5) | Added, qty=5, low stock warning |
| PW-05 | Guest | Normal (20) | Yes | 1 | Incremented by 1 |
| PW-06 | Guest | Out of stock (0) | Yes | Mid (5) | Rejected: insufficient stock |
| PW-07 | Registered | Out of stock (0) | No | Mid (5) | Rejected: insufficient stock |
| PW-08 | Registered | Low stock (2) | No | 1 | Added, qty=1, low stock warning |
| PW-09 | Registered | Normal (50) | Yes | Max (50) | Check cumulative vs stock |
| PW-10 | Registered | Normal (10) | No | Max (10) | Added, qty=10 |
| PW-11 | Registered | Low stock (4) | Yes | 1 | Incremented by 1 |
| PW-12 | Registered | Out of stock (0) | Yes | Max (0) | Rejected: insufficient stock |

### 5.2 Cart Merge - Parameter Combinations

**Parameters:**
- P1: Guest cart state — Empty, Has unique items, Has overlapping items
- P2: User cart state — Doesn't exist, Empty, Has items
- P3: Stock constraint — All fit, Some exceed stock

Full factorial: 3 x 3 x 2 = 18 combinations
Pairwise reduction: **9 tests**

| PW ID | Guest Cart | User Cart | Stock | Expected |
|-------|-----------|-----------|-------|----------|
| PW-MRG-01 | Empty | Doesn't exist | All fit | User cart created empty |
| PW-MRG-02 | Has unique items (A,B) | Empty | All fit | User gets A,B |
| PW-MRG-03 | Has overlapping (A:3) | Has items (A:2) | All fit (stock=10) | User A:5 |
| PW-MRG-04 | Has unique items (C) | Has items (A,B) | All fit | User gets A,B,C |
| PW-MRG-05 | Has overlapping (A:5) | Has items (A:4) | Exceeds (stock=5) | A stays at 4 (skip) |
| PW-MRG-06 | Empty | Has items (A) | All fit | User cart unchanged |
| PW-MRG-07 | Has unique (D) | Doesn't exist | Exceeds (stock=0) | User cart created, D skipped (no stock) |
| PW-MRG-08 | Has overlapping (B:1) | Empty | Exceeds (stock=0) | B not added (no stock) |
| PW-MRG-09 | Has unique + overlap | Has items | Mixed | Unique added, overlap combined where stock allows |

### 5.3 Cart View - Display Combinations

**Parameters:**
- P1: Cart state — Empty, Single item, Multiple items
- P2: User type — Guest, Registered
- P3: Pricing — Below $50 (shipping applies), At/above $50 (free shipping)

| PW ID | Cart State | User Type | Pricing | Verify |
|-------|-----------|-----------|---------|--------|
| PW-VIEW-01 | Empty | Guest | $0 | Empty state msg, "Continue Shopping" link, no checkout btn |
| PW-VIEW-02 | Single item | Guest | Below $50 | Item shown, shipping=$5.99, checkout enabled |
| PW-VIEW-03 | Multiple items | Guest | Above $50 | All items, FREE shipping, subtotal correct |
| PW-VIEW-04 | Empty | Registered | $0 | Empty state msg |
| PW-VIEW-05 | Single item | Registered | At $50 | FREE shipping, checkout enabled |
| PW-VIEW-06 | Multiple items | Registered | Below $50 | All items, $5.99 shipping |

---

## 6. Consolidated Test Suite

### 6.1 Backend API Tests (Jest)

#### Suite: POST /api/cart/items — Add to Cart

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 1 | should add new item to empty cart with qty=1 | BVA (min qty) | CART-001 | P0 |
| 2 | should add item with qty at exact stock limit | BVA (max) | CART-001.4 | P0 |
| 3 | should reject qty exceeding stock by 1 | BVA (max+1) | CART-001.4 | P0 |
| 4 | should increment quantity when same product already in cart | DT R6 | CART-001.5 | P0 |
| 5 | should reject when cart qty + add qty exceeds stock | DT R5 | CART-001.4 | P0 |
| 6 | should reject quantity of 0 | EP (EP-Q2) | CART-001 | P0 |
| 7 | should reject negative quantity | EP (EP-Q1) | CART-001 | P0 |
| 8 | should reject non-integer quantity | EP (EP-Q5) | CART-001 | P1 |
| 9 | should reject non-existent product ID | DT R1 | CART-001.1 | P0 |
| 10 | should reject empty product ID | EP (EP-PID3) | CART-001 | P0 |
| 11 | should reject when product has 0 stock | DT R2 | CART-001.1 | P0 |
| 12 | should capture priceAtAdd from product at time of addition | — | CART-001 | P1 |
| 13 | should update cart timestamp on add | — | CART-001 | P1 |

#### Suite: PUT /api/cart/items/:id — Update Cart Item

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 14 | should update quantity to valid value | EP (EP-UQ3) | CART-003 | P0 |
| 15 | should remove item when quantity set to 0 | BVA / ST (T5) | CART-003.5 | P0 |
| 16 | should reject negative quantity | EP (EP-UQ1) | CART-003 | P0 |
| 17 | should reject quantity exceeding stock | BVA (max+1) | CART-003.3 | P0 |
| 18 | should update quantity to exact stock limit | BVA (at max) | CART-003.3 | P0 |
| 19 | should return error for non-existent item ID | ST (IT1) | CART-003 | P0 |
| 20 | should recalculate subtotal after update | — | CART-003.4 | P0 |

#### Suite: DELETE /api/cart/items/:id — Remove from Cart

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 21 | should remove item and update totals | ST (T6) | CART-004 | P0 |
| 22 | should return error for non-existent item | ST (IT2) | CART-004 | P0 |
| 23 | should result in empty cart when last item removed | ST (T6→S1) | CART-004.3 | P0 |
| 24 | should update cart timestamp on remove | — | CART-004 | P1 |

#### Suite: DELETE /api/cart — Clear Cart

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 25 | should remove all items from cart | ST (T7) | CART-003 | P0 |
| 26 | should handle clearing already empty cart | ST | CART-003 | P1 |

#### Suite: POST /api/cart/merge — Merge Carts

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 27 | should merge unique guest items into user cart | DT R4 | CART-005.3 | P0 |
| 28 | should combine quantities for overlapping products | DT R6 | CART-005.4 | P0 |
| 29 | should skip merge when combined qty exceeds stock | DT R5 | CART-005.4 | P0 |
| 30 | should create user cart if doesn't exist | DT R3 | CART-005 | P0 |
| 31 | should delete guest cart after merge | DT | CART-005.3 | P0 |
| 32 | should handle empty guest cart | DT R2 | CART-005 | P1 |
| 33 | should handle non-existent guest cart | DT R1 | CART-005 | P1 |
| 34 | should require authentication | — | CART-005.3 | P0 |

#### Suite: Cart Persistence & Expiration

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 35 | should create guest cart with 7-day expiration | BVA | CART-005.1 | P0 |
| 36 | should create user cart with 30-day expiration | BVA | CART-005.2 | P0 |
| 37 | should cleanup expired guest carts | ST (T8→T9) | CART-005 | P1 |
| 38 | should cleanup expired user carts | ST (T8→T9) | CART-005 | P1 |
| 39 | should not cleanup non-expired carts | BVA | CART-005 | P1 |

#### Suite: Subtotal Calculation

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 40 | should calculate subtotal for single item | — | CART-002.4 | P0 |
| 41 | should calculate subtotal for multiple items | — | CART-002.4 | P0 |
| 42 | should return 0 for empty cart | EP (EP-PR4) | CART-002.4 | P0 |

### 6.2 Frontend Store Tests (Jest)

#### Suite: Zustand Cart Store — addItem

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 43 | should add new item with default quantity 1 | EP | CART-001.2 | P0 |
| 44 | should add item with specified quantity | EP | CART-001 | P0 |
| 45 | should increment quantity for existing product+variant | DT | CART-001.5 | P0 |
| 46 | should treat different variants as separate items | PW | CART-001 | P1 |
| 47 | should recalculate subtotal, tax, total, itemCount | — | CART-002 | P0 |

#### Suite: Zustand Cart Store — updateQuantity

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 48 | should update to valid quantity | EP | CART-003 | P0 |
| 49 | should remove item when quantity set to 0 | BVA | CART-003.5 | P0 |
| 50 | should remove item when quantity is negative | BVA | CART-003 | P0 |
| 51 | should recalculate all computed values | — | CART-003.4 | P0 |

#### Suite: Zustand Cart Store — removeItem / clearCart

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 52 | should remove specific item by ID | ST (T6) | CART-004 | P0 |
| 53 | should not affect other items on remove | ST | CART-004 | P0 |
| 54 | should clear all items and reset totals | ST (T7) | CART-003 | P0 |

#### Suite: useCart Hook — Shipping Logic

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 55 | should charge $5.99 shipping when subtotal < $50 | DT/BVA | CHK-003 | P0 |
| 56 | should give free shipping when subtotal = $50 | BVA (boundary) | CHK-003.3 | P0 |
| 57 | should give free shipping when subtotal > $50 | BVA | CHK-003.3 | P0 |
| 58 | should charge $5.99 shipping on empty cart | EP (EP-PR4) | CHK-003 | P1 |

### 6.3 Frontend Component Tests (Jest/RTL)

#### Suite: AddToCartButton Component

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 59 | should display "Add to Cart" when in stock | ST | CART-001 | P0 |
| 60 | should display "Out of Stock" when stock=0 | EP/BVA | CART-001.1 | P0 |
| 61 | should show low stock warning when stock <= 5 | BVA | CAT-003.4 | P0 |
| 62 | should not show low stock warning when stock=6 | BVA | CAT-003.4 | P1 |
| 63 | should disable "-" button when quantity=1 | BVA (min) | CART-001 | P0 |
| 64 | should disable "+" when quantity=maxQuantity | BVA (max) | CART-001.4 | P0 |
| 65 | should cap max quantity at min(stock, 99) | BVA | CART-001.4 | P1 |
| 66 | should show loading spinner during add | — | CART-001.2 | P1 |
| 67 | should debounce rapid clicks (300ms) | — | CART-001 | P1 |
| 68 | should display error toast on failure | EP | CART-001 | P0 |

#### Suite: CartItem Component

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 69 | should display product image, name, price, quantity | — | CART-002.1-3 | P0 |
| 70 | should display line total (price * qty) | — | CART-002.3 | P0 |
| 71 | should call onUpdateQuantity on +/- click | — | CART-003.1 | P0 |
| 72 | should call onRemove on remove button click | — | CART-004.1 | P0 |
| 73 | should show "Maximum quantity reached" at max | BVA | CART-001.4 | P1 |

#### Suite: CartDrawer Component

| # | Test Name | Technique | Req | Priority |
|---|-----------|-----------|-----|----------|
| 74 | should display items when cart has items | PW-VIEW | CART-002 | P0 |
| 75 | should display empty state with CTA when empty | PW-VIEW | CART-002.8 | P0 |
| 76 | should show item count in header | — | CART-001.3 | P0 |
| 77 | should display subtotal in footer | — | CART-002.4 | P0 |
| 78 | should show "Proceed to Checkout" button | — | CART-002.7 | P0 |
| 79 | should close on X button click | ST-UI-02 | CART-002 | P0 |
| 80 | should close on backdrop click | ST-UI-03 | CART-002 | P0 |

### 6.4 E2E Tests (Playwright)

| # | Test Name | Technique | Reqs Covered | Priority |
|---|-----------|-----------|-------------|----------|
| 81 | Full add-to-cart flow: PDP -> add -> drawer opens with item | ST path | CART-001, 002 | P0 |
| 82 | Update quantity in cart page and verify totals recalculate | BVA + ST | CART-003.1-4 | P0 |
| 83 | Remove item and verify undo option appears for 5 seconds | ST | CART-004.2 | P1 |
| 84 | Remove last item shows empty cart state | ST | CART-002.8 | P0 |
| 85 | Cart persists after page refresh (localStorage) | PW | CART-005.1 | P0 |
| 86 | Free shipping threshold: add items to cross $50 | BVA | CHK-003.3 | P0 |
| 87 | Add same product twice increments quantity | DT | CART-001.5 | P0 |
| 88 | Cannot add more than stock allows | BVA | CART-001.4 | P0 |
| 89 | Cart icon badge updates on add/remove | ST | CART-001.3 | P0 |
| 90 | Guest checkout flow with cart items | PW | CHK-001.1 | P0 |

---

## 7. Traceability Matrix

| Requirement | Test Cases | Techniques Used |
|-------------|-----------|-----------------|
| REQ-CART-001 (Add to Cart) | 1-13, 43-47, 59-68, 81, 87, 88 | EP, BVA, DT, ST, PW |
| REQ-CART-001.1 (Validate stock) | 3, 5, 11 | BVA, DT |
| REQ-CART-001.2 (Show confirmation) | 66, 81 | ST |
| REQ-CART-001.3 (Update cart icon) | 76, 89 | ST |
| REQ-CART-001.4 (Prevent exceeding stock) | 2, 3, 5, 64, 65, 73, 88 | BVA, DT |
| REQ-CART-001.5 (Increment existing) | 4, 45, 87 | DT, ST |
| REQ-CART-002 (View Cart) | 40-42, 47, 69-80 | EP, PW |
| REQ-CART-002.1-3 (Display fields) | 69, 70 | — |
| REQ-CART-002.4 (Subtotal) | 40-42, 77 | EP |
| REQ-CART-002.5 (Remove option) | 72 | — |
| REQ-CART-002.7 (Checkout button) | 78 | — |
| REQ-CART-002.8 (Empty state) | 75, 84 | PW, ST |
| REQ-CART-003 (Update Cart) | 14-20, 48-51, 71, 82 | EP, BVA, ST |
| REQ-CART-003.3 (Stock validation) | 17, 18 | BVA |
| REQ-CART-003.4 (Real-time recalc) | 20, 51, 82 | — |
| REQ-CART-003.5 (Qty 0 = remove) | 15, 49 | BVA, ST |
| REQ-CART-004 (Remove) | 21-24, 52-53, 72, 83 | ST |
| REQ-CART-004.2 (Undo option) | 83 | ST |
| REQ-CART-004.3 (Update totals) | 21, 23 | ST |
| REQ-CART-005 (Persistence) | 35-39, 85 | BVA, ST |
| REQ-CART-005.1 (Guest 7 days) | 35, 37 | BVA |
| REQ-CART-005.2 (User 30 days) | 36, 38 | BVA |
| REQ-CART-005.3 (Merge on login) | 27-34 | DT, PW |
| REQ-CART-005.4 (Merge stock limit) | 29 | DT |
| REQ-CART-005.5 (Validate on restore) | 39 | BVA |

**Coverage summary:** All 5 REQ-CART requirements and 20 sub-requirements covered by 90 test cases.

---

## 8. Implementation Notes

### 8.1 Observations from Code Review

| # | Finding | Impact | Related Tests |
|---|---------|--------|---------------|
| 1 | **Backend `calculateSubtotal` uses `item.price`** but CartItem model stores `priceAtAdd`. The field name mismatch could cause `NaN` if the included relation uses `priceAtAdd` column name. | Subtotal may calculate incorrectly | 40, 41, 42 |
| 2 | **Frontend store has no stock validation** — the Zustand store `addItem` and `updateQuantity` do not check against available stock. Only the backend validates. | Users could add unlimited qty client-side if backend isn't called | 64, 65, 88 |
| 3 | **Cart merge silently skips items** when combined quantity exceeds stock (no user notification). REQ-CART-005.4 says "not exceed stock" but doesn't specify notification. | Users may not realize items were dropped during merge | 29, PW-MRG-05 |
| 4 | **Undo on remove (REQ-CART-004.2)** is not implemented in either backend or frontend. | Missing SRS requirement | 83 |
| 5 | **Frontend `useAddToCart` generates IDs with `Date.now()`** which could collide if adding two items in rapid succession (<1ms). | Potential duplicate ID issues | 67 |
| 6 | **Frontend cart not synced with backend** — Zustand store operates independently from the Express API. | Cart data may diverge between client and server | 85, 90 |

### 8.2 Test Prioritization

**Run first (P0 — 63 tests):** Stock validation, add/remove/update core flows, subtotal calculations, merge logic, empty states, key UI interactions.

**Run second (P1 — 27 tests):** Expiration boundaries, edge case inputs, timestamp updates, variant handling, debounce, low stock warnings, promo codes.

### 8.3 Technique Contribution Summary

| Technique | Tests Designed | Primary Value |
|-----------|---------------|---------------|
| Equivalence Partitioning | 18 | Validated all input classes for quantity, productId, price ranges |
| Boundary Value Analysis | 24 | Found edge cases at stock limits, qty=0/1, $50 shipping threshold, expiration dates |
| Decision Tables | 18 | Mapped complex add-to-cart and merge business rules exhaustively |
| State Transition | 20 | Covered cart lifecycle including empty→active→cleared→expired paths |
| Pairwise Testing | 10 | Reduced 54 combinations to 21 tests covering all parameter pairs |

**Total unique test cases: 90** (some tests are attributed to multiple techniques where they overlap)

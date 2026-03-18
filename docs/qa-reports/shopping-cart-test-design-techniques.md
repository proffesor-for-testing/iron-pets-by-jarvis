# Shopping Cart Test Design -- Systematic Techniques Applied

**Feature**: Shopping Cart (SRS Section 3.4, REQ-CART-001 through REQ-CART-005)
**Source files**: `cart.service.ts`, `cart.validation.ts`, `cart.controller.ts`
**Date**: 2026-03-18
**Techniques Applied**: Boundary Value Analysis, Equivalence Partitioning, Decision Tables, State Transition Testing, Pairwise/Combinatorial Testing

---

## 1. Boundary Value Analysis (BVA)

Bugs cluster at boundaries. The cart has several numeric boundaries derived from requirements and implementation.

### 1.1 Quantity Boundaries (REQ-CART-001, REQ-CART-003)

Validation: `addItemSchema` requires `quantity: z.number().int().min(1)`, `updateItemSchema` allows `min(0)`.

| Test ID | Input | Boundary | Expected | Requirement |
|---------|-------|----------|----------|-------------|
| **BVA-QTY-01** | Add quantity = 0 | Below min (add) | Reject: "quantity must be >= 1" | REQ-CART-001.1 |
| **BVA-QTY-02** | Add quantity = 1 | Min valid (add) | Accept: item added | REQ-CART-001 |
| **BVA-QTY-03** | Add quantity = -1 | Below zero | Reject: validation error | REQ-CART-001.4 |
| **BVA-QTY-04** | Add quantity = 1.5 | Non-integer | Reject: "must be integer" | Schema |
| **BVA-QTY-05** | Update quantity = 0 | Delete trigger | Item removed from cart | REQ-CART-003.5 |
| **BVA-QTY-06** | Update quantity = -1 | Below zero (update) | Reject: validation error | REQ-CART-003.3 |

### 1.2 Stock Limit Boundaries (REQ-CART-001.4)

Given product with `stockQuantity = 10`:

| Test ID | Scenario | Input | Expected | Requirement |
|---------|----------|-------|----------|-------------|
| **BVA-STK-01** | Add at stock limit | qty = 10 | Accept | REQ-CART-001.4 |
| **BVA-STK-02** | Add above stock | qty = 11 | Reject: insufficient stock | REQ-CART-001.4 |
| **BVA-STK-03** | Add, then add more exceeding | cart=9, add 2 more | Reject: "Only 1 more available" | REQ-CART-001.5 |
| **BVA-STK-04** | Add to stock = 0 product | qty = 1, stock = 0 | Reject: out of stock | REQ-CART-001.1 |
| **BVA-STK-05** | Add to stock = 1 product | qty = 1, stock = 1 | Accept (edge) | REQ-CART-001.1 |
| **BVA-STK-06** | Update to exactly stock | update qty = 10 | Accept | REQ-CART-003.3 |
| **BVA-STK-07** | Update to stock + 1 | update qty = 11 | Reject | REQ-CART-003.3 |

### 1.3 Cart Expiration Boundaries (REQ-CART-005)

| Test ID | Scenario | Time | Expected | Requirement |
|---------|----------|------|----------|-------------|
| **BVA-EXP-01** | Guest cart at 6d 23h 59m | Just before 7 days | Cart persists | REQ-CART-005.1 |
| **BVA-EXP-02** | Guest cart at 7d 0h 1m | Just after 7 days | Cart expired/cleaned | REQ-CART-005.1 |
| **BVA-EXP-03** | User cart at 29d 23h 59m | Just before 30 days | Cart persists | REQ-CART-005.2 |
| **BVA-EXP-04** | User cart at 30d 0h 1m | Just after 30 days | Cart expired/cleaned | REQ-CART-005.2 |

### 1.4 Price Boundaries (Decimal 10,2 schema)

| Test ID | Input | Expected |
|---------|-------|----------|
| **BVA-PRC-01** | Product price = $0.01 | Stored in `priceAtAdd` correctly |
| **BVA-PRC-02** | Product price = $99999999.99 | Max Decimal(10,2) handled |
| **BVA-PRC-03** | Cart with 1 item x qty 1 @ $0.01 | Subtotal = $0.01 |
| **BVA-PRC-04** | Cart with max items at high price | No overflow in subtotal |

---

## 2. Equivalence Partitioning (EP)

One representative test per equivalent class -- reduces redundancy while ensuring coverage.

### 2.1 Quantity Partitions (Add to Cart)

| Partition | Class | Representative | Expected | Requirement |
|-----------|-------|---------------|----------|-------------|
| **EP-Q1** | Invalid: negative | -5 | Reject | REQ-CART-001 |
| **EP-Q2** | Invalid: zero | 0 | Reject | REQ-CART-001 |
| **EP-Q3** | Invalid: non-integer | 2.7 | Reject | Schema |
| **EP-Q4** | Valid: within stock | 3 (stock=10) | Accept | REQ-CART-001 |
| **EP-Q5** | Invalid: exceeds stock | 15 (stock=10) | Reject | REQ-CART-001.4 |

### 2.2 User Type Partitions (Cart Persistence)

| Partition | Class | Representative | Expected | Requirement |
|-----------|-------|---------------|----------|-------------|
| **EP-U1** | Guest (sessionId only) | Anonymous browser | 7-day expiry, cookie-based | REQ-CART-005.1 |
| **EP-U2** | Registered (userId) | Logged-in user | 30-day expiry, DB-based | REQ-CART-005.2 |
| **EP-U3** | Guest to Registered (login) | Guest logs in | Cart merged | REQ-CART-005.3 |

### 2.3 Product State Partitions (Add to Cart)

| Partition | Class | Representative | Expected | Requirement |
|-----------|-------|---------------|----------|-------------|
| **EP-P1** | In stock (qty > low_stock) | stockQty=50 | Normal add | REQ-CART-001.1 |
| **EP-P2** | Low stock (0 < qty <= threshold) | stockQty=3, threshold=10 | Add with warning potential | REQ-CART-001.1 |
| **EP-P3** | Out of stock (qty = 0) | stockQty=0 | Reject | REQ-CART-001.1 |
| **EP-P4** | Non-existent product | Invalid UUID | Reject: product not found | REQ-CART-001 |

### 2.4 Cart State Partitions (View Cart)

| Partition | Class | Representative | Expected | Requirement |
|-----------|-------|---------------|----------|-------------|
| **EP-C1** | Empty cart | No items | Show empty message + shop link | REQ-CART-002.8 |
| **EP-C2** | Single item | 1 product, qty 1 | Show item + totals | REQ-CART-002 |
| **EP-C3** | Multiple items | 3 products | Show all items + correct subtotal | REQ-CART-002.4 |
| **EP-C4** | Cart with item at qty > 1 | 1 product, qty 5 | Show line total = price x 5 | REQ-CART-002.3 |

---

## 3. Decision Tables -- Free Shipping & Cart Merge Rules

### 3.1 Add to Cart Decision Table

| | R1 | R2 | R3 | R4 | R5 | R6 |
|---|---|---|---|---|---|---|
| **Conditions** | | | | | | |
| Product exists? | Y | Y | Y | Y | N | Y |
| Product in stock? | Y | Y | Y | N | - | Y |
| Item already in cart? | N | Y | Y | - | - | N |
| Combined qty <= stock? | Y | Y | N | - | - | N |
| **Actions** | | | | | | |
| Create new CartItem | **X** | | | | | |
| Increment existing qty | | **X** | | | | |
| Reject: exceeds stock | | | **X** | | | **X** |
| Reject: out of stock | | | | **X** | | |
| Reject: not found | | | | | **X** | |
| Update cart timestamp | **X** | **X** | | | | |
| Show confirmation | **X** | **X** | | | | |
| Update cart icon count | **X** | **X** | | | | |

**Test IDs**: DT-ADD-R1 through DT-ADD-R6

### 3.2 Cart Merge Decision Table (REQ-CART-005.3-005.5)

| | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| **Conditions** | | | | | |
| Guest cart has items? | Y | Y | Y | N | Y |
| Item exists in user cart? | N | Y | Y | - | N |
| Combined qty <= stock? | Y | Y | N | - | Y |
| **Actions** | | | | | |
| Create item in user cart | **X** | | | | **X** |
| Increment user cart qty | | **X** | | | |
| Silently skip (cap at stock) | | | **X** | | |
| No-op (nothing to merge) | | | | **X** | |
| Delete guest cart | **X** | **X** | **X** | **X** | **X** |

**Test IDs**: DT-MERGE-R1 through DT-MERGE-R5

### 3.3 Checkout Eligibility Decision Table

| | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| **Conditions** | | | | |
| Cart has items? | Y | Y | N | Y |
| All items in stock? | Y | N | - | Y |
| Subtotal >= $50? | Y | Y | - | N |
| **Actions** | | | | |
| Enable "Proceed to Checkout" | **X** | | | **X** |
| Show stock warning | | **X** | | |
| Show empty cart message | | | **X** | |
| Show shipping = $5.99 | | | | **X** |
| Show shipping = FREE | **X** | | | |

**Test IDs**: DT-ELIG-R1 through DT-ELIG-R4

---

## 4. State Transition Testing

### 4.1 Cart Lifecycle State Model

```
                    +---------------+
        +---------->|   EMPTY       |<--------------+
        |           +-------+-------+               |
        |                   | Add Item               | Clear Cart
        |                   v                        |
        |           +---------------+               |
        |           |  HAS_ITEMS    |---------------+
        |           +-------+-------+
        |                   | ^ ^
        |    Remove last    | | | Add/Update
        |    item           | | |
        |<------------------+ | +------ Update qty
        |                     |
        |                     v
        |           +---------------+
        |           |  CHECKOUT     | (cart reserved)
        |           +-------+-------+
        |                   |
        |          +--------+--------+
        |          v                 v
        |  +------------+   +------------+
        +--| ORDERED    |   | ABANDONED  |
           | (cleared)  |   | (restored) |
           +------------+   +------------+
```

### 4.2 State Transition Table

| Current State | Event | Next State | Action | Test ID |
|--------------|-------|------------|--------|---------|
| EMPTY | Add item | HAS_ITEMS | Create CartItem, update icon | ST-01 |
| EMPTY | View cart | EMPTY | Show empty message + shop link | ST-02 |
| EMPTY | Proceed to checkout | EMPTY | Block: "Cart is empty" | ST-03 |
| HAS_ITEMS | Add item (new) | HAS_ITEMS | Create CartItem | ST-04 |
| HAS_ITEMS | Add item (existing) | HAS_ITEMS | Increment quantity | ST-05 |
| HAS_ITEMS | Update qty > 0 | HAS_ITEMS | Update quantity, recalculate | ST-06 |
| HAS_ITEMS | Update qty = 0 | EMPTY* | Remove item (if last item) | ST-07 |
| HAS_ITEMS | Update qty = 0 | HAS_ITEMS | Remove item (others remain) | ST-08 |
| HAS_ITEMS | Remove item (last) | EMPTY | Delete item, show empty msg | ST-09 |
| HAS_ITEMS | Remove item (not last) | HAS_ITEMS | Delete item, recalculate | ST-10 |
| HAS_ITEMS | Clear cart | EMPTY | Delete all items | ST-11 |
| HAS_ITEMS | Proceed to checkout | CHECKOUT | Validate stock, reserve | ST-12 |
| HAS_ITEMS | Session expires | EXPIRED | Cleanup removes cart | ST-13 |
| HAS_ITEMS | User logs in (merge) | HAS_ITEMS | Merge guest to user cart | ST-14 |

### 4.3 Invalid State Transitions (Negative Tests)

| Current State | Invalid Event | Expected | Test ID |
|--------------|--------------|----------|---------|
| EMPTY | Update item | Error: item not found | ST-NEG-01 |
| EMPTY | Remove item | Error: item not found | ST-NEG-02 |
| EMPTY | Merge (no guest cart) | No-op, return user cart | ST-NEG-03 |
| EXPIRED | Add item | Create new cart (auto-create) | ST-NEG-04 |
| EXPIRED | View cart | New empty cart returned | ST-NEG-05 |

### 4.4 Multi-Step Sequences (Path Coverage)

| Sequence | Steps | Test ID |
|----------|-------|---------|
| Full lifecycle | Empty -> Add A -> Add B -> Update A -> Remove B -> Checkout | ST-SEQ-01 |
| Add-remove cycle | Empty -> Add -> Remove -> Empty -> Add again | ST-SEQ-02 |
| Guest-to-user | Add (guest) -> Login -> Merge -> Checkout | ST-SEQ-03 |
| Clear and restart | Add 3 items -> Clear -> Add 1 item -> Checkout | ST-SEQ-04 |
| Quantity dance | Add (qty=1) -> Update (qty=5) -> Update (qty=0/delete) | ST-SEQ-05 |

---

## 5. Pairwise / Combinatorial Testing

### 5.1 Parameter Identification

The cart has interactions across these dimensions:

| Parameter | Values |
|-----------|--------|
| **User type** | Guest, Registered |
| **Cart state** | Empty, Single item, Multiple items |
| **Operation** | Add, Update, Remove, View, Clear |
| **Product stock** | In stock, Low stock (<=10), Out of stock |
| **Quantity range** | Min (1), Mid (5), Max (=stock) |

Full factorial: 2 x 3 x 5 x 3 x 3 = **270 combinations**
Pairwise covers all pairs in **~15-18 tests**.

### 5.2 Pairwise Test Suite (All-Pairs)

| # | User | Cart State | Operation | Stock | Qty | Test ID |
|---|------|-----------|-----------|-------|-----|---------|
| 1 | Guest | Empty | Add | In stock | 1 | PW-01 |
| 2 | Guest | Single item | Update | Low stock | 5 | PW-02 |
| 3 | Guest | Multiple items | Remove | Out of stock | - | PW-03 |
| 4 | Registered | Empty | Add | Low stock | Max | PW-04 |
| 5 | Registered | Single item | View | In stock | - | PW-05 |
| 6 | Registered | Multiple items | Clear | In stock | - | PW-06 |
| 7 | Guest | Multiple items | Add | In stock | 5 | PW-07 |
| 8 | Registered | Empty | View | Out of stock | - | PW-08 |
| 9 | Guest | Single item | Clear | In stock | - | PW-09 |
| 10 | Registered | Multiple items | Update | Low stock | 1 | PW-10 |
| 11 | Guest | Empty | View | Low stock | - | PW-11 |
| 12 | Registered | Single item | Add | Out of stock | 1 | PW-12 |
| 13 | Guest | Multiple items | View | Low stock | - | PW-13 |
| 14 | Registered | Single item | Remove | In stock | - | PW-14 |
| 15 | Guest | Single item | Add | In stock | Max | PW-15 |

**Reduction: 270 -> 15 tests** (94% reduction), all parameter pairs covered.

---

## 6. Coverage Summary & Gap Analysis

### Technique Yield

| Technique | Tests Designed | Primary Risk Area |
|-----------|---------------|-------------------|
| BVA | 17 | Quantity limits, stock edges, expiry timing |
| EP | 15 | User types, product states, cart states |
| Decision Tables | 15 | Add-to-cart rules, merge logic, checkout eligibility |
| State Transition | 24 | Lifecycle flows, invalid transitions, sequences |
| Pairwise | 15 | Cross-parameter interactions |
| **Total (before dedup)** | **86** | |
| **Estimated unique after dedup** | **~62** | |

### Gaps Found in Existing Tests

Comparing against `cart.test.ts` (current 10 test groups, ~30 test cases):

| Gap | Technique | Test IDs | Risk |
|-----|-----------|----------|------|
| No non-integer quantity test | BVA | BVA-QTY-04 | Medium |
| No negative quantity test (add) | BVA | BVA-QTY-03 | Medium |
| No price boundary/overflow test | BVA | BVA-PRC-02, BVA-PRC-04 | Low |
| No cart expiration boundary test (exact timing) | BVA | BVA-EXP-01..04 | High |
| No out-of-stock product add test | EP | EP-P3 | High |
| No invalid productId test | EP | EP-P4 | Medium |
| No merge with stock conflict test | DT | DT-MERGE-R3 | High |
| No "update last item to 0 -> empty cart" sequence | ST | ST-07 | Medium |
| No full lifecycle sequence test | ST | ST-SEQ-01 | Medium |
| No guest->login->merge->checkout flow | ST | ST-SEQ-03 | High |
| No guest + multiple items + remove combination | PW | PW-03 | Low |
| **Race condition: concurrent stock depletion** | - | - | **High** |

### Highest-Priority Tests to Add

Based on risk and gap analysis, the **top 10 tests to implement first**:

1. **ST-SEQ-03** -- Guest->Login->Merge->Checkout (critical user journey, untested)
2. **DT-MERGE-R3** -- Merge when combined qty exceeds stock (silent skip, untested)
3. **EP-P3** -- Add out-of-stock product (stock = 0, distinct from "exceeds")
4. **BVA-EXP-02/04** -- Cart expiration at exact boundary (7d guest / 30d user)
5. **ST-07** -- Update last item qty to 0 -> cart becomes empty
6. **DT-ADD-R6** -- Add item with qty > stock (first add, not cumulative)
7. **BVA-QTY-03** -- Add with negative quantity
8. **BVA-STK-03** -- Cumulative stock check (cart=9, add 2, stock=10)
9. **ST-SEQ-01** -- Full lifecycle: empty->add->add->update->remove->checkout
10. **EP-P4** -- Add with non-existent productId

### Implementation-Specific Risk: No Transaction Wrapping

The `validateStock()` check at `cart.service.ts:391` and the subsequent `create`/`update` at lines 147/206 are **not wrapped in a database transaction**. This means:

- **Two users could both pass stock validation** and both add the last item
- **Race condition** between stock check and cart write

This is not testable with unit tests but should be flagged for integration/load testing.

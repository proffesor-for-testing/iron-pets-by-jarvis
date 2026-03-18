# Exploratory Test Charters -- Shopping Cart Feature

**Application**: Iron Pets e-commerce | **Feature**: Shopping Cart (REQ-CART-001 -> 005)
**Method**: Session-Based Test Management (SBTM) with RST heuristics and Test Tours
**Date**: 2026-03-18

---

## Charter 1: The Money Tour -- Add to Cart Happy Path & Revenue Impact

```
Charter:     ETC-CART-01
Mission:     Explore the Add to Cart flow to discover if the core revenue
             path works reliably from product browse -> cart -> checkout entry
Tour:        Money Tour (revenue-critical path)
Heuristic:   FEW HICCUPPS -> Claims, Purpose, Users
Time-box:    60 minutes
Risk level:  CRITICAL -- any failure here = $0 revenue
```

**Focus areas:**
- Add single item from PDP -- does confirmation appear? Does cart icon update? (REQ-CART-001.2, 001.3)
- Add same product twice -- does quantity increment or create duplicate? (REQ-CART-001.5)
- Add from PLP via "Quick Add" -- same behavior as PDP? (REQ-CAT-002.6)
- Add items from different categories (Dogs Food + Cats Toys) -- subtotal correct?
- Proceed to Checkout button -- does it appear? Is it clickable? Where does it go?

**Oracles to watch:**
- **Claims**: SRS says confirmation message on add (REQ-CART-001.2) -- does it actually show?
- **Purpose**: Can a first-time buyer complete this without confusion?
- **Users**: "Practical Pet Owner" persona -- can Sarah add dog food in under 30 seconds?

**Notes to capture:**
- Time from "Add to Cart" click to visible confirmation (target: < 500ms per SRS)
- Cart icon count accuracy after each operation
- Subtotal calculation -- does `priceAtAdd` (snapshot) match displayed product price?

---

## Charter 2: The FedEx Tour -- Follow the Data Through the System

```
Charter:     ETC-CART-02
Mission:     Trace cart data from browser -> API -> database -> response to
             discover data integrity issues, especially around priceAtAdd
             snapshot and Decimal precision
Tour:        FedEx Tour (follow data end-to-end)
Heuristic:   SFDIPOT -> Data, Structure
Time-box:    75 minutes
Risk level:  HIGH -- priceAtAdd snapshot creates stale price risk
```

**Focus areas:**
- Add item, then check DB: does `priceAtAdd` match the product's current price? (cart.service.ts:152)
- **Stale price scenario**: Add item -> admin changes product price -> view cart. What price does the user see? The `priceAtAdd` snapshot or the current product price?
- `calculateSubtotal` at line 382-386 uses `item.price * item.quantity` -- but the CartItem model has `priceAtAdd`, not `price`. Is the field name mapping correct? Does the `include: { product: true }` bleed the product's current price into the calculation?
- Decimal precision: add item at $19.99, qty 3. Is subtotal exactly $59.97 or does floating-point drift appear?
- Large cart: add 20 different products. Does subtotal overflow? Does the API response degrade?

**Specific investigation:**
```
cart.service.ts:382-386 -- calculateSubtotal uses item.price
BUT CartItem schema has priceAtAdd, not price
QUESTION: Which field actually gets used? Is there a mismatch
between what Prisma returns and what the calculation reads?
```

**Oracles to watch:**
- **Explainable**: Can I explain why the subtotal is what it is?
- **World**: Real-world expectation -- if I add item at $20 and price changes to $25, what should I pay?

---

## Charter 3: The Bad Neighborhood Tour -- Stock Validation Race Conditions

```
Charter:     ETC-CART-03
Mission:     Explore the gap between stock validation and cart write to
             discover race conditions, since validateStock() and the
             subsequent create/update are NOT wrapped in a transaction
Tour:        Bad Neighborhood (known architectural risk area)
Heuristic:   SFDIPOT -> Time, Operations
Time-box:    90 minutes
Risk level:  CRITICAL -- could allow overselling
```

**The known risk (cart.service.ts:96-165):**
```
Line 100: validateStock(productId, quantity)  <-- CHECK
   ... other DB queries happen ...
Line 147: cartItem.create(...)                <-- WRITE
   <-- No transaction wrapping. Another request could deplete
     stock between CHECK and WRITE.
```

**Exploration strategy:**
1. Product with stock = 1. Open two browser tabs. Click "Add to Cart" simultaneously in both. Do both succeed? (Expected: only one should succeed)
2. Product with stock = 5. Tab A adds qty 3, Tab B adds qty 3 at same time. Both pass validation (3 <= 5), but combined = 6 > 5. Does the system catch this?
3. Guest adds item -> logs in -> merge runs -> simultaneously another guest session adds the same low-stock item. Merge + add overlap.
4. Rapid-fire add: click "Add to Cart" 10 times in 1 second. Does quantity increment cleanly or do we get duplicates violating the `@@unique([cartId, productId])` constraint?

**Oracles to watch:**
- **World**: Real stores prevent overselling -- does Iron Pets?
- **Comparable**: Amazon and Chewy both use inventory reservation -- Iron Pets has none
- **Standards**: REQ-CART-001.4 says "prevent adding more than available stock" -- is this guarantee real under concurrency?

---

## Charter 4: The Rained-Out Tour -- What Happens When Things Fail?

```
Charter:     ETC-CART-04
Mission:     Explore cart behavior under failure conditions: network errors,
             database timeouts, invalid inputs, and deleted products
Tour:        Rained-Out Tour (failure paths)
Heuristic:   SFDIPOT -> Interfaces, Operations; FEW HICCUPPS -> Familiar problems
Time-box:    60 minutes
Risk level:  HIGH -- SRS REQ-REL-003 requires user-friendly error messages
```

**Scenarios to explore:**

| Failure Condition | Explore What Happens |
|---|---|
| Add product that gets deleted mid-session | Cart has productId pointing to nothing. View cart -- crash or graceful? |
| Add item, then product goes to stock=0 | Cart still shows item. Proceed to checkout -- what error? |
| Network disconnect during addItem API call | Does the frontend retry? Double-add? Stale cart state? |
| Invalid session ID (expired/tampered) | Controller reads `req.sessionId` at line 22. What if it's empty string? null? |
| Cart with 0 items -> PUT /cart/items/:id | Update a non-existent item -- is error code `ITEM_NOT_FOUND` returned? HTTP 404 or 400? |
| Malformed productId (SQL injection attempt) | `productId: "'; DROP TABLE carts; --"` -- Prisma should parameterize, but verify |
| Exceed Decimal(10,2) precision | priceAtAdd with value 99999999.999 -- truncated or rejected? |

**Specific code concern:**
```
cart.controller.ts:22 -- sessionId = req.sessionId || req.headers['x-session-id']
QUESTION: What if both are undefined? The service receives undefined
as sessionId. Does getCart create a cart with sessionId=undefined?
Does Prisma reject this? Or does it silently create a ghost cart?
```

**Oracles to watch:**
- **Claims**: REQ-REL-003.1 says "user-friendly error messages" -- are they?
- **Familiar**: Common error patterns -- does the app show stack traces to users?

---

## Charter 5: The Landmark Tour -- Guest <-> User Cart Persistence & Merge

```
Charter:     ETC-CART-05
Mission:     Explore cart persistence across sessions and the guest-to-user
             merge flow, focusing on the silent skip behavior when stock is
             insufficient during merge
Tour:        Landmark Tour (navigate by key features: persistence landmarks)
Heuristic:   SFDIPOT -> Data, Time; FEW HICCUPPS -> Users, Purpose
Time-box:    75 minutes
Risk level:  HIGH -- merge silently drops items without notifying user
```

**Key landmarks to visit:**

1. **Guest persistence (7 days)**: Add items as guest -> close browser -> reopen after hours -> is cart intact? (REQ-CART-005.1)

2. **User persistence (30 days)**: Login -> add items -> logout -> login 2 weeks later -> cart intact? (REQ-CART-005.2)

3. **The Merge (REQ-CART-005.3-005.4)**:
   - Guest has: Product A (qty 2), Product B (qty 1)
   - User already has: Product A (qty 3)
   - Login triggers merge -> Expected: Product A (qty 5), Product B (qty 1)
   - **But what if Product A stock = 4?** Merge silently skips the increment (line 341). User sees qty stays at 3. **No notification that 2 items from guest cart were lost.**

4. **Double merge**: Login -> merge -> quickly call merge API again with same guestSessionId. Guest cart already deleted -- what happens?

5. **Merge price conflict**: Guest added Product A at $20 (priceAtAdd=$20). User had Product A at $18 (priceAtAdd=$18). After merge, increment quantity -- but which priceAtAdd wins? (line 343 only updates quantity, leaves priceAtAdd as-is on existing item)

**Critical finding to investigate:**
```
cart.service.ts:341 -- if (hasStock) { update } ... else { NOTHING }
Silent data loss: user's guest cart items disappear with ZERO feedback.
SRS REQ-CART-005.4 says "Merge shall combine quantities (not exceed stock)"
but says nothing about notifying the user. This is a UX gap.
```

**Oracles to watch:**
- **Users**: Would Sarah know her guest cart items were silently dropped?
- **Purpose**: The merge exists to preserve shopping intent -- silent drops defeat this
- **Comparable**: Amazon shows "These items in your cart have changed" -- Iron Pets shows nothing

---

## Charter 6: The Obsessive-Compulsive Tour -- Rapid Repetitive Cart Operations

```
Charter:     ETC-CART-06
Mission:     Perform rapid, repetitive cart operations to discover timing
             bugs, UI desync, and the "Undo" behavior after remove
Tour:        Obsessive-Compulsive Tour (repetitive actions)
Heuristic:   SFDIPOT -> Time, Function
Time-box:    45 minutes
Risk level:  MEDIUM
```

**Repetitive scenarios:**
- Click "Add to Cart" 20 times rapidly on same product. Final qty should equal 20 (if stock allows). Any duplicates? Any `@@unique` constraint violations?
- Increment quantity with +/- buttons 50 times rapidly. Does the UI keep up? Does the final DB state match the displayed state?
- Add item -> Remove -> Add -> Remove -> Add (5 cycles). Does the cart end in a consistent state?
- Update quantity to 0 (delete) then immediately add the same product. Race between delete and add?
- **Undo after remove**: REQ-CART-004.2 says "show brief Undo option (5 seconds)." Does the undo actually work? What if I remove 2 items quickly -- can I undo both? Does undo restore exact quantity?

**Special attention:**
```
REQ-CART-004.2: Undo option (5 seconds)
Implementation: cart.service.ts removeItem() does an immediate
prisma.cartItem.delete(). There is NO undo mechanism in the service.
QUESTION: Is undo implemented on the frontend only? If so, does
the frontend re-add the item (new priceAtAdd?) or use a soft-delete?
```

**Oracles to watch:**
- **Explainable**: Can I explain the cart state after 20 rapid operations?
- **History**: Do rapid operations leave ghost data in the DB?

---

## Charter 7: The Intellectual Tour -- Subtotal Calculation & Edge Cases

```
Charter:     ETC-CART-07
Mission:     Explore subtotal, line totals, and cart math with adversarial
             inputs to discover arithmetic bugs and display inconsistencies
Tour:        Intellectual Tour (complex/thinking-intensive)
Heuristic:   SFDIPOT -> Data, Function; FEW HICCUPPS -> Standards, World
Time-box:    45 minutes
Risk level:  MEDIUM -- incorrect totals erode trust
```

**Calculations to verify:**
- Line total = price x quantity (REQ-CART-002.3)
- Cart subtotal = sum of all line totals (REQ-CART-002.4)
- Floating point: $19.99 x 3 = $59.97 (not $59.970000000000001)
- Empty cart: subtotal should be $0.00, not null/NaN/undefined
- Single item at $0.01 x qty 1 = $0.01 (minimum)
- Mix of high and low prices: $0.50 item + $499.99 item = $500.49

**`calculateSubtotal` investigation (cart.service.ts:382-386):**
```javascript
return items.reduce((total, item) => {
  return total + (item.price * item.quantity);
}, 0);
```
- Uses `item.price` -- but CartItem has `priceAtAdd`. The `include: { product: true }` relation nests product as `item.product.price`. So is `item.price` actually `undefined`? Or does Prisma flatten it?
- If `item.price` is `undefined`: `undefined * 3 = NaN`. Subtotal would be `NaN`.
- **This might be a latent bug.** Needs careful DB query trace.

**Oracles to watch:**
- **World**: Real money calculations must be exact -- no floating-point surprises
- **Standards**: Financial calculations should use fixed-point (Decimal), not JavaScript `number`

---

## Charter 8: The Garbage Collector Tour -- Cart Cleanup & Expiration

```
Charter:     ETC-CART-08
Mission:     Explore the cart expiration and cleanup mechanism to discover
             orphaned data, timezone issues, and cleanup completeness
Tour:        Garbage Collector Tour (cleanup and edge cases)
Heuristic:   SFDIPOT -> Time, Operations
Time-box:    45 minutes
Risk level:  MEDIUM -- orphaned carts waste DB space, expired carts cause confusion
```

**Exploration areas:**
- `cleanupExpiredCarts()` at line 407 -- this is called "periodically via cron job" but **no cron job is configured**. How do carts actually get cleaned up?
- Create guest cart -> let it expire (mock time to 7+ days) -> try to view cart. Does `getCart()` return the expired cart or create a new one? (getCart doesn't check expiresAt -- line 48-59)
- **Ghost cart**: getCart() at line 48 finds by `userId` or `sessionId` -- it doesn't filter `expiresAt > now`. An expired cart would still be returned and usable.
- Cart items with deleted products: delete a product from DB -> view cart with that item. Does `include: { product: true }` return null? Does subtotal calculation crash?
- User deletes account (REQ-USR-004) -- Cart has `onDelete: Cascade`. Verify items cascade too.

**Specific code concern:**
```
getCart() at line 48-59 does NOT filter by expiresAt.
cleanupExpiredCarts() is the only thing that removes expired carts.
If cleanup never runs, expired carts are IMMORTAL.
A guest from 6 months ago could return and still have their cart.
This contradicts REQ-CART-005.1 (7-day guest expiry).
```

**Oracles to watch:**
- **Claims**: SRS says 7-day/30-day expiry. Is it actually enforced or just a DB field?
- **Operations**: Who runs the cleanup? How often? What happens if it fails?

---

## Charter Prioritization (Recommended Execution Order)

| Priority | Charter | Risk | Time | Rationale |
|----------|---------|------|------|-----------|
| **1st** | ETC-CART-01 Money Tour | Critical | 60m | If happy path fails, nothing else matters |
| **2nd** | ETC-CART-03 Bad Neighborhood | Critical | 90m | Race condition = overselling = real revenue loss |
| **3rd** | ETC-CART-02 FedEx Tour | High | 75m | `calculateSubtotal` field mismatch may be a latent bug |
| **4th** | ETC-CART-05 Landmark Tour | High | 75m | Silent merge data loss is a UX trust-breaker |
| **5th** | ETC-CART-04 Rained-Out | High | 60m | Undefined sessionId could create ghost carts |
| **6th** | ETC-CART-07 Intellectual | Medium | 45m | Subtotal using wrong field name -> NaN risk |
| **7th** | ETC-CART-08 Garbage Collector | Medium | 45m | Expired carts never actually expire |
| **8th** | ETC-CART-06 Obsessive-Compulsive | Medium | 45m | Undo not implemented in backend |

**Total exploration time**: ~8.25 hours across 8 sessions

---

## Three Findings Surfaced During Charter Design

These emerged from reading the code -- worth verifying before any exploration begins:

1. **`calculateSubtotal` may produce `NaN`** -- It reads `item.price` but CartItem stores `priceAtAdd`. If Prisma doesn't flatten the product relation, `item.price` is `undefined` and the subtotal silently becomes `NaN`. (cart.service.ts:384)

2. **Expired carts are never actually filtered** -- `getCart()` has no `expiresAt` check. The 7-day/30-day expiry is only enforced by `cleanupExpiredCarts()` which requires a cron job that doesn't exist. (cart.service.ts:48-59 vs 407-443)

3. **Merge silently drops items with zero user feedback** -- When stock is insufficient during merge, the item is simply not added (line 341). No error, no notification, no return value indicating partial merge. The user's guest cart items vanish. (cart.service.ts:341-346)

---

## Session Debrief Template

After completing each charter, capture:

```
Session ID:    ETC-CART-0X
Charter:       [mission statement]
Duration:      [actual] / [time-box]
Tester:        [name]

Time Breakdown:
  Setup:         __%
  Exploration:   __%
  Bug invest.:   __%
  Note-taking:   __%

Bugs Found:      _ (Critical: _, Major: _, Minor: _)
Questions:       _
Test Ideas:      _

SFDIPOT Coverage:
  [x] Structure  [x] Function  [x] Data
  [x] Interfaces [x] Platform  [x] Operations  [x] Time

Key Discovery:   [single most important finding]
Follow-up:       [next charter or investigation needed]
```

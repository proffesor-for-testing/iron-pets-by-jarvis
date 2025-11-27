# Iron Pets - E2E Checkout Flow Test Plan

## Overview

Comprehensive end-to-end testing strategy for the Iron Pets checkout flow using Playwright, following TDD RED phase principles.

## Test Framework

- **Framework**: Playwright v1.40+
- **Language**: TypeScript
- **Test Runner**: Playwright Test
- **Coverage Target**: 95%+ for checkout flow
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Test Organization

### Directory Structure

```
src/iron-pets/frontend/
├── tests/
│   └── e2e/
│       ├── checkout-flow.spec.ts      # Main checkout tests
│       ├── global-setup.ts            # Pre-test setup
│       └── global-teardown.ts         # Post-test cleanup
├── playwright.config.ts               # Playwright configuration
└── package.json                       # Test scripts
```

## Test Scenarios

### 1. Complete Checkout Flow (Happy Path)
**Coverage**: Full user journey from browsing to confirmation

**Steps**:
1. Browse products catalog
2. Add multiple products to cart
3. View cart with accurate totals
4. Enter shipping information
5. Select shipping method
6. Enter payment details (Stripe)
7. Review order summary
8. Place order
9. Receive order confirmation

**Assertions**:
- ✓ Cart displays correct items and quantities
- ✓ Checkout wizard navigates through all steps
- ✓ Payment processes successfully
- ✓ Order number generated (format: `ORD-XXXXXXXX`)
- ✓ Confirmation email sent

---

### 2. Guest Checkout
**Coverage**: Checkout without account creation

**Steps**:
1. Add products to cart without login
2. Select guest checkout option
3. Provide email for order updates
4. Complete checkout flow
5. Verify cart persists across navigation

**Assertions**:
- ✓ No login required
- ✓ Email captured for notifications
- ✓ Cart persists across page refresh
- ✓ Order completes successfully

---

### 3. Error Handling
**Coverage**: Edge cases and error scenarios

**Test Cases**:
- **Empty Cart**: Redirect to cart when attempting checkout
- **Invalid Address**: Form validation errors
- **Payment Declined**: Stripe test card `4000000000000002`
- **Network Errors**: Offline/timeout handling

**Assertions**:
- ✓ Clear error messages displayed
- ✓ User can retry failed operations
- ✓ No data loss on errors

---

### 4. Cart Persistence
**Coverage**: Cart state management

**Test Cases**:
- Cart survives page refresh
- Cart survives site navigation
- Cart timeout after 24 hours

**Assertions**:
- ✓ Cart items preserved
- ✓ Quantities accurate
- ✓ Totals recalculated correctly

---

### 5. Promo Codes
**Coverage**: Discount code functionality

**Test Cases**:
- Valid percentage discount (`SAVE10`)
- Valid free shipping (`FREESHIP`)
- Invalid code rejection
- Expired code rejection
- Remove applied code

**Assertions**:
- ✓ Discount applied to total
- ✓ Error messages for invalid codes
- ✓ Discount line itemized in summary

---

### 6. Stock Handling
**Coverage**: Inventory management during checkout

**Test Cases**:
- Item becomes out of stock during checkout
- Insufficient quantity available
- Price changes during checkout

**Assertions**:
- ✓ User notified of stock issues
- ✓ Quantity adjustment options provided
- ✓ Cannot complete checkout with unavailable items

---

### 7. Free Shipping
**Coverage**: Shipping threshold logic

**Test Cases**:
- Cart under $50 (shipping charged)
- Cart at $50+ (free shipping)
- Adding items crosses threshold

**Assertions**:
- ✓ Shipping cost accurate
- ✓ Free shipping badge displayed at $50+
- ✓ Progress indicator shows remaining amount

---

### 8. Payment Methods
**Coverage**: Stripe integration

**Test Cards**:
- Success: `4242424242424242`
- Declined: `4000000000000002`
- Expired: `4000000000000069`

**Assertions**:
- ✓ Card validation works
- ✓ Payment errors handled gracefully
- ✓ Secure payment processing

---

### 9. Order Confirmation
**Coverage**: Post-purchase experience

**Assertions**:
- ✓ Order number displayed prominently
- ✓ Order summary accurate
- ✓ Email confirmation message shown
- ✓ All totals match

---

### 10. Order Tracking
**Coverage**: Post-purchase order management

**Test Cases**:
- View order from confirmation page
- Order appears in order history
- Tracking information displayed

**Assertions**:
- ✓ Order details accessible
- ✓ Status timeline visible
- ✓ Expected delivery date shown

## Stripe Test Cards

```javascript
const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',           // Payment succeeds
  DECLINED: '4000000000000002',          // Payment declined
  EXPIRED: '4000000000000069',           // Expired card error
  INSUFFICIENT_FUNDS: '4000000000009995', // Insufficient funds
};
```

**Expiry**: Use any future date (e.g., `12/25`)
**CVC**: Any 3 digits (e.g., `123`)

## Running Tests

### Installation

```bash
cd src/iron-pets/frontend
npm install
npx playwright install --with-deps
```

### Execution

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npm run test:e2e:chromium

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### CI/CD Integration

```bash
# Run in CI environment
CI=true npm run test:e2e
```

## Test Data

### Test Shipping Address

```typescript
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  address: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  phone: '+1-415-555-0123'
}
```

### Promo Codes

- `SAVE10` - 10% discount
- `FREESHIP` - Free shipping
- `EXPIRED2024` - Expired code
- `NOTREAL` - Invalid code

## Expected Results (RED Phase)

### Current Status: ❌ ALL TESTS FAILING

This is **expected** behavior for TDD RED phase.

**Why tests fail**:
- ❌ Checkout components not implemented
- ❌ Cart persistence not built
- ❌ Stripe integration missing
- ❌ Promo code validation not implemented
- ❌ Order confirmation system doesn't exist

### Next Steps (GREEN Phase)

1. **Implement Checkout Components**
   - Multi-step wizard (Shipping → Method → Payment → Review)
   - Form validation with react-hook-form + Zod

2. **Build Cart System**
   - Zustand store for state management
   - localStorage persistence
   - Cart timeout handling

3. **Integrate Stripe**
   - @stripe/react-stripe-js components
   - Payment intent creation
   - Error handling

4. **Add Business Logic**
   - Promo code validation API
   - Stock checking
   - Free shipping threshold

5. **Build Order System**
   - Order creation endpoint
   - Confirmation page
   - Email notifications (SendGrid/Mailgun)

6. **Implement Order Tracking**
   - Order history page
   - Status tracking
   - Delivery estimates

## Test Metrics

### Coverage Goals

- **Line Coverage**: 95%+
- **Branch Coverage**: 90%+
- **Function Coverage**: 95%+
- **Statement Coverage**: 95%+

### Performance Targets

- **Test Execution**: < 5 minutes (all browsers)
- **Average Test Duration**: < 10 seconds per test
- **CI/CD Integration**: < 10 minutes total

## Maintenance

### When to Update Tests

1. **Requirements Change**: Update test scenarios
2. **UI Changes**: Update selectors and assertions
3. **New Features**: Add new test cases
4. **Bug Fixes**: Add regression tests

### Test Stability

- Use `data-testid` attributes (never CSS classes)
- Implement proper wait strategies
- Mock external dependencies
- Use Playwright's auto-wait features

## References

- [Playwright Documentation](https://playwright.dev)
- [Stripe Testing](https://stripe.com/docs/testing)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Iron Pets PRD/SRS](../requirements/)

---

**Generated by**: qe-test-writer subagent
**TDD Phase**: RED (Write Failing Tests)
**Status**: ❌ Tests failing (expected)
**Next Phase**: GREEN (Make tests pass)
**Version**: 1.0.0

# E2E Test Implementation Guide

## Complete Test Suite Structure

The full comprehensive test suite contains **41 tests** across **10 scenarios**. Due to file size, the implementation is organized as follows:

### Files

1. **checkout-flow.spec.ts** - Main test file with condensed structure
2. **checkout-flow-comprehensive.spec.ts** - Reference for full structure
3. **e2e-test-plan.md** - Complete specifications for all 41 tests
4. **IMPLEMENTATION-GUIDE.md** - This file

## Implementing the Full Test Suite

### Option 1: Single File (Recommended for Small Teams)

Expand `checkout-flow.spec.ts` with all 41 tests:

```bash
# Copy structure from comprehensive file
# Add all test scenarios from e2e-test-plan.md
```

### Option 2: Split by Scenario (Recommended for Large Teams)

Create separate files:

```
tests/e2e/
├── scenarios/
│   ├── 01-complete-flow.spec.ts
│   ├── 02-guest-checkout.spec.ts
│   ├── 03-error-handling.spec.ts
│   ├── 04-cart-persistence.spec.ts
│   ├── 05-promo-codes.spec.ts
│   ├── 06-stock-handling.spec.ts
│   ├── 07-free-shipping.spec.ts
│   ├── 08-payment-methods.spec.ts
│   ├── 09-order-confirmation.spec.ts
│   └── 10-order-tracking.spec.ts
└── helpers/
    └── checkout-helper.ts
```

### Option 3: Parallel Execution Groups

Group tests for parallel execution:

```
tests/e2e/
├── critical-path.spec.ts      # Scenarios 1-2 (must pass)
├── error-handling.spec.ts     # Scenario 3
├── cart-features.spec.ts      # Scenarios 4-5
├── inventory.spec.ts          # Scenarios 6-7
├── payment.spec.ts            # Scenario 8
└── post-purchase.spec.ts      # Scenarios 9-10
```

## Test Template

Each test should follow this structure:

```typescript
test.describe('Scenario X: Name', () => {
  test('should do something specific', async ({ page }) => {
    // GIVEN: Setup preconditions
    // - Clear state
    // - Navigate to starting point
    // - Set up test data

    // WHEN: Execute action
    // - Perform user actions
    // - Simulate interactions

    // THEN: Verify outcomes
    // - Assert expected state
    // - Verify UI elements
    // - Check data changes
  });
});
```

## Running Strategy

### Development
```bash
# Run specific scenario
npx playwright test scenarios/01-complete-flow

# Run with UI mode
npm run test:e2e:ui
```

### CI/CD
```bash
# Run critical path first
npx playwright test critical-path

# Run all tests in parallel
npm run test:e2e
```

### Debugging
```bash
# Debug specific test
npx playwright test --debug -g "should complete full checkout"

# Run headed mode
npm run test:e2e:headed
```

## Test Data Management

### Fixtures
```typescript
// test-fixtures.ts
export const testProducts = {
  premiumDogFood: { id: 'premium-dog-food', price: 49.99 },
  catToyBundle: { id: 'cat-toy-bundle', price: 24.99 },
  // ... more products
};

export const testUsers = {
  guest: TEST_SHIPPING_ADDRESS,
  registered: { email: 'test@example.com', password: 'Test123!' }
};
```

### Environment Variables
```bash
# .env.test
BASE_URL=http://localhost:3000
STRIPE_PUBLISHABLE_KEY=pk_test_...
API_BASE_URL=http://localhost:3001
```

## Coverage Goals

### Critical Path (Must Pass)
- Scenario 1: Complete Checkout Flow
- Scenario 2: Guest Checkout

### High Priority
- Scenario 3: Error Handling
- Scenario 8: Payment Methods

### Medium Priority
- Scenario 4: Cart Persistence
- Scenario 5: Promo Codes
- Scenario 7: Free Shipping

### Low Priority (Nice to Have)
- Scenario 6: Stock Handling
- Scenario 9: Order Confirmation
- Scenario 10: Order Tracking

## Maintenance

### When to Update

1. **UI Changes** - Update selectors
2. **Flow Changes** - Update test steps
3. **New Features** - Add new tests
4. **Bug Fixes** - Add regression tests

### Best Practices

1. Use `data-testid` for selectors
2. Avoid CSS class selectors
3. Use Playwright's auto-wait features
4. Mock external services
5. Clean up test data
6. Run locally before committing

## Troubleshooting

### Tests Timing Out
- Increase timeout in playwright.config.ts
- Check for slow network requests
- Add explicit waits where needed

### Flaky Tests
- Improve wait strategies
- Check for race conditions
- Stabilize test data

### CI Failures
- Check browser compatibility
- Verify environment variables
- Review CI logs

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Design Patterns](https://playwright.dev/docs/test-patterns)
- [E2E Test Plan](./e2e-test-plan.md)
- [Stripe Testing](https://stripe.com/docs/testing)

---

**Status**: Implementation guide for 41-test comprehensive suite
**Last Updated**: 2025-11-26

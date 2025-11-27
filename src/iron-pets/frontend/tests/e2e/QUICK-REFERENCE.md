# E2E Tests - Quick Reference Card

## Test Files

```
tests/e2e/
├── checkout-flow.spec.ts              # Main test file (438 lines)
├── checkout-flow-comprehensive.spec.ts # Full structure reference
├── global-setup.ts                     # Pre-test setup
├── global-teardown.ts                  # Post-test cleanup
├── README.md                           # Quick start guide
├── IMPLEMENTATION-GUIDE.md             # Implementation strategies
└── QUICK-REFERENCE.md                  # This file
```

## Quick Commands

```bash
# Installation
npm install
npx playwright install --with-deps

# Run tests
npm run test:e2e              # All tests
npm run test:e2e:ui           # UI mode (best for dev)
npm run test:e2e:headed       # See browser
npm run test:e2e:debug        # Debug mode
npm run test:e2e:chromium     # Chromium only
npm run test:e2e:report       # View report

# CI mode
CI=true npm run test:e2e
```

## Test Statistics

- **Total Scenarios**: 10
- **Total Tests**: 41
- **Lines of Code**: 1,037
- **Target Coverage**: 95%+

## Test Scenarios (10)

| # | Scenario | Tests | Priority |
|---|----------|-------|----------|
| 1 | Complete Checkout Flow | 1 | Critical |
| 2 | Guest Checkout | 3 | Critical |
| 3 | Error Handling | 6 | High |
| 4 | Cart Persistence | 3 | Medium |
| 5 | Promo Codes | 5 | Medium |
| 6 | Stock Handling | 3 | Medium |
| 7 | Free Shipping | 3 | Medium |
| 8 | Payment Methods | 4 | High |
| 9 | Order Confirmation | 3 | Low |
| 10 | Order Tracking | 3 | Low |

## Stripe Test Cards

```javascript
SUCCESS:    '4242424242424242'  // ✅ Payment succeeds
DECLINED:   '4000000000000002'  // ❌ Card declined
EXPIRED:    '4000000000000069'  // ❌ Expired card
```

**Expiry**: Any future date (12/25)
**CVC**: Any 3 digits (123)

## Key Selectors

```javascript
// Products
'[data-testid="product-card-{name}"]'
'[data-testid="add-to-cart-button"]'

// Cart
'[data-testid="cart-icon"]'
'[data-testid="cart-count"]'
'[data-testid="cart-total"]'
'[data-testid="checkout-button"]'

// Checkout
'[data-testid="first-name"]'
'[data-testid="email"]'
'[data-testid="shipping-method-standard"]'
'[data-testid="stripe-card-element"]'
'[data-testid="place-order-button"]'

// Confirmation
'[data-testid="order-number"]'
'[data-testid="email-confirmation-message"]'
```

## Test Data

```javascript
// Shipping Address
const TEST_SHIPPING_ADDRESS = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  address: '123 Main Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  phone: '+1-415-555-0123'
};

// Promo Codes
SAVE10:        10% discount
FREESHIP:      Free shipping
EXPIRED2024:   Expired code
NOTREAL:       Invalid code
```

## CheckoutHelper Class

```javascript
// Usage in tests
const helper = new CheckoutHelper(page);

await helper.addProductToCart('premium-dog-food', 2);
await helper.navigateToCart();
await helper.proceedToCheckout();
await helper.fillShippingAddress();
await helper.continueToShippingMethod();
await helper.selectShippingMethod('standard');
await helper.continueToPayment();
await helper.fillStripePaymentInfo(STRIPE_TEST_CARDS.SUCCESS);
await helper.continueToReview();
await helper.placeOrder();

const total = await helper.getCartTotal();
const count = await helper.getCartItemCount();
```

## TDD Status

**Current Phase**: ❌ RED (Write Failing Tests)

**Why tests fail**:
- No checkout components
- No cart system
- No Stripe integration
- No promo codes
- No order system

**Next Phase**: ✅ GREEN (Make tests pass)

## Common Issues

### Test Timeout
```typescript
// Increase timeout
test.setTimeout(60000);

// Or in config
timeout: 60000
```

### Flaky Test
```typescript
// Add explicit waits
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="element"]');
```

### CI Failure
```bash
# Run locally first
npm run test:e2e

# Check environment
echo $BASE_URL
echo $STRIPE_PUBLISHABLE_KEY
```

## Browser Support

- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)
- ✅ Tablet (iPad Pro)

## Documentation

- **Test Plan**: `/docs/iron-pets/testing/e2e-test-plan.md`
- **Summary**: `/docs/iron-pets/testing/TEST-SUITE-SUMMARY.md`
- **Implementation**: `./IMPLEMENTATION-GUIDE.md`
- **Quick Start**: `./README.md`

## Links

- [Playwright Docs](https://playwright.dev)
- [Stripe Testing](https://stripe.com/docs/testing)
- [TDD Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-26
**Status**: ❌ RED Phase (Tests failing as expected)

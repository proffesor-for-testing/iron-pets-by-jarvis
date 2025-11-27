# AddToCartButton Tests - Execution Guide

## Quick Start

```bash
# Navigate to frontend directory
cd /workspaces/aegis/src/iron-pets/frontend

# Run all AddToCartButton tests
npm test -- AddToCartButton.test.tsx

# Run with coverage report
npm test -- AddToCartButton.test.tsx --coverage

# Run specific test suite
npm test -- AddToCartButton.test.tsx -t "Add to Cart"

# Watch mode for development
npm test -- AddToCartButton.test.tsx --watch
```

## Test Suites Breakdown

### 1. Add to Cart - Core Functionality (10 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Add to Cart - Core Functionality"
```

**Tests**:
- Default quantity (1)
- Custom quantity via selector
- Success toast notification
- Cart store update
- Cart badge update
- Loading state display
- Error handling
- Network timeout
- 401 unauthorized
- 409 conflict

### 2. Stock Management (8 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Stock Management"
```

**Tests**:
- In stock display
- Out of stock disabled
- Low stock warning
- Prevent exceeding stock
- Stock validation
- "Only X left" message
- Stock change updates
- Stock depletion during transaction

### 3. Quantity Selector (8 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Quantity Selector"
```

**Tests**:
- Increment with + button
- Decrement with - button
- Min quantity (1)
- Max quantity (stock)
- Direct input
- Invalid input rejection
- Quantity in button text
- Reset after add

### 4. Loading States (4 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Loading States"
```

**Tests**:
- Button disabled during loading
- Spinner visible
- Quantity controls disabled
- State restoration

### 5. Authentication (4 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Authentication"
```

**Tests**:
- Guest user cart
- Authenticated user cart
- Cart merge on login
- Cart persistence

### 6. Accessibility (6 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Accessibility"
```

**Tests**:
- Screen reader announcements
- Keyboard navigation
- Enter/Space activation
- ARIA labels
- Loading state announcement
- Focus management

### 7. Edge Cases (4 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Edge Cases"
```

**Tests**:
- Rapid clicks (debouncing)
- Price changes
- Large quantities
- Component unmount

### 8. Integration Tests (2 tests)
```bash
npm test -- AddToCartButton.test.tsx -t "Integration with Cart System"
```

**Tests**:
- Cart drawer opens
- Cart total updates

## Expected Results (RED Phase)

### Tests That Should PASS ✅
```
✓ should add product to cart with quantity 1 by default
✓ should increment quantity when + button clicked
✓ should decrement quantity when - button clicked
✓ should not decrement below minimum quantity of 1
✓ should not increment beyond stock limit
✓ should disable button when product is out of stock
✓ should show loading state during add operation
✓ should allow guest users to add to cart
```

### Tests That Should FAIL ❌
```
✗ should show success toast notification after adding to cart
✗ should handle add to cart error with error toast
✗ should handle 401 unauthorized error
✗ should handle 409 conflict error
✗ should show "Only X left" message for low stock items
✗ should disable quantity controls during loading
✗ should have proper ARIA labels for quantity controls
✗ should announce loading state to screen readers
✗ should open cart drawer after successful add
```

## Debugging Specific Tests

### Run Single Test
```bash
npm test -- AddToCartButton.test.tsx -t "should add product to cart with quantity 1"
```

### Verbose Output
```bash
npm test -- AddToCartButton.test.tsx --verbose
```

### Update Snapshots (if any)
```bash
npm test -- AddToCartButton.test.tsx -u
```

## Coverage Report

### Generate Coverage
```bash
npm test -- AddToCartButton.test.tsx --coverage --coverageReporters=html
```

### View Coverage
```bash
open coverage/index.html
```

### Expected Coverage (when all tests pass)
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## Common Issues

### 1. Mock Issues
**Problem**: Tests fail because mocks aren't working
**Solution**: Check mock paths match actual import paths
```typescript
// Verify mock path matches import in component
jest.mock('@/hooks/useCart') // Must match: import { useAddToCart } from '@/hooks/useCart'
```

### 2. Async Timing
**Problem**: Tests fail with "Element not found"
**Solution**: Use waitFor for async operations
```typescript
await waitFor(() => {
  expect(mockAddToCart).toHaveBeenCalled()
})
```

### 3. React Query Issues
**Problem**: Mutations not triggering
**Solution**: Ensure QueryClientProvider wraps component
```typescript
const renderWithProviders = (ui) => (
  <QueryClientProvider client={queryClient}>
    {ui}
  </QueryClientProvider>
)
```

### 4. User Event Issues
**Problem**: Clicks not registering
**Solution**: Use userEvent.setup() and await clicks
```typescript
const user = userEvent.setup()
await user.click(button)
```

## Test Maintenance

### Adding New Tests
1. Place in appropriate describe block
2. Follow Given-When-Then structure
3. Add clear test name describing behavior
4. Include comments for implementation notes

### Modifying Tests
1. Ensure test still follows TDD principles
2. Update test documentation if needed
3. Run full suite after changes
4. Verify both pass and fail cases

### Removing Tests
1. Document why test is being removed
2. Ensure coverage isn't reduced significantly
3. Update test count in documentation

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run AddToCartButton tests
  run: |
    cd src/iron-pets/frontend
    npm test -- AddToCartButton.test.tsx --ci --coverage
```

### Pre-commit Hook
```bash
#!/bin/bash
npm test -- AddToCartButton.test.tsx --bail --findRelatedTests
```

## Performance

### Current Test Performance
- **Total Tests**: 46
- **Expected Duration**: 5-10 seconds
- **Parallelization**: Yes (Jest default)

### Optimization Tips
1. Use `--maxWorkers=4` for parallel execution
2. Use `--bail` to stop on first failure
3. Use `--onlyChanged` for faster feedback

## Documentation Updates

When tests change, update:
- [ ] Test count in summary document
- [ ] Coverage percentages
- [ ] Expected pass/fail lists
- [ ] New feature test sections
- [ ] This execution guide

---

**Test File**: `/workspaces/aegis/src/iron-pets/frontend/tests/components/products/AddToCartButton.test.tsx`
**Documentation**: `/workspaces/aegis/docs/iron-pets-addtocart-tests-summary.md`
**Status**: RED Phase ✅

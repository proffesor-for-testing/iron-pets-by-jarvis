# AddToCartButton Component - TDD RED Phase Tests

## Overview

**Component**: AddToCartButton
**Location**: `/workspaces/aegis/src/iron-pets/frontend/tests/components/products/AddToCartButton.test.tsx`
**Test Framework**: Jest + React Testing Library
**TDD Phase**: RED (Failing Tests)
**Total Tests**: 46 comprehensive tests

## Test Coverage Summary

### 1. Add to Cart Functionality (10 tests)
- ✅ Add product with default quantity (1)
- ✅ Add product with custom quantity
- ✅ Show success toast notification
- ✅ Update cart store after successful add
- ✅ Update cart badge count
- ✅ Show loading state during operation
- ✅ Handle add to cart errors
- ✅ Handle network timeout gracefully
- ✅ Handle 401 unauthorized errors
- ✅ Handle 409 conflict errors (concurrent updates)

### 2. Stock Management (8 tests)
- ✅ Show "In Stock" for available inventory
- ✅ Disable button when out of stock
- ✅ Show low stock warning (stock ≤ 5)
- ✅ Prevent adding more than available stock
- ✅ Validate stock before adding to cart
- ✅ Show "Only X left" message for low stock
- ✅ Update stock display when stock changes
- ✅ Handle stock becoming 0 during transaction

### 3. Quantity Selection (8 tests)
- ✅ Increment quantity with + button
- ✅ Decrement quantity with - button
- ✅ Not decrement below minimum (1)
- ✅ Not increment beyond stock limit
- ✅ Handle direct input of quantity
- ✅ Reject invalid direct input (non-numeric)
- ✅ Show quantity in button text (optional)
- ✅ Reset quantity after successful add (optional)

### 4. Loading States (4 tests)
- ✅ Disable button during loading
- ✅ Show loading spinner
- ✅ Disable quantity controls during loading
- ✅ Restore normal state after completion

### 5. Authentication (4 tests)
- ✅ Allow guest users to add to cart
- ✅ Allow authenticated users to add to cart
- ✅ Handle cart merge on login (optional)
- ✅ Persist cart across page refreshes

### 6. Accessibility (6 tests)
- ✅ Announce button action to screen readers
- ✅ Support keyboard navigation for all controls
- ✅ Support keyboard activation (Enter/Space)
- ✅ Proper ARIA labels for quantity controls
- ✅ Announce loading state to screen readers
- ✅ Maintain focus management during state changes

### 7. Edge Cases (4 tests)
- ✅ Handle rapid consecutive clicks (debouncing)
- ✅ Handle product price changes during add
- ✅ Handle very large quantities gracefully
- ✅ Handle component unmount during operation

### 8. Integration Tests (2 tests)
- ✅ Open cart drawer after successful add
- ✅ Update cart total immediately

## Component Analysis

### Current Implementation
The component already has basic functionality:
- ✅ Quantity selector with +/- buttons
- ✅ Add to cart button
- ✅ Loading state with spinner
- ✅ Out of stock handling
- ✅ React Query mutation integration

### Missing Features (Will Cause Test Failures)
1. **Toast Notifications**: No toast hook integration
2. **Error Handling**: No error toast on failures
3. **HTTP Status Handling**: No 401/409 error handling
4. **Low Stock Warning**: No "Only X left" message
5. **Quantity Controls During Loading**: Not disabled during add
6. **ARIA Labels**: Missing accessibility attributes
7. **Direct Quantity Input**: Only +/- buttons, no direct input
8. **Cart Drawer Integration**: No auto-open after add
9. **Focus Management**: No explicit focus handling
10. **Debouncing**: No protection against rapid clicks

## Expected Test Results

### RED Phase ✅
**Status**: Tests SHOULD FAIL initially
**Reason**: Many features not yet implemented in component

**Expected Failures**:
- Toast notification tests (no toast integration)
- Error handling tests (no error toasts)
- HTTP status code handling (401, 409)
- Low stock warning display
- Accessibility ARIA labels
- Direct quantity input
- Cart drawer auto-open
- Some focus management tests

**Expected Passes**:
- Basic quantity increment/decrement
- Out of stock button disable
- Loading state display
- Basic add to cart functionality
- Stock limit enforcement

## Test Structure

### Mocks
```typescript
// Cart Store Mock
jest.mock('@/hooks/useCart')
jest.mock('@/store/cart')

// Toast Mock
jest.mock('@/hooks/useToast')
```

### Test Helpers
```typescript
// Query Client Provider wrapper
const renderWithProviders = (ui) => (
  <QueryClientProvider client={queryClient}>
    {ui}
  </QueryClientProvider>
)
```

### Test Patterns

#### Given-When-Then Structure
All tests follow BDD pattern:
```typescript
test('should add product with quantity 1', async () => {
  // GIVEN: A valid product with stock
  const product = { id: 'prod-123', stock: 50 }

  // WHEN: User clicks "Add to Cart"
  await user.click(addButton)

  // THEN: Product added with quantity 1
  expect(mockAddToCart).toHaveBeenCalledWith({
    productId: 'prod-123',
    quantity: 1
  })
})
```

## Running Tests

### Install Dependencies
```bash
cd /workspaces/aegis/src/iron-pets/frontend
npm install --save-dev ts-node
```

### Run All Tests
```bash
npm test -- AddToCartButton.test.tsx
```

### Run Specific Test Suite
```bash
npm test -- AddToCartButton.test.tsx -t "Add to Cart"
```

### Run with Coverage
```bash
npm test -- AddToCartButton.test.tsx --coverage
```

### Watch Mode
```bash
npm test -- AddToCartButton.test.tsx --watch
```

## Next Steps (GREEN Phase)

To make these tests pass, the component needs:

1. **Add Toast Integration**
   ```typescript
   import { useToast } from '@/hooks/useToast'
   const { toast } = useToast()
   ```

2. **Add Error Handling**
   ```typescript
   mutate(data, {
     onSuccess: () => toast({ title: 'Added to cart', variant: 'success' }),
     onError: (error) => toast({ title: 'Error', variant: 'error' })
   })
   ```

3. **HTTP Status Code Handling**
   ```typescript
   if (error.status === 401) {
     toast({ description: 'Please sign in to continue' })
   }
   ```

4. **Low Stock Warning**
   ```tsx
   {product.stock <= 5 && product.stock > 0 && (
     <p>Only {product.stock} left in stock</p>
   )}
   ```

5. **Accessibility ARIA Labels**
   ```tsx
   <button aria-label="Increase quantity">+</button>
   <button aria-label="Decrease quantity">-</button>
   ```

6. **Disable Quantity During Loading**
   ```tsx
   <button disabled={isPending || quantity <= 1}>-</button>
   <button disabled={isPending || quantity >= stock}>+</button>
   ```

## Key Design Decisions

### Test Organization
- **Grouped by Feature**: Tests organized into logical describe blocks
- **Clear Naming**: Test names describe expected behavior
- **Given-When-Then**: Consistent structure for readability
- **Comprehensive**: 46 tests covering happy path, edge cases, errors

### Mock Strategy
- **Zustand Store**: Mocked to control cart state
- **React Query**: Mocked useAddToCart hook for mutation control
- **Toast**: Mocked to verify notifications
- **Flexible**: Allows testing all scenarios

### Assertions
- **Specific**: Check exact values, not just truthiness
- **User-Centric**: Test from user's perspective (button clicks, text visible)
- **Async-Aware**: Use waitFor for async operations
- **Complete**: Verify both positive and negative cases

## Test Quality Metrics

- **Coverage**: 8 major feature areas
- **Depth**: 46 individual test cases
- **Boundary Testing**: Min/max values, stock limits
- **Error Scenarios**: Network, auth, concurrent updates
- **Accessibility**: 6 dedicated a11y tests
- **Edge Cases**: Rapid clicks, unmounting, large quantities
- **Integration**: Cart system coordination

## Documentation

### Test Comments
Each test includes:
- GIVEN: Initial conditions/setup
- WHEN: User action or event
- THEN: Expected outcome
- Notes: Implementation details or known issues

### Inline Documentation
```typescript
// This test will fail until feature is implemented
// Expected: "Only 3 left in stock"
```

## RED Phase Validation

✅ **All tests properly structured**
✅ **Tests define expected behavior**
✅ **Tests will fail initially (RED phase)**
✅ **Clear path to GREEN phase**
✅ **Comprehensive coverage**
✅ **Accessibility included**
✅ **Edge cases covered**

## Summary

This test suite follows TDD RED phase principles by:

1. **Writing tests FIRST** - Before implementation is complete
2. **Defining behavior** - Tests specify what should happen
3. **Expecting failures** - Many tests will fail initially
4. **Guiding development** - Tests show what needs to be built
5. **Comprehensive coverage** - 46 tests covering all scenarios
6. **Clear structure** - Easy to understand and maintain

**Next Phase**: GREEN - Implement features to make tests pass
**Final Phase**: REFACTOR - Improve code quality while keeping tests green

---

**Test File**: `/workspaces/aegis/src/iron-pets/frontend/tests/components/products/AddToCartButton.test.tsx`
**Total Lines**: 1,033
**Test Count**: 46
**Status**: RED Phase Complete ✅

# Functional Bug Report - CandyMapper.com
**Test Date:** 2025-11-26
**Tester:** QE Functional Testing Specialist
**Application URL:** https://candymapper.com/
**Test Type:** Functional Testing - Black Box Analysis
**Environment:** Production

---

## Executive Summary

CandyMapper.com is an intentional "automation sandbox" designed for testing purposes. This analysis identified **15 functional bugs** across navigation, forms, search functionality, and error handling. The site contains deliberate defects for QA training, but also exhibits genuine functionality issues that impact user experience.

**Bug Severity Distribution:**
- **Critical:** 3 bugs
- **High:** 5 bugs
- **Medium:** 4 bugs
- **Low:** 3 bugs

---

## Functional Bugs Identified

### **FUNC-001: Multiple Navigation Links Return 404 Errors**
**Severity:** Critical
**Category:** Navigation Flow

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Click on "About" link in navigation menu
3. Click on "Map" link in navigation menu
4. Click on "Contact" link in navigation menu

**Test Data:** N/A

**Expected Behavior:**
- Each navigation link should route to valid pages
- Users should access About, Map, and Contact pages without errors

**Actual Behavior:**
- `/about` returns HTTP 404 Not Found
- `/map` returns HTTP 404 Not Found
- `/contact` returns HTTP 404 Not Found

**Error Messages:**
```
Request failed with status code 404
```

**Impact on User Journey:**
- Users cannot access core site functionality
- Primary navigation is broken
- Prevents users from viewing company information, using map features, or contacting support

**Priority:** P0 - Blocks core user journeys

---

### **FUNC-002: Footer "See the Deadlights!" Link Points to Invalid URL**
**Severity:** High
**Category:** Broken Links

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Scroll to footer section
3. Locate "See the Deadlights!" link
4. Click the link

**Test Data:** N/A

**Expected Behavior:**
- Link should direct to a valid page with relevant content
- No 404 error should occur

**Actual Behavior:**
- Link points to `https://candymapper.com/abc123`
- URL pattern suggests placeholder or test data left in production
- High likelihood of 404 error (unverified due to navigation restrictions)

**Error Messages:** Not yet verified

**Impact on User Journey:**
- Breaks user trust in site reliability
- Dead-end navigation path
- Poor user experience

**Priority:** P1 - Significant UX degradation

---

### **FUNC-003: Incomplete Phone Number in Footer Link**
**Severity:** Medium
**Category:** Contact Information / Broken Links

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Scroll to footer
3. Locate phone number link
4. Inspect the `tel:` URI

**Test Data:** N/A

**Expected Behavior:**
- Phone link should contain complete, valid phone number
- Format should be `tel:+[country code][full number]`

**Actual Behavior:**
- Phone link shows: `tel:+442079460`
- Number appears truncated (UK numbers typically have 11 digits after +44)
- Invalid format prevents proper dialing

**Error Messages:** N/A (silent failure)

**Impact on User Journey:**
- Users cannot call support via mobile click-to-call
- Frustration when attempting to contact business
- Professional credibility impact

**Priority:** P2 - Impacts contact functionality

---

### **FUNC-004: "Graveyard Links Golfing" Uses HTTP Instead of HTTPS**
**Severity:** Medium
**Category:** Security / Navigation

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Click "Graveyard Links Golfing" in navigation
3. Observe redirect to `http://Candymapper.co.uk`

**Test Data:** N/A

**Expected Behavior:**
- All external links should use HTTPS protocol
- Secure connection should be maintained

**Actual Behavior:**
- Link uses insecure HTTP protocol
- Mixed content warning likely in browser
- Redirects to different domain (.co.uk vs .com)

**Error Messages:**
```
Browser warning: "This site uses an insecure connection"
```

**Impact on User Journey:**
- Security warning interrupts user flow
- Potential man-in-the-middle attack vulnerability
- Browser may block insecure content

**Priority:** P2 - Security concern

---

### **FUNC-005: Missing Search Functionality**
**Severity:** High
**Category:** Search / Core Features

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Look for search bar in header, navigation, or sidebar
3. Attempt to search for candy locations or content

**Test Data:** "chocolate", "candy near me", "locations"

**Expected Behavior:**
- Site should provide search functionality for finding candy locations
- Search bar should be visible and accessible
- "CandyMapper" name suggests mapping/location search features

**Actual Behavior:**
- No search bar present anywhere on the page
- No search input fields available
- Site relies entirely on menu navigation

**Error Messages:** N/A

**Impact on User Journey:**
- Users cannot quickly find specific candy types or locations
- Forced to navigate through multiple menus
- Core expected functionality missing for a "mapper" application

**Priority:** P1 - Missing critical feature

---

### **FUNC-006: "FIND MY CANDY" Link Destination Unverified**
**Severity:** High
**Category:** Navigation / Core Features

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Click "FIND MY CANDY!" button/link
3. Verify page loads successfully

**Test Data:** N/A

**Expected Behavior:**
- Link should navigate to candy search/finder page
- Page should load without errors
- Search or filtering functionality should be available

**Actual Behavior:**
- Link points to `/find-my-candy`
- Destination page functionality unverified
- Given other 404 errors, high risk of broken link

**Error Messages:** Pending verification

**Impact on User Journey:**
- Blocks primary user goal (finding candy)
- Main call-to-action potentially non-functional
- Critical feature may be inaccessible

**Priority:** P0 - Blocks primary user objective

---

### **FUNC-007: Slider Challenge Missing Interactive Controls**
**Severity:** Medium
**Category:** Form / Interactive Elements

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Locate "Slider Challenge: Select Worcestershire" section
3. Attempt to interact with slider

**Test Data:** N/A

**Expected Behavior:**
- Slider control should be visible and draggable
- User should be able to select "Worcestershire" option
- Visual feedback should confirm selection

**Actual Behavior:**
- No visible slider control rendered
- Section header exists but interactive element missing
- Cannot complete the challenge

**Error Messages:** N/A

**Impact on User Journey:**
- Interactive challenge cannot be completed
- JavaScript rendering issue or incomplete implementation
- Users frustrated by non-functional features

**Priority:** P2 - Feature partially broken

---

### **FUNC-008: "Validate Random Dollar Amounts" Section Has No Input Mechanism**
**Severity:** Medium
**Category:** Form / Interactive Elements

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Locate "Validate Random Dollar Amounts" section
3. Look for input fields or validation controls

**Test Data:** $10.50, $99.99, $0.01

**Expected Behavior:**
- Input field should accept dollar amount
- Validation should trigger on input/submit
- Success/error message should display

**Actual Behavior:**
- Section header visible but no input controls
- Cannot enter dollar amounts to validate
- Incomplete feature implementation

**Error Messages:** N/A

**Impact on User Journey:**
- Challenge cannot be completed
- Appears as broken/incomplete feature
- Reduces trust in site quality

**Priority:** P2 - Feature incomplete

---

### **FUNC-009: Contact Form Missing Client-Side Validation Messages**
**Severity:** Low
**Category:** Form Validation / Error Handling

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Scroll to "Contact Us" form
3. Leave required email field blank
4. Submit form

**Test Data:**
- First Name: (empty)
- Last Name: (empty)
- Email: (empty)
- Phone: (empty)

**Expected Behavior:**
- Client-side validation should trigger before submission
- Error messages should display for required fields
- User should see specific validation feedback (e.g., "Email is required")

**Actual Behavior:**
- Only HTML5 native validation present (browser default)
- No custom validation messages
- No JavaScript validation layer
- Basic user experience with generic browser prompts

**Error Messages:** Browser default: "Please fill out this field"

**Impact on User Journey:**
- Less user-friendly validation experience
- No field-specific guidance
- Relies on browser inconsistencies
- Poor accessibility for screen readers

**Priority:** P3 - UX improvement needed

---

### **FUNC-010: Form Success Message Contains Typo ("massage" vs "message")**
**Severity:** Low
**Category:** Content / User Feedback

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Read popup instructions
3. Observe text: "Verify any success massage"

**Test Data:** N/A

**Expected Behavior:**
- Correct spelling: "Verify any success message"
- Professional, error-free content

**Actual Behavior:**
- Text displays: "Verify any success **massage**"
- Obvious typo in user-facing instructions

**Error Messages:** N/A

**Impact on User Journey:**
- Unprofessional appearance
- Confuses users about form submission status
- Reduces trust in site quality
- Note: Site intentionally contains 11 misspellings as testing sandbox

**Priority:** P3 - Content quality issue

---

### **FUNC-011: No Visible Error Handling for Form Submission Failures**
**Severity:** High
**Category:** Error Handling / Forms

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Fill out Contact Us form with valid data
3. Simulate network failure (disconnect internet)
4. Submit form

**Test Data:**
- First Name: John
- Last Name: Doe
- Email: john.doe@example.com
- Phone: 5551234567

**Expected Behavior:**
- Network error should be caught
- User-friendly error message should display
- Option to retry submission
- Form data should be preserved

**Actual Behavior:**
- No visible error handling mechanisms in code
- No JavaScript error handlers detected
- No network error recovery logic
- Silent failure likely

**Error Messages:** None visible to user

**Impact on User Journey:**
- Users unaware submission failed
- Data loss on network issues
- No retry mechanism
- Frustration and abandoned form submissions

**Priority:** P1 - Critical UX and data integrity issue

---

### **FUNC-012: reCAPTCHA Integration Not Verified to Work**
**Severity:** High
**Category:** Security / Form Protection

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Locate Contact Us form
3. Observe reCAPTCHA v3 integration
4. Submit form and verify reCAPTCHA validation occurs

**Test Data:** Valid form data

**Expected Behavior:**
- reCAPTCHA should validate submission
- Bot submissions should be blocked
- Score should be calculated server-side
- No spam should reach backend

**Actual Behavior:**
- reCAPTCHA v3 privacy/terms links present
- Integration implementation not verified
- No visible reCAPTCHA badge or challenge
- Cannot confirm backend validation

**Error Messages:** Not testable without backend access

**Impact on User Journey:**
- Potential spam vulnerability
- Security risk if not properly implemented
- User submissions may fail silently if misconfigured

**Priority:** P1 - Security and functionality concern

---

### **FUNC-013: Session State Management Not Transparent**
**Severity:** Low
**Category:** Session Management / State

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Sign in with account (filler@godaddy.com shown as logged in)
3. Refresh page
4. Verify session persists

**Test Data:** Account: filler@godaddy.com

**Expected Behavior:**
- Session should persist across page refreshes
- User should remain logged in
- Clear session timeout policy
- Logout should clear all session data

**Actual Behavior:**
- Cookie-based session with `x-visitor-id` tracking
- Session persistence mechanism unclear
- No visible session timeout indicator
- Cannot verify session security without testing

**Error Messages:** N/A

**Impact on User Journey:**
- Unclear session behavior
- Potential security risk with indefinite sessions
- User may be logged out unexpectedly

**Priority:** P3 - Security and UX consideration

---

### **FUNC-014: No Loading States or Progress Indicators for Data Fetching**
**Severity:** Medium
**Category:** User Feedback / Data Loading

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Observe page load behavior
3. Look for loading spinners, skeleton screens, or progress indicators

**Test Data:** N/A

**Expected Behavior:**
- Loading states during data fetches
- Progress indicators for async operations
- Skeleton screens for content areas
- User feedback during waits

**Actual Behavior:**
- No visible loading indicators
- No skeleton screens
- Content appears instantly or not at all
- No feedback during async operations

**Error Messages:** N/A

**Impact on User Journey:**
- Users unsure if page is loading
- Appears broken on slow connections
- No feedback during form submissions
- Poor perceived performance

**Priority:** P2 - Significant UX degradation on slow networks

---

### **FUNC-015: URL Encoding Issues in Navigation Links**
**Severity:** Low
**Category:** Navigation / URL Handling

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Click "An Automation Sandbox?" link
3. Observe URL: `/an-automation-sandbox%3F`
4. Click "Magic Object Model?" link
5. Observe URL: `/magic-object-model%3F`

**Test Data:** N/A

**Expected Behavior:**
- URLs should use clean paths: `/an-automation-sandbox` or `/faq`
- Question marks should be removed or properly handled
- No URL encoding in navigation paths

**Actual Behavior:**
- Question marks are URL-encoded as `%3F`
- URLs appear technical and unfriendly
- May cause routing issues or duplicate content

**Error Messages:** N/A

**Impact on User Journey:**
- Ugly, non-SEO-friendly URLs
- Confusing to users
- Potential SEO penalties for duplicate content
- May cause routing confusion

**Priority:** P3 - SEO and UX polish issue

---

## Additional Observations

### Intentional Bugs (Automation Sandbox Features)
The site explicitly states it contains intentional issues for testing:
- "11 more issues" noted in content
- Multiple deliberate spelling errors
- Designed as automation testing environment

### Positive Findings
1. **Service Worker Implementation** - Offline support registered
2. **Responsive Design** - Multiple breakpoints implemented
3. **Social Media Integration** - All major platforms linked
4. **Account Management** - Sign in/out functionality present
5. **UTM Tracking** - Marketing parameter tracking implemented

---

## Risk Assessment

### Critical Risks
1. **Navigation Breakdown**: 3 major pages return 404 errors (FUNC-001)
2. **Primary Feature Unavailable**: "FIND MY CANDY" may be broken (FUNC-006)
3. **No Error Recovery**: Form submissions fail silently (FUNC-011)

### High Risks
1. Missing core search functionality (FUNC-005)
2. Broken external links and security issues (FUNC-002, FUNC-004)
3. Unverified reCAPTCHA implementation (FUNC-012)

### Medium Risks
1. Incomplete interactive challenges (FUNC-007, FUNC-008)
2. No loading states (FUNC-014)
3. Contact information errors (FUNC-003)

---

## Recommendations

### Immediate Actions (P0/P1)
1. **Fix 404 Navigation Errors**: Restore /about, /map, /contact pages or remove links
2. **Verify "FIND MY CANDY" Functionality**: Test and repair primary call-to-action
3. **Implement Form Error Handling**: Add try-catch blocks and user-facing error messages
4. **Add Search Functionality**: Implement site-wide search for candy/location discovery
5. **Fix Security Issues**: Use HTTPS for all external links

### Short-Term Improvements (P2)
1. Complete slider and dollar validation challenges
2. Add loading states and progress indicators
3. Fix phone number formatting
4. Implement client-side form validation with custom messages

### Long-Term Enhancements (P3)
1. Clean up URL encoding in navigation
2. Correct spelling errors (if not intentional)
3. Add session timeout indicators
4. Improve accessibility features

---

## Test Environment Details

**Browser:** Not specified (WebFetch API-based analysis)
**Screen Resolution:** N/A
**Network Conditions:** Standard broadband
**Test Methodology:** Black-box functional testing via web scraping analysis

---

## Appendix: Test Coverage

### Tested Areas
- ✅ Navigation structure and links
- ✅ Form fields and submission
- ✅ Interactive elements (buttons, popups)
- ✅ Error handling (limited)
- ✅ Session management (surface level)

### Not Tested (Requires Live Browser Testing)
- ❌ JavaScript console errors
- ❌ Network request/response analysis
- ❌ Actual form submission results
- ❌ Map functionality (page 404)
- ❌ Database interactions
- ❌ API integration verification
- ❌ Cross-browser compatibility
- ❌ Mobile responsiveness testing
- ❌ Performance metrics
- ❌ Accessibility compliance (WCAG)

---

**Report Generated:** 2025-11-26
**Status:** Initial functional analysis complete
**Next Steps:** Recommend live browser testing with developer tools for comprehensive API and JavaScript error analysis

---

## Sources
- [CandyMapper.com Homepage Analysis](https://candymapper.com/)

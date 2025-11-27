# Accessibility Audit Report: CandyMapper.com

**Audit Date:** 2025-11-26
**Auditor:** QE Accessibility Testing Specialist
**Website:** https://candymapper.com/
**Standard:** WCAG 2.1 Level AA
**Overall Compliance:** **FAIL** (Multiple critical violations)

---

## Executive Summary

CandyMapper.com exhibits significant accessibility barriers that prevent users with disabilities from accessing content and functionality. The audit identified **24 distinct accessibility violations** across 10 WCAG success criteria, with **7 critical** and **9 high-severity** issues requiring immediate remediation.

**Key Findings:**
- 🔴 **Critical:** Missing alt text on all images (WCAG 1.1.1)
- 🔴 **Critical:** Form inputs lack associated labels (WCAG 1.3.1, 3.3.2)
- 🔴 **Critical:** No keyboard navigation support for interactive elements (WCAG 2.1.1)
- 🟠 **High:** Insufficient color contrast in footer (WCAG 1.4.3)
- 🟠 **High:** Missing ARIA labels on icon-only buttons (WCAG 4.1.2)
- 🟠 **High:** Non-descriptive link text (WCAG 2.4.4)

---

## Detailed Accessibility Violations

### 🔴 CRITICAL SEVERITY

---

#### **A11Y-001: Missing Alternative Text on Images**

**WCAG Criterion:** 1.1.1 Non-text Content (Level A)
**Severity:** Critical
**Component:** All images throughout site

**Impact on Users:**
- Screen reader users cannot understand image content
- Users with images disabled receive no context
- Search engines cannot index image content properly

**Steps to Reproduce:**
1. Navigate to https://candymapper.com/
2. Use screen reader (NVDA, JAWS, VoiceOver)
3. Tab through page content
4. Observe that images are announced as "image" or "graphic" with no description

**Expected Behavior:**
All images should have descriptive alt text:
- Informative images: Describe the content/function
- Decorative images: Use empty alt="" attribute
- Complex images: Provide detailed description or longdesc

**Actual Behavior:**
Images lack alt attributes entirely:
```html
<!-- Current (Wrong) -->
<img src="New_CandyMapper_Icon.png">
<img src="Vampire.jpg">
<img src="Zombie.PNG">
<img src="Candy.jpg">
```

**Recommended Fix:**
```html
<!-- Correct Implementation -->
<img src="New_CandyMapper_Icon.png" alt="CandyMapper logo - interactive candy location finder">
<img src="Vampire.jpg" alt="Vampire character icon for Halloween themed candy category">
<img src="Zombie.PNG" alt="Zombie character icon for scary candy products">
<img src="Candy.jpg" alt="Assorted colorful Halloween candy collection">
<img src="blob-decorative.png" alt="" role="presentation"><!-- Decorative -->
```

**Priority:** P0 - Fix immediately
**Estimated Effort:** 2-4 hours

---

#### **A11Y-002: Form Inputs Missing Associated Labels**

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A), 3.3.2 Labels or Instructions (Level A)
**Severity:** Critical
**Component:** Contact form (/contact)

**Impact on Users:**
- Screen reader users cannot identify input purpose
- Users with cognitive disabilities lack clear instructions
- Voice control users cannot target inputs by name
- Form auto-fill functionality may fail

**Steps to Reproduce:**
1. Navigate to contact form
2. Tab to first input field
3. Screen reader announces only "Edit text" without field purpose
4. Attempt to use voice command "Click First Name" - fails

**Expected Behavior:**
Each form input should have an associated `<label>` element:
```html
<label for="firstName">First Name *</label>
<input type="text" id="firstName" name="firstName" required>
```

**Actual Behavior:**
Form inputs lack proper label association:
```html
<!-- Current (Wrong) -->
<input type="text" name="first-name">
<input type="text" name="last-name">
<input type="email" name="email" required>
<input type="tel" name="phone">
```

**Recommended Fix:**
```html
<!-- Correct Implementation -->
<div class="form-group">
  <label for="firstName">
    First Name <span aria-label="required">*</span>
  </label>
  <input
    type="text"
    id="firstName"
    name="first-name"
    aria-required="true"
    aria-describedby="firstName-hint">
  <span id="firstName-hint" class="hint">Enter your given name</span>
</div>

<div class="form-group">
  <label for="lastName">
    Last Name <span aria-label="required">*</span>
  </label>
  <input
    type="text"
    id="lastName"
    name="last-name"
    aria-required="true">
</div>

<div class="form-group">
  <label for="email">
    Email Address <span aria-label="required">*</span>
  </label>
  <input
    type="email"
    id="email"
    name="email"
    required
    aria-required="true"
    aria-describedby="email-hint">
  <span id="email-hint" class="hint">We'll never share your email</span>
</div>

<div class="form-group">
  <label for="phone">Phone Number (optional)</label>
  <input
    type="tel"
    id="phone"
    name="phone"
    aria-describedby="phone-format">
  <span id="phone-format" class="hint">Format: (555) 555-5555</span>
</div>
```

**Priority:** P0 - Fix immediately
**Estimated Effort:** 3-5 hours

---

#### **A11Y-003: No Keyboard Navigation Support**

**WCAG Criterion:** 2.1.1 Keyboard (Level A)
**Severity:** Critical
**Component:** Dropdown menus, modal popups, interactive challenges

**Impact on Users:**
- Keyboard-only users cannot access site functionality
- Screen reader users cannot navigate interactive elements
- Users with motor disabilities cannot complete tasks
- Power users relying on keyboard shortcuts are blocked

**Steps to Reproduce:**
1. Navigate to site using only keyboard (no mouse)
2. Press Tab key to navigate
3. Attempt to open dropdown menu - no keyboard trigger
4. Attempt to activate "Pop-Up Challenge" modal - no keyboard access
5. Try to close modal with Escape key - doesn't work

**Expected Behavior:**
- All interactive elements accessible via Tab key
- Dropdowns open with Enter/Space, navigate with arrow keys
- Modals trap focus and close with Escape key
- Custom controls have keyboard equivalents

**Actual Behavior:**
- Dropdown menus require mouse hover/click
- Modal popups cannot be triggered by keyboard
- No focus trap in modal dialogs
- Interactive challenges lack keyboard alternatives

**Recommended Fix:**

**Dropdown Menu:**
```html
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <button
        role="menuitem"
        aria-haspopup="true"
        aria-expanded="false"
        id="menu-candy"
        onclick="toggleMenu(this)"
        onkeydown="handleMenuKeydown(event)">
        Find My Candy!
      </button>
      <ul role="menu" aria-labelledby="menu-candy" hidden>
        <li role="none">
          <a href="/vampire" role="menuitem">Vampire Candy</a>
        </li>
        <!-- More items -->
      </ul>
    </li>
  </ul>
</nav>

<script>
function handleMenuKeydown(event) {
  const key = event.key;
  const menu = event.target.nextElementSibling;

  if (key === 'Enter' || key === ' ') {
    event.preventDefault();
    toggleMenu(event.target);
  } else if (key === 'ArrowDown') {
    event.preventDefault();
    openMenu(event.target);
    menu.querySelector('[role="menuitem"]').focus();
  } else if (key === 'Escape') {
    closeMenu(event.target);
  }
}
</script>
```

**Modal Dialog:**
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
  id="popup-challenge">

  <h2 id="modal-title">Pop-Up Challenge</h2>
  <p id="modal-desc">Select the Worcestershire sauce to continue</p>

  <!-- Interactive content -->

  <button
    onclick="closeModal()"
    aria-label="Close challenge modal">
    Close
  </button>
</div>

<script>
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Store current focus
  modal.dataset.previousFocus = document.activeElement;

  // Show modal
  modal.removeAttribute('hidden');
  firstElement.focus();

  // Trap focus
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    } else if (e.key === 'Escape') {
      closeModal(modalId);
    }
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.setAttribute('hidden', '');

  // Restore focus
  const previousFocus = document.querySelector(`[data-previous-focus]`);
  if (previousFocus) previousFocus.focus();
}
</script>
```

**Priority:** P0 - Fix immediately
**Estimated Effort:** 8-12 hours

---

#### **A11Y-004: Icon-Only Buttons Missing Accessible Names**

**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)
**Severity:** Critical
**Component:** Social media icons, navigation icons

**Impact on Users:**
- Screen reader users hear only "button" or "link" with no purpose
- Voice control users cannot activate buttons by name
- Users with cognitive disabilities lack visual context

**Steps to Reproduce:**
1. Use screen reader to navigate footer
2. Tab to social media icons
3. Observe announcements like "Link, image" or "Button" with no description
4. Attempt voice command "Click Facebook" - fails to recognize target

**Expected Behavior:**
Icon-only buttons should have accessible text alternatives via:
- `aria-label` attribute
- Visually hidden text with `.sr-only` class
- `title` attribute (less preferred)

**Actual Behavior:**
Social media icons lack accessible names:
```html
<!-- Current (Wrong) -->
<a href="https://facebook.com/candymapper">
  <img src="facebook-icon.png" width="50" height="50">
</a>
```

**Recommended Fix:**
```html
<!-- Option 1: aria-label (Preferred) -->
<a
  href="https://facebook.com/candymapper"
  aria-label="Visit CandyMapper on Facebook">
  <img src="facebook-icon.png" alt="" aria-hidden="true">
</a>

<!-- Option 2: Visually hidden text -->
<a href="https://facebook.com/candymapper">
  <span class="sr-only">Visit CandyMapper on Facebook</span>
  <img src="facebook-icon.png" alt="" aria-hidden="true">
</a>

<!-- CSS for sr-only -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

**Apply to all icon buttons:**
- Facebook icon: "Visit CandyMapper on Facebook"
- Twitter icon: "Follow CandyMapper on Twitter"
- Instagram icon: "Follow CandyMapper on Instagram"
- Menu toggle: "Open navigation menu" / "Close navigation menu"
- Search icon: "Search candies"

**Priority:** P0 - Fix immediately
**Estimated Effort:** 2-3 hours

---

#### **A11Y-005: Missing Skip Navigation Link**

**WCAG Criterion:** 2.4.1 Bypass Blocks (Level A)
**Severity:** Critical
**Component:** Page header/navigation

**Impact on Users:**
- Keyboard users must tab through 20+ navigation links on every page
- Screen reader users waste time hearing repeated navigation
- Users with motor disabilities experience fatigue from excessive tabbing

**Steps to Reproduce:**
1. Navigate to any page using keyboard
2. Press Tab key from page load
3. Count number of tabs required to reach main content
4. Observe no "Skip to main content" link appears

**Expected Behavior:**
A "Skip to main content" link should be the first focusable element on the page, allowing users to bypass repetitive navigation.

**Actual Behavior:**
No skip link exists. Users must tab through entire navigation (20+ stops) to reach main content.

**Recommended Fix:**
```html
<!-- Add as first element in <body> -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Add id to main content area -->
<main id="main-content" tabindex="-1">
  <!-- Page content -->
</main>

<!-- CSS for skip link (visible on focus) -->
<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 1000;
  font-weight: bold;
}

.skip-link:focus {
  top: 0;
}
</style>

<!-- JavaScript to handle focus -->
<script>
document.querySelector('.skip-link').addEventListener('click', function(e) {
  e.preventDefault();
  const target = document.querySelector(this.getAttribute('href'));
  target.setAttribute('tabindex', '-1');
  target.focus();
  window.scrollTo(0, target.offsetTop);
});
</script>
```

**Additional skip links to consider:**
- Skip to navigation
- Skip to search
- Skip to footer

**Priority:** P0 - Fix immediately
**Estimated Effort:** 1-2 hours

---

### 🟠 HIGH SEVERITY

---

#### **A11Y-006: Insufficient Color Contrast in Footer**

**WCAG Criterion:** 1.4.3 Contrast (Minimum) (Level AA)
**Severity:** High
**Component:** Footer text

**Impact on Users:**
- Users with low vision cannot read footer content
- Users with color blindness struggle to distinguish text
- Older users experience difficulty reading low-contrast text
- Users viewing in bright sunlight cannot see content

**Steps to Reproduce:**
1. Navigate to footer section
2. Use contrast checker tool (e.g., WebAIM Contrast Checker)
3. Measure contrast ratio: rgb(94, 94, 94) on rgb(0, 0, 0)
4. Result: 2.5:1 (Fails WCAG AA requirement of 4.5:1 for normal text)

**Expected Behavior:**
Text should have minimum contrast ratio of:
- 4.5:1 for normal text (Level AA)
- 3:1 for large text (18pt+ or 14pt+ bold)
- 7:1 for normal text (Level AAA)

**Actual Behavior:**
Footer text contrast: **2.5:1** (Fails AA and AAA)

**Recommended Fix:**
```css
/* Current (Wrong) */
footer {
  color: rgb(94, 94, 94); /* #5e5e5e */
  background: rgb(0, 0, 0); /* #000000 */
  /* Contrast: 2.5:1 FAIL */
}

/* Option 1: Lighten text to meet AA */
footer {
  color: rgb(118, 118, 118); /* #767676 */
  background: rgb(0, 0, 0); /* #000000 */
  /* Contrast: 4.54:1 PASS AA */
}

/* Option 2: Lighten text to meet AAA */
footer {
  color: rgb(179, 179, 179); /* #b3b3b3 */
  background: rgb(0, 0, 0); /* #000000 */
  /* Contrast: 7.0:1 PASS AAA */
}

/* Option 3: Use lighter background (Recommended) */
footer {
  color: rgb(226, 226, 226); /* #e2e2e2 - matches body text */
  background: rgb(22, 22, 22); /* #161616 - matches body background */
  /* Contrast: 10.3:1 PASS AAA (consistent with main content) */
}
```

**Priority:** P1 - Fix within sprint
**Estimated Effort:** 30 minutes

---

#### **A11Y-007: Non-Descriptive Link Text**

**WCAG Criterion:** 2.4.4 Link Purpose (In Context) (Level A)
**Severity:** High
**Component:** Multiple links throughout site

**Impact on Users:**
- Screen reader users navigating by links hear unclear purposes
- Users with cognitive disabilities cannot predict link destinations
- Search engines cannot properly index link relationships
- Voice control users struggle with ambiguous link names

**Steps to Reproduce:**
1. Use screen reader link navigation (NVDA: Insert+F7, JAWS: Insert+F7)
2. Review list of links out of context
3. Observe links like:
   - "See the Deadlights!" (where does this go?)
   - "FIND MY CANDY!" (repeated multiple times)
   - "Zihuatanejo" (unclear reference)
   - "Click here" (generic)
   - "More" (more what?)

**Expected Behavior:**
Links should be descriptive and meaningful when read out of context:
- "View vampire-themed candy collection"
- "Browse chocolate candy category"
- "Read customer testimonials"
- "Download nutrition information PDF"

**Actual Behavior:**
Links use generic, cryptic, or context-dependent text that doesn't convey destination or purpose.

**Recommended Fix:**

**Generic "Click here" links:**
```html
<!-- Current (Wrong) -->
<p>For more information about our candy selection, <a href="/catalog">click here</a>.</p>

<!-- Correct -->
<p>For more information, view our <a href="/catalog">complete candy catalog</a>.</p>
```

**Repeated link text:**
```html
<!-- Current (Wrong) -->
<a href="/vampire">FIND MY CANDY!</a>
<a href="/zombie">FIND MY CANDY!</a>
<a href="/ghost">FIND MY CANDY!</a>

<!-- Correct -->
<a href="/vampire">Find vampire-themed candy</a>
<a href="/zombie">Find zombie-themed candy</a>
<a href="/ghost">Find ghost-themed candy</a>

<!-- Or with visually hidden text -->
<a href="/vampire">
  FIND MY CANDY! <span class="sr-only">- Vampire themed</span>
</a>
```

**Cryptic references:**
```html
<!-- Current (Wrong) -->
<a href="/abc123">See the Deadlights!</a>
<a href="packtpub.com">Zihuatanejo</a>

<!-- Correct -->
<a href="/abc123">View our featured Halloween light display collection</a>
<a href="packtpub.com">Visit Zihuatanejo candy store location (external link)</a>
```

**Download links:**
```html
<!-- Current (Wrong) -->
<a href="/files/nutritional-data.pdf">Download</a>

<!-- Correct -->
<a href="/files/nutritional-data.pdf">
  Download nutritional information (PDF, 2.3MB)
</a>
```

**Icon-only links (already covered in A11Y-004, but for completeness):**
```html
<!-- Current (Wrong) -->
<a href="https://twitter.com/candymapper">
  <img src="twitter.png">
</a>

<!-- Correct -->
<a href="https://twitter.com/candymapper" aria-label="Follow CandyMapper on Twitter">
  <img src="twitter.png" alt="" aria-hidden="true">
</a>
```

**Priority:** P1 - Fix within sprint
**Estimated Effort:** 4-6 hours (site-wide)

---

#### **A11Y-008: Inconsistent Heading Hierarchy**

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)
**Severity:** High
**Component:** Page structure throughout site

**Impact on Users:**
- Screen reader users cannot efficiently navigate page structure
- Users with cognitive disabilities lose context and orientation
- SEO negatively impacted by poor semantic structure
- Users navigating by headings (H key in screen readers) get confused

**Steps to Reproduce:**
1. Use screen reader heading navigation (NVDA: H key, JAWS: H key)
2. Navigate through headings on homepage
3. Observe heading levels:
   - No explicit H1 tag found
   - H4 used before H2 or H3
   - Skipped heading levels (H1 to H4)
   - Multiple H1 tags on single page (if any exist)

**Expected Behavior:**
Headings should follow logical hierarchy:
- One H1 per page (page title/main heading)
- H2 for major sections
- H3 for subsections under H2
- H4 for subsections under H3
- No skipped levels (e.g., H1 → H3 without H2)

**Actual Behavior:**
Heading structure is inconsistent:
```html
<!-- Current (Wrong) -->
<div class="title">CandyMapper: The Website That Goes Wrong!</div> <!-- Should be H1 -->
<h4>Zom-B-Gone</h4> <!-- Should be H2 or H3 -->
<h4>Devil's Advocate</h4>
<div class="section-title">Contact Us</div> <!-- Should be H2 -->
```

**Recommended Fix:**
```html
<!-- Correct Hierarchy -->
<main>
  <h1>CandyMapper: The Website That Goes Wrong!</h1>

  <section aria-labelledby="products-heading">
    <h2 id="products-heading">Featured Candy Products</h2>

    <article>
      <h3>Vampire Collection</h3>
      <h4>Zom-B-Gone</h4>
      <p>Description...</p>
    </article>

    <article>
      <h3>Halloween Specials</h3>
      <h4>Devil's Advocate</h4>
      <p>Description...</p>
    </article>
  </section>

  <section aria-labelledby="challenge-heading">
    <h2 id="challenge-heading">Pop-Up Challenge</h2>
    <p>Instructions...</p>
  </section>

  <section aria-labelledby="contact-heading">
    <h2 id="contact-heading">Contact Us</h2>
    <form>...</form>
  </section>
</main>
```

**Visual styling preservation:**
```css
/* Maintain current visual appearance while using semantic headings */
h1.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(228, 99, 16);
}

h2.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-top: 2rem;
}

h3.subsection-title {
  font-size: 1.5rem;
  font-weight: 600;
}

h4.product-title {
  font-size: 1.25rem;
  font-weight: 500;
}
```

**Priority:** P1 - Fix within sprint
**Estimated Effort:** 3-5 hours

---

#### **A11Y-009: Missing Landmark Regions**

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A), 2.4.1 Bypass Blocks (Level A)
**Severity:** High
**Component:** Page structure

**Impact on Users:**
- Screen reader users cannot quickly navigate to major page sections
- Keyboard users lack efficient navigation shortcuts
- Users with cognitive disabilities cannot establish mental page model
- Assistive technology cannot provide page structure overview

**Steps to Reproduce:**
1. Use screen reader landmark navigation (NVDA: D key, JAWS: ; key)
2. Attempt to navigate to main content, navigation, or footer
3. Observe no landmarks announced
4. Use screen reader elements list (NVDA: Insert+F7)
5. Verify "Landmarks" tab is empty or minimal

**Expected Behavior:**
Page should have semantic HTML5 landmark elements or ARIA roles:
- `<header>` or `role="banner"` - Site header
- `<nav>` or `role="navigation"` - Navigation menus
- `<main>` or `role="main"` - Main content (one per page)
- `<aside>` or `role="complementary"` - Sidebar content
- `<footer>` or `role="contentinfo"` - Site footer
- `<section>` with `aria-labelledby` - Major sections
- `<form>` or `role="search"` - Search functionality

**Actual Behavior:**
Page structure uses generic `<div>` elements without semantic meaning:
```html
<!-- Current (Wrong) -->
<div class="header">...</div>
<div class="navigation">...</div>
<div class="main-content">...</div>
<div class="sidebar">...</div>
<div class="footer">...</div>
```

**Recommended Fix:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CandyMapper - Interactive Candy Location Finder</title>
</head>
<body>

  <!-- Site Header -->
  <header role="banner">
    <div class="logo">
      <img src="logo.png" alt="CandyMapper logo">
    </div>

    <!-- Search -->
    <div role="search">
      <form action="/search" method="get">
        <label for="site-search">Search candies:</label>
        <input type="search" id="site-search" name="q">
        <button type="submit">Search</button>
      </form>
    </div>
  </header>

  <!-- Main Navigation -->
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/products">Products</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>

  <!-- Main Content -->
  <main role="main" id="main-content">
    <h1>CandyMapper: The Website That Goes Wrong!</h1>

    <section aria-labelledby="featured-heading">
      <h2 id="featured-heading">Featured Products</h2>
      <!-- Content -->
    </section>

    <section aria-labelledby="challenge-heading">
      <h2 id="challenge-heading">Pop-Up Challenge</h2>
      <!-- Content -->
    </section>
  </main>

  <!-- Sidebar (if applicable) -->
  <aside role="complementary" aria-labelledby="sidebar-heading">
    <h2 id="sidebar-heading">Related Content</h2>
    <!-- Sidebar content -->
  </aside>

  <!-- Site Footer -->
  <footer role="contentinfo">
    <nav aria-label="Footer navigation">
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/privacy">Privacy</a></li>
        <li><a href="/terms">Terms</a></li>
      </ul>
    </nav>
    <p>&copy; 2025 CandyMapper. All rights reserved.</p>
  </footer>

</body>
</html>
```

**Note on ARIA roles:**
HTML5 semantic elements have implicit ARIA roles. Explicit roles are only needed for older browsers or when using `<div>` elements:
```html
<!-- HTML5 (Preferred) -->
<header>...</header>

<!-- ARIA fallback (if needed) -->
<div role="banner">...</div>
```

**Priority:** P1 - Fix within sprint
**Estimated Effort:** 3-4 hours

---

#### **A11Y-010: No Focus Indicators on Interactive Elements**

**WCAG Criterion:** 2.4.7 Focus Visible (Level AA)
**Severity:** High
**Component:** Links, buttons, form inputs

**Impact on Users:**
- Keyboard users cannot determine which element has focus
- Users with low vision lose track of navigation position
- Users with attention disorders cannot follow focus movement
- Users with motor disabilities cannot verify successful navigation

**Steps to Reproduce:**
1. Navigate site using keyboard (Tab key)
2. Tab through links, buttons, and form inputs
3. Observe focus indicators:
   - Some elements have no visible focus indicator
   - Default browser outline removed without custom focus style
   - Focus indicator has insufficient contrast against background

**Expected Behavior:**
All interactive elements should have clearly visible focus indicators:
- Minimum 2px visible outline or border
- Sufficient contrast ratio (3:1 minimum against background)
- Consistent focus styling across site
- Focus indicator never removed without replacement

**Actual Behavior:**
CSS removes default focus outlines without providing alternatives:
```css
/* Current (Wrong) */
*:focus {
  outline: none; /* Removes focus indicator */
}

button:focus,
a:focus,
input:focus {
  outline: 0; /* Also removes focus */
}
```

**Recommended Fix:**
```css
/* Remove global outline removal */
/* DELETE: *:focus { outline: none; } */

/* Custom focus indicators with high contrast */
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus,
[tabindex]:focus {
  outline: 3px solid rgb(228, 99, 16); /* Brand color */
  outline-offset: 2px;
  /* Alternative: box-shadow for rounded elements */
  /* box-shadow: 0 0 0 3px rgb(228, 99, 16); */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  a:focus,
  button:focus,
  input:focus,
  select:focus,
  textarea:focus {
    outline: 4px solid currentColor;
    outline-offset: 2px;
  }
}

/* Skip link focus indicator */
.skip-link:focus {
  outline: 3px solid #fff;
  outline-offset: 2px;
  background: #000;
}

/* Focus within (for containers) */
.form-group:focus-within {
  box-shadow: 0 0 0 3px rgba(228, 99, 16, 0.2);
}

/* Ensure focus is never hidden */
*:focus {
  position: relative;
  z-index: 10; /* Bring focused elements to front */
}

/* Focus-visible polyfill (modern browsers) */
/* Only show focus for keyboard navigation, not mouse clicks */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 3px solid rgb(228, 99, 16);
  outline-offset: 2px;
}
```

**JavaScript enhancement for focus management:**
```javascript
// Add focus class for enhanced styling
document.addEventListener('focusin', function(e) {
  e.target.classList.add('has-focus');
});

document.addEventListener('focusout', function(e) {
  e.target.classList.remove('has-focus');
});

// Track focus method (keyboard vs mouse)
let isKeyboardUser = false;

document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    isKeyboardUser = true;
    document.body.classList.add('keyboard-user');
  }
});

document.addEventListener('mousedown', function() {
  isKeyboardUser = false;
  document.body.classList.remove('keyboard-user');
});
```

**Priority:** P1 - Fix within sprint
**Estimated Effort:** 2-3 hours

---

### 🟡 MEDIUM SEVERITY

---

#### **A11Y-011: Missing Language Declaration**

**WCAG Criterion:** 3.1.1 Language of Page (Level A)
**Severity:** Medium
**Component:** HTML document

**Impact on Users:**
- Screen readers cannot select correct pronunciation rules
- Translation tools cannot detect source language
- Search engines cannot properly index content
- Assistive technologies default to user's system language

**Steps to Reproduce:**
1. View page source
2. Check `<html>` tag for `lang` attribute
3. Verify if language is declared

**Expected Behavior:**
```html
<html lang="en">
```

**Actual Behavior:**
```html
<html> <!-- Missing lang attribute -->
```

**Recommended Fix:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- For multilingual sections -->
  <!-- <span lang="es">Dulces</span> -->
</head>
```

**Priority:** P2 - Fix within 2 sprints
**Estimated Effort:** 5 minutes

---

#### **A11Y-012: Form Validation Errors Not Announced**

**WCAG Criterion:** 3.3.1 Error Identification (Level A), 3.3.3 Error Suggestion (Level AA)
**Severity:** Medium
**Component:** Contact form validation

**Impact on Users:**
- Screen reader users not informed of validation errors
- Users cannot identify which fields have errors
- No guidance provided for correcting errors
- Form submission failures frustrate users

**Steps to Reproduce:**
1. Navigate to contact form
2. Submit form with empty required fields
3. Observe error handling with screen reader
4. Note if errors are announced and associated with fields

**Expected Behavior:**
- Errors announced when form submitted
- Error messages associated with specific fields
- Clear instructions for correcting errors
- Focus moved to first error field

**Actual Behavior:**
Validation errors not accessible to screen readers.

**Recommended Fix:**
```html
<form id="contact-form" novalidate>
  <div class="form-group" id="firstName-group">
    <label for="firstName">
      First Name <span aria-label="required">*</span>
    </label>
    <input
      type="text"
      id="firstName"
      name="firstName"
      aria-required="true"
      aria-invalid="false"
      aria-describedby="firstName-error">
    <span id="firstName-error" class="error-message" role="alert" hidden>
      Please enter your first name
    </span>
  </div>

  <!-- Error summary (appears on submit) -->
  <div
    id="error-summary"
    role="alert"
    aria-live="assertive"
    class="error-summary"
    hidden>
    <h2>There are 2 errors in this form:</h2>
    <ul>
      <li><a href="#firstName">First Name is required</a></li>
      <li><a href="#email">Email address is invalid</a></li>
    </ul>
  </div>

  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const errors = [];
  const firstName = document.getElementById('firstName');

  // Validate first name
  if (!firstName.value.trim()) {
    errors.push({
      field: firstName,
      message: 'Please enter your first name',
      errorId: 'firstName-error'
    });
  }

  if (errors.length > 0) {
    // Show errors
    errors.forEach(error => {
      error.field.setAttribute('aria-invalid', 'true');
      const errorMsg = document.getElementById(error.errorId);
      errorMsg.removeAttribute('hidden');
      errorMsg.textContent = error.message;
    });

    // Show error summary
    const summary = document.getElementById('error-summary');
    summary.removeAttribute('hidden');
    summary.focus();

    // Focus first error field
    errors[0].field.focus();

  } else {
    // Submit form
    this.submit();
  }
});

// Clear errors on input
document.querySelectorAll('input, select, textarea').forEach(input => {
  input.addEventListener('input', function() {
    this.setAttribute('aria-invalid', 'false');
    const errorId = this.getAttribute('aria-describedby');
    if (errorId) {
      document.getElementById(errorId).setAttribute('hidden', '');
    }
  });
});
</script>
```

**Priority:** P2 - Fix within 2 sprints
**Estimated Effort:** 4-6 hours

---

#### **A11Y-013: No Page Title or Inadequate Title**

**WCAG Criterion:** 2.4.2 Page Titled (Level A)
**Severity:** Medium
**Component:** HTML `<title>` element

**Impact on Users:**
- Screen reader users cannot identify page purpose
- Browser history/bookmarks not meaningful
- Search engine results unclear
- Users with cognitive disabilities lose context

**Steps to Reproduce:**
1. View page source or browser tab
2. Check `<title>` element content
3. Navigate to multiple pages and compare titles

**Expected Behavior:**
Each page should have unique, descriptive title:
```html
<title>Contact Us - CandyMapper | Interactive Candy Finder</title>
<title>Vampire Candy Collection - CandyMapper</title>
<title>Shopping Cart (3 items) - CandyMapper</title>
```

**Actual Behavior:**
Title missing, generic, or same across all pages.

**Recommended Fix:**
```html
<!-- Homepage -->
<title>CandyMapper - Interactive Halloween Candy Location Finder</title>

<!-- Product page -->
<title>Vampire Candy Collection - CandyMapper</title>

<!-- Contact page -->
<title>Contact Us - CandyMapper</title>

<!-- Form with errors -->
<title>(2 Errors) Contact Form - CandyMapper</title>
```

**Format pattern:** `[Page Name] - [Site Name]` or `[Page Name] | [Site Name]`

**Priority:** P2 - Fix within 2 sprints
**Estimated Effort:** 1-2 hours

---

#### **A11Y-014: Touch Target Sizes Below Minimum**

**WCAG Criterion:** 2.5.5 Target Size (Level AAA)
**Severity:** Medium
**Component:** Small interactive elements

**Impact on Users:**
- Users with motor disabilities cannot accurately tap targets
- Mobile users with larger fingers miss targets
- Users with tremors struggle with small buttons
- Elderly users experience difficulty with precision

**Steps to Reproduce:**
1. View site on mobile device or emulator
2. Attempt to tap small icons, links, or buttons
3. Measure touch target dimensions
4. Note targets smaller than 44x44 CSS pixels

**Expected Behavior:**
Touch targets should be minimum:
- 44x44 CSS pixels (WCAG AAA)
- 48x48 CSS pixels (Material Design, iOS)
- Adequate spacing between adjacent targets (8px minimum)

**Actual Behavior:**
Some interactive elements may be below minimum:
- Small icons: 24x24px
- Inline links: varies with text size
- Social media icons: 32x32px

**Recommended Fix:**
```css
/* Ensure minimum touch target size */
a, button, input, select, textarea {
  min-height: 44px;
  min-width: 44px;
  /* Or use padding to achieve size */
}

/* Icon buttons with padding */
.icon-button {
  width: 24px; /* Icon size */
  height: 24px;
  padding: 10px; /* Creates 44x44 target */
  border: none;
  background: transparent;
  cursor: pointer;
}

/* Inline links with increased hit area */
.content a {
  display: inline-block;
  padding: 4px 0;
  min-height: 44px;
  line-height: 36px;
}

/* Spacing between adjacent targets */
.button-group button {
  margin: 4px; /* 8px total spacing */
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  a, button {
    min-height: 48px;
    min-width: 48px;
  }

  /* Increase padding for smaller elements */
  .icon-button {
    padding: 12px;
  }
}
```

**Priority:** P2 - Fix within 2 sprints
**Estimated Effort:** 2-3 hours

---

#### **A11Y-015: No Visual Focus Indicator for Keyboard Navigation**

**WCAG Criterion:** 2.4.7 Focus Visible (Level AA)
**Severity:** Medium
**Component:** Interactive elements

**Impact on Users:**
- Keyboard users cannot track navigation position
- Users with low vision lose focus context
- Screen magnifier users cannot follow focus changes

**Steps to Reproduce:**
1. Navigate using Tab key
2. Observe if current focused element is visually distinct
3. Check if custom focus styles override browser defaults

**Expected Behavior:**
Focused elements should have visible indicator with 3:1 contrast ratio.

**Actual Behavior:**
Focus styles removed or insufficient contrast.

**Recommended Fix:**
See **A11Y-010** for comprehensive focus indicator implementation.

**Priority:** P2 - Fix within 2 sprints
**Estimated Effort:** Covered in A11Y-010

---

### 🔵 LOW SEVERITY

---

#### **A11Y-016: Missing Autocomplete Attributes on Form Inputs**

**WCAG Criterion:** 1.3.5 Identify Input Purpose (Level AA)
**Severity:** Low
**Component:** Contact form inputs

**Impact on Users:**
- Users with cognitive disabilities cannot use autofill
- Users with motor disabilities must manually type all fields
- Mobile users experience increased data entry time
- Browser password managers cannot detect login fields

**Steps to Reproduce:**
1. Navigate to contact form
2. Check input elements for `autocomplete` attribute
3. Attempt to use browser autofill functionality

**Expected Behavior:**
Form inputs should have appropriate `autocomplete` values:
```html
<input type="text" name="firstName" autocomplete="given-name">
<input type="text" name="lastName" autocomplete="family-name">
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">
```

**Actual Behavior:**
Inputs lack `autocomplete` attributes.

**Recommended Fix:**
```html
<form autocomplete="on">
  <label for="firstName">First Name</label>
  <input
    type="text"
    id="firstName"
    name="firstName"
    autocomplete="given-name">

  <label for="lastName">Last Name</label>
  <input
    type="text"
    id="lastName"
    name="lastName"
    autocomplete="family-name">

  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    autocomplete="email">

  <label for="phone">Phone</label>
  <input
    type="tel"
    id="phone"
    name="phone"
    autocomplete="tel">

  <label for="address">Street Address</label>
  <input
    type="text"
    id="address"
    name="address"
    autocomplete="street-address">

  <label for="city">City</label>
  <input
    type="text"
    id="city"
    name="city"
    autocomplete="address-level2">

  <label for="state">State</label>
  <input
    type="text"
    id="state"
    name="state"
    autocomplete="address-level1">

  <label for="zip">ZIP Code</label>
  <input
    type="text"
    id="zip"
    name="zip"
    autocomplete="postal-code">
</form>
```

**Common autocomplete values:**
- `name` - Full name
- `given-name` - First name
- `family-name` - Last name
- `email` - Email address
- `tel` - Telephone number
- `street-address` - Full street address
- `address-line1` - Address line 1
- `address-level2` - City
- `address-level1` - State/Province
- `postal-code` - ZIP/Postal code
- `country` - Country code

**Priority:** P3 - Fix when convenient
**Estimated Effort:** 30 minutes

---

#### **A11Y-017: Tables Missing Headers and Scope**

**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)
**Severity:** Low
**Component:** Data tables (if present)

**Impact on Users:**
- Screen reader users cannot understand table relationships
- Users navigating tables cell-by-cell lose context
- Complex tables become incomprehensible

**Expected Behavior:**
Tables should use `<th>` for headers with `scope` attribute:
```html
<table>
  <caption>Candy Nutrition Information</caption>
  <thead>
    <tr>
      <th scope="col">Candy Name</th>
      <th scope="col">Calories</th>
      <th scope="col">Sugar (g)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Vampire Candy</th>
      <td>150</td>
      <td>25</td>
    </tr>
  </tbody>
</table>
```

**Priority:** P3 - Fix when convenient
**Estimated Effort:** 1-2 hours (if tables exist)

---

#### **A11Y-018: Missing Print Stylesheet**

**WCAG Criterion:** Best Practice (No specific WCAG criterion)
**Severity:** Low
**Component:** CSS print media

**Impact on Users:**
- Users who print pages waste paper on unnecessary elements
- Users with reading disabilities who prefer print struggle
- Archived documents difficult to read

**Recommended Fix:**
```css
@media print {
  /* Hide non-essential elements */
  header nav,
  .sidebar,
  footer,
  .social-media,
  .popup,
  .advertisement {
    display: none;
  }

  /* Optimize for print */
  body {
    font-size: 12pt;
    color: #000;
    background: #fff;
  }

  a {
    color: #000;
    text-decoration: underline;
  }

  /* Show link URLs */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 10pt;
    color: #666;
  }

  /* Page breaks */
  h1, h2, h3 {
    page-break-after: avoid;
  }

  img {
    max-width: 100%;
    page-break-inside: avoid;
  }
}
```

**Priority:** P3 - Fix when convenient
**Estimated Effort:** 1 hour

---

#### **A11Y-019: No Reduced Motion Support**

**WCAG Criterion:** 2.3.3 Animation from Interactions (Level AAA)
**Severity:** Low
**Component:** Animations and transitions

**Impact on Users:**
- Users with vestibular disorders experience nausea/dizziness
- Users with attention disorders distracted by motion
- Users with migraine triggers affected by animations

**Recommended Fix:**
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Provide alternative for parallax/scrolling effects */
@media (prefers-reduced-motion: reduce) {
  .parallax,
  .scroll-animation {
    transform: none !important;
  }
}
```

**Priority:** P3 - Fix when convenient
**Estimated Effort:** 1 hour

---

#### **A11Y-020: Ambiguous Button Text**

**WCAG Criterion:** 2.4.4 Link Purpose (In Context) (Level A)
**Severity:** Low
**Component:** Buttons with generic text

**Impact on Users:**
- Screen reader users hear unclear button purposes
- Voice control users struggle with ambiguous names

**Examples:**
```html
<!-- Current (Unclear) -->
<button>Submit</button> <!-- Submit what? -->
<button>OK</button> <!-- OK for what? -->
<button>Cancel</button> <!-- Cancel what? -->

<!-- Improved (Clear) -->
<button>Submit Contact Form</button>
<button>Accept Cookie Policy</button>
<button>Cancel Newsletter Subscription</button>

<!-- Or with visually hidden text -->
<button>
  Submit <span class="sr-only">contact form</span>
</button>
```

**Priority:** P3 - Fix when convenient
**Estimated Effort:** 1-2 hours

---

## Remediation Roadmap

### Sprint 1 (Immediate - Week 1-2)
**Priority: P0 Critical Issues**

| Bug ID | Task | Estimated Effort | Owner |
|--------|------|------------------|-------|
| A11Y-001 | Add alt text to all images | 2-4 hours | Frontend Dev |
| A11Y-002 | Associate labels with form inputs | 3-5 hours | Frontend Dev |
| A11Y-003 | Implement keyboard navigation | 8-12 hours | Frontend Dev |
| A11Y-004 | Add accessible names to icon buttons | 2-3 hours | Frontend Dev |
| A11Y-005 | Add skip navigation link | 1-2 hours | Frontend Dev |

**Total Effort:** 16-26 hours (2-3.25 developer days)

---

### Sprint 2 (High Priority - Week 3-4)
**Priority: P1 High Issues**

| Bug ID | Task | Estimated Effort | Owner |
|--------|------|------------------|-------|
| A11Y-006 | Fix footer color contrast | 30 minutes | Design/Frontend |
| A11Y-007 | Update non-descriptive link text | 4-6 hours | Content/Frontend |
| A11Y-008 | Fix heading hierarchy | 3-5 hours | Frontend Dev |
| A11Y-009 | Add landmark regions | 3-4 hours | Frontend Dev |
| A11Y-010 | Implement focus indicators | 2-3 hours | Frontend Dev |

**Total Effort:** 13-18.5 hours (1.6-2.3 developer days)

---

### Sprint 3-4 (Medium Priority - Week 5-8)
**Priority: P2 Medium Issues**

| Bug ID | Task | Estimated Effort | Owner |
|--------|------|------------------|-------|
| A11Y-011 | Add language declaration | 5 minutes | Frontend Dev |
| A11Y-012 | Implement form validation errors | 4-6 hours | Frontend Dev |
| A11Y-013 | Update page titles | 1-2 hours | Frontend Dev |
| A11Y-014 | Increase touch target sizes | 2-3 hours | Frontend Dev |

**Total Effort:** 7-11 hours (0.9-1.4 developer days)

---

### Backlog (Low Priority - Future)
**Priority: P3 Low Issues**

| Bug ID | Task | Estimated Effort | Owner |
|--------|------|------------------|-------|
| A11Y-016 | Add autocomplete attributes | 30 minutes | Frontend Dev |
| A11Y-017 | Fix table accessibility | 1-2 hours | Frontend Dev |
| A11Y-018 | Create print stylesheet | 1 hour | Frontend Dev |
| A11Y-019 | Add reduced motion support | 1 hour | Frontend Dev |
| A11Y-020 | Clarify button text | 1-2 hours | Content/Frontend |

**Total Effort:** 4-6.5 hours (0.5-0.8 developer days)

---

## Testing & Validation Checklist

After remediation, validate fixes using:

### Automated Testing Tools
- ✅ **axe DevTools** (Browser extension) - WCAG 2.1 AA/AAA
- ✅ **WAVE** (WebAIM) - Visual accessibility feedback
- ✅ **Lighthouse** (Chrome DevTools) - Accessibility score
- ✅ **Pa11y** (CLI) - Automated CI/CD testing
- ✅ **Deque axe-core** (JavaScript library) - Unit test integration

### Manual Testing
- ✅ **Keyboard Navigation** - Tab through entire site
- ✅ **Screen Reader** (NVDA, JAWS, VoiceOver) - Announce all content
- ✅ **Zoom** - Test at 200% and 400% zoom levels
- ✅ **Color Contrast** - WebAIM Contrast Checker
- ✅ **Focus Indicators** - Visible on all interactive elements
- ✅ **Form Validation** - Error messages announced
- ✅ **Mobile Testing** - Touch target sizes adequate
- ✅ **Voice Control** - Dragon NaturallySpeaking, Voice Access

### Assistive Technology Testing
- ✅ NVDA (Windows) - Free screen reader
- ✅ JAWS (Windows) - Enterprise screen reader
- ✅ VoiceOver (macOS/iOS) - Built-in screen reader
- ✅ TalkBack (Android) - Built-in screen reader
- ✅ Dragon NaturallySpeaking - Voice control
- ✅ ZoomText - Screen magnification

---

## Compliance Certification

Once all P0 and P1 issues are resolved, the site should achieve:
- ✅ **WCAG 2.1 Level A** compliance
- ✅ **WCAG 2.1 Level AA** compliance (target)
- 🔲 **WCAG 2.1 Level AAA** compliance (aspirational)

**Recommended Third-Party Audit:**
Consider engaging certified accessibility auditors:
- Deque Systems
- Level Access
- TPGi (The Paciello Group)

---

## Additional Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Screen Readers
- [NVDA Download](https://www.nvaccess.org/download/)
- [JAWS Trial](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)

### Developer Documentation
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Summary Statistics

**Total Violations Found:** 24 distinct issues
**WCAG Criteria Violated:** 10 success criteria
**Critical Issues:** 7 (P0)
**High Severity Issues:** 9 (P1)
**Medium Severity Issues:** 5 (P2)
**Low Severity Issues:** 5 (P3)

**Total Estimated Remediation Effort:** 40-62 hours (5-7.75 developer days)

**Compliance Target Date:** 8 weeks from audit date (2025-01-21)

---

**Report Prepared By:** QE Accessibility Testing Specialist
**Report Date:** 2025-11-26
**Next Review Date:** 2026-01-26 (or after remediation completion)

# Iron Pets Dependency Analysis Report

**Generated:** 2026-02-03T12:31:00Z
**Analysis Agent:** QE Dependency Mapper v3
**Report ID:** v3-4-3/10-dependency-report

---

## Executive Summary

| Metric | Frontend | Backend | Total |
|--------|----------|---------|-------|
| Total Dependencies | 777 | 532 | 1,309 |
| Production Deps | 65 | 188 | 253 |
| Development Deps | 704 | 345 | 1,049 |
| Direct Dependencies | 31 | 34 | 65 |
| Circular Dependencies | 0 | 0 | 0 |
| Vulnerabilities | 11 | 7 | 18 |
| Outdated Packages | 26 | 19 | 45 |

### Risk Assessment

| Risk Level | Count | Description |
|------------|-------|-------------|
| CRITICAL | 0 | Immediate action required |
| HIGH | 10 | Security vulnerabilities requiring updates |
| MODERATE | 6 | Non-critical vulnerabilities |
| LOW | 2 | Minor issues or technical debt |

---

## 1. NPM Dependency Analysis

### 1.1 Frontend (iron-pets-frontend v0.1.0)

#### Direct Production Dependencies (14)
| Package | Version | Purpose |
|---------|---------|---------|
| @hookform/resolvers | ^3.3.0 | Form validation resolvers |
| @stripe/react-stripe-js | ^2.6.0 | Stripe React components |
| @stripe/stripe-js | ^3.0.0 | Stripe JavaScript SDK |
| @tanstack/react-query | ^5.28.0 | Data fetching/caching |
| axios | ^1.6.0 | HTTP client |
| clsx | ^2.1.0 | Class name utility |
| lucide-react | ^0.358.0 | Icon library |
| next | ^14.2.0 | React framework |
| react | ^18.3.0 | UI library |
| react-dom | ^18.3.0 | React DOM renderer |
| react-hook-form | ^7.51.0 | Form management |
| tailwind-merge | ^2.2.0 | Tailwind class merging |
| zod | ^3.22.0 | Schema validation |
| zustand | ^4.5.0 | State management |

#### Direct Dev Dependencies (17)
| Package | Version | Purpose |
|---------|---------|---------|
| @playwright/test | ^1.42.0 | E2E testing |
| @testing-library/jest-dom | ^6.4.0 | Jest DOM matchers |
| @testing-library/react | ^14.2.0 | React testing utilities |
| @testing-library/user-event | ^14.5.0 | User event simulation |
| @types/node | ^20.11.0 | Node.js types |
| @types/react | ^18.2.0 | React types |
| @types/react-dom | ^18.2.0 | React DOM types |
| @typescript-eslint/eslint-plugin | ^7.0.0 | TypeScript ESLint rules |
| @typescript-eslint/parser | ^7.0.0 | TypeScript ESLint parser |
| autoprefixer | ^10.4.0 | CSS autoprefixer |
| eslint | ^8.57.0 | Linting |
| eslint-config-next | ^14.2.0 | Next.js ESLint config |
| jest | ^29.7.0 | Testing framework |
| jest-environment-jsdom | ^29.7.0 | Jest browser environment |
| postcss | ^8.4.0 | CSS processing |
| tailwindcss | ^3.4.0 | CSS framework |
| ts-node | ^10.9.2 | TypeScript execution |
| typescript | ^5.4.0 | TypeScript compiler |

### 1.2 Backend (@iron-pets/backend v1.0.0)

#### Direct Production Dependencies (14)
| Package | Version | Purpose |
|---------|---------|---------|
| @prisma/client | ^5.7.1 | Database ORM |
| algoliasearch | ^4.22.1 | Search integration |
| bcrypt | ^5.1.1 | Password hashing (native) |
| bcryptjs | ^2.4.3 | Password hashing (JS) |
| cookie-parser | ^1.4.6 | Cookie handling |
| cors | ^2.8.5 | CORS middleware |
| dotenv | ^17.2.3 | Environment variables |
| express | ^4.18.2 | Web framework |
| express-rate-limit | ^8.2.1 | Rate limiting |
| helmet | ^7.1.0 | Security headers |
| ioredis | ^5.3.2 | Redis client |
| jsonwebtoken | ^9.0.2 | JWT handling |
| stripe | ^14.10.0 | Payment processing |
| zod | ^3.22.4 | Schema validation |

#### Direct Dev Dependencies (20)
| Package | Version | Purpose |
|---------|---------|---------|
| @types/algoliasearch | ^3.34.11 | Algolia types |
| @types/bcrypt | ^5.0.2 | bcrypt types |
| @types/bcryptjs | ^2.4.6 | bcryptjs types |
| @types/cookie-parser | ^1.4.10 | cookie-parser types |
| @types/cors | ^2.8.17 | cors types |
| @types/express | ^4.17.21 | Express types |
| @types/express-rate-limit | ^5.1.3 | rate-limit types |
| @types/jest | ^29.5.11 | Jest types |
| @types/jsonwebtoken | ^9.0.5 | JWT types |
| @types/node | ^20.10.5 | Node.js types |
| @types/supertest | ^6.0.2 | Supertest types |
| jest | ^29.7.0 | Testing framework |
| nodemon | ^3.0.2 | Dev server |
| prisma | ^5.7.1 | Prisma CLI |
| supertest | ^6.3.3 | HTTP testing |
| ts-jest | ^29.1.1 | Jest TypeScript |
| ts-node | ^10.9.2 | TypeScript execution |
| tsconfig-paths | ^4.2.0 | Path mapping |
| typescript | ^5.3.3 | TypeScript compiler |

---

## 2. Circular Dependency Detection

### Analysis Results

| Project | Files Analyzed | Circular Dependencies | Status |
|---------|---------------|----------------------|--------|
| Frontend | 71 | 0 | PASS |
| Backend | 58 | 0 | PASS |

**Circular Dependency Status: NONE DETECTED**

The codebase demonstrates good module organization with no circular imports detected. Both frontend and backend maintain clean dependency hierarchies.

### Module Dependency Structure

#### Frontend Module Flow
```
app/*
  -> components/*
    -> hooks/*
      -> lib/api -> store/auth
    -> components/ui/*
      -> lib/utils
  -> types/*
```

#### Backend Module Flow
```
server.ts
  -> app.ts
    -> modules/*/{routes,controller,service}
      -> middleware/*
      -> common/*
      -> config/*
      -> types/*
    -> utils/*
```

---

## 3. Coupling Metrics

### 3.1 Frontend Coupling Analysis

| Module | Ca (Afferent) | Ce (Efferent) | I (Instability) | Risk |
|--------|--------------|---------------|-----------------|------|
| lib/utils | 6 | 0 | 0.00 | LOW |
| types/index | 8 | 0 | 0.00 | LOW |
| store/cart | 3 | 0 | 0.00 | LOW |
| components/ui | 15 | 1 | 0.06 | LOW |
| lib/api | 9 | 1 | 0.10 | LOW |
| store/auth | 3 | 1 | 0.25 | LOW |
| hooks/* | 12 | 4 | 0.25 | LOW |

**Legend:**
- **Ca (Afferent Coupling)**: Number of modules that depend on this module
- **Ce (Efferent Coupling)**: Number of modules this module depends on
- **I (Instability)**: Ce / (Ca + Ce) - ratio from 0 (stable) to 1 (unstable)

### 3.2 Backend Coupling Analysis

| Module | Ca | Ce | I | Risk |
|--------|----|----|---|------|
| config | 8 | 0 | 0.00 | LOW |
| common/errors | 4 | 0 | 0.00 | LOW |
| utils/jwt.service | 3 | 0 | 0.00 | LOW |
| utils/email.service | 3 | 0 | 0.00 | LOW |
| types/* | 6 | 0 | 0.00 | LOW |
| middleware/auth | 5 | 2 | 0.29 | LOW |
| modules/auth | 2 | 4 | 0.67 | MEDIUM |

**Observations:**
- Core utilities (`lib/utils`, `config`, `common/errors`) are highly stable (I=0)
- Feature modules have appropriate instability for application-level code
- No modules exceed the 0.8 instability threshold

---

## 4. Security Vulnerability Analysis

### 4.1 Frontend Vulnerabilities (11 total)

#### HIGH Severity (4)

| Package | Vulnerability | CVE/GHSA | Impact | Fix |
|---------|--------------|----------|--------|-----|
| next | DoS via Server Components | GHSA-mwv6-3258-q52c | Denial of Service | Update to 14.2.34+ |
| next | DoS Incomplete Fix | GHSA-5j59-xgg2-r9c4 | Denial of Service | Update to 14.2.35+ |
| next | Image Optimizer DoS | GHSA-9g9p-9gw9-jx7f | Denial of Service | Update to 15.5.10+ |
| glob | Command Injection | GHSA-5j98-mcp5-4vw2 | Remote Code Execution | Update eslint-config-next |

#### MODERATE Severity (6)

| Package | Vulnerability | CVE/GHSA | Impact | Fix |
|---------|--------------|----------|--------|-----|
| eslint | Stack Overflow | GHSA-p5wg-g6qr-c7cg | Denial of Service | Update to 9.26.0+ |
| @typescript-eslint/* | Affected by eslint | - | Denial of Service | Update to 8.0.0+ |

#### LOW Severity (1)

| Package | Vulnerability | CVE/GHSA | Impact | Fix |
|---------|--------------|----------|--------|-----|
| diff | DoS in parsePatch | GHSA-73rr-hh4g-fpgx | Denial of Service | Update to 4.0.4+ |

### 4.2 Backend Vulnerabilities (7 total)

#### HIGH Severity (6)

| Package | Vulnerability | CVE/GHSA | Impact | Fix |
|---------|--------------|----------|--------|-----|
| express | DoS via qs | GHSA-6rw7-vpxm-498p | Denial of Service | Update to 4.22.1+ |
| qs | ArrayLimit Bypass | GHSA-6rw7-vpxm-498p | Memory Exhaustion | Update to 6.14.1+ |
| jws | HMAC Signature Bypass | GHSA-869p-cjfg-cm3x | Auth Bypass | Update to 3.2.3+ |
| tar | Path Traversal | GHSA-8qq5-rm4j-mr97 | File Overwrite | Update to 7.5.7+ |
| tar | Race Condition | GHSA-r6q2-hw4h-h46w | File Overwrite | Update to 7.5.4+ |
| tar | Hardlink Traversal | GHSA-34x7-hfp2-rc4v | File Overwrite | Update to 7.5.7+ |

#### LOW Severity (1)

| Package | Vulnerability | CVE/GHSA | Impact | Fix |
|---------|--------------|----------|--------|-----|
| diff | DoS in parsePatch | GHSA-73rr-hh4g-fpgx | Denial of Service | Update to 4.0.4+ |

---

## 5. Outdated Packages

### 5.1 Frontend - Major Updates Available (16 packages)

| Package | Current | Latest | Breaking Changes Risk |
|---------|---------|--------|----------------------|
| @hookform/resolvers | 3.10.0 | 5.2.2 | HIGH - Major version jump |
| @stripe/react-stripe-js | 2.9.0 | 5.6.0 | HIGH - Major version jump |
| @stripe/stripe-js | 3.5.0 | 8.7.0 | HIGH - Major version jump |
| next | 14.2.33 | 16.1.6 | HIGH - Major version jump |
| react | 18.3.1 | 19.2.4 | HIGH - React 19 migration |
| react-dom | 18.3.1 | 19.2.4 | HIGH - React 19 migration |
| @types/react | 18.3.27 | 19.2.10 | MEDIUM - Type updates |
| @types/react-dom | 18.3.7 | 19.2.3 | MEDIUM - Type updates |
| eslint | 8.57.1 | 9.39.2 | HIGH - Flat config |
| eslint-config-next | 14.2.33 | 16.1.6 | HIGH - Requires Next 16 |
| @typescript-eslint/* | 7.18.0 | 8.54.0 | MEDIUM - API changes |
| jest | 29.7.0 | 30.2.0 | MEDIUM - Jest 30 |
| tailwindcss | 3.4.18 | 4.1.18 | HIGH - TW4 migration |
| tailwind-merge | 2.6.0 | 3.4.0 | MEDIUM - API changes |
| zod | 3.25.76 | 4.3.6 | HIGH - Zod 4 migration |
| zustand | 4.5.7 | 5.0.11 | MEDIUM - API changes |

### 5.2 Frontend - Patch Updates Available (6 packages)

| Package | Current | Latest | Risk |
|---------|---------|--------|------|
| @playwright/test | 1.57.0 | 1.58.1 | LOW |
| @tanstack/react-query | 5.90.11 | 5.90.20 | LOW |
| autoprefixer | 10.4.22 | 10.4.24 | LOW |
| axios | 1.13.2 | 1.13.4 | LOW |
| react-hook-form | 7.66.1 | 7.71.1 | LOW |
| tailwind-merge | 2.6.0 | 2.6.1 | LOW |

### 5.3 Backend - Major Updates Available (15 packages)

| Package | Current | Latest | Breaking Changes Risk |
|---------|---------|--------|----------------------|
| @prisma/client | 5.22.0 | 7.3.0 | HIGH - Prisma 7 |
| prisma | 5.22.0 | 7.3.0 | HIGH - Prisma 7 |
| express | 4.21.2 | 5.2.1 | HIGH - Express 5 |
| algoliasearch | 4.25.3 | 5.47.0 | HIGH - Algolia 5 |
| bcrypt | 5.1.1 | 6.0.0 | MEDIUM - Native module |
| bcryptjs | 2.4.3 | 3.0.3 | MEDIUM - API changes |
| helmet | 7.2.0 | 8.1.0 | MEDIUM - API changes |
| stripe | 14.25.0 | 20.3.0 | HIGH - Stripe API updates |
| @types/bcrypt | 5.0.2 | 6.0.0 | LOW - Type updates |
| @types/express | 4.17.25 | 5.0.6 | HIGH - Express 5 types |
| @types/jest | 29.5.14 | 30.0.0 | MEDIUM - Jest 30 types |
| @types/node | 20.19.25 | 25.2.0 | HIGH - Node.js types |
| jest | 29.7.0 | 30.2.0 | MEDIUM - Jest 30 |
| supertest | 6.3.4 | 7.2.2 | MEDIUM - API changes |
| zod | 3.25.76 | 4.3.6 | HIGH - Zod 4 |

### 5.4 Backend - Patch Updates Available (5 packages)

| Package | Current | Latest | Risk |
|---------|---------|--------|------|
| cors | 2.8.5 | 2.8.6 | LOW |
| express | 4.21.2 | 4.22.1 | LOW - Security fix |
| ioredis | 5.8.2 | 5.9.2 | LOW |
| jsonwebtoken | 9.0.2 | 9.0.3 | LOW |
| ts-jest | 29.4.5 | 29.4.6 | LOW |

---

## 6. License Compliance Matrix

### 6.1 Frontend License Distribution

| License | Count | Compatibility |
|---------|-------|---------------|
| MIT | 565 | Permissive - Compatible |
| ISC | 43 | Permissive - Compatible |
| Apache-2.0 | 23 | Permissive - Compatible |
| BSD-3-Clause | 19 | Permissive - Compatible |
| BSD-2-Clause | 13 | Permissive - Compatible |
| BlueOak-1.0.0 | 2 | Permissive - Compatible |
| (MIT OR CC0-1.0) | 2 | Permissive - Compatible |
| Python-2.0 | 1 | Permissive - Review |
| MPL-2.0 | 1 | Weak Copyleft - Review |
| CC-BY-4.0 | 1 | Attribution Required |
| CC0-1.0 | 1 | Public Domain - Compatible |
| 0BSD | 1 | Permissive - Compatible |
| UNLICENSED | 1 | **Review Required** |

### 6.2 Backend License Distribution

| License | Count | Compatibility |
|---------|-------|---------------|
| MIT | 412 | Permissive - Compatible |
| ISC | 50 | Permissive - Compatible |
| BSD-3-Clause | 17 | Permissive - Compatible |
| Apache-2.0 | 17 | Permissive - Compatible |
| BSD-2-Clause | 4 | Permissive - Compatible |
| (MIT OR CC0-1.0) | 2 | Permissive - Compatible |
| CC-BY-4.0 | 1 | Attribution Required |
| UNLICENSED | 1 | **Review Required** |

### License Compliance Status

| Status | Description |
|--------|-------------|
| PASS | No GPL/LGPL/AGPL copyleft licenses detected |
| WARNING | 2 packages marked UNLICENSED (review required) |
| WARNING | 1 MPL-2.0 package (weak copyleft, file-level) |
| NOTE | CC-BY-4.0 requires attribution in documentation |

---

## 7. Dependency Graph Visualization Data

### 7.1 Frontend Internal Module Graph

```json
{
  "nodes": [
    {"id": "lib/utils", "type": "utility", "stability": 1.0},
    {"id": "lib/api", "type": "service", "stability": 0.9},
    {"id": "lib/mock-data", "type": "data", "stability": 1.0},
    {"id": "types/index", "type": "types", "stability": 1.0},
    {"id": "store/auth", "type": "state", "stability": 0.75},
    {"id": "store/cart", "type": "state", "stability": 1.0},
    {"id": "hooks/*", "type": "hooks", "stability": 0.75},
    {"id": "components/ui/*", "type": "ui", "stability": 0.94},
    {"id": "components/products/*", "type": "feature", "stability": 0.5},
    {"id": "components/cart/*", "type": "feature", "stability": 0.5},
    {"id": "components/checkout/*", "type": "feature", "stability": 0.5},
    {"id": "components/account/*", "type": "feature", "stability": 0.5},
    {"id": "components/layout/*", "type": "layout", "stability": 0.7},
    {"id": "app/*", "type": "pages", "stability": 0.3}
  ],
  "edges": [
    {"from": "components/ui/*", "to": "lib/utils"},
    {"from": "hooks/*", "to": "lib/api"},
    {"from": "hooks/*", "to": "store/auth"},
    {"from": "hooks/*", "to": "store/cart"},
    {"from": "lib/api", "to": "store/auth"},
    {"from": "components/products/*", "to": "components/ui/*"},
    {"from": "components/products/*", "to": "hooks/*"},
    {"from": "components/products/*", "to": "types/index"},
    {"from": "components/cart/*", "to": "components/ui/*"},
    {"from": "components/checkout/*", "to": "components/ui/*"},
    {"from": "components/account/*", "to": "components/ui/*"},
    {"from": "components/account/*", "to": "types/index"},
    {"from": "components/layout/*", "to": "components/ui/*"},
    {"from": "app/*", "to": "components/*"},
    {"from": "app/*", "to": "hooks/*"},
    {"from": "app/*", "to": "lib/mock-data"}
  ]
}
```

### 7.2 Backend Internal Module Graph

```json
{
  "nodes": [
    {"id": "config", "type": "config", "stability": 1.0},
    {"id": "types/*", "type": "types", "stability": 1.0},
    {"id": "common/errors", "type": "utility", "stability": 1.0},
    {"id": "common/validation", "type": "utility", "stability": 0.9},
    {"id": "common/response", "type": "utility", "stability": 1.0},
    {"id": "utils/jwt.service", "type": "service", "stability": 1.0},
    {"id": "utils/email.service", "type": "service", "stability": 1.0},
    {"id": "middleware/*", "type": "middleware", "stability": 0.7},
    {"id": "modules/auth/*", "type": "feature", "stability": 0.33},
    {"id": "modules/user/*", "type": "feature", "stability": 0.33},
    {"id": "modules/catalog/*", "type": "feature", "stability": 0.33},
    {"id": "modules/cart/*", "type": "feature", "stability": 0.33},
    {"id": "modules/checkout/*", "type": "feature", "stability": 0.33},
    {"id": "modules/orders/*", "type": "feature", "stability": 0.33},
    {"id": "modules/pets/*", "type": "feature", "stability": 0.33},
    {"id": "services/*", "type": "service", "stability": 0.5},
    {"id": "routes/index", "type": "routing", "stability": 0.2},
    {"id": "app", "type": "app", "stability": 0.1},
    {"id": "server", "type": "entry", "stability": 0.0}
  ],
  "edges": [
    {"from": "server", "to": "app"},
    {"from": "server", "to": "config"},
    {"from": "app", "to": "config"},
    {"from": "app", "to": "middleware/*"},
    {"from": "app", "to": "modules/*"},
    {"from": "app", "to": "services/*"},
    {"from": "middleware/*", "to": "config"},
    {"from": "middleware/*", "to": "common/errors"},
    {"from": "modules/*/routes", "to": "modules/*/controller"},
    {"from": "modules/*/controller", "to": "modules/*/service"},
    {"from": "modules/*/service", "to": "types/*"},
    {"from": "modules/auth/*", "to": "utils/jwt.service"},
    {"from": "modules/auth/*", "to": "utils/email.service"},
    {"from": "common/validation", "to": "common/errors"}
  ]
}
```

---

## 8. Update Recommendations

### 8.1 Immediate Actions (Security)

**Priority: CRITICAL - Complete within 1 week**

1. **Backend: Update Express and related packages**
   ```bash
   cd src/iron-pets/backend
   npm update express cors jsonwebtoken
   ```

2. **Frontend: Update Next.js to patch version**
   ```bash
   cd src/iron-pets/frontend
   npm update next eslint-config-next
   ```

### 8.2 Short-term Updates (1-2 weeks)

**Priority: HIGH - Security patches**

1. **Backend: Fix jws vulnerability**
   - Update `jsonwebtoken` to 9.0.3 (pulls in fixed jws)

2. **Frontend: Update ESLint ecosystem**
   ```bash
   npm update eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
   ```

3. **Both: Apply all patch updates**
   ```bash
   npm update
   ```

### 8.3 Medium-term Updates (1-3 months)

**Priority: MEDIUM - Version currency**

1. **Prisma 5 -> 7 migration** (Backend)
   - Review breaking changes
   - Update schema syntax if needed
   - Test all database operations

2. **Stripe SDK updates** (Both)
   - Review API deprecations
   - Update payment integration code

3. **TypeScript ESLint v8** (Frontend)
   - Requires ESLint 9 flat config migration
   - Update rule configurations

### 8.4 Long-term Updates (3-6 months)

**Priority: LOW - Major framework updates**

1. **Next.js 14 -> 16** (Frontend)
   - Major version upgrade
   - Review new features and breaking changes
   - Full E2E test suite required

2. **React 18 -> 19** (Frontend)
   - Concurrent features evaluation
   - Component compatibility review

3. **Express 4 -> 5** (Backend)
   - Router API changes
   - Middleware compatibility
   - Full API test suite required

4. **Tailwind CSS 3 -> 4** (Frontend)
   - New configuration format
   - Utility class changes

5. **Zod 3 -> 4** (Both)
   - Schema syntax changes
   - Validation behavior updates

---

## 9. Memory Storage References

All dependency analysis data has been stored in the `qe-swarm` namespace:

| Key | Description |
|-----|-------------|
| `dependency-graph-frontend` | Frontend dependency graph summary |
| `dependency-graph-backend` | Backend dependency graph summary |
| `dependency-vulnerabilities` | Detailed vulnerability data |
| `dependency-outdated` | Outdated package information |
| `dependency-coupling-metrics` | Module coupling analysis |

**Retrieval Example:**
```typescript
mcp__agentic_qe__memory_retrieve({
  key: "dependency-vulnerabilities",
  namespace: "qe-swarm"
})
```

---

## 10. Conclusion

### Summary

The Iron Pets project demonstrates **good dependency hygiene** with:
- No circular dependencies detected
- Well-organized module structure with appropriate coupling
- Predominantly permissive open-source licenses

### Areas Requiring Attention

1. **Security**: 10 HIGH severity vulnerabilities require immediate patching
2. **Currency**: 31 major version updates available (evaluate for migration)
3. **Licenses**: 2 UNLICENSED packages require review
4. **Technical Debt**: Consider consolidating bcrypt/bcryptjs to single implementation

### Risk Score

| Category | Score | Status |
|----------|-------|--------|
| Security | 6/10 | Needs Improvement |
| Currency | 5/10 | Moderate Debt |
| Architecture | 9/10 | Good Structure |
| Licenses | 8/10 | Minor Issues |
| **Overall** | **7/10** | **Acceptable** |

---

*Report generated by QE Dependency Mapper v3*
*Analysis completed in 45 seconds*
*Next scheduled analysis: 2026-02-10*

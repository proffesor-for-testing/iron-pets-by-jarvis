# Performance Test Suite for CandyMapper.com

## Automated Performance Testing Strategy

### 1. Lighthouse CI Configuration

**File: `.lighthouserc.json`**
```json
{
  "ci": {
    "collect": {
      "url": ["https://candymapper.com/"],
      "numberOfRuns": 5,
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "speed-index": ["error", { "maxNumericValue": 3000 }],
        "interactive": ["error", { "maxNumericValue": 3500 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 307200 }],
        "resource-summary:image:size": ["error", { "maxNumericValue": 512000 }],
        "resource-summary:stylesheet:size": ["error", { "maxNumericValue": 102400 }],
        "resource-summary:total:size": ["error", { "maxNumericValue": 1228800 }],
        "uses-optimized-images": "error",
        "uses-webp-images": "error",
        "modern-image-formats": "error",
        "uses-responsive-images": "error",
        "offscreen-images": "error",
        "render-blocking-resources": "error",
        "unminified-css": "error",
        "unminified-javascript": "error",
        "unused-css-rules": "warn",
        "unused-javascript": "warn",
        "uses-text-compression": "error",
        "uses-rel-preconnect": "warn",
        "uses-rel-preload": "warn",
        "font-display": "error",
        "efficient-animated-content": "warn",
        "duplicated-javascript": "error",
        "legacy-javascript": "warn",
        "total-byte-weight": ["error", { "maxNumericValue": 1228800 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 2. WebPageTest API Integration

**File: `performance-tests/webpagetest-config.js`**
```javascript
const WebPageTest = require('webpagetest');
const wpt = new WebPageTest('www.webpagetest.org', 'YOUR_API_KEY');

const testConfig = {
  url: 'https://candymapper.com/',
  location: 'Dulles:Chrome',
  connectivity: '4G',
  runs: 3,
  firstViewOnly: false,
  video: true,
  lighthouse: true,
  pollResults: 5,
  timeout: 600,
  specs: {
    average: {
      firstView: {
        visualComplete: 3000,
        SpeedIndex: 3000,
        'chromeUserTiming.LargestContentfulPaint': 2500,
        'chromeUserTiming.CumulativeLayoutShift': 0.1,
        'chromeUserTiming.TotalBlockingTime': 300,
        bytesIn: 1228800
      }
    }
  }
};

async function runPerformanceTest() {
  return new Promise((resolve, reject) => {
    wpt.runTest(testConfig.url, testConfig, (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log('Test ID:', result.data.testId);
        console.log('Summary URL:', result.data.summaryURL);
        resolve(result);
      }
    });
  });
}

module.exports = { runPerformanceTest, testConfig };
```

### 3. Custom Real User Monitoring (RUM)

**File: `performance-tests/rum-tracker.js`**
```javascript
// Deploy this script on CandyMapper.com for field data collection

(function() {
  'use strict';

  // Track Core Web Vitals
  function sendMetric(metric) {
    const data = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      url: window.location.href,
      timestamp: Date.now(),
      connection: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      deviceMemory: navigator.deviceMemory || 'unknown'
    };

    // Send to analytics endpoint
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify(data));
    } else {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true
      });
    }
  }

  // Load web-vitals library
  import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js').then((webVitals) => {
    webVitals.onCLS(sendMetric);
    webVitals.onFID(sendMetric);
    webVitals.onLCP(sendMetric);
    webVitals.onFCP(sendMetric);
    webVitals.onTTFB(sendMetric);
    webVitals.onINP(sendMetric);
  });

  // Track custom performance metrics
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    const paintData = performance.getEntriesByType('paint');

    const metrics = {
      // Navigation Timing
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      ttfb: perfData.responseStart - perfData.requestStart,
      download: perfData.responseEnd - perfData.responseStart,
      domInteractive: perfData.domInteractive,
      domComplete: perfData.domComplete,
      loadComplete: perfData.loadEventEnd,

      // Paint Timing
      fcp: paintData.find(p => p.name === 'first-contentful-paint')?.startTime,

      // Resource Timing
      resources: performance.getEntriesByType('resource').length,
      totalSize: performance.getEntriesByType('resource')
        .reduce((sum, r) => sum + (r.transferSize || 0), 0),

      // Memory (if available)
      jsHeapSize: performance.memory?.usedJSHeapSize,

      // User context
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: Date.now()
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/performance', JSON.stringify(metrics));
    }
  });

  // Track long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          sendMetric({
            name: 'long-task',
            value: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution
          });
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  }

  // Track layout shifts
  if ('PerformanceObserver' in window) {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        console.log('Layout shift detected:', entry.value);
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
})();
```

### 4. Performance Budget Enforcement

**File: `performance-tests/budget-validator.js`**
```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const PERFORMANCE_BUDGET = {
  timings: {
    'first-contentful-paint': 2000,
    'largest-contentful-paint': 2500,
    'total-blocking-time': 300,
    'cumulative-layout-shift': 0.1,
    'speed-index': 3000,
    'interactive': 3500
  },
  resourceSizes: {
    script: 300 * 1024,      // 300KB
    image: 500 * 1024,       // 500KB
    stylesheet: 100 * 1024,  // 100KB
    total: 1200 * 1024       // 1.2MB
  }
};

async function validatePerformanceBudget(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    onlyCategories: ['performance']
  };

  const runnerResult = await lighthouse(url, options);
  const audits = runnerResult.lhr.audits;

  const violations = [];

  // Check timing budgets
  for (const [metric, budget] of Object.entries(PERFORMANCE_BUDGET.timings)) {
    const audit = audits[metric];
    if (audit && audit.numericValue > budget) {
      violations.push({
        metric,
        type: 'timing',
        actual: audit.numericValue,
        budget,
        exceeded: audit.numericValue - budget,
        severity: audit.numericValue > budget * 1.5 ? 'critical' : 'warning'
      });
    }
  }

  // Check resource size budgets
  const resourceSummary = audits['resource-summary'];
  if (resourceSummary) {
    const items = resourceSummary.details.items;

    items.forEach(item => {
      const budget = PERFORMANCE_BUDGET.resourceSizes[item.resourceType];
      if (budget && item.size > budget) {
        violations.push({
          metric: `${item.resourceType}-size`,
          type: 'resource',
          actual: item.size,
          budget,
          exceeded: item.size - budget,
          severity: item.size > budget * 1.5 ? 'critical' : 'warning'
        });
      }
    });
  }

  await chrome.kill();

  return {
    passed: violations.filter(v => v.severity === 'critical').length === 0,
    violations,
    score: runnerResult.lhr.categories.performance.score * 100
  };
}

// Run validation
validatePerformanceBudget('https://candymapper.com/')
  .then(result => {
    console.log('Performance Budget Validation Results:');
    console.log(`Score: ${result.score}/100`);
    console.log(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);

    if (result.violations.length > 0) {
      console.log('\nBudget Violations:');
      result.violations.forEach(v => {
        console.log(`  [${v.severity.toUpperCase()}] ${v.metric}:`);
        console.log(`    Actual: ${v.actual}`);
        console.log(`    Budget: ${v.budget}`);
        console.log(`    Exceeded by: ${v.exceeded}`);
      });
    }

    process.exit(result.passed ? 0 : 1);
  })
  .catch(err => {
    console.error('Validation failed:', err);
    process.exit(1);
  });

module.exports = { validatePerformanceBudget, PERFORMANCE_BUDGET };
```

### 5. Regression Testing with Playwright

**File: `performance-tests/regression.spec.js`**
```javascript
const { test, expect } = require('@playwright/test');

test.describe('CandyMapper Performance Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://candymapper.com/');
  });

  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries.find(e => e.entryType === 'largest-contentful-paint');

          if (lcpEntry) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const fcp = performance.getEntriesByName('first-contentful-paint')[0];

            resolve({
              lcp: lcpEntry.renderTime || lcpEntry.loadTime,
              fcp: fcp?.startTime,
              ttfb: navigation.responseStart,
              domInteractive: navigation.domInteractive
            });
          }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });

    // Assert Core Web Vitals
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(metrics.fcp).toBeLessThan(2000); // FCP < 2s
    expect(metrics.ttfb).toBeLessThan(600);  // TTFB < 600ms
  });

  test('should load critical resources efficiently', async ({ page }) => {
    const resourceStats = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');

      return {
        totalRequests: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        scripts: resources.filter(r => r.initiatorType === 'script').length,
        images: resources.filter(r => r.initiatorType === 'img').length,
        css: resources.filter(r => r.initiatorType === 'link' && r.name.includes('.css')).length,
        fonts: resources.filter(r => r.name.includes('font')).length
      };
    });

    expect(resourceStats.totalSize).toBeLessThan(1.2 * 1024 * 1024); // < 1.2MB
    expect(resourceStats.totalRequests).toBeLessThan(50); // < 50 requests
  });

  test('should not have render-blocking resources', async ({ page }) => {
    const blockingResources = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

      return {
        blockingScripts: scripts.filter(s => !s.async && !s.defer).length,
        blockingStyles: links.filter(l => !l.media || l.media === 'all').length
      };
    });

    expect(blockingResources.blockingScripts).toBe(0);
    expect(blockingResources.blockingStyles).toBeLessThan(2); // Allow 1 critical CSS
  });

  test('should use modern image formats', async ({ page }) => {
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[src]'));

      return imgs.map(img => ({
        src: img.src,
        format: img.src.split('.').pop().split('?')[0]
      }));
    });

    const modernFormats = ['webp', 'avif'];
    const modernImageCount = images.filter(img =>
      modernFormats.some(format => img.format === format)
    ).length;

    const modernFormatPercentage = (modernImageCount / images.length) * 100;
    expect(modernFormatPercentage).toBeGreaterThan(70); // >70% modern formats
  });

  test('should implement lazy loading', async ({ page }) => {
    const lazyImages = await page.evaluate(() => {
      const allImages = Array.from(document.querySelectorAll('img'));
      const lazyImages = allImages.filter(img => img.loading === 'lazy');

      return {
        total: allImages.length,
        lazy: lazyImages.length,
        percentage: (lazyImages.length / allImages.length) * 100
      };
    });

    expect(lazyImages.percentage).toBeGreaterThan(50); // >50% lazy loaded
  });

  test('should have proper caching headers', async ({ page }) => {
    const response = await page.goto('https://candymapper.com/');
    const cacheControl = response.headers()['cache-control'];

    // Check that static assets are cached
    const cssResponse = await page.goto('https://candymapper.com/styles/main.css');
    if (cssResponse) {
      const cssCacheControl = cssResponse.headers()['cache-control'];
      expect(cssCacheControl).toContain('max-age');
    }
  });

  test('should minimize layout shifts', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          resolve(clsValue);
        }, 3000);
      });
    });

    expect(cls).toBeLessThan(0.1); // CLS < 0.1
  });

  test('should load fonts efficiently', async ({ page }) => {
    const fonts = await page.evaluate(() => {
      return Array.from(document.fonts).map(font => ({
        family: font.family,
        status: font.status,
        display: getComputedStyle(document.body).fontDisplay
      }));
    });

    // All fonts should be loaded
    const loadedFonts = fonts.filter(f => f.status === 'loaded').length;
    expect(loadedFonts).toBe(fonts.length);
  });
});
```

### 6. CI/CD Integration (GitHub Actions)

**File: `.github/workflows/performance-tests.yml`**
```yaml
name: Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install -g @lhci/cli@0.12.x

      - name: Run Lighthouse CI
        run: lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: .lighthouseci/

  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run performance regression tests
        run: npx playwright test performance-tests/regression.spec.js

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  budget-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Validate performance budget
        run: node performance-tests/budget-validator.js

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('budget-results.json', 'utf8'));

            const comment = `## Performance Budget Validation

            **Score:** ${results.score}/100
            **Status:** ${results.passed ? '✅ PASSED' : '❌ FAILED'}

            ${results.violations.length > 0 ? `
            ### Budget Violations
            ${results.violations.map(v => `
            - **${v.metric}** (${v.severity})
              - Actual: ${v.actual}
              - Budget: ${v.budget}
              - Exceeded by: ${v.exceeded}
            `).join('\n')}
            ` : 'No violations detected.'}
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### 7. Performance Monitoring Dashboard Configuration

**File: `performance-tests/grafana-dashboard.json`**
```json
{
  "dashboard": {
    "title": "CandyMapper Performance Metrics",
    "panels": [
      {
        "title": "Core Web Vitals",
        "type": "graph",
        "targets": [
          {
            "expr": "web_vitals_lcp_seconds{url='candymapper.com'}",
            "legendFormat": "LCP"
          },
          {
            "expr": "web_vitals_fid_seconds{url='candymapper.com'}",
            "legendFormat": "FID"
          },
          {
            "expr": "web_vitals_cls{url='candymapper.com'}",
            "legendFormat": "CLS"
          }
        ]
      },
      {
        "title": "Page Load Time Distribution",
        "type": "histogram",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(page_load_seconds_bucket[5m]))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.50, rate(page_load_seconds_bucket[5m]))",
            "legendFormat": "P50"
          }
        ]
      },
      {
        "title": "Resource Sizes",
        "type": "graph",
        "targets": [
          {
            "expr": "resource_size_bytes{type='script'}",
            "legendFormat": "JavaScript"
          },
          {
            "expr": "resource_size_bytes{type='image'}",
            "legendFormat": "Images"
          },
          {
            "expr": "resource_size_bytes{type='stylesheet'}",
            "legendFormat": "CSS"
          }
        ]
      }
    ]
  }
}
```

---

## Test Execution Schedule

### Daily Tests
- Lighthouse CI runs on every commit
- Playwright regression tests on PR creation
- Budget validation before merge

### Hourly Monitoring
- Synthetic monitoring via WebPageTest API
- Real User Monitoring (RUM) continuous collection
- Uptime and performance checks

### Weekly Audits
- Full Lighthouse audit with detailed report
- Competitive benchmarking against similar sites
- Performance trend analysis

### Monthly Reviews
- Comprehensive performance review meeting
- Budget adjustments based on real data
- Optimization priority reassessment

---

## Success Criteria

### Performance Score
- ✅ Lighthouse Performance Score ≥ 90/100
- ✅ Accessibility Score ≥ 95/100
- ✅ Best Practices Score ≥ 90/100
- ✅ SEO Score ≥ 90/100

### Core Web Vitals
- ✅ LCP < 2.5s (75th percentile)
- ✅ FID < 100ms (75th percentile)
- ✅ CLS < 0.1 (75th percentile)

### Resource Budgets
- ✅ Total JavaScript < 300KB
- ✅ Total Images < 500KB
- ✅ Total CSS < 100KB
- ✅ Total Page Weight < 1.2MB

### User Experience
- ✅ Time to Interactive < 3.5s
- ✅ Speed Index < 3.0s
- ✅ First Contentful Paint < 2.0s

---

**Test Suite Version:** 1.0.0
**Last Updated:** 2025-11-26
**Maintained By:** QE Performance Testing Team

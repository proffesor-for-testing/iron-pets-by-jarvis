# Rehearsal receipts — 19 October 2026

Source: 67a146c6af83fd9806a58b0977f5d695ceefe0f8 (application source equals then-main b953b0e), with the documented frontend dependency repair. Both deliberately injected source mutations were restored. Commands ran locally in scratch. No automatic Claude dispatch, scheduler or agent fleet was run.

## hook-baseline

```text
Test Suites: 1 passed, 1 total
Tests:       52 passed, 52 total
Snapshots:   0 total
Time:        0.594 s, estimated 1 s
```

## hook-mutation

```text
Test Suites: 1 failed, 1 total
Tests:       4 failed, 48 passed, 52 total
Snapshots:   0 total
Time:        0.626 s, estimated 1 s
```

## hook-restored

```text
Test Suites: 1 passed, 1 total
Tests:       52 passed, 52 total
Snapshots:   0 total
Time:        0.545 s, estimated 1 s
```

## orders-mutant-survives

```text
Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        0.67 s, estimated 1 s
```

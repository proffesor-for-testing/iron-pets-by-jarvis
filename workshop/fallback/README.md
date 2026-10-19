# Offline evidence walkthrough

These are genuine local test receipts from the 19 October rehearsal, **not a
recording of an AI fleet, automatic hook dispatch or scheduled execution**.
They can support the verification lesson if a live demo is unavailable.

## Slide 20 — scheduled report design (15 minutes total)

Spend 7 minutes inspecting a quality-report structure: revision, commands,
results, skipped work and unresolved questions. Say that this pack was collected
manually, not by a scheduler. Cloud routines, Desktop tasks and `/loop` have
different host/session requirements. Without an approved completed scheduled
run, teach the design exercise and show the [actual test receipts](receipts.md)
as report inputs. Learners design one task for 5 minutes and share for 3.

## Slide 23 — fleet evidence walkthrough (30 minutes total)

Show the intended roles: finder proposes a defect, verifier executes a relevant
check, facilitator accepts evidence or marks it missing. Use the two recorded
cases below. This is a walkthrough of fleet governance, not proof a live fleet
ran. No new provider call is needed.

1. **Finding caught:** a deliberate Button loading mutation is detected by four
   tests. Restore the original bytes and require a passing rerun.
2. **Finding missed:** a deliberate orders route mutation survives all 16 legacy
   orders tests. Those tests inspect fixtures and do not establish route behavior.
   “Tests green, route correct” is rejected for missing HTTP evidence.
3. **Checkpoint:** a claim without command, tested revision, output and scope is
   marked unverified; do not invent a verifier approval.

Spend 20 minutes on the walkthrough, 7 on questions and 3 closing. If an actual
licensed fleet run is prepared later, record its exact version/configuration and
keep the same evidence checkpoints. November 4 repeats Level 1 for group two.

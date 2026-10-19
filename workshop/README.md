# Sixsentix Level 1 — PARTICIPANT TRAINING VERSION

**21 October 2026, 15:00–19:00 Europe/Belgrade. 4 November repeats Level 1
for the second group. Level 2 is an optional future topic.**

## Prepare before the workshop

Use a new training clone, Node **22**, npm, Git, and the company's approved
Claude Code license. VS Code is recommended; Claude Desktop and Copilot are
optional. A GitHub account is not needed to clone this public repository.
Do not install or sign in from an existing client project. No credentials,
payment/email services, database, Docker, MCP server or provider call is needed
for the mandatory baseline below. Do not run root `start.sh` or the privileged
devcontainer setup for this path.

```bash
git clone https://github.com/proffesor-for-testing/iron-pets-by-jarvis.git sixsentix-iron-pets
cd sixsentix-iron-pets
# Check out the full approved merge SHA supplied with the participant pack.
git switch --detach <participant-sha-from-checklist>
git rev-parse HEAD
node --version
npm run workshop:setup
npm run workshop:check
npm run workshop:rehearse
```

The checklist supplies a pinned participant training SHA (not general main), and participants should record their actual
`git rev-parse HEAD`. The setup script uses lockfile-based installs with lifecycle
scripts disabled, then explicitly generates Prisma and builds/installs bcrypt's
native binding in the clone. Network access to npm, Prisma binaries and bcrypt's
distribution may be required. It installs no global packages or host services.
Use company-approved Node 22; native package behavior on Windows requires IT's
normal build/install support. macOS and CI acceptance are recorded in the final
facilitator receipt; other platforms are not implicitly certified.

`workshop:check` runs frontend component tests, typecheck and lint, backend build,
legacy tests and **7 core HTTP contract tests with database IO mocked**. Warnings,
TODOs and skipped legacy tests are visible; green does not mean full application
coverage. The 52-test Button file is the fast exercise baseline:

```bash
npm --prefix src/iron-pets/frontend run test:workshop
```

The invalid Jest option `--run` must not be used. To run a file directly:
`npm test -- --runInBand --watch=false tests/components/ui/Button.test.tsx`
from `src/iron-pets/frontend`.

## Exercise boundaries

This is the dedicated participant version. General main remains fixed. The dedicated
participant branch contains one selected cart-validation defect; its expected
red exercise check is separate from the green setup gate.
`workshop:rehearse` first checks the baseline, temporarily removes the Button's
loading-disable condition, expects failing tests, restores the exact original
bytes in `finally`, and requires a passing rerun. Run it only in the training
copy while nobody else is editing Button.tsx. It refuses to overwrite a source
that already lacks the expected original expression. Save/commit your own work
before experimentation; no `git reset --hard`, `git clean` or database deletion
is required.

- **Exercise 2.1:** audit existing CLAUDE.md against package files and executed
  commands. It already exists; do not replace it with a blank template. Identify
  a real gap, or add a verified command/result instead of inventing a stale fact.
- **Exercise 3.3:** copy `workshop/skills/bug-report/SKILL.md` into
  `.claude/skills/bug-report/SKILL.md` in your training copy, then invoke
  `/bug-report`. Use the hypothetical Save/empty-email example; do not assert an
  Iron Pets defect without reproduction. These project files are ignored by Git.
- **Exercise 3.4:** review `workshop/claude-settings.json` and
  `workshop/hooks/test.cjs`. From the clone root, opt into only that explicit file:

  ```bash
  claude --setting-sources= --strict-mcp-config --settings "$PWD/workshop/claude-settings.json"
  ```

  Managed policy can still apply; this is not a security sandbox. Inspect
  `/hooks` after launch. Make an allowed Edit/Write and inspect the output.
  Bash/external edits are outside this scope. PostToolUse reports after an edit
  and cannot undo it. `workshop:rehearse` verifies the handler by direct JSON stdin
  invocation; it does **not** prove automatic Claude dispatch or consume model
  quota. Live dispatch and skill invocation require the licensed human session.
- **Exercise 4.1:** default feature is Button loading/disabled behavior. Design
  3–5 behavior tests, run them, plant one reversible mutation, restore and rerun.
  Database setup and payment flow are outside the mandatory 35-minute exercise.

The initial reviewed launcher remains
`claude --setting-sources user --strict-mcp-config`; user/managed rules can still
apply, and it deliberately does not enable the workshop hook until opt-in.
Never copy global hook settings or bypass permissions to complete an exercise.

## Known gaps, not claimed seeded bugs

The earlier audit found catalog alias and validation contract failures. A dedicated
participant training branch selectively restores one cart-validation defect; general
main remains fixed. Other defects are not claimed to be historically intentional.
Legacy backend tests include many skipped or fixture-only examples. Eleven
assertion-free frontend proposals are explicit TODOs rather than green tests.
The frontend's local cart and server cart are not proven equivalent. Development
mock email has an interface mismatch; browser account verification, checkout,
order persistence and comprehensive E2E are not acceptance claims of this pack.
Use these as investigation candidates, clearly separated from the controlled
Button mutation. No authoritative seeded-bug list exists.

## Optional full application

Only use a separate local training PostgreSQL database. The earlier rehearsal
used PostgreSQL 14.18 on a dedicated loopback port; the historical PostgreSQL 15+
prerequisite and a clean DevPod build have not been accepted. Set DATABASE_URL
explicitly, USE_MOCK_SERVICES=true, and matching backend port, frontend API URL
and CORS origin. Do not copy real Stripe/SendGrid keys. Generate Prisma, push
schema and seed **once** in that new database. Repeating the existing seed fails
on duplicate slugs. To start over, create another disposable database name and
seed it once; never reset an unknown or shared database. Full UI acceptance must
be completed separately before using it as the default participant journey.

## Offline fallback and delivery timing

See [fallback/README.md](fallback/README.md). Saved test evidence is an offline
verification exercise, not a claim that a live agent fleet or scheduled task ran.
Schedule/remote/fleet demos require either an actual completed authorized run or
an explicitly labeled walkthrough. No provider spending is authorized by these
scripts. Remote Control also requires the eligible account/org approval and a
running host/session. Do not change organization security settings for a demo.

| Belgrade time | Activity | Minutes |
|---|---|---:|
| 15:00–15:30 | Prompting/personalization, including opening/setup | 30 |
| 15:30–16:15 | Context | 45 |
| 16:15–16:30 | Break | 15 |
| 16:30–17:45 | Agents, skill, hook, demo/design | 75 |
| 17:45–18:30 | Practicum 35 + debrief 10 | 45 |
| 18:30–19:00 | Fleet evidence demo/walkthrough 20 + Q&A 7 + close 3 | 30 |

Total 240 minutes. Learner/spoken timing, licenses, projector/QR and venue
network remain human acceptance checks. Resolve setup before 15:00; pair learners
if access fails rather than taking time from the fixed first/fifth blocks.


## Windows and the no-database cart exercise

In Windows PowerShell or CMD, use `npm.cmd` for every `npm` command here:

```powershell
npm.cmd --version
npm.cmd run workshop:setup
npm.cmd run workshop:check
npm.cmd run workshop:rehearse
npm.cmd run workshop:cart
npm.cmd run workshop:accept
```

The scripts select npm.cmd internally on Windows. Do not change execution policy,
credentials or organization settings. The live hook command above assumes an
already approved Git Bash shell: `$PWD` and `$CLAUDE_PROJECT_DIR` must resolve there.
A working native Claude CLI alone does not establish that shell compatibility.
Inspect /hooks in the actual session; otherwise use `workshop:rehearse`, which
calls the handler directly and does not consume model quota. Do not install a
shell or relax policy just for this demo. Windows CI checks Node scripts/tests,
not VS Code, licensing, corporate proxy or automatic Claude dispatch.

If backend bcrypt native setup fails, the frontend-only fallback is:

```powershell
npm.cmd --prefix src/iron-pets/frontend ci --ignore-scripts --no-audit --no-fund
npm.cmd --prefix src/iron-pets/frontend run test:workshop
node workshop/rehearse.cjs
```

That fallback supports Button/handler only, not the backend/cart exercise or full
setup acceptance. Pair for cart or use facilitator evidence if backend is unavailable.

Run `workshop:cart` in the assigned training revision. It checks five explicit
request contracts using actual middleware and schemas, with no database or HTTP
listener. A nonzero result is expected on the assigned participant baseline;
it is exercise evidence, not an installation failure. Record expected versus
actual, propose 3–5 focused tests and investigate before changing behavior.
Button/mutation remains the prepared core and fallback. Repair only the assigned
behavior; preserve unrelated defects. No root-cause patch is included in learner
instructions. `workshop:accept` distinguishes the expected red exercise from a
failed setup; it does not turn failed behavior into a product pass.

Reset ONLY the cart exercise file with `npm.cmd run workshop:cart:reset`
(or npm on macOS/Linux). It restores that file from the current HEAD and keeps
edited bytes in `.workshop-cart-backup`. It refuses to overwrite an existing
backup. Inspect/move that backup yourself before another edited reset; never
use a blanket reset/clean. Running reset on an unchanged file is a no-op.
The Button script independently backs up/restores its exact source bytes.

PostgreSQL **15+** is optional only if the instructor explicitly chooses a separate
DB-backed exercise. A company-approved native PostgreSQL installation can be
used; Docker Desktop is not required. Do not substitute SQLite in the PostgreSQL
Prisma schema, use real service keys, or run database reset commands for Level 1.

See the current checklist for exact participant SHA and facilitator acceptance
for measured platforms. No native Windows acceptance is claimed from source review.

Participant cart baseline: the five contract checks produce 2 PASS / 3 FAIL and exit 1. That is the assigned observation; investigate without changing unrelated behavior. `workshop:check` remains green with 7 core contracts. Instructor answers are not part of this learner version.

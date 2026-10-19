# Instructor only — cart request boundary

Participant observation: valid add/update requests receive 400 with missing body/params; the nested-body workaround wrongly passes. The middleware spreads request namespaces while the actual cart Zod schemas expect `{body, query, params}`. Preserve those namespaces; do not change the client JSON contract.

The preceding participant commit differs from this solution only in that selected middleware hunk, the six reference tests, variant metadata and instructor documentation. No broad application repairs are included.

Run `npm run workshop:cart`: participant 2 pass / 3 fail (exit 1), solution 5 pass (exit 0). Run `npm --prefix src/iron-pets/backend run test:contracts`: solution 13 pass including six cart contracts with real middleware, schemas, HTTP dispatch and mocked/no database IO. Core `workshop:check` runs seven non-cart contracts.

Reset in either pinned detached clone using `npm run workshop:cart:reset`: only validate.ts returns to that revision, edits are backed up and earlier backups are never overwritten. Repeated reset of unchanged bytes is a no-op. Never reset a shared/unknown DB or the full worktree.

Time budget: cart investigation 15–25 minutes estimated, not measured learner completion. Keep Button/mutation as the prepared core/fallback. No PostgreSQL/Docker needed. Broader JWT/auth/cart/checkout/styling repairs remain archived WIP outside this release.

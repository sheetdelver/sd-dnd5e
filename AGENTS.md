# D&D 5e module working agreement

Read this file, then `temp/AGENT-HANDOFF.md` when present and its current task
references. Read [module architecture](docs/architecture.md) for technical context.
Do not inherit another module's active audit. This module remains experimental.

Current planning context: [ADR-0001](docs/adr/0001-complete-character-lifecycle.md),
[active audit](docs/audits/README.md), [native release map](docs/reference/native-6.0.6.md)
and [verification matrix](docs/plans/0001-verification.md). The target is the
pinned D&D system 6.0.6 baseline, primarily 2024 rules. These are
active implementation documents, not current support claims. Record actual
progress against their stable DD/A/M IDs; current task authority and checkpoints
belong in the handoff. No live world authority follows from these documents.

The October 23 [usability and delivery review](docs/audits/2026-10-23-usability-and-delivery-review.md)
is the active audit. Its DD-QA07 operator follow-up pauses implementation until
explicit user resumption; then verify the actual Actor/Item integration and usable
basic sheet before attack/damage. Historical next-work entries do not override
this pause. Its execution order supersedes the old next-field-matrix queue: repair DD-QA01/02, demonstrate integrated sheet usability, rationalize
duplicated verification, and deliver a complete player operation. ADR-0001's full
acceptance scope remains open. Report player outcomes, not case-count progress.
Use installed native data wherever public contracts provide it. Qualify upgrades
with representative character workflows and changed-domain tests; do not silently
broaden exact-version rules or run deep qualification on each character load.
Preserve proven regressions, but justify new exhaustive permutations by a concrete
failure/risk. Core0.21/SDK3.7 adoption opportunities and remaining E01–E05 gaps are
documented in the review; no compatibility or Core change is implied.

## Scope and repository ownership

This is an independent SheetDelver system-module repository. Keep its code,
tests, documentation, audits and handoff here. Core and sibling modules are
read-only unless the current user explicitly selects work in those repositories.
An unavailable host contract is an external dependency to report, not permission
to edit Core, import private host code or add a direct Foundry transport.

Use public `@sheet-delver/sdk` entry points. Core owns source/prepared stores,
authorization, world/session lifecycle and shared chat, notifications and dice
presentation. The module owns system rules and its UI. Keep browser UI,
server-only orchestration and environment-neutral rules separated. Do not add a
second world cache/lifecycle or treat module-prepared data as native browser data.

## Git and release boundaries

- Check this repository's branch, status and version before work. Preserve
  unrelated changes, stashes, parked research and native reference checkouts.
- Feature implementation belongs on a user-authorized module branch, not main.
  A task that explicitly authorizes a branch needs no repeated permission.
- Other Git mutations and remote writes need their own scoped user authority.
  Do not infer commit/push/merge/tag/release permission from implementation work
  or an earlier release. Do not reset, discard or rewrite unrelated history.
- When a PR merge is authorized, use squash merge with branch deletion after
  required checks pass; verify merge and removal of that feature branch.
- `info.json` owns module version/compatibility. During implementation, prepare
  terse changelog notes without version bumps. Do not change Core versions,
  compatibility minima or CI toolchain pins as incidental housekeeping.
- Follow this module's CI/release workflows and the host's documented packaging
  contract. Release publication is a separate authorized operation.
- Record any Core/SDK/API requirement changes with explicit old → new versions
  in CHANGELOG.md and the current handoff, alongside manifest/toolchain updates.
  Keep this guidance current when a new required floor is adopted. Use the previous
  release baseline, not intermediate branch bumps; identify the supporting Core
  publication and whether it must precede the module release. Optional adoption
  must name its introduction versions without implying an increased minimum.

## Standalone release tooling

Use the module-local `npm run release:tag -- [version] --dry-run` and
`npm run test:release`; see [release instructions](docs/RELEASING.md).
`info.json` remains the only version authority. The npm manifest has no version
or dependencies. Tag pushes validate; a separately confirmed workflow dispatch
publishes only after exact-tag validation. Keep the helper, tests and workflow
changes together. Do not run a real release or push merely to verify tooling;
use temporary Git fixtures. No Core checkout is needed to run the helper.

## Data and verification discipline

- Native source fields, prepared results and caller-visible projections are
  distinct. Preserve canonical identities and original source data.
- Use native rules for the selected release. Record version/source provenance.
  Missing data must produce a clear unavailable/unsupported state, not invented
  formulas, dice, defaults or same-name document substitutions.
- Share preparation/action logic across sheets, cards, dialog defaults and
  server execution. UI may format/filter/select; it must not duplicate rules.
- Route caller operations through the public request runtime. Keep permission,
  privacy, source-preservation and failure behavior in regression coverage.
- Use SDK rich-text/URL handling and shared roll/confirmation components.
  Never use native browser alert/confirm/prompt for application flows.
- Treat host .env/settings as production-connected. Do not start Core or connect
  to live Foundry for a test without task-specific authority. Prefer offline
  fixtures and isolated outputs; never copy credentials into documentation.
- Browser tests are isolated development tools, not runtime/backend dependencies.
  Inspect listeners before starting/stopping a needed service and record any
  retained test process in the local handoff.
- Match tests to changed behavior. For confirmed defects, establish a meaningful
  failing case, then prove the fix with the same input and an independent oracle.
  Passing mocks/prepared fixtures do not establish native/operator acceptance.

## Documentation ownership

- `AGENTS.md`: durable working rules and verification entry points.
- `CLAUDE.md`: imports this module's AGENTS.md; do not maintain a second rules copy.
- `temp/AGENT-HANDOFF.md`: one replaceable local task snapshot, when present.
  Keep verified facts, user reports, unknowns, permissions and next steps distinct.
  `temp/` is ignored; a missing local handoff is not an error in a clean clone.
- `docs/architecture.md`: technical behavior and supported boundaries.
- `docs/adr/`: module decisions/plans; `docs/audits/`: durable findings/evidence.
  Number ADRs independently in each module, starting at 0001; identify Core
  decision references explicitly as Core ADRs.
  A handoff names one active module audit. Preserve historical reports and
  deferrals; old unchecked research does not become active work by itself.
- Keep tracked decisions understandable without ignored reports. Do not use
  architecture/ADR/audit files as repeated agent startup or permission notices.
  Record scope decisions once in the decision record and current authority in
  the handoff. Update documentation and tests with the implementation.

## D&D 5e constraints and parked work

Keep the experimental designation and distinguish bounded supported behavior
from native preparation parity. Persisted Actor source does not contain every
native prepared field; behavior-preserving tests are not native-rule oracles.
Version capture profiles and expectations explicitly when investigating parity.

The native preparation-runtime experiment is parked. Preserve its branches,
stashes, fixtures and `temp/audit-report/` history. Do not resume, integrate,
delete or rewrite it without explicit user direction. Historical checklists
and successful isolated experiments do not authorize a native-runtime project.

Use the module's shared roll frame for HUD integration while preserving the
host-resolved formula/audience and permitted overrides. Keep self-hosted font
provenance/licenses with [the font assets](assets/fonts/README.md).

## Verification commands

Run from a configured Core/toolchain checkout with this repository available at
`data/local/modules/dnd5e` (or adapt that path to the isolated CI data root):

```sh
npx tsx data/local/modules/dnd5e/src/tests/prepared-actor.test.ts
npx tsx data/local/modules/dnd5e/src/tests/presentation.test.ts
npm run module:check -- dnd5e
```

Root TypeScript excludes module source; explicitly include the module when
checking types. Use isolated package output when validating distribution.
The current workflow is `.github/workflows/ci-dnd5e.yaml`; inspect its pinned
host version before running compatibility checks. Tools may run from Core,
but module work does not authorize changing Core files or generated settings.

# D&D usability, delivery and upgrade-maintenance review

Date: 2026-10-23  
Status: Audit complete; DD-QA01/02 corrected offline; player delivery and remaining gates open
Authority: user-requested independent QA and documentation amendments, including
test proportionality and greater use of native data. No application repair,
commit, release or live Foundry mutation performed by this review.

## Conclusion

The implementation has substantial, useful rules-preparation infrastructure, but
does not yet deliver the selected player-character lifecycle. Passing large
synthetic/native-method matrices has become the dominant progress signal. It is
not an adequate proxy for an ordinary character opening as a usable sheet.

The user demonstrated a sheet dominated by repeated “Q02a qualification” text,
missing values and overlapping panels. This review independently reproduced that
failure using module-owned fixtures and the actual sheet. A harmless native
migration marker is enough to trigger the broad preparation refusal. The exact
offending effect on the user's Krusky Actor is **not known**: its source was not
read from the connected world. Do not claim that specific Actor has the marker.

The execution-order amendment below takes precedence over the old “continue the
next transferred-field matrix” instruction. Preserve valid rules and evidence;
repair usability, reduce redundant test execution, and deliver complete player
workflows. Do not remove honest unsupported states or invent effective values to
make the screenshot look populated.

## Repair disposition — October23

DD-QA01 and DD-QA02 are corrected in the module. Supported metadata-bearing
characters retain their checks, level and HP without source changes. A single
accessible diagnostic and contained grids replace repeated tile prose/overlap.
DD-QA03 improves within a bounded scope: Item-only unresolved counters do not
blank independently qualified character facts; unknown global mechanics stay
restricted. Full dependency isolation remains open. The original reproduction and
review findings below are preserved as historical evidence.

[Repair evidence and commands](evidence/2026-10-23-usability-repair.md) distinguish
focused regressions, controlled pinned native methods, mounted SDK-seam rendering
and packaging. The exact offending source on Krusky remains unknown.
No live native/operator acceptance is claimed; ADR-0001 remains open.

DD-QA05: duplicate standalone tooling CI step removed; explicit smoke/affected/deep
entry points added without discarding tests. Legacy executable oracle imports are
retained for affected-only migration. DD-QA06: [bounded native-data and upgrade
decision](../plans/native-upgrades.md) recorded; exact version qualification remains.

## Baseline and quantified progress

- Module HEAD `5b52545`, branch `feat/adr-0001-character-lifecycle`; latest runtime
  checkpoint `68d1a29` (C107). Clean before this audit's files were added.
- Module 0.4.1 remains experimental, Core minimum 0.19.3. No requirement changes.
- Current Core `597ffbae`, application 0.21.0, SDK 3.7.0, module API 1.7.0,
  UI API 3.5.0, roll engine API 1.0.0. Core was read-only.
- Native reference: D&D 6.0.6 at `87e94dbd9f930135e0694cd7e7d49f210603cd2c`,
  static Foundry 14.367 target. No live source/prepared capture in this review.

From initial ADR checkpoint `e0fd608` through reviewed HEAD there are **125
commits**, with implementation history through **C107**. The diff changes 130
runtime/UI files, 236 test/fixture files, 108 scripts and 128 documentation files.
Generated fixture/evidence JSON accounts for much of the volume. These counts
measure activity, **not completion or the percentage of redundant tests**.
The ADR and verification ledger alone totaled 7,528 lines before this amendment.
Machine-readable counts: [delivery metrics](evidence/2026-10-23-delivery-metrics.json).

| Delivery area | Verified state at review |
| --- | --- |
| M0–M2: reference/context/preparation | Extensive partial implementation and evidence; all three full milestone gates remain open. |
| M3: writes and recovery | Journal, admission/queue and status foundations exist. `module/server.ts` registers only content, content/detail and commands/status, all read-only. Domain command execution remains unimplemented. Some old UI controls still use generic Core updates; this is not proof of completed M3. |
| M4: activities and rests | Full execution not started in the milestone ledger; modern rest controls deliberately gated. `getRollData` handles checks/initiative, not `item` activity execution. |
| M5: spellcasting | Read facts exist, but adapter explicitly reports casting preparation not implemented. No complete cast/consume/concentrate cycle. |
| M6: builder/advancement | Not started; UI manifest has no builder/tool registration. |
| M7: usability | Many consumers were modified, but full milestone remains open. Current screenshot failure reproducible. |
| M8/M9: delivery and acceptance | Package checks exist and pass; full packaging/compatibility acceptance and native/operator completion remain open. No complete lifecycle acceptance demonstrated. |

**0 of 10 full milestone gates are closed.** This does not mean zero useful work
exists, and does not establish the user's illustrative “2%” estimate. The useful
work is primarily bounded preparation, check formulas, source preservation,
permission/context fences and testing infrastructure, rather than completed play.

## Fresh verification

On current Core 0.21.0, this review ran:

- `npm test -- --core /path/to/core`: **9 tooling suites and 87 module suites pass**.
- `npm run typecheck -- --core /path/to/core`: **317 source/UI/server/test/hook files pass**.
- `npm run check:package -- --core /path/to/core`: module check and isolated package pass.
- The [bounded usability probe](evidence/2026-10-23-sheet-usability-probe.mjs):
  12 preparation controls and two sheet states at four widths. It imports the
  actual adapter and Sheet, uses the existing SDK presentation seam, compiled
  Core CSS and local fonts. All browser requests are locally fulfilled or aborted;
  no HTTP listener, Core startup or Foundry connection is used.

Reproduction:

```sh
node docs/audits/evidence/2026-10-23-sheet-usability-probe.mjs --core /path/to/core --browser-tools /path/to/test-tools --chromium /path/to/chromium --core-css /path/to/compiled-core.css
```

Portable results: [sheet evidence](evidence/2026-10-23-sheet-usability.json).
Local artifacts are indexed in the current handoff. Screenshots at 1440px were
visually inspected and reproduce the user's overlapping/repeated-text pattern.
These are offline checks, not actual Krusky data or complete native acceptance.
The first package check caught direct console output in the newly added audit
probe; changing it to process.stdout corrected that audit-only issue. Do not
report that failed run as an inherited module defect.

## Findings and required repairs

### DD-QA01 — High: benign metadata can invalidate the entire character

`src/logic/preparation/effect-admission.ts::permanentEffectReason606` rejects
every truthy `flags.dnd5e` value except explicit false `isTemporary`. The same
file's `itemEffectMetadata606` has a similar broad refusal for unrecognized Item
flags. It treats metadata as evidence of unimplemented mechanical dependencies.

Pinned native `module/documents/active-effect.mjs::_initializeSource` sets
`persistSourceMigration` for native migration bookkeeping. Its applicable-type,
suppression and temporary-effect logic do not turn that marker into a condition.
An empty `dependents` array is also truthy in JavaScript. Native dependency
relationships and temporary states must be distinguished from these cases.

| Offline change to otherwise working character | Ability/skill checks available | Level/HP |
| --- | --- | --- |
| Baseline or supported plain additive effect | 6 / 18 | 1 / 7 |
| Same effect plus `persistSourceMigration: true` | 0 / 0 | unavailable |
| Same effect plus `dependents: []` | 0 / 0 | unavailable |
| Supported poisoned condition plus migration marker | 0 / 0 | unavailable |
| Disabled marker-bearing effect | 6 / 18 | 1 / 7 |
| Owned feat with migration marker and supported effect | 0 / 0 | unavailable, Item metadata reason |

`spellLevel: 1`, an actual dependency and temporary flag also reproduce broad
refusal. Those are separate semantic cases; do not infer that all may be ignored.
Repair by classifying native identity/migration metadata separately from rule
inputs, with a few direct regression controls. Preserve original source flags;
do not strip them from world data or blanket-allow unknown mechanical flags.
Use native getters/schema/migration provenance to qualify the distinction.

### DD-QA02 — High: diagnostic presentation breaks layout

The same diagnostic is rendered **50 times** on the desktop fixture. At 1440px,
the ability children extend **400px** beyond their grid and saving throws extend
**278px**. At 1024px the unavailable sheet's document width is **1307px**; even
the baseline working sheet is **1064px** wide. At 390px the unavailable ability
and save grids overflow their own containers by **96px/86px**, even though the
document width remains 390px. Document-level overflow assertions alone miss this.

Sources: `StandardView` fixed sidebar columns and 52%-width ability area;
`Abilities` and `SavingThrows` use `repeat(n, 1fr)` with unconstrained intrinsic
widths; `CharacterFact` and numerous blocks repeat full diagnostic prose.

Repair now, not after full M2: compact per-field unavailable indicators, one
accessible summary with expandable diagnostics and exact readable Item/effect
attribution. Technical IDs such as Q02a belong in developer details, not every
stat tile. Keep independent known source facts visible with their proper labels;
never present a base value as a proven effective value. Use shrinkable grid tracks,
wrapping and content-aware breakpoints. Verify adjacent-card containment and
hit-testing, not only absence of console errors or viewport scrollbars.

### DD-QA03 — Architectural limitation: one global reason propagates too far

`effects.ts::planEffects606` keeps the first failure as one `reason`;
`numeric-effects.ts` forwards it, and character-profile/health/movement/check
consumers mark broad fact groups unavailable. The metadata case is a concrete
false rejection. For genuinely unknown mechanics, broad refusal can be necessary,
but the model cannot currently explain which dependencies are actually affected.

Introduce bounded dependency/availability scopes as part of repairing the
reproduced character profile. Do not launch another exhaustive graph-research
project. Known metadata should not poison rules; a known affected field should
invalidate its dependents; genuinely unknown global effects retain a clearly
explained restriction. Uncertain effective rolls stay disabled. A diagnostic
must identify the cause and a useful next step without asking users to delete
legitimate native content just to load the sheet.

### DD-QA04 — Delivery priority: checkpoint counts obscure user capability

The history repeatedly adds large field permutations while complete activities,
spellcasting and advancement remain unavailable. Existing verification guidance
already says to prioritize workflows, but the next-work queue keeps selecting
another narrow matrix. This is a prioritization defect, not a reason to erase
correct preparation work or weaken source/authorization checks.

Report every checkpoint as **what the player can now do**, followed by evidence
and remaining limitations. A new internal field or a larger assertion count is
supporting work, not a completed user feature. Do not mark M2 complete while its
full gates remain open; also do not make every independent usability fix wait for
all M2 or an external world-clock capability.

### DD-QA05 — Test duplication and missing integration coverage

Confirmed redundancy: `.github/workflows/ci-dnd5e.yaml` runs
`scripts/*.test.mjs` separately and then `scripts/test.mjs`, which runs the same
9 tooling suites again. Remove one invocation in a tested CI change.

There are 41 static imports between native oracle scripts; several imported
scripts execute their test matrices at module load. For example the C107 oracle
imports trait, custom-trait, flag, activity, proficiency and effect oracles to
reuse helpers while also triggering their assertions. This creates repeated work
across separate oracle commands. Extract inert shared harness/builders; executing
a focused oracle should not automatically run unrelated full matrices.

The 87-suite runner starts every suite sequentially with no selection interface.
The mounted runner uses many prepared cases and checks particular fields, but
the reviewed geometry checks do not cover this all-unavailable sheet. Current CI
does not run the mounted suite. It is therefore possible for every maintained
regression to pass while the actual sheet overlaps badly.

Do not classify all 87 suites as redundant: many protect real corrections.
Rationalize by behavior/risk, preserving regression provenance. Stop introducing
Cartesian combinations without a concrete changed rule, demonstrated interaction
or failure. See the test policy below. No automatic deletion of historical
evidence or parked research is authorized.

### DD-QA06 — Upgrade maintenance: exact-version reimplementation is brittle

`rules-context.ts` accepts only `systemVersion === '6.0.6'`; all **30** settings
declarations are `=6.0.6`. A version change rejects the profile and content access
even before detecting whether the fields used by a particular read changed.
This is an honest qualification boundary, not a claim that later versions are
compatible. Simply changing the equality to an open-ended range would be unsafe.

The module already reads actual owned Items/activities and declared compendium
documents. That should remain the primary data authority. Runtime also contains
copied native registry labels/IDs and extensive version-specific preparation;
static native tests cannot make that code automatically follow future changes.
Content and executable rules must be treated differently. The strategy below
replaces indefinite micro-qualification with data-driven behavior, small release
canaries and targeted adaptation when semantics change.

## Updated execution order

1. **Repair the reproduced sheet:** DD-QA01/02 plus the necessary bounded part of
   DD-QA03. A representative ordinary character opens with correct known values,
   supported checks work, and unsupported mechanics remain understandable without
   overlap. Obtain a sanitized relevant source/diagnostic from Krusky only through
   an authorized workflow; do not claim the synthetic fixture is that character.
2. **Make verification proportional:** remove the confirmed duplicate tooling
   invocation, add the small integrated regression above to CI, establish the
   smoke/affected/deep split below. No new field-permutation expansion as the next
   deliverable. Refactor test harnesses only where it avoids demonstrated repeated
   execution; do not turn test cleanup into another open-ended project.
3. **Record one native-data/compatibility decision:** inventory where current
   behavior reads installed data versus snapshots/reimplemented rules, classify
   actual required Core gaps, and define the release canaries below. Do not resume
   the parked native-runtime experiment. Any proposed native prepared-data bridge
   or generic read service needs a separately approved Core design and evidence.
4. **Deliver a complete M3 player operation:** review → authorized health/inventory
   change → exact readback → visible result → failure/reconnect behavior. Choose a
   concrete bounded operation, state its supported rules, and demonstrate it on
   the real sheet. Reuse the existing journal instead of adding more unused
   infrastructure. Native writes require separate disposable-world authority.
5. **Deliver connected play slices:** one supported attack/damage flow, then spell
   cast/resource flow and rest/recovery, before expanding builder/advancement.
   Implement required read dependencies just in time for each slice. Existing
   M4–M6 acceptance requirements stay intact; partial delivery is labeled partial.

Each checkpoint must state: user outcome, files changed, checks chosen and why,
failed/unverified paths, next bounded task. Keep the status summary short; detailed
historical matrices remain evidence links rather than new pages in the critical
path. Do not promise milestone completion by a raw case-count target.

## Proportional regression and upgrade strategy

### Three test layers

| Layer | Purpose and execution |
| --- | --- |
| Workflow smoke | Small deterministic corpus: clean martial, spellcaster, multiclass, ordinary equipped/granted effects, migrated/metadata-bearing character and genuinely unsupported effect. Exercise actual Sheet at normal/narrow/breakpoint widths, supported checks and whichever complete write/play flows exist. Run on every PR and candidate upgrade. Add a sanitized reported character when it demonstrates a distinct failure. |
| Affected rules/contracts | Focused rules, authorization, source immutability, context retirement and exact-write recovery tests selected by changed dependencies. Reuse proven expectations. Run when that behavior changes; unclassified changes need an explicit test-impact decision, not silent omission. |
| Deep qualification | Existing exhaustive matrices and controlled native-method comparisons. Run the affected domains for native-system upgrades, changed rule interpreters, or investigation of a demonstrated interaction. Keep a full qualification command for release/research needs; do not rerun every matrix on every small UI edit or import. |

Retain high-value boundary tests and every confirmed regression. Each new matrix
must explain the risk that representative cases miss. Native actor acceptance,
public-host contract checks and pure rule tests serve different purposes; name
which one was run. New smoke tests must include unavailable as well as happy
states. Add 1024/1280 breakpoint coverage to the existing 360/390/768/1440 target,
plus zoom/keyboard and per-container non-overlap assertions.

### Native data first

- Read installed, authorized Class/Species/Background/Feat/Spell/Item/Activity and
  advancement records by exact identity. Use their formulas, counts, choices,
  references, descriptions and overrides; do not recreate content by class name
  or keep hand-maintained copies of level tables available in those records.
- Use live public world settings and package metadata. Treat missing optional
  content separately from malformed required data. Cache via Core's lifecycle and
  revisions; do not build a parallel world cache or rescan the system every load.
- Separate registry/presentation metadata from executable rules. Where native
  registry/config values are not exposed through a public contract, keep a small
  explicit versioned fallback with provenance and a differential extraction check.
  Do not claim arbitrary config execution or registry access exists today.
- Unknown nonmechanical fields should be preserved. Unknown mechanical fields
  get a localized unsupported disposition and affected dependencies; they must
  not be guessed. Preserve raw source and distinguish source/base from effective
  values in read-only inspection.
- Do not persist prepared values, execute downloaded native JavaScript, start a
  browser as a runtime dependency, or reopen the parked experiment by inference.

### Release-change workflow

1. Keep a small versioned corpus of representative native source, selected native
   prepared outputs and ordered action outcomes, with version/settings provenance.
   Real disposable characters complement synthetic edge fixtures; compare useful
   fields/behavior, not incidental timestamps, random IDs or every object property.
2. For a candidate system update, review source/schema/config and capability
   differences only in the domains consumed by the module. Diff content separately
   from interpreter semantics. Changed descriptions or added spells should not
   require a new hard-coded rule table.
3. Run smoke plus affected native comparisons against the prior and candidate
   system. Report **changed / unchanged / unsupported**, with exact observed
   differences. A matching schema alone is not proof of matching rules.
4. Classify changes: data-only (consume), supported schema adaptation (small patch),
   changed rules (targeted implementation and regression), or unavailable public
   input (specific Core proposal). Avoid a full new test matrix for every release.
5. Publish a reviewed compatibility profile/range only after this qualification.
   Keep security checks and runtime shape validation. For an unqualified version,
   preserve safe descriptive/source inspection and state one compatibility notice;
   restrict unqualified effective actions. This graceful fallback needs explicit
   implementation and tests; it is not currently provided by changing a version
   string. Keep genuine global uncertainty fenced.

Run heavy qualification offline/CI when the module/system/profile changes, **not
at every sheet load or bootstrap**. Runtime checks should use immutable version/
context identity and cheap shape/capability checks. This plan does not authorize
scheduled jobs or automatic updates. Some changed rules will still need an
adapter update; the goal is bounded maintenance, not an impossible guarantee of
compatibility with arbitrary future system code.

## Current Core capabilities and remaining gaps

Verified against current public code, not stale “publication pending” prose in
older reports. Core 0.19.3 provided SDK3.4/module1.6/UI3.2; current Core0.21.0
provides SDK3.7/module1.7/UI3.5. D&D's declared minimums are unchanged.

| Capability | Available now / D&D action |
| --- | --- |
| Package discovery and artwork | Core0.20.0, SDK3.5/module1.7/UI3.3: `runtime.packages`, `useFoundryPackages`, caller-bound `runtime.artwork`, optional display-artwork policy. Use for installed-package awareness and exact-reference presentation. Metadata does not grant arbitrary content reads or run package hooks. |
| Informational Actor/Item reference views | Same additions: `prepareReferenceView` and UI `referenceViews`, hosted read-only by Core. Useful later for shared item/NPC cards; not a substitute for D&D action execution or an E01 general catalog. |
| Universal page canvas | Core0.20.1 background fix: world art → module fallback color → Core theme, viewport-fixed cover. Module outer pages can be transparent; do not duplicate loaders/sizing. Keep D&D card/panel styling. |
| GM tool placement | Core0.21.0/UI3.4 addition: optional dashboard action section. Relevant if adding a GM catalog, not a prerequisite for sheet repair. |
| Settings panels/preferences | Core0.21.0/SDK3.7/UI3.5: cached panel definitions, semantic Core-themed controls, lifecycle/dirty handling, validated preference/reset support. Adopt for actual module preferences later; existing actor-flag/browser scope must be deliberately preserved or migrated. |
| Shared dialogs/confirmation/HUD | Current Core includes focus/scroll-lock corrections and manual/formula initiative UI. Reuse public surfaces. It still does not advertise module formula mode capabilities beyond existing initiative contracts. Do not infer a new solution for bounded D&D roll semantics. |
| E01 arbitrary optional content | **Still open.** Public package metadata improves discovery, but `runtime.compendium` remains declared-pack scoped. D&D already declares bundled SRD5.1/5.2 packs. Do not use private Combat Manager readers for arbitrary Item catalogs. |
| E02 exact writes/concurrency | **Still needs qualification.** Public document operations have no new CAS/transaction/idempotency promise in this upgrade. Existing journal work is reusable, but no automatic guarantee against native concurrent writes. |
| E03 rich text | Shared rendering/sanitization/reference presentation is reusable. It is not native D&D macro/enricher execution; qualify syntax actually used. |
| E04 world clock/scene data | **Still open in0.21.0.** Public `ModuleWorldSnapshot` remains identity/settings; no native world clock. Current SDK additions do not solve timed-effect preparation. Do not derive it from wall-clock time or migration-only relations. |
| E05 numeric rolls | No change to Core roll kernel/grammar in reviewed0.19.3→0.21.0 diff. Preserve proven plain-roll behavior; new UI does not establish new rule expressiveness. |

These are adoption opportunities and verified gaps, not authorization to expand
Core. Required use of new APIs must explicitly update compatibility, workflow pins,
changelog old→new versions and handoff; optional features may retain an older
entry point. No minimum/version bump is part of this audit.

## Documentation disposition and handoff

This is the one active review. The
[original DD-01–36 audit](2026-10-19-character-lifecycle.md), ADR milestone history,
verification matrix and existing E01–E05 decisions remain supporting evidence;
their unresolved requirements are not erased or marked complete. Current agent
guidance and handoff point here. Application source is unchanged; findings remain
open for the implementation agent. No commits, pushes or releases were made.

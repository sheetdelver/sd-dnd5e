# October23 usability repair

Player outcome: a supported metadata-bearing character can inspect effective
level/HP/checks and roll its supported checks again. Unknown mechanics retain
disabled controls and one accessible, expandable diagnostic with source identity.
The effect on Krusky remains unknown; all sources here are synthetic fixtures.

Starting review checkpoint: `7275b2e`. DD-QA01/02 corrected; DD-QA03 improved only
for verified metadata and independent Item-only failure. Global unknown mechanics
still conservatively restrict effective facts. Full dependency isolation remains
open. No permission bypass, removed effect, source rewrite, or version expansion.

## Failing before, passing after

- The maintained `src/tests/effect-metadata.test.ts` failed before the repair with
  unchanged `{persistSourceMigration:true}`: expected no preparation reason,
  received `Effect conditions/dependencies require Q02a qualification`.
- The review's unchanged offline probe reproduced zero of6 ability/18 skill
  checks, unavailable level/HP,50 repeated desktop reasons,400px ability/278px
  save overflow at1440. Even the working1024 baseline overflowed40px.
- After repair: metadata-bearing Actor and Item effects retain all6/18 checks,
  level1,HP7/max10,Perception `1d20+5`; poisoned condition remains disadvantage
  `2d20kl1+4`. Empty/default/migration metadata preserve source. Incoming/nonempty
  dependencies,temporary states,spellLevel,unknown mechanics and malformed markers
  remain restricted.
- Actual Sheet smoke covers martial,caster,multiclass,migration,Item-local
  unavailability,unknown global mechanics and unqualified6.0.7 at390/1024/1280/1440.
  Grids stay inside their containers; adjacent cards do not intersect; supported
  check buttons are hit-testable and open/submit Normal or Shift shortcuts.
  Unknown controls stay disabled; technical reasons remain collapsed; context loss
  retires the open dialog and recovery does not replay it. Screenshots were
  inspected, including narrow desktop unavailable HP controls.

Portable before/after outcomes, pinned-symbol observations and local artifact
hashes are in [the evidence JSON](2026-10-23-usability-repair.json). Ignored logs
and screenshots supplement this self-contained record.

## Commands/results

From module root, `CORE` denotes the read-only configured Core checkout;
`TOOLS` is a temporary Playwright tool installation and `CHROMIUM` its executable.

```sh
npm test -- --core "$CORE"
npm run typecheck -- --core "$CORE"
npm run test:native-source -- --core "$CORE" --native ../../../../temp/dnd5e
node scripts/native-metadata-oracle.mjs --core "$CORE" --native ../../../../temp/dnd5e --foundry /path/to/static-foundry14.367 --write-evidence temp/qa-native-metadata.json
node scripts/test-workflow-smoke.mjs --core "$CORE" --browser-tools "$TOOLS" --chromium "$CHROMIUM" --core-css /path/to/compiled-core.css
npm run check:package -- --core "$CORE"
```

Maintained regressions:9 tooling suites/89 module suites PASS, including DD-R01–06
and context/source invariance. Explicit typing includes322 module/UI/server/hook/
test files. Exact release inventory matches2242 records/591 candidate expressions.
Targeted native metadata comparison PASS without importing other oracle suites.
Mounted smoke PASS; module check and isolated package PASS. Initial package archive
SHA256 `b29e340b4f127099cbf77414676b1dfcfa70749933ce98c67b39b3b0bae3cfcc`
predates the final HP-label font-only adjustment; final delivery package is recorded
with the subsequent workflow checkpoint. No release artifact is published.

## Evidence limits and next work

R: focused failure/regressions; S: exact6.0.6 migration/getter/schema methods with
explicit static Foundry14.367 duration/dependency seams; offline mounted UI: actual
Sheet with SDK presentation seam and intercepted network. Packaging validates the
module contract. None establishes installed UI, full native preparation, live
Foundry writes, native/operator acceptance or release readiness.

Next executable package: remove duplicate tooling CI invocation, add small
smoke/explicit affected/deep entry points and record upgrade qualification; then
deliver a reviewed, authorized, read-back M3 health operation with recovery.
E01/world-clock/widerQ00 remain open and do not block that package. ADR-0001 stays
open; module0.4.1 experimental and compatibility requirements are unchanged.

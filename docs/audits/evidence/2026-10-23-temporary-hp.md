# C110 — manual temporary-HP edit

Player outcome: both sheet layouts now offer **Edit temp HP** for a qualified
character. Review shows the server's current and requested value before any write.
Confirm replaces or clears the persisted field,then shows acknowledgement/Core
source readback and refreshes the sheet. After a lost response/reopen,the player
checks the saved operation's status and inspects the current value;the previous
write is never replayed. Inspection queues behind an active execution and retires any
unexecuted review,so a delayed execute cannot arrive afterward and write. Finishing
inspection is explicit before a fresh review.

This completes one bounded M3 operation,not M3 or the character lifecycle. It
advances DD-04/25/26/34/35 and A16/A18 partially. ADR-0001 stays open.

## Scope and shared path

- Shared health preparation supplies source/default/effective edit eligibility.
  Any active initial/final effect targeting temp HP,even a same-value override,
  disables this operation. Missing/malformed HP,unqualified rules/Actor identities
  and selected legacy profiles retain their restrictions.
- `health/temporary` accepts only strict review/execute/status bodies. The server
  creates the operation ID,plan,source fingerprint and patch. It rechecks current
  owner,rules,source and choice before dispatch. No client patch/formula/authority,
  hidden `onUpdate`,source mutation during review or optimistic Actor cache.
- Existing journal queues/fences apply. One SDK patch changes only
  `system.attributes.hp.temp`;exact acknowledged Actor identity is retained even
  if the returned value,readback or later storage fails. Unknown outcomes are
  fenced,not retried. Status does not promote matching stored values to confirmed.
- Recovery storage holds only an operation ID scoped to instance/world/caller/
  Actor. Current ownership is required for inspection. Source/access/connection
  changes retire the dialog;old callbacks cannot silently become a new intent.

Native6.0.6 `AttributesFields.hitPoints.temp` is persisted,integer,min0,initial0.
The source profile accepts whole numbers0–1000000000. Native `applyTempHP` grants
only a larger amount;this UI explicitly performs manual replacement/clearing and
does not claim grant-max semantics. Damage/healing,death saves,concentration,HD,
activity consumption,effect-dependent temp HP and rests remain separate work.

## Verification

Commands from module root; `CORE` is configured current Core0.21.0, `BASELINE`
the read-only released Core0.19.3 checkout, `TOOLS` test-only Playwright and
`CHROMIUM` its local executable. No runtime dependencies were added.

```sh
npm run test:smoke -- --core "$CORE"
npm run test:affected -- --core "$CORE" --test src/tests/temporary-hp.test.ts --test src/tests/health.test.ts --test src/tests/command-journal.test.ts
npm run typecheck -- --core "$CORE"
npm run typecheck -- --core "$BASELINE"
npm run test:native-temporary-hp -- --core "$CORE" --native ../../../../temp/dnd5e --write-evidence temp/health-native.json
npm run test:workflow -- --core "$CORE" --browser-tools "$TOOLS" --chromium "$CHROMIUM" --core-css /path/to/core.css
npm run test:public-health -- --core "$BASELINE" --browser-tools "$TOOLS" --chromium "$CHROMIUM" --core-css /path/to/core.css
npm run check:package -- --core "$BASELINE"
```

- **R:** smoke7 maintained suites and affected health/domain/journal suites PASS.
  An absent stored field stays unavailable in inspection,including an unqualified
  version;verified606 initialized0 remains a distinct prepared fact. Review is
  zero-write;replacement/clear changes the exact field only;duplicates
  never dispatch again. Source/context/permission/effect changes reject zero-write;
  restoration requires fresh review. Lost/empty/mismatched acknowledgements,
  changed readback and journal faults remain uncertain across duplicate/restart. Recovery inspection
  waits for an admitted execution or retires its unexecuted capability;later
  execute requests cannot resurrect it.
  Invalid values and injected authority are rejected. Earlier complete regression
  run at C108 passed9 tooling/89 module suites;that is not relabeled a complete
  post-C110 deep run. The small tooling-selection regression also passes.
- **S:** targeted schema getter and `applyTempHP` controls PASS against exact
  `87e94dbd9f930135e0694cd7e7d49f210603cd2c`,with an explicit field/update seam.
  No unrelated oracle matrix is imported. Earlier pinned inventory comparison
  matches2242 records/591 expressions;no native version support is broadened.
- **I:** actual route/journal on released Core0.19.3 with temporary configuration,
  caller auth and synthetic socket backend PASS. Review writes0;confirmed duplicate
  writes1;source/ownership retirement writes0;applied-empty-ack stays uncertain;
  a real post-ack journal-file failure retains its receipt;restart/status do not
  replay;fresh clear succeeds. No live Foundry transport is used.
- **Offline mounted UI:** actual Sheet + public SDK presentation/cache seam
  forwards to that real isolated route at390/1280. Confirm/readback visibly updates
  HP;lost browser response recovers by reopen/status with no extra write;changed
  source stays retired through disconnect/reconnect;fresh review succeeds. A held
  response from a closed review cannot overwrite the newer recovery identity.
  The wider representative sheet smoke passes390/1024/1280/1440 with actual
  containment,card nonintersection,hit-testing,Normal/Shift and unavailable states.
- **Additional confirmed UI regression:** clicking the shared native dialog border
  dismissed it as backdrop (expected1 dialog,actual0). The unchanged mounted input
  passes after requiring dismissal coordinates outside the dialog rectangle.
  Inside-frame clicks stay open;real backdrop dismissal remains covered.
- **Typing/package:** explicit328 module/UI/server/test/hook files pass on current
  and minimum host toolchains. Module check and isolated package pass on0.19.3.
  Archive SHA256:
  `88d499674c0528393ae54e10f298fa18ba33274b7b266ed62424005acfb27c39`.

Portable outcomes,native source hashes and artifact hashes are in
[the evidence JSON](2026-10-23-temporary-hp.json). Local screenshots supplement
the tracked record. During harness development,one SDK seam used unbound browser
fetch and failed before reaching the route;it was corrected to an arrow wrapper.
Full-page capture of an open native dialog also intermittently displaced/dismissed
it;cause was not established as a production/Core defect. Final viewport captures
pass. A further mounted regression caught recovery controls disappearing when
preparation became unqualified (expected1 control,actual0). Inspection now remains
reachable in both layouts while new effective editing stays gated;the same input
passes. This unavailable context is projected by the actual adapter in a fixture
route,not a real host/native system upgrade. Historical failures
are retained in ignored logs;they are not counted as successful runs.

## Limits and next executable work

SDK Core source readback is the host's authorized source authority,not a fresh
independent native capture. The public unconditional patch has no cross-native CAS;
matching receipt/readback cannot exclude the known E02 external-edit race. No new
transaction,idempotency or native-execution contract is claimed. Temporary fixture
registration omits content hydration/UI and admits its synthetic adapter;actual
packaging is checked separately. These are R/S/I/offline mounted checks,not installed
UI,native/operator acceptance or release readiness. Krusky's source remains unknown.

Next: connect one qualified owned attack Activity to review/attack/damage and
its stored native costs,adding the required read dependencies as encountered.
Casting/resources and rest follow as connected outcomes. Do not resume the former
transferred-field permutation queue. E01,world-clock,wider Q00/E05 and all full
milestone acceptance gates stay open. Module0.4.1 experimental and compatibility
metadata are unchanged. Task-owned hosts,browsers and synthetic endpoints are stopped.

# D&D 5e module architecture

`info.json` is the compatibility authority. The module requires Core 0.19.3
and UI API 3.1; the remaining API ranges are declared there. Its experimental
designation is intentional and must not be removed as release housekeeping.

The adapter enters Core's deterministic preparation pipeline without writing
derived values back to Foundry. Current normalization still depends on some
prepared-looking inputs and fallback values. Sheets, cards, item rows and modals
also contain overlapping raw reads and calculations; they do not yet implement
one complete native rule interpretation.
Core owns authorization, world/session lifecycle, roll execution and shared
chat/media/dice presentation. Use public SDK contracts, not private host APIs.

The active implementation architecture is defined by
[ADR-0001: complete character lifecycle](adr/0001-complete-character-lifecycle.md)
and the [current audit](audits/2026-10-19-character-lifecycle.md). The planning
reference is the current Foundry-installable D&D system **6.0.6**, requiring
Foundry **14.367+**, with 2024 rules primary. This is a future implementation
target, not a new compatibility claim for module 0.4.1. See the
[native source map](reference/native-6.0.6.md) for exact release provenance and
[verification matrix](plans/0001-verification.md) for completion evidence.

## Current executable boundaries

- The UI manifest registers the sheet, initiative modal and stylesheet. It has
  no builder/tool/dashboard action. The server entry exposes read-only D&D content
  metadata routes; rules-bearing write commands remain unimplemented.
- Bounded source-derived numeric ability/save/skill formulas are available;
  unqualified rules and unknown contexts disable these controls with reasons.
  Weapon/spell controls currently request `item` rolls that the adapter does not
  resolve. They are not complete native activity execution.
- Rest controls currently perform partial HP/temp-HP changes only. Hit-dice,
  slot, resource and item-use recovery remain unimplemented.
- Conditions, defenses, proficiencies and appearance include placeholder
  presentation. Modern spell preparation/properties and physical Item weight
  schemas are incompletely read. The active audit records reproducible examples.
- Versioned native world settings are declared and decoded from immutable public
  host snapshots. No maintenance migration is needed for these pure projections.

The proposed architecture separates versioned pure rules/preparation, caller
projections, server action/receipt orchestration and UI intent. Dynamic optional
content needs the external host capability documented as E01; other host limits
have bounded qualification tasks. No Core or sibling changes are authorized by
that plan. Native-runtime research remains parked.

The self-hosted fonts and their provenance/licenses are documented in
[assets/fonts/README.md](../assets/fonts/README.md).

## Initiative

Core resolves a saved GM override first, then the module formula, then its
generic fallback. The HUD adapter reuses the module's roll frame and returns
only a roll choice or final manual total. The resolved formula and audience
are read-only; default execution preserves the expression, while permitted
Advantage/Disadvantage choices are explicit overrides.

Sheet bonus/configuration fields do not recalculate the HUD formula. Centering,
scrolling and narrow-screen button layout belong to the shared module frame.
This integration does not provide native Foundry browser-hook/effect parity.

## Preparation limits

Experimental status includes known differences between module-prepared and native
values. The existing prepared-actor tests preserve bounded behavior; they do not
prove complete native rule parity. ADR-0001 implementation is in progress; its complete-lifecycle acceptance remains open. Native preparation-runtime research remains
separate from shipping functionality. No connected native frontend or backend
browser is required for normal module operation.

## Distribution and verification

`info.json` declares the module version and API compatibility. CI/release
workflows use the released Core `v0.19.3` toolchain. Release assets
include the package archive, checksum, catalog manifest and release history.
A module release tag identifies the matching manifest version.

Repository workflow and verification commands live in [AGENTS.md](../AGENTS.md).
The shared contracts are described in Core's
[module authoring guide](https://github.com/sheetdelver/sheetdelver/blob/v0.19.3/docs/MODULE_AUTHORING.md)
and [release process](https://github.com/sheetdelver/sheetdelver/blob/v0.19.3/docs/RELEASING.md).

## ADR-0001 verification foundation

Module-owned `npm test` enumerates tooling and module suites. `npm run typecheck`
explicitly includes every source/UI/server/test/migration hook file, independent
of Core's root exclusions. Both accept `-- --core /path/to/core`. No host files
are generated. `npm run check:package` uses retained temporary data/output and
read-only toolchain aliases; it starts no service.

`npm run test:native-source -- --native /path/to/dnd5e` reads pinned Git objects,
not HEAD. The versioned fixture index distinguishes source, manually independent
expectations and absent native captures. Static inventories do not establish
formula support, grant closure, runtime behavior or native/operator acceptance.

## Rule context and content foundation

`src/logic/rules-context.ts` accepts the host's immutable world snapshot. Exact
system6.0.6 / Foundry14 build367+ is the selected schema boundary; legacy worlds
are labeled `legacy-limited`. This is context readiness, not completed rules
automation or later-build native acceptance. Missing/invalid settings remain
unavailable; the module never applies a local default to an unreadable setting.
CalendarConfig has no declared default because its Foundry field initialization
has not been independently qualified. Consumers must require their own inputs.

`src/logic/native/6.0.6/source.ts` decodes detached Actor/Item identity and
advancement/activity collections. It preserves source fields, editions,
origin/root links and owned IDs. Arrays and keyed advancements are accepted;
collisions, mismatched IDs and unknown types are diagnosed. No decoded value is
written back. The adapter publishes context/capability readiness separately from
its old numeric projection, which remains explicitly unqualified pending M2.

M2's bounded replacements are `src/logic/preparation/skills.ts` and `abilities.ts`:
modern PC numeric skill checks/passives and ability checks/saves derive from
class levels, source ability scores, proficiency multipliers, constant bonuses
and initialized global proficiency targets. `character-profile.ts` shares prerequisites,
class-level proficiency, constant parsing and numeric representation checks.
Source `total/passive/mod/check.value/save.value` are never reused as an oracle.
Adapter execution and both layouts consume the same result/formula. Cards also
consume `characterFacts` with explicit value/status/reason/provenance; missing
facts never select old source/default numbers. C06 corrects DD-R03 across card
projection and both headers/proficiency controls. Known class facts survive
unresolved equipped armor; unknown context/class data/effects remain unavailable. This subset supports
normal rolls and numeric situational bonuses within the released host literal
limit (absolute1e9). C07 computes persisted source modes and passive±5, but
blocks manual/source advantage/disadvantage execution after a public-host tie
selection mismatch (E05). Opposed sources cancel to an executable normal roll;
alternate abilities and unqualified bonus expressions are rejected. It is not
the complete native skill/ability/save/tool interpreter. Active effects,
conditions, equipped equipment/encumbrance, active native Actor flags,
proficiency dice, optional abilities and missing inputs yield explicit unavailable
checks. Nonzero source modes preserve known totals/passives but have unavailable
execution; malformed modes remain unavailable. UI disables them
and passives render an unavailable state instead of a guessed10 within that
tested branch. The [independent review](audits/evidence/2026-10-19-c01-c03-review.md)
identified two exceptions corrected by C04: all four native die-range scopes now
block unqualified execution without altering known totals/passives (DD-R01), and
unknown/unsupported context produces unavailable values and rejects direct rolls
(DD-R02). Legacy fallback requires an explicitly supported `legacy-limited`
profile, never missing prepared checks. Configured bounds, malformed bounds and
combined ranges remain unavailable until Q00 qualifies equivalent execution.
Ability/check/save range scopes apply the same execution gate. Check/save totals
remain distinct from base ability modifiers; a check bonus does not change the
displayed score. Only six standard ability scores0–30 and the explicit numeric
profile are qualified. C06 corrects DD-R04: `roll-initialization.ts` creates
separate detached global check/save/skill/tool configs with verified initial0
for nonpersisted proficiency, preserving persisted bonus/mode/range fields.
Source fields remain unchanged. Effects must be qualified through future phases;
stale source proficiency is never an effect substitute. Eight intermediate-model
arithmetic expectations remain separate from eight source/default expectations.
Other numeric domains (including HP/AC) and the legacy
compatibility projection remain unqualified.

`getSystemDataForUser` and GET `content` / `content/detail` under
`/api/modules/dnd5e/` use only the supplied caller runtime. Catalog supports
`page`, `pageSize` (1–100) and optional `packId`; detail takes a typed canonical
Item `uuid`. The static declared reader cannot page its underlying read; result
paging is module-local and transient. No additional world/content cache exists.
Caller access, native source exclusions and current world identity/revision are
checked around reads. World/owned detail requires observer access. Optional
undeclared packs expose E01 availability only; full reads fail before dispatch.
Owned Items can still be inspected when their original catalog is gone.

Responses allowlist metadata; they omit raw source, flags, ownership and
descriptions. Unidentified names/provenance are concealed. Description rendering
remains an explicit Q03 unavailable state. This endpoint is not a complete
builder catalog/choice validator. Required ItemGrant closure uses exact UUIDs
on caller-authorized supplied sources, with missing/cyclic/limit failures;
optional pools and description/provenance backlinks are not required grants.

Core0.18 lacks world context and caller-safe projection. These contracts are
released in module-api1.5 (Core0.19.0); Core0.19.3 is the selected tested baseline.
The manifest floor and CI/release pins align with that actual dependency.

Skill/check/save intents bind to Actor identity, host world/epoch/context/source
revisions and the current prepared projection. Both layouts use the same
`usePreparedRollIntent` controller. Modern previews and confirmation use the
same `numericD20Roll` compiler as direct adapter execution; unsupported bonus
expressions disable submit rather than showing an executable formula.
ModalHost hides stale roll controls immediately and retires the slot; mounted
callbacks also carry a transition token and an unmount fence so recovery cannot
revive prior intent. This is consumer intent state, not a world cache or a write
receipt protocol. Core still validates the current prepared revision at execution.

`npm run test:mounted -- --browser-tools /path/to/test-tools [--chromium /path/to/executable]`
runs maintained isolated React/Chromium fixtures with fresh contexts and all
requests intercepted. No fixture service is started. Playwright stays outside
module/runtime dependencies; missing tools fail instead of skipping. Explicit
typing includes `tests/browser`. These mounted module tests use a test SDK
presentation seam and do not establish installed Core I/U or native N/O parity.

C07's `test:public-rolls` launches Core's normal entry point with an isolated data
root, synthetic loopback transport/users, and test-only dependency entropy. A
fixture module calls actual request-bound `runtime.rolls.roll` after public player
login; no private Core import, live Foundry, new module runtime evaluator or
production configuration is used. All901 totals/serialized faces and numeric
distributions match. Forty tied adv/dis pairs retain index1 where exact native
BasicDie retains index0. This is a D&D equivalence gap, not a claim that Core's
generic keep/drop contract is defective. A public first-tie selection contract
(or independently qualified equivalent primitive) is the bounded E05 dependency.
The qualification command exits2 and records the open gate, never a parity pass.
Silent normal execution is qualified only within this numeric fixture; full
Actor-route, chat/audience/critical annotations, installed UI and native/operator
acceptance remain open.

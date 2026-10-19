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
- Basic ability/save/skill roll formulas are available, with known parity gaps.
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

M2's first bounded replacement is `src/logic/preparation/skills.ts`: modern PC
numeric skill checks/passives derive from class levels, source ability scores,
proficiency multipliers, constant bonuses and global proficiency overrides.
Source `total/passive/mod` are never reused as an oracle. Adapter roll execution
and both sheet layouts consume the same result/formula. This subset supports
normal/manual advantage/disadvantage requests and numeric situational bonuses;
alternate abilities and unqualified bonus expressions are rejected. It is not
the complete native skill/ability/save/tool interpreter. Active effects,
conditions, equipped equipment/encumbrance, active native Actor flags,
proficiency dice, optional abilities, nonzero source roll
modes and missing inputs yield explicit unavailable checks. UI disables them
and passives render an unavailable state instead of a guessed10 within that
tested branch. The [independent review](audits/evidence/2026-10-19-c01-c03-review.md)
records two open exceptions: native die ranges are ignored (DD-R01),and absent/
unsupported context falls back to old executable skills (DD-R02). Lifecycle
diagnostics alone currently do not gate sheet controls. These require correction
before broadening availability claims. Other numeric
domains and the legacy compatibility projection remain unqualified.

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

# D&D 5e module architecture

`info.json` is the compatibility authority. The module requires Core 0.18.0
and UI API 3.1; the remaining API ranges are declared there. Its experimental
designation is intentional and must not be removed as release housekeeping.

The adapter enters Core's deterministic preparation pipeline without writing
derived values back to Foundry. Current normalization still depends on some
prepared-looking inputs and fallback values. Sheets, cards, item rows and modals
also contain overlapping raw reads and calculations; they do not yet implement
one complete native rule interpretation.
Core owns authorization, world/session lifecycle, roll execution and shared
chat/media/dice presentation. Use public SDK contracts, not private host APIs.

The active implementation architecture are
[ADR-0001: complete character lifecycle](adr/0001-complete-character-lifecycle.md)
and the [current audit](audits/2026-10-19-character-lifecycle.md). The planning
reference is the current Foundry-installable D&D system **6.0.6**, requiring
Foundry **14.367+**, with 2024 rules primary. This is a future implementation
target, not a new compatibility claim for module 0.4.1. See the
[native source map](reference/native-6.0.6.md) for exact release provenance and
[verification matrix](plans/0001-verification.md) for completion evidence.

## Current executable boundaries

- The UI manifest registers the sheet, initiative modal and stylesheet. It has
  no builder/tool/dashboard action, and the module has no server action entry.
- Basic ability/save/skill roll formulas are available, with known parity gaps.
  Weapon/spell controls currently request `item` rolls that the adapter does not
  resolve. They are not complete native activity execution.
- Rest controls currently perform partial HP/temp-HP changes only. Hit-dice,
  slot, resource and item-use recovery remain unimplemented.
- Conditions, defenses, proficiencies and appearance include placeholder
  presentation. Modern spell preparation/properties and physical Item weight
  schemas are incompletely read. The active audit records reproducible examples.
- No native world settings or maintenance migration contract is declared.
  Correcting a projection does not itself require a world-data migration.

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
workflows currently use the released Core `v0.18.0` toolchain. Release assets
include the package archive, checksum, catalog manifest and release history.
A module release tag identifies the matching manifest version.

Repository workflow and verification commands live in [AGENTS.md](../AGENTS.md).
The shared contracts are described in Core's
[module authoring guide](https://github.com/sheetdelver/sheetdelver/blob/v0.18.0/docs/MODULE_AUTHORING.md)
and [release process](https://github.com/sheetdelver/sheetdelver/blob/v0.18.0/docs/RELEASING.md).

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

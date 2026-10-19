# SheetDelver — D&D 5e

An experimental D&D 5th Edition character-sheet module for SheetDelver.
Support is still in development.

## Features

- Character sheets with abilities, equipment and spells.
- Basic check dialogs and initiative integration.
- Combat HUD initiative rolling.

Requires **SheetDelver Core 0.19.3 or later** (native world context and caller-safe content contracts).

See the [releases](https://github.com/sheetdelver/sd-dnd5e/releases),
[changelog](CHANGELOG.md), [module architecture](docs/architecture.md) and
[working guidance](AGENTS.md).

The module is not yet a complete character lifecycle implementation. Weapon and
spell execution, resting, advancement and several sheet sections have confirmed
gaps. The current [audit](docs/audits/2026-10-19-character-lifecycle.md) and
[ADR-0001](docs/adr/0001-complete-character-lifecycle.md) define the work
for complete 2024 support against Foundry's released D&D system 6.0.6. Its
6.0.6/Foundry 14.367 target is a plan, not a present native-parity claim.

Implementation includes exact-release fixtures, explicit module typing,
immutable rule context and a caller-bound metadata catalog. Dynamic optional
content still requires Core dependency E01. These foundations do not implement
character creation, advancement or native activity execution.

## Font licenses

The module includes Roboto, Roboto Slab and Roboto Mono.
License details are in [assets/fonts/README.md](assets/fonts/README.md).

## Release tooling

Use this repository’s independent `npm run release:tag` command. It prepares the
numbered changelog release, pushes its tag for validation, and asks separately
before publication. See [module release instructions](docs/RELEASING.md).

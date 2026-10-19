# SheetDelver — D&D 5e

An experimental D&D 5th Edition character-sheet module for SheetDelver.
Support is still in development.

## Features

- Character sheets with abilities, equipment and spells.
- Roll dialogs and styled chat cards.
- Combat HUD initiative rolling.

Requires **SheetDelver Core 0.18.0 or later**.

See the [releases](https://github.com/sheetdelver/sd-dnd5e/releases),
[changelog](CHANGELOG.md), [module architecture](docs/architecture.md) and
[working guidance](AGENTS.md).

## Font licenses

The module includes Roboto, Roboto Slab and Roboto Mono.
License details are in [assets/fonts/README.md](assets/fonts/README.md).

## Release tooling

Use this repository’s independent `npm run release:tag` command. It prepares the
numbered changelog release, pushes its tag for validation, and asks separately
before publication. See [module release instructions](docs/RELEASING.md).

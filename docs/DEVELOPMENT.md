# D&D 5e module development

## Contracts and ownership

`info.json` is the compatibility authority. The module requires Core 0.18.0
and UI API 3.1; the remaining API ranges are declared there. Its experimental
designation is intentional and must not be removed as release housekeeping.

The adapter prepares Actors deterministically without writing derived values
back to Foundry. Sheets, cards and rolls consume the shared prepared model.
Core owns authorization, world/session lifecycle, roll execution and shared
chat/media/dice presentation. Use public SDK contracts, not private host APIs.

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

## Validation

From the Core checkout with this module in `data/local/modules/dnd5e`:

```sh
npx tsx data/local/modules/dnd5e/src/tests/prepared-actor.test.ts
npx tsx data/local/modules/dnd5e/src/tests/presentation.test.ts
npm run module:check -- dnd5e
```

Core's root TypeScript check excludes module source. Include module sources
explicitly for interface changes, and use isolated package output for release
validation. Preserve parked research/stashes; those are not shipping features.

## Distribution

CI and release workflows pin Core `v0.18.0`. Keep their toolchain references
aligned with the tested minimum and update compatibility before publication.
The module tag must match `info.json.version`; published tags are immutable.
Release CI publishes the archive, checksum, catalog manifest and release history.
Keep user-facing notes concise in [CHANGELOG.md](../CHANGELOG.md).

See Core's [module authoring guide](https://github.com/sheetdelver/sheetdelver/blob/v0.18.0/docs/MODULE_AUTHORING.md)
and [release process](https://github.com/sheetdelver/sheetdelver/blob/v0.18.0/docs/RELEASING.md)
for the shared workflow. Verification history belongs in audits/ADRs, not the
module overview.

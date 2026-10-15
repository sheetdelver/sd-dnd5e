# Sheet Delver - DnD 5e module

## Third-Party Fonts

The module self-hosts Roboto, Roboto Slab, and Roboto Mono so its UI works
under Sheet Delver's same-origin Content Security Policy. Source revisions,
checksums, and license copies are recorded in
[`assets/fonts/README.md`](assets/fonts/README.md).

## Prepared Actor Lifecycle

This module requires Sheet Delver `module-api >=1.1.0`. Its adapter prepares
each source Actor once per source revision; the dashboard, sheet, card, roll,
and initiative paths consume that shared prepared model. The hook remains
deterministic and does not write derived values back to Foundry.

From this module's local checkout inside the Sheet Delver repository, run the
behavior-preserving contract check with:

```sh
npx tsx src/tests/prepared-actor.test.ts
```

## Distribution

Pull requests and changes to `main` validate the module contract and build its
distribution package using the pinned Sheet Delver toolchain. To publish a
release, first set the workflow's Sheet Delver reference to a stable core
release tag, update `info.json`, and push the matching module tag (for example,
module version `0.3` uses tag `v0.3`). The release workflow publishes the
archive, checksum, and `sheet-delver-manifest.json` consumed by the module
catalog.

TODO
- Implement scafolding for sheets
- Connect actor data to sheets
- Character sheet creator
- Future -> Import from PDF or DND Beyond

## SDK Feedback Compatibility

The development checkout requires SheetDelver Core `>=0.17.0` and
`ui-extension-api >=3.0.0 <4.0.0` (SDK 3.0.0). The UI API gate keeps it
incompatible with released Core 0.17.0. Before module release, raise the
Core minimum to `>=0.18.0` after Core 0.18.0 is published. It declares no
dashboard actions. The combat-HUD initiative adapter shares the sheet roller's
native dialog, fields and buttons, under the module's scoped stylesheet. Core
supplies a read-only formula/audience under explicit GM override → module
formula → Core fallback precedence. The adapter returns only a roll choice
or final manual total via **Input Manually**. It does not expose sheet bonus/configuration fields or
recalculate the formula. Default preserves the module-supplied expression;
Advantage/Disadvantage are explicit permitted choices. Zero/fractions are valid
manual final totals. Narrow layouts stack buttons; dialog centering/scrolling
is explicit rather than dependent on browser reset styles.
CI and release packaging target Core `v0.18.0`; publish Core first.
The server and roll API contract requirements are unchanged.
ADR-0061 hardening verification (October 14): module tests, explicit source
typing and isolated packaging pass on the integrated SDK3.2/UI3.1 host. Approved
local Foundry 14.367 / D&D 5e 6.0.2 owner initiative and turn HTTP/browser
checks passed before the subsequent presentation correction. The native adapter
now has offline rendered checks at320/375/1280, both Core appearances and
bounded default/manual submissions; the user accepts its native-themed roller.
Core's final v13.351 owner-write proof used Shadowdark, not D&D: no native D&D
v13 or full feature/effect parity is inferred. Core0.18.0 released-host validation
remains a release gate.

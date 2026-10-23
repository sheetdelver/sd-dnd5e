# Native data and bounded upgrade qualification

October23 decision under ADR-0001/DD-QA06. Module0.4.1 stays experimental; the
effective interpreter remains qualified for exact D&D6.0.6/Foundry14.367. Neither
shape similarity nor a newer host expands that profile automatically.

Installed, caller-authorized native documents/settings own content: Classes,
Species, Backgrounds, Feats, Spells, Items, Activities, advancement selections,
counts, formulas and exact references. Resolve stable identities; do not replace
them by name or add parallel content tables. Missing/inaccessible documents block
their dependent workflow. E01 still limits undeclared content discovery; package
or artwork metadata does not grant arbitrary compendium access. Owned source may
be inspected through existing public document contracts and SDK rich-text handling.

Source is not a prepared native Actor. Schema defaults/nonpersisted fields,
effect phases and executable rules still require a qualified interpreter. Keep
their provenance separate. Metadata can be admitted only with evidence that it
does not change mechanics; unknown mechanics do not become harmless by omission.

## Candidate update procedure

1. Record the installed candidate version/commit and changed **consumed** native
   schema, configuration, setting declarations, preparation and action symbols
   against the last qualified release. Review the exact release objects.
2. Classify each change: authorized content/data-only; schema/default adaptation;
   interpreter/action change; or missing public input/contract. Content-only
   differences do not justify new hard-coded registries. Shape-only matches do
   not establish semantic compatibility.
3. Run the small representative source corpus plus affected native comparisons.
   Current synthetic canaries are martial/caster/multiclass, migrated effect,
   localized failure, unknown mechanics and incompatible context in
   `src/tests/fixtures/player-corpus.ts`. Their selected expected check/HP values
   link to pinned source fixtures. Add independent native captures of source,
   selected prepared fields and action outcomes when available; current offline
   fixtures are **not** substitutes for native/operator evidence.
4. Adapt only changed domains and add focused regressions. Run deep qualification
   for actual interpreter changes or demonstrated interactions. New Cartesian
   matrices need a concrete uncovered failure/risk. Import inert helpers, never
   an executable oracle merely to obtain a symbol reader.
5. Review evidence, then explicitly update profile/setting qualification together.
   Compatibility/release metadata changes are a separate authorized decision.
   Until then, show one compatibility notice, preserve descriptive/source
   inspection where safe, and restrict unqualified effective actions. Do not
   promote stored/base values to proven effective values.

This work runs offline/CI, not at every bootstrap or Actor load. The existing30
declared setting contracts stay pinned until candidate evidence exists. There is
no native browser runtime, private Core import, new transport or duplicate cache.
The parked native preparation-runtime experiment remains parked.

## Proportional test entry points

- **Workflow smoke:** `npm run test:smoke -- --core "$CORE"`, then
  `npm run test:workflow -- --core "$CORE" --browser-tools "$TOOLS" --chromium "$CHROMIUM" --core-css /path/to/core.css`.
  The latter mounts the actual Sheet with an SDK seam and intercepted network,
  checks breakpoints/containment/hit tests/check submission/context recovery.
- **Affected rules/contracts:** `npm run test:affected -- --core "$CORE" --test src/tests/health.test.ts`.
  Repeat `--test` for specifically affected maintained suites. No implicit full
  fallback when a test path is missing. Select authorization/source/context/write
  recovery tests when those paths change; explicitly type-check module files.
- **Deep qualification:** `npm run test:deep -- --core "$CORE"` retains all
  maintained module/tooling regressions. Run the named affected native/public-host
  oracle commands in the ledger for interpreter changes/updates; a full unrelated
  native matrix is not a prerequisite for every UI fix. `--list` reports runner
  selection without running tests. Deep module tests are not native acceptance.

CI currently retains all maintained regressions **once**. The redundant standalone
tooling invocation is removed; release/tooling fixtures remain in the deep runner.
This bounded change does not replace CI with an unproven automatic impact classifier
or rewrite historical oracle imports. New targeted metadata comparisons use the
inert `scripts/lib/native-symbols.mjs`; old deep drivers migrate when affected.
No browser/tooling dependency is added to the runtime manifest.

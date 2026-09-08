# Sheet Delver - DnD 5e module

## Third-Party Fonts

The module self-hosts Roboto, Roboto Slab, and Roboto Mono so its UI works
under Sheet Delver's same-origin Content Security Policy. Source revisions,
checksums, and license copies are recorded in
[`assets/fonts/README.md`](assets/fonts/README.md).

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

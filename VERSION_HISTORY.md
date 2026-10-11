# Sifr version history and rollback

The Site uses Git source history plus immutable, archive-backed saved Site versions. Keep both. Each published iteration must create a new saved version; never replace or delete the baseline as part of normal editing.

## v0.3.0 — Field Atlas (11 October 2026)

- Separate makeathon Site and repository, preserving the original live Sifr.
- 100 source-linked recipe records across 24 source area labels; ingredient trails, map/list navigation, search, quantities and source links.
- Generic ingredient-derived sketches with topography, particles and barcode sharing fixed positions and selection.
- Two-recipe comparison with aligned original quantity strings, shared/different ingredient filters and reversible model weights.
- Equal starting weights; amounts and preparation do not predict taste. Unmapped ingredients remain explicit.
- The original 24-record instrument is retained at `/instrument`, with its checksum unchanged.
- Desktop and mobile interaction evidence, model tests and release status are recorded in the makeathon handoff; this entry alone does not claim publication.
- Hosting ID: `appgprj_6acb086304e481918618d58499ed680f`. Source: `https://github.com/shariffster/sifr-atlas`.

The earlier records below describe the preserved original Site. The new Site's native version record identifies its exact source commit and archive.

## v0.1 — baseline (7 October 2026)

- Saved Site version: **1**
- Version ID: `appgprj_6ac5e912712881919a1b3795fa5517d7~appgver_8b22d0b120308191ad82567ea87ce74f`
- Source commit: `b065a2d2514382c81597e427d0876a5267ca24f2`
- Verified as an archive-backed saved version before v0.1.1 edits.
- Three data-driven views, 24 original particles, Compare, inspection, filters, methodology.

## v0.1.1 — Follow the particle (7 October 2026)

- Saved Site version: **2**
- Version ID: `appgprj_6ac5e912712881919a1b3795fa5517d7~appgver_a2971925cda88191879f1c2baa4966cb`
- Source commit: `68397ead0c598e899019bbf536c1adcd6ce5f896`
- Verified as an archive-backed rollback point before v0.1.2 edits.
- Point-cloud representation of the same Gaussian field; original Relief renderer remains selectable.
- Particle focus persists between projections and highlights the matching barcode stripe.
- Contribution-only mode uses the selected particle's exact Gaussian, on the fixed shared height scale.
- Region labels are interpretive annotations anchored to the weighted coordinates of their visible member particles.
- Compact selection card leaves the terrain and projection controls accessible; full metadata stays in Details.
- The release version is shown in the site, with readable release notes.
- Regression checks in `scripts/test-sifr.mjs` protect the original data checksum and model invariants. Run `node scripts/test-sifr.mjs` before future publishing.

The native saved-version record links this release to its exact pushed Git commit and deployable archive. List Site versions to retrieve that record; do not infer version IDs from strings.

## v0.1.2 — A living sensory field (7 October 2026)

- Approximately 1.75-second ground/gather/rise formation; 1.15-second projection transitions.
- Interrupted transitions continue from the last displayed sample positions.
- Low-amplitude sample drift, shimmer and a slow brightness ripple; exact markers and contours remain stable after formation.
- Canvas samples move into barcode stripes, which retain the original order, widths and values.
- Larger mobile terrain, brighter grains and stronger selected/group highlights.
- Guided comparison: shared garlic (60/46), chilli (55/86), and the supplied citrus/herbal/floral region.
- Replay, pause/resume, reduced-motion handling and suspension when hidden/offscreen.
- Drawing is capped at 30 fps, device pixel ratio at 1.65; stable geometry is cached and empty samples culled.
- Tests protect motion endpoints and the exact settled field, plus all existing data invariants.
- Field movement is explicitly presentation, not sensing, molecular motion or new evidence.

Retrieve the release's exact source commit and archive from its native saved-version record. The earlier releases remain intact.

## v0.1.3 — Formation (7 October 2026)

- 1.75-second dish morph from current per-particle presentation weights, preserving shared garlic/chilli markers.
- Cached Gaussian kernels drive intermediate terrain samples and continuously reforming contours; no source values changed.
- 1.15-second view transforms: anchored particles generate/relax relief, then reorganise into barcode bands.
- Barcode-to-barcode dish changes release/reassemble bands without immediately replacing the signature.
- 650 ms filter/Common/Difference transitions. Excluded records remain as 15% ghosts; excluded field contributions go to zero.
- Complete barcode stripe widths and positions remain fixed during filtering. Shared stripes dim in Difference.
- Interruptions copy current visual weights and screen positions, with no animation queue.
- Restrained independent drift, contour shimmer, reduced motion and visibility suspension; Canvas retained.
- Selection survives when still eligible; filters and comparison states dismiss excluded records. Copy changed to “Inspect a particle…”.
- Native saved-version record contains this release's exact pushed commit and deployable archive. See `docs/QA-v0.1.3.md` for checks and limits.

## Pre-Formation checkpoint — 7 October 2026

**Sifr v0.1 baseline — pre-Formation checkpoint (published v0.1.2)** names the unchanged published Site at the start of v0.1.3 work. Its immutable archive is reused as the recoverable checkpoint:

- Saved Site version: **3**
- Version ID: `appgprj_6ac5e912712881919a1b3795fa5517d7~appgver_a7005a05e6bc8191a0b98f72a3556f6f`
- Git commit: `b692b0967b2e39f783af3444254ae2df1f4c690c`
- Deployable archive verified before any product-source edit.
- Redeploy version 3 to restore the exact pre-Formation experience. Earlier releases remain saved.

## Rollback procedure

1. Get the existing Site `appgprj_6ac5e912712881919a1b3795fa5517d7` and list its saved versions.
2. Confirm which saved version is requested and that it has an archive.
3. Redeploy that saved version to the same Site, preserving its audience and URL. For the initial baseline use the exact v0.1 version ID above.
4. Confirm the deployment succeeds. Do not use a destructive Git reset to roll back production.
5. For subsequent development, open the Site normally and intentionally reconcile the source with the desired release. Preserve the newer commits even when an older version is live.

## Invariants

- Do not modify the original 24 records or their x/y coordinates as part of rendering changes.
- All projections consume the same Sifr object.
- Field-sample dots are not additional compounds or model particles.
- Inferred scores are not laboratory concentrations.

## v0.2.0 — Shape a flavour (11 October 2026)

- Sifr Lab adds one hypothetical chilli-prominence control for Laksa. Only a separate derived copy of `laksa-4` changes; `lib/sifr-data.json` stays byte-identical.
- Original / My variation switches between the supplied reference and the local variation. Reset variation restores the original 86/100 prominence. Leaving the Lab restores the reference for normal dish comparison.
- Topography, Particles, Barcode, region annotations and particle inspection consume the same displayed model. Source coordinates, volatility, confidence and the fixed 0.19 height multiplier are retained.
- Cached Gaussian contributions and marker sizes interpolate their derived prominence, including interrupted updates. Barcode width responds to that same model; modality filtering still preserves each displayed profile's complete barcode geometry.
- Copy distinguishes a hypothetical prominence from measured heat, ingredient quantities and recipe predictions. Reference confidence is labelled separately when the selected contribution changes. Variations are local to the current page session.
- Lab controls sit beside the object on desktop and directly above it on phone widths. Lab mode compresses surrounding navigation and removes its duplicate explainer, keeping the control and visual response close together.
- The published v0.1.3 baseline is preserved as saved Site version 4, source commit `f0a91d794b76aaabbe4e045074c6054240f9beab`.
- Publication and browser verification are pending until recorded in the native saved-version record and release QA. These notes do not claim deployment or physical-device validation.

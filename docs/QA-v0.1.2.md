# v0.1.2 verification — 7 October 2026

## Preserved release and model

- v0.1.1 saved Site version 2, source `68397ead0c598e899019bbf536c1adcd6ce5f896`, confirmed archive-backed before editing.
- Original v0.1 saved Site version 1 remains available.
- Handover JSON remains byte-identical. No supplied particle, coordinate, confidence, volatility, or prominence values changed.

## Automated checks

`node scripts/test-sifr.mjs`, TypeScript `--noEmit`, and `git diff --check` pass.

The existing model checks now also cover monotonic ground-to-profile timing, exact transition endpoints, matching sample lattices between dishes, sampled field equality in Overlay/Common/Difference, isolated Gaussian identity, and guided comparison scores (garlic 60/46; capsaicinoids 55/86).

## Browser preview checks

- Fresh load defaults to Chicken Rice / Point cloud, visibly gathering and rising before settling.
- Checked intermediate ground/forming frames and the settled profile at mobile and desktop widths.
- Exact phone document client width: 390px; scroll width: 390px. No horizontal overflow.
- Barcode transition shows samples collecting into their target stripes. Native stripe buttons retain original order and selection.
- Selection of 2-acetyl-1-pyrroline persists into Barcode and back into terrain. Original source and scores remain correct.
- Selected Laksa capsaicinoids from Barcode, returned to Topography, paused, and isolated its contribution; correct 86/5/96 scores and source remain visible.
- Rapid Chicken Rice → Laksa → Chicken Rice → Laksa and Particles → Barcode switching ends in the correct 13-particle Laksa view.
- Guided comparison highlights the supplied garlic records, capsaicinoids, and the curated aromatic-region records. Group values come directly from the Sifr object.
- Pause settles the profile and stops idle motion. Resume and Re-form work.
- Offscreen suspension verified: canvas below viewport, frame counter stayed at 44 across separate observations.
- Final clean phone load: no application console errors or warnings. Unrelated browser-extension errors are excluded.

## Performance and accessibility boundaries

- No React state updates per animation frame. Shared samples are memoized, stable geometry cached, invisible samples skipped, and drawing capped at 30 fps with device pixel ratio capped at 1.65.
- Observed canvas draw costs were approximately 10–22ms in the preview browser during checks, with a 14.8ms Compare observation after culling. These are local draw measurements, not physical-phone frame-rate claims.
- Reduced motion is handled directly by `prefers-reduced-motion` in the page and renderer and takes the same exact-settled branch as Pause. OS-level preference emulation was not available in this browser; the equivalent still branch was exercised through Pause.
- Visibility/Intersection observers cancel background drawing and resume without accumulating elapsed hidden time.
- Sample drift and brightness changes are decorative presentation. Model markers and the settled Gaussian/contour geometry remain fixed.
- Native phone GPU/battery profiling remains outstanding. Crowded markers can still be selected through the picker.

Temporary phone QA fixture removed before publishing. No live rollback was performed; saved release archives are retained for restoration.

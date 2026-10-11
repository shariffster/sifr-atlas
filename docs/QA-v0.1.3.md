# Sifr v0.1.3 — Formation validation

7 October 2026. Updated the existing Site in place; all eight Drive documents read, including 06 and 07.

## Recoverable baseline

Pre-Formation checkpoint: **Sifr v0.1 baseline — pre-Formation checkpoint (published v0.1.2)**. Saved Site version 3, commit `b692b0967b2e39f783af3444254ae2df1f4c690c`, matching deployable archive verified before edits. Reused the existing immutable version rather than creating a duplicate. Prior versions retained. VERSION_HISTORY.md identifies the exact rollback version.

## Data and motion

- Original JSON SHA-256 remains `6a5d850dcde8e75bee643aa96e8309c43f10e2b279c8148b6e6cff79fdd25776`: 11 Chicken Rice and 13 Laksa records.
- Shared coordinates, source scores, sigma rule, padded domain, descriptor palette and fixed 0.19 height scale preserved.
- Regression checks exercise the actual formation module: exact settled and intermediate Gaussian fields; comparison field arithmetic; 15% filtered visibility; shared-pair presence throughout both dish endpoints; retargeting from interrupted state; timing ranges.
- Gaussian kernels and metadata are computed once. Contours follow current amplitudes during formation, then cache at rest. No React state updates per sample/frame; only labels and staged barcode layout update React state.
- Particle view retains the same angled coordinates and marker heights while relief relaxes beneath it. This intentionally improves projection continuity over the earlier flat camera.
- Barcode is a staged transform, not a physical simulation. Native accessible stripe controls take over after samples gather. No arbitrary terrain, new compounds or measured data.

## Browser checks

- Desktop preview and a phone frame with **390 px client width**, 390 px scroll width, 844 px frame height.
- Chicken Rice default, Laksa and reverse dish switching; Topography/Particles/Barcode; repeated dish/view changes; final states complete without reload or broken canvas.
- In-barcode dish morph, including Chicken Rice/Laksa/Compare interruption sequence. Correct final 13-record Laksa and 24-record Compare signatures.
- Full Laksa stripe widths/left positions measured before and after Trigeminal filter: all 13 identical. Only capsaicinoids bright; 12 others opacity 0.15. Common Compare retains 24 stripes, with only four shared records bright.
- Direct phone-coordinate marker tap selected Glutamate: chicken stock + soy, 88/10/88, correct type and layer.
- Selected Laksa capsaicinoids followed from filtered Barcode into terrain: dried/fresh chilli, 86/5/96. Clearing the filter retained selection. Difference dismissed the shared inspector.
- Common/Difference/Overlay, point cloud/Relief, modality controls, confidence markers, Reset View, guided comparison, contribution isolation and detail sheet exercised.
- Citral-family detail check: lemongrass, 72/92/88, (0.0574, 0.0000), compound family. Original methodology and inferred/not-a-laboratory-assay language retained.
- Pause settles immediately at the exact profile and stops idle drawing; Resume works. Reduced-motion matchMedia uses the same settle/no-RAF branch and CSS removes stripe transitions. Browser OS preference emulation was unavailable, so the actual OS setting was not independently toggled.
- Visibility listeners cancel RAF when hidden; IntersectionObserver suspends offscreen rendering. A nearly offscreen canvas (18 px still visible) correctly continued; no claim of a complete physical-device background benchmark.
- Fresh v0.1.3 sessions produced no application console errors/warnings. Older retained logs from 08:22–08:23 concern the earlier v0.1.2 development session and are outside this run (started after 11:00 UTC).

## Constraints and issues resolved

- Replaced final-only contour fade with evolving field contours.
- Corrected filtered-barcode renormalisation and selected-particle dismissal.
- Caught and fixed hard-cut dish replacement inside Barcode; signatures now release/reassemble.
- Added a completion fallback for throttled frames so delayed barcode layout always reaches the requested dish.
- Preserved 30 fps target, DPR cap 1.65 and existing Canvas approach. Preview frame costs varied with comparison and tooling; this is not a device FPS claim.
- Physical iPhone/Android performance, battery use and OS-level reduced-motion behaviour remain unbenchmarked. Test those next, including whether viewers can track garlic/chilli through a dish change without explanation.

Final gates: data regression script, TypeScript check, whitespace check and production build. Temporary phone harness removed before packaging. Screenshot evidence is versioned with the source.

# v0.1.1 verification — 7 October 2026

## Automated

- `node scripts/test-sifr.mjs`: passes. Tests the actual model functions through TypeScript transpilation, without a new runtime dependency.
- `node_modules/.bin/tsc --noEmit`: passes.
- `git diff --check`: passes.
- Original handover JSON unchanged from baseline commit `b065a2d2514382c81597e427d0876a5267ca24f2`.
- SHA-256: `6a5d850dcde8e75bee643aa96e8309c43f10e2b279c8148b6e6cff79fdd25776`.
- Tests cover 11 Chicken Rice / 13 Laksa particles, unique IDs, descriptor palette, sigma, Gaussian peak heights and field summation, fixed scale/domain, exact garlic alignment, capsaicinoid proximity, Common membership, barcode order/identity/non-mutation, and weighted annotation anchors.

## Browser preview

Tested the managed preview at desktop width and in an actual 390px-wide iframe viewport (390px document client width and scroll width; no horizontal overflow). Temporary QA fixture removed before publishing.

- Chicken Rice opens in Topography / Point cloud on fresh load.
- Both dishes and Compare switch without navigation.
- Topography, Particles, Barcode, Relief, Overlay, Common and Difference remain available.
- Rice/pandan region selects 2-acetyl-1-pyrroline: source pandan + fragrant rice, scores 82 / 90 / 95, coordinates 0.3011 / 0.3849, specific compound / aroma / roasted.
- The same ID and outlined stripe persist into Barcode; selection persists into Particles and back to Topography.
- Contribution only removes other contributions and annotations; clearing focus restores the full field.
- Direct canvas marker tap selects Gingerols correctly (ginger, scores 64 / 35 / 88).
- Common clears nonshared selection and exposes the four garlic/capsaicinoid records.
- Choosing Laksa garlic then switching to Chicken Rice follows its counterpart and updates the score/source card.
- Region labels toggle, Details opens the inspection sheet, and Version history shows current and baseline releases with rollback guidance.
- Final clean-load check: no application console errors or warnings. The temporary phone harness's scrollbar style produced one hydration warning during testing; that fixture was removed and the clean-load check passed. The browser extension also emitted unrelated metadata errors.

## Scope and limitations

- Browser viewport and pointer/touch-compatible handler checks, not physical-phone GPU/CPU benchmarking.
- Bounded Canvas point samples, capped device pixel ratio and event-driven redraw; no continuous animation loop or thousands of DOM particles.
- Closely overlapping markers remain selectable through the particle picker.
- Region labels are interpretive groupings, not measured segmentation.
- Release restoration is documented and both saved versions are checked after publishing. No disruptive live rollback was performed for testing.

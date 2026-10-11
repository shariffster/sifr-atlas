# Sifr v0.1

Built from all six documents in the supplied Sites handover, read 7 October 2026.

## Data contract
- lib/sifr-data.json is the single source of truth. All original 24 rows, scores, sources, layers, and coordinates are preserved exactly.
- Added stable IDs, dish metadata, a global descriptor palette, particle type, and inferred evidence status. Compound families are distinguished from single compounds.
- lib/sifr.ts supplies shared selection, field, kernel, barcode ordering, and common-particle logic.

## Rendering
- Canvas 2D relief from a 64 × 64 cell Gaussian height field. Fixed domain [-0.16, 1.16] includes edge-particle tails.
- Every dish/filter shares a fixed height multiplier 0.19 and supplied coordinates. No per-dish normalization.
- Sigma = 0.065 + (1 - volatility) × 0.025. Surface colour blends local descriptor influence.
- Sampled contours, stems and tappable markers; constrained horizontal orbit, Reset View, and a fixed top-down Particle projection.
- Compare: solid Chicken Rice/circles; wire/dashed Laksa/diamonds. Common requires an exact label match within 0.06 latent units. Difference is the positive field residual per dish with common markers dimmed. Difference is available on spatial views, not barcodes.
- Barcode: one stripe per particle, sorted by x then descending intensity; weight 0.45 + intensity; volatility highlight.

## Reliability and accessibility
- Memoized fields, demand-driven drawing, DPR capped at 1.75, no idle animation, no WebGL or external asset requests.
- Offscreen/hidden documents skip drawing. Reduced motion removes animations. Vertical touch scrolling and pinch zoom are allowed.
- A named particle selector provides a touch/keyboard route to crowded or coincident markers. Inspector includes dish, source, type, layer, prominence, volatility, confidence, descriptor, evidence status, and coordinates.
- Chicken Rice opens by default. Switching stays on one page.

## Validation
- Readback matches every original row exactly.
- Model checks passed for dish counts, kernel, peak contribution, shared anchors, and barcode ordering/traceability.
- Garlic: both (0.2767, 0.9543). Capsaicinoid separation: 0.035925 latent units.
- Desktop and phone layout checked. Phone used a 390px iframe container (373px content after borders and desktop scrollbar). No horizontal overflow.
- Checked switching, marker and stripe taps, inspector paging, Compare states, modality filtering, and methodology visibility.
- No application console errors observed. Browser extension metadata errors were unrelated.
- TypeScript passed. Physical iPhone/Android performance is not benchmarked.
- Optional WebMCP exploration is feature detected. The preview exposed no registered tools, so WebMCP validation was unavailable; UI functionality is independent.

## Choices and limits
- Used the permitted Canvas fallback. No source score or coordinate changed.
- Added Common/Difference, modality filters, and confidence visualization.
- Confidence is qualitative, not a probability. No measured concentrations or assay claims.
- Coincident markers are intentional; use the selector or inspector paging.
- Field subtraction is not a perceptual similarity score. Barcodes use x ordering, not an aligned spatial axis.
- Next: attach particle-level evidence, then test geometry against structured human sensory judgments for specified preparations.

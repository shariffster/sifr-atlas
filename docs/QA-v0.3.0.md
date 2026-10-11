# Atlas verification

11 October 2026, local candidate before publication.

## Automated checks

- `node scripts/test-sifr.mjs`: original data checksum, 24 records, fixed fields, projection identity, animation endpoints and exact Lab reset pass.
- `node scripts/test-atlas-model.mjs`: 100 recipe profiles, stable identities and coordinates, equal source-independent weights, bounded overrides, unmapped handling and reset pass. 43 of 1,069 deduplicated ingredient occurrences are explicitly unmapped.
- `pnpm exec tsc --noEmit`: pass.
- Sites production build: pass for `/`, `/compare` and `/instrument`.

## Browser evidence

Verified in the Codex browser at 1440/1586 desktop widths and 390px mobile width:

- Atlas opens the coconut trail, Malaysia and Nasi lemak. Counts show 8/100 in the library and 3/4 in the Malaysian sample.
- Inspecting coconut milk and switching between topography, particles and barcode keeps the selection. Following the exact ingredient back to the map shows 7/100 and 2/4, distinct from the broader coconut trail.
- Geographic list selection opens Thailand. An unmatched search shows a recoverable empty-result message.
- The selected recipe opens a real second recipe in comparison, and returning preserves the first recipe ID.
- Comparison switches all three projections, filters to two shared names for Nasi lemak/Thai curry noodle soup, and changes coconut's model weight to 1.6. Original restores the starting sketch while preserving the draft variation; Reset returns the control to 1.0 and disables Reset.
- Source quantities remain verbatim, including duplicate anchovy source entries displayed separately.
- Mobile page width equals the viewport width (390px) for both routes. Profiles and controls stack, and ingredient rows remain readable.

An SVG title hydration mismatch was found and fixed by retaining country accessibility labels without nested SVG title nodes. Reload and subsequent profile interactions succeeded.

Local screenshots are retained outside the published source in the makeathon workspace's `output/playwright/` directory. Independent visual review, public judge access and deployed interaction evidence are separate release gates; these local checks do not establish them.

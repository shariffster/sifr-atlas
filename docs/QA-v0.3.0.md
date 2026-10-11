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


## Production navigation repair — candidate after public version 1

Public version 1 at source `fc3d2c66ba86da14191715ff1aa46ee92e5dcc2d` rendered, but Atlas comparison links failed on pointer activation and keyboard Enter. Release QA reported `[vinext] RSC prefetch setup error: TypeError: f is not a function` and a `startTransition` client navigation error. Earlier local navigation evidence does not establish production navigation success.

The app uses Vinext through its Sites framework runner. The bounded repair replaces all four `next/link` instances in the Atlas with native `a href` anchors: wordmark, desktop Compare, contextual Compare and Original instrument. Their URLs, query parameters, visible content and classes are unchanged. Native navigation requests the destination route as a full document, bypassing the failing client prefetch/transition path. The exact upstream runtime cause remains unconfirmed.

- `/compare` already uses native anchors for Atlas return, including the selected recipe ID; no change required.
- `/instrument` has no Next Link or client-router cross-navigation; no change required. Its wordmark remains the existing in-page instrument reset.
- Static audit: no `next/link` import or `Link` element remains in the application routes.
- TypeScript check: pass after this repair.
- Production build, saved-version publication, pointer/keyboard link activation, recipe-preserving return and `/instrument` access must be rechecked by release QA on the repaired deployed version. This note does not claim those release checks have passed.

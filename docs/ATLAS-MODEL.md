# Atlas model: ingredient-derived sketches

The primary indexed object is a recipe record. Its source ingredient list and written amounts are inputs, not a measured flavour profile. The source's area classification is context, not proof of origin or cultural ownership. A complete sensory account would also need ingredient state, quantities, preparation, serving conditions and human perception; this prototype does not model those relationships. The Atlas sketch is an explicitly authored reading aid built from those inputs.

`buildAtlasProfile(food, overrides?)` returns `foodId`, `foodName`, `particles`, `ingredientCount`, `unmappedCount`, `methodLabel` and `hasOverrides`. A particle contains `id`, original `label`, normalized `ingredient`, `x`, `y`, `intensity`, `color`, `descriptor`, `mapped` and `family`.

- **Identity:** ingredient names are lowercased and lightly normalized, including a small explicit synonym/plural table. Fresh/dried and other meaningful distinctions remain. Duplicate normalized rows within a recipe become one identity; written source amounts remain in the recipe record.
- **Coordinates:** a coarse, author-designed ingredient-family lexicon selects a fixed descriptor anchor. Deterministic family and ingredient offsets separate markers. The same normalized ingredient always receives the same coordinates; geometry is never refitted to a dish or region. It is not a universal sensory standard or measured PCA space.
- **Descriptor lens:** families and descriptor colours are illustrative associations. Compound ingredient names can be ambiguous, and one descriptor cannot express everything an ingredient contributes. The lexicon is transparent source code, not a trained sensory model.
- **Weights:** every unique listed ingredient starts at one contribution unit. An override keyed by stable particle ID or normalized ingredient name changes only that ingredient, clamped to 0–2. Other ingredients are not renormalized. Units do not express physical mass, concentration, intensity of tasted flavour or population preference. Source amounts are display-only because recipe measures are not commensurable without additional work.
- **Limit of distinction:** two source recipes with the same normalized ingredient set produce the same starting sketch, even if their written quantities or cooking methods differ. They remain different recipe records. The current sketch cannot establish their actual sensory difference.
- **Unknowns:** unmatched names receive `mapped: false`, descriptor/family `unmapped`, neutral colour and a stable position at the edge. They remain inspectable and appear in the barcode, but add no invented field contribution. The interface shows their count.
- **Field:** mapped ingredients contribute Gaussian kernels with the same width, 0.074, multiplied by their contribution units. The terrain uses the same fixed logarithmic height compression across recipes. These are display choices, not physical chemistry.
- **Projections:** the canvas field, particle markers and barcode consume the same profile. Barcode sorts by fixed x/y and stable ID; a minimum visible stripe width preserves zero-weight entries. Linked selection follows the same ID. The component uses a 380 ms transition and supports pause, reduced motion, hidden-tab and offscreen suspension.
- **Overlap:** `sharedIngredientScore(a,b)` is the Jaccard fraction of normalized ingredient sets. It includes directly matching unmapped names, ignores repeated source rows, and is not taste similarity. Empty sets return zero.

The original `lib/sifr-data.json` and the earlier 24-record instrument are unchanged. Do not merge this recipe-derived layer into the earlier inferred sensory dataset or describe the two as equally evidenced.

## Component API

```tsx
<AtlasProfile
  profile={buildAtlasProfile(food, overrides)}
  view="topography" // or "particles" / "barcode"
  selectedId={selectedId}
  onSelect={setSelectedId}
/>
```

The component exports both `AtlasProfile` and a default export. `AtlasProfileProps` is exported. The parent owns recipe choice, view controls, the ingredient list, override controls and source attribution. The component adds only the canvas, a motion button and accessible ingredient-selection buttons.

Run `node scripts/test-atlas-model.mjs`. Tests protect source immutability, fixed cross-recipe coordinates, bounds and reset, field differences from a single override, honest unknowns, barcode identity, overlap semantics, and the checksum of the original 24-record model. Browser layout and interaction still require the parent route's rendered QA; model tests do not establish sensory validity.

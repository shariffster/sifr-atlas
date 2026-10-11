# Sifr Atlas

**One ingredient. Many expressions.** A Common Ground Makeathon 2026 prototype for curious food-culture explorers. Follow ingredients across places, inspect source-linked recipe versions, and compare their ingredient lists and illustrative profiles.

Release candidate: **0.3.0**. [Intended demo](https://sifr-atlas.riffster.chatgpt.site) · [Source](https://github.com/shariffster/sifr-atlas). Availability and access are verified in the release handoff, not inferred from these links.

## Run locally

Requires Node.js 22.13 or later and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

The portable development server defaults to http://127.0.0.1:5173. To use another port, run `pnpm run dev -- --port 5174`.

```sh
node scripts/test-sifr.mjs
node scripts/test-atlas-model.mjs
pnpm exec tsc --noEmit
pnpm run build
```

The app uses React, TypeScript, Vinext/Vite, SVG geography and Canvas ingredient profiles. It does not need an AI API key, account or database for the core discovery experience. The Sites deployment manifest binds this separate release; local development uses the portable runtime.

## Routes

- `/`: geographic and ingredient discovery, with recipe details.
- `/compare`: two source recipe versions, aligned ingredient quantities and three views of an ingredient-derived sketch.
- `/instrument`: the preserved two-dish Sifr reference instrument and hypothetical Laksa variation.

## What the data means

The library contains 100 TheMealDB recipe records across 24 source area labels, with 1,094 ingredient entries before within-recipe deduplication. It is a small, deliberately bounded educational sample. Ingredient frequency is frequency within these indexed records; it is not population consumption, popularity, authenticity or a complete account of a cuisine.

Each recipe retains its source URL and the original ingredient-quantity strings. Source labels describe how records are indexed, not exclusive cultural ownership. Some source names and quantities are inconsistent; they are not silently converted into canonical recipes.

**The visual profiles are ingredient-derived sketches, not sensory measurements or predictions.** Ingredients begin with equal drawing contributions. An authored descriptor lexicon places recognised ingredients at fixed coordinates; unknowns remain visible and are excluded from invented sensory fields. Quantities, preparation and serving conditions do not yet drive the sketch. A hypothetical contribution control changes a model weight, not a measured dose or forecast flavour.

See [Methodology](docs/METHODOLOGY.md), [model details](docs/ATLAS-MODEL.md), [dataset provenance](docs/ATLAS-DATA.md), [release notes](RELEASE.md) and [baseline history](VERSION_HISTORY.md).

## Provenance and reuse

Recipe facts were retrieved through TheMealDB official API for this educational prototype, with a maximum 100-record sample. Source attribution travels with each recipe. No instructions, food photographs or third-party recipe prose are included. Consult [TheMealDB API](https://www.themealdb.com/api.php) and [terms](https://www.themealdb.com/terms_of_use.php) before expanding or reusing the dataset commercially. This repository does not grant additional rights to third-party material.

Map geometry is Natural Earth 1:110m data, [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Geographic shapes are for discovery, not boundary or cultural-origin determinations.

The original 24-record Sifr dataset and its coordinates are preserved byte-for-byte. It was pre-existing work; the makeathon contribution is described in RELEASE.md.

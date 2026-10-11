# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Sifr is Shariff's proposed shared language for food and flavour, using Pantone's
consistent treatment of colour as an analogy. The 11 October 2026 makeathon
iteration should extend beyond the original two dishes into a broad food library
and a global flavour atlas. The same ingredient may appear across places but be
expressed differently in dishes shaped by community, culture and heritage.

The user wants to explore how a dish changes when ingredients or their inputs
change, and how familiar dishes vary between households, communities and regions.

## Users

Primary audience: curious food-culture explorers who want to follow familiar
ingredients across dishes, places and cultural contexts. Immediate evaluation:
Common Ground Makeathon participants and judges for Culture × Tech and Design × Tech.

## Operating Context

Solo project, 11 October 2026, Singapore. Pre-existing code and ideas are allowed.
Initial submission can use a two-minute demo video; deadline 15:15 SGT, judging
15:30. Internal feature freeze 13:15, verified release 14:00, package 14:30,
successful submission target 14:45. These are delivery constraints, not evidence
that any milestone is complete.

The user selected mockups first: research references, compare visual candidates,
then integrate the chosen Atlas interface. MagicPath access has been restored;
the user approved Field Atlas plus the comparison view at 11:53 SGT. The user also selected a
new, separate Site and GitHub repository for this iteration, preserving the
incumbent Site and source history. This explicit decision supersedes the inherited
instruction to continue only the original Site.

## Capabilities and Constraints

The existing instrument has two authored, illustrative profiles, 24 records,
three projections, linked inspection, fixed comparison scale and saved releases.
Preserve that dataset and its coordinates. The implemented Lab adds a separate
hypothetical Laksa chilli variation; browser/release verification remains required.

The atlas will distinguish indexed recipe facts, illustrative flavour mappings,
and user-created what-if variations. Ingredient frequency within a sampled recipe
library is not population popularity, ingredient concentration or sensory intensity.
The original 24-record model is not a complete ingredient library or validated
predictor. Do not represent invented testimony, community validation or a universal
canonical recipe as established evidence.

## Brand Commitments

Keep the Sifr name and the incumbent instrument's visual identity. The user asks
for quality and taste, and an ambitious but coherent makeathon outcome.

## Evidence on Hand

- Original data: `lib/sifr-data.json`, preserved byte-for-byte.
- Prior live release: Sifr v0.1.3, Site saved version 4.
- NHB dish context: `lib/sifr-culture.ts`, with named primary source links.
- Atlas recipe sample: 100 TheMealDB records across 24 source-country filters in
  `lib/atlas-foods.json`. No population consumption dataset exists here.
- Model definitions and current limits: `docs/METHODOLOGY.md` and
  `docs/ATLAS-MODEL.md`.

## Product Principles

- Follow an ingredient across places and across visual representations.
- Make differences traceable to explicit inputs.
- Keep cultural context and personal variation visible without flattening
  a community into one definitive taste.
- Make sources and model limitations available where they affect interpretation.

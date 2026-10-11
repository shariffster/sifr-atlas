---
name: Sifr Field Atlas
description: A geographic ingredient explorer and paired recipe instrument.
colors:
  sand: "#dfc99d"
  sage: "#95aca0"
  ink: "#e7e9e2"
  background: "#0b1112"
  drawer: "#111b17"
  muted: "#a4b7ab"
  compare-soft: "#b2c0b7"
  line: "#293833"
  compare-line: "#33433c"
  selected-row: "#24362a"
typography:
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.6px"
  compare-headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(25px, 2.65vw, 38px)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "14px"
    lineHeight: 1.4
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "12px"
  navigation:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "13px"
rounded:
  compact: "3px"
  control: "5px"
  pill: "30px"
spacing:
  small: "8px"
  compact: "12px"
  mobile-gutter: "20px"
  medium: "24px"
  section: "28px"
components:
  filter-chip:
    textColor: "#bdc9bd"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
    typography: "{typography.label}"
  filter-chip-selected:
    backgroundColor: "{colors.sand}"
    textColor: "#18231b"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
    typography: "{typography.label}"
  compare-link:
    textColor: "{colors.sand}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  compare-link-hover:
    backgroundColor: "{colors.selected-row}"
    textColor: "{colors.sand}"
    rounded: "{rounded.control}"
  search-field:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  drawer:
    backgroundColor: "{colors.drawer}"
    textColor: "{colors.ink}"
    padding: "32px 30px 25px"
---

# Design System: Sifr Field Atlas

## Overview

**Creative North Star: "Field Atlas"**

Field Atlas extends the existing Sifr instrument into a quiet working atlas. Warm ivory text and sand selection sit on dark green surfaces; geographic paths, ingredient markers and fine contour lines provide the visual substance. The approved Arial/Helvetica character and lowercase sifr° wordmark continue across discovery and comparison.

This document records the built Atlas and recipe comparison surfaces for v0.3.0. It describes the implementation in app/atlas.css, app/compare/compare.css and app/atlas-profile.tsx, checked against the five retained review captures. The preserved original instrument is a separate surface. Composition and approval provenance remain in DESIGN-BRIEF-atlas.md; the finish verdict covers its five scored fixes, not a complete quality certification.

**Key Characteristics:**
- Dark green, flat working surfaces with fine rules.
- Sand connects selection across map, controls, profile and source rows.
- Compact normal-weight type leaves room for the geographic and ingredient objects.
- Source quantities and model limitations remain alongside the visual interpretation.

## Colors

The interface uses a restrained sand and sage palette over green-black grounds. Ingredient colours belong to the data model and continue into the profiles and barcode; they are not a second navigation palette.

### Primary

- **Sand:** selected ingredient trails, active navigation, source actions, keyboard focus, selected map places and comparison controls.

### Secondary

- **Sage:** sampled geographic coverage and supporting diagram cues. Map opacity varies with the within-sample share; the legend explains that encoding.

### Neutral

- **Ink:** principal text and strong diagram labels.
- **Background / Drawer:** the main working ground and the slightly lighter recipe region.
- **Muted / Compare Soft:** secondary text within each route's existing palette.
- **Line / Compare Line:** quiet divisions between persistent regions and source rows.
- **Selected Row:** the filled recipe selection in the Atlas drawer.

**The Selection Continuity Rule.** Use sand to keep the active place, ingredient and action traceable across the interface. Preserve the ingredient's model colour where it identifies a data object.

## Typography

Arial, Helvetica and the sans-serif fallback are deliberately retained from the approved Sifr identity. Normal weights, modest scale changes and close headline tracking keep the objects primary. No external font files are required.

The Atlas headline uses the frontmatter headline role. Comparison has its own fluid headline role and a slightly looser body line height (1.5). Recipe and place headings sit between body and route title: comparison section headings are compact (19px), Atlas recipe titles (23px) and place titles (29px). Navigation and controls use the label and navigation roles. Quantities and counts use tabular numerals. Small source notes are supporting metadata; their incidental sizes are not a general body-text standard.

The shared wordmark is lowercase text with the raised sand degree mark. Its desktop size is large (43px), reducing on mobile (35px); this is an identity treatment, not a display-heading scale.

## Layout

Atlas uses a broad map region and a linked recipe drawer. The desktop grid is `minmax(0, 1.85fr) minmax(360px, 1fr)`; at (1100px) it tightens to a 1.5fr map with a (340px) drawer minimum. At (1150px) the search moves beneath the headline. At (760px), the map, recipe selector and recipe details stack with the mobile gutter. The full desktop navigation yields to the compact identity and information control; the contextual comparison action stays with the selected recipe.

Comparison uses equal columns separated by a fine vertical rule, within fluid side gutters (4.4%). At (700px), profiles stack in reading order, the separating rule becomes horizontal, and the model controls reflow into two columns. The ingredient ledger retains its three aligned columns with wrapping source strings. At large widths (1600px), the fluid gutters also constrain the content to approximately (1450px).

Spacing is component-led rather than a newly imposed universal grid. Repeated small, compact, mobile-gutter, medium and section spaces are recorded in frontmatter. Keep the map generous; use dense rows for inspection and source comparison.

**The Equal Grounds Rule.** Comparison gives both recipes equal visual space and a shared coordinate and height scale. Selection must leave both complete profile forms visible.

## Elevation & Depth

Persistent surfaces are flat. The slightly lighter recipe drawer, fine borders, muted unselected geometry and sand selection establish hierarchy. Geographic and ingredient geometry supply depth inside the visual objects; their perspective is not a card treatment.

Search results are the observed floating layer, using a diffuse shadow (`0 12px 30px #0006`). No card-shadow scale is established.

**The Flat Working Surface Rule.** Separate persistent regions with tonal steps and fine rules. Reserve the existing diffuse shadow for the floating search results.

## Shapes

Fine rules organise the interface. Compact controls have small corners, search and contextual comparison links use the control radius, and ingredient trail filters use the pill radius. The comparison filters and ledger remain square. Small circular markers identify ingredient colours; they are data cues. Do not generalise the filter-pill shape to every container.

## Components

### Navigation and identity

The shared sifr° wordmark anchors each route. Active navigation is identified by a sand rule; surrounding links use the route's muted text. The comparison return link and Atlas comparison link preserve the chosen recipe context. Keep the inline Lucide SVG icon family consistent.

### Ingredient filters and view controls

Atlas trail chips wrap onto additional lines; selection fills the chip with sand and dark text. Hover adds a dark green fill to unselected chips. Projection tabs use compact segmented surfaces in the drawer and simple underlined labels in comparison. Preserve their existing `aria-pressed` states.

### Contextual comparison action

A quiet outlined link sits directly below the selected recipe's introduction. Its sand label and arrow lead; the second line names the paired recipe. Hover fills with Selected Row. This is an action within the inspection flow, not a promotional card.

### Search and recipe selectors

Atlas search is a fine outlined field with a search icon, dark transparent input and a bounded results layer. Comparison uses native selects for recipe and variation-target selection. No custom modal selector is established. Focus uses a sand outline (2px) offset from the control (4px). Disabled controls visibly dim and use the default cursor.

### Recipe drawer and ingredient ledger

The Atlas recipe list uses full-width rows with fine dividers and a filled active row. The source-ingredient region scrolls within a bounded height; quantities stay right aligned. Comparison aligns ingredient names and both source amounts in a semantic table. Selecting an ingredient coordinates its row, profile marker and colour band; a text label keeps selection understandable beyond colour alone.

### Geographic atlas

Natural Earth paths form the world map, with an alternative place list. Unmatched areas remain subdued, sampled shares use sage opacity and the chosen place uses sand. Counts show both numerator and sample denominator. Selection callouts, zoom controls and the legend remain subordinate to the geography.

### Shared ingredient profile

The same Canvas renderer produces Topography, Particles and Barcode. Profiles share fixed ingredient positions and a common height scale; mapped ingredient colours recur in the visible colour bands and rows. Contours remain legible during selection and a ring or stripe outline identifies the selected ingredient. Unmapped ingredients stay explicit.

View and recipe changes interpolate from the displayed state (380ms); reduced motion or the pause control removes that transition. Small UI transitions are limited to chip backgrounds, map fills/strokes and colour-band opacity. Keep named visible ingredient controls as the keyboard path to Canvas selection.

## Do's and Don'ts

### Do:

- **Do** preserve the lowercase sifr° wordmark and the approved plain sans character.
- **Do** keep sand selection, visible keyboard focus and the selected ingredient name coordinated.
- **Do** keep exact source amount strings legible and separate from model weights.
- **Do** retain shared profile coordinates, complete contour forms and the visible ingredient controls.
- **Do** stack major regions on narrow screens while preserving the comparison ledger's column relationships.

### Don't:

- **Don't** substitute decorative imagery for the source geography or ingredient geometry.
- **Don't** turn sampled recipe frequency into a visual claim about national popularity or cultural ownership.
- **Don't** make ingredient selection erase the surrounding profile shape.
- **Don't** introduce elevation, a replacement wordmark or a new font family as an incidental refinement.

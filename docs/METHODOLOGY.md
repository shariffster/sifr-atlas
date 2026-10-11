# What Sifr profiles

Sifr should profile **a specific prepared recipe version**: a particular formulation and preparation, with an identifiable source. “Laksa” is a family of versions, rather than one canonical sensory profile. The intended model connects what went into a preparation, what people perceived, and the cultural context attached to it.

Ingredient identity, state (fresh, dried, fermented), amount and preparation are **inputs**. Taste, aroma, chemical sensations and mouthfeel are **sensory observations** of the resulting food under recorded conditions. Geography, community, household and occasion provide context; their relationships to recipes are many-to-many, not exclusive ownership labels.

Taste is one part of flavour. Sweet, sour, salty, bitter and umami are basic taste qualities; aroma, chilli burn, mint cooling, temperature and texture also contribute to the eating experience. Keeping these dimensions separate makes the vocabulary clearer. [NIDCD, how taste works](https://www.nidcd.nih.gov/health/taste-disorders)

## What is the base unit?

There are two different records:

- **Recipe evidence:** one ingredient occurrence in a version, retaining its identity, state, source amount and preparation role. An ingredient is an input, not a fixed unit of perceived flavour.
- **Sensory evidence:** one attribute observation with an intensity, defined scale, method, assessor or panel, conditions and provenance. A profile collects these observations; measured, reported and inferred values must remain distinguishable.

Proposed conceptual schema, beyond what today’s prototype stores:

```text
DishFamily(id, names)
RecipeVersion(id, familyId, source, revision, preparationSteps)
IngredientOccurrence(recipeId, ingredientId, state, amount, unit, step)
PreparedSample(id, recipeId, preparationDeviations, servingConditions)
SensoryObservation(sampleId, attributeId, intensity, scale,
                   method, assessor, conditions, evidence)
Profile(sampleId, observations[], modelVersion?, uncertainty?)
ContextLink(recipeId, place/community/household/occasion, source)
```

This is a proposed data architecture, not a validated sensory protocol. Missing observations remain missing.

## How far the Pantone analogy goes

The useful ambition is consistent identifiers, reference samples, vocabulary and coordinates that let people compare observations. It does not establish a linear mixture law: adding ingredient scores cannot yet predict a prepared dish’s flavour.

Ahn and colleagues’ ingredient–compound network offers a precedent for examining recipe relationships. Their study also recognises preparation effects and lacks systematic compound-concentration and detection-threshold data. It does not validate Sifr’s sketch or a recipe-to-perception calculator. [Ahn et al., 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3240947/)

## What the current prototype actually contains

The Atlas indexes **100 TheMealDB recipes across 24 source-country filters**. Its evidence layer is ingredient occurrence: which indexed recipes contain an ingredient, which ingredients overlap, and how those counts vary across the sample’s source labels. Frequency here means frequency in this library, not population consumption, cultural importance or authenticity.

The separate **Ingredient-derived sketch** assigns each unique normalised ingredient an equal starting weight of one. An authored, coarse descriptor lexicon gives recognised ingredients stable positions and colours. Unmapped ingredients remain visible and contribute no invented sensory field. Source quantity strings are retained for display; the engine does not interpret amounts or preparation. What-if multipliers alter drawing weights, not measured concentration or predicted taste.

**The present engine cannot establish actual sensory differences between recipes using the same ingredients in different proportions or preparations.** The same normalised ingredient set starts with the same sketch. Capturing those differences requires structured preparation records and calibrated sensory modelling or tasting evidence.

The original Chicken Rice/Laksa instrument remains separate: two authored illustrative profiles containing 24 preserved records. It is neither the Atlas ingredient library nor experimental validation.

## Today’s deliverable boundary

For curious food-culture explorers: sourced recipe discovery, ingredient relationships across places, an explicitly illustrative sketch, and traceable hypothetical changes. The interface should invite exploration while exposing its evidence and limits. A validated flavour standard, sensory prediction, community archive and definitive account of any cuisine remain future work. Visual selection precedes Atlas application integration; the intended release uses a separate Site and GitHub repository, preserving the incumbent release.

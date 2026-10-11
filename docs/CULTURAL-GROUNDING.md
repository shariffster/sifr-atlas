# Sifr: cultural grounding for Common Ground Makeathon

Prepared 11 October 2026. Research and a bounded implementation proposal; this document does not change the application.

## Recommended cultural angle

**What changes, what stays?** Use the visual instrument to open a conversation about how a familiar dish can vary while carrying remembered practices and relationships. Give each dish one sourced context passage and one ingredient focus; let the existing hypothetical chilli adjustment lead into a specific reflection.

Culture is doing real work when a visitor can connect a visible ingredient to a documented practice, consider a change, and explain what they would want to carry forward. Merely renaming graphs after dishes, or adding an unrelated story box, would not achieve that.

## Claim and source ledger

These are three official institutional sources. NHB's inventories summarise cultural research and practitioner accounts; UNESCO records the inscription and its description. They are not chemical studies, sensory assays, or evidence that Sifr's numbers describe a particular cook's food.

| ID | Supported claim and exact supporting location | Source | Boundary |
| --- | --- | --- | --- |
| C1 | Laksa incorporates Chinese, Malay and other influences. Introduction. Its preparation continues to change through multigenerational establishments. Associated Social and Cultural Practices says: “The dish has seen adaptations over the years”. | [National Heritage Board, Laksa — ICH-070, included March 2019](https://www.roots.gov.sg/ich-landing/ich/laksa) | Supports a history of cultural exchange and adaptation. Does not establish a single authentic formula or a quantitative flavour profile. Avoid claiming all regional laksa has the listed coconut broth. |
| C2 | Coconut milk is one of the ingredients in the laksa described by this inventory. Introduction. | [NHB, Laksa](https://www.roots.gov.sg/ich-landing/ich/laksa) | Supports a coconut ingredient focus for the selected example, not the value, chemistry, prominence or location of its model record. |
| C3 | Hainanese chicken rice in Singapore incorporates Cantonese influences; pandan is a local addition to rice preparation. Introduction and Associated Social and Cultural Practices. Exact example: “the use of pandan leaves in cooking the rice”. | [National Heritage Board, Chicken Rice — ICH-064, included March 2019](https://www.roots.gov.sg/ich-landing/ich/chicken-rice) | Say “NHB describes” rather than implying a universal recipe. This source cannot verify Sifr's compound identity, strength, confidence or coordinates. |
| C4 | NHB's practitioner account describes Benjamin Boh learning by observing parents and elders and working in the family business. Experience of a Practitioner. | [NHB, Chicken Rice](https://www.roots.gov.sg/ich-landing/ich/chicken-rice) | This is a named practitioner account; do not invent his words, imply his participation, or generalise his family's particular method to all chicken rice. |
| C5 | Hawker dishes adapt to local contexts, and culinary knowledge passes through family members and apprentices. Inscription description: “transmit their recipes, knowledge and skills to younger family members or apprentices”. | [UNESCO, Hawker culture in Singapore — nomination 01568, inscribed 2020](https://ich.unesco.org/en/RL/hawker-culture-in-singapore-community-dining-and-multicultural-living-01568) | Recognition concerns hawker culture and its social practices. It does not certify individual dishes, endorse Sifr, or show that this prototype has safeguarded heritage. |

### Access and verification

Read on 11 October 2026 using the web tool's indexed page bodies. Searches returned the complete NHB inventory text, including headings, practitioner account and reference identifiers, and UNESCO's complete inscription description. Direct `open` requests to the NHB URLs returned three-line bot/JavaScript responses. These are therefore verified against retrieved indexed bodies, **not** a claim of direct rendered-page inspection or guaranteed current page availability. The search index reported the NHB bodies crawled four months earlier; UNESCO was reported crawled that day. No visitor, family, hawker or community interviews were conducted.

## Two UI passages

Both are below 65 words. Place each beside the selected dish, with its visible attribution link immediately below. The factual sentence is from the source; the question is Sifr's invitation.

### Laksa — 45 words

> Laksa carries Chinese, Malay and other influences, and cooks continue to adapt it. Coconut milk is part of the version described by Singapore's National Heritage Board. Follow coconut in this illustrative model, then ask: what would you keep from the bowl of laksa you remember?

Attribution: [Cultural context: National Heritage Board](https://www.roots.gov.sg/ich-landing/ich/laksa)

Button: **Follow coconut** → focus existing record `laksa-1` (`Coconut aroma + lipid matrix`, source `coconut milk`).

### Hainanese chicken rice — 45 words

> Hainanese chicken rice changed with local influences. Singapore's National Heritage Board describes Cantonese techniques and pandan added to the rice. Follow pandan and rice in this illustrative model. Which detail makes a plate familiar to you—and who or where helped you learn to notice it?

Attribution: [Cultural context: National Heritage Board](https://www.roots.gov.sg/ich-landing/ich/chicken-rice)

Button: **Follow pandan and rice** → focus existing record `chicken_rice-4` (`2-acetyl-1-pyrroline`, source `pandan + fragrant rice`). The button presents the record as Sifr's inference; the heritage source supports the ingredient practice only.

## Small interaction to complete before feature freeze

1. **Context → focus.** Selecting a dish swaps the passage and source link. The focus button selects the existing record in the current rendering and opens its existing detail. Keep the inferred/model status visible. No new data is required.
2. **Variation → reflection.** Beside the existing Laksa chilli Lab, use: **“What would you change—and what would you keep from the bowl you remember?”** Supporting label: **“This changes one model score. It does not predict the taste of a cooked recipe.”** Prefer **Model baseline / Your variation** over unqualified **Original / Variation**, which can imply a canonical recipe.
3. **Optional personal note, only if time remains.** One local field: **“A detail I would carry forward…”** with a prompt to name a practice, ingredient, person or place. Show it alongside the current variation under **Your reflection**. State actual storage behaviour accurately, e.g. “Kept only in this session” only if that is implemented. Do not prefill a family story, aggregate responses, or imply a public archive.

The note is useful only when it explains why a change matters to its author. If it is detached from the variation, cannot be presented meaningfully, or puts the freeze at risk, keep the reflection as a spoken demo prompt instead. A thoughtful question is preferable to a pretend collection feature.

Use Shariff's personal memory only after he supplies it; attribute it as his experience. A future co-design session with cooks and diners is a proposed next step, not completed participation or validation.

## Winning concept pitch

“Sifr is a visual conversation starter about food we inherit and food we change. Its first examples are laksa and Hainanese chicken rice. Heritage sources explain the practices around them; an illustrative model lets you follow an ingredient and try a hypothetical variation across three views. The question is what you would carry forward. Today we demonstrate that conversation; a next version could be shaped with cooks and diners around their own accounts.”

**Culture × Tech:** practice, memory and transmission determine what a variation means. **Design × Tech:** one consistent model becomes three readable, explorable views. Neither claim depends on pretending to have measured food.

## Two risks to address visibly

1. **Apparent scientific authority.** Precise numbers and chemical labels can make a constructed profile look measured. Keep “illustrative / inferred” next to the interaction; do not present confidence scores as validated probabilities or the Lab as a recipe simulator. Cite heritage separately from model provenance.
2. **Flattened or invented culture.** One dish label can erase variation, while unattributed personal stories can falsely imply community input. Present these as two starting examples; make the source and the speaker visible; leave variation open. Do not claim authentic taste, heritage preservation, representative community findings or institutional endorsement.

## Immediate check

Verify that the source link belongs to the displayed dish, the focus target exists, switching dishes clears irrelevant focus, and the Lab still changes only its intended inferred chilli score. These checks establish correct prototype behaviour, not cultural or sensory validation.

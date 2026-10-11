# Flavour Atlas recipe sample

Retrieved: `2026-10-11T03:29:09+00:00`. Provider: [TheMealDB](https://www.themealdb.com/).

## What is included

- 100 distinct source records, chosen using 24 country filters; 24 distinct retained area labels and 12 meal categories.
- Names, source area/category, original ingredient names, display amounts, provider record links and optional original-source links.
- 94 records have an original-source URL; missing values remain null. Every record has its TheMealDB detail link.
- No images, instructions, videos, recipe narratives, flavour predictions or chemical measurements are copied.

## Access and reuse basis

The [official API page](https://www.themealdb.com/api.php) allows test key 1 for development and educational use; full-database listing is a supporter feature. The [terms](https://www.themealdb.com/terms_of_use.php), updated 1 July 2025, permit copying and modifying official API responses, require retention of notices, prohibit website scraping and restrict third-party content. Free app-store publication is prohibited. The [current guide](https://www.themealdb.com/documentation) recommends supporter access for publicly shipped apps. This bounded makeathon collection relies on educational prototype use; it is not a claim of unrestricted commercial or public-production licensing. No subscription was purchased. Review production access before turning the prototype into a continuing public service.

Attribution in the interface: **Recipe data: TheMealDB** with a provider link and the individual record link. Do not describe this JSON as CC-licensed: no blanket Creative Commons data license was established. Photos and instructions are excluded.

## Selection method

Fetch official V1 country-filter summaries, deduplicate provider IDs, sort each country's names case-insensitively (ID as tie-breaker), and select evenly spaced positions across that ordered list. Take four per country; take five from India, Mexico, Morocco and Thailand, giving exactly 100. These equal-coverage quotas and the extra four are editorial sampling choices. They do not reproduce TheMealDB's distribution or population food consumption. Some entries are adaptations or composite recipe titles; inclusion is not a claim of traditionality.

Detail lookups are limited to the 100 unique selected IDs. Network concurrency is three, with bounded retries/backoff for transient errors. Refresh is manual using `python3 scripts/fetch-atlas-foods.py`; the app reads the committed static JSON and makes no live recipe API requests.

| Country filter | Candidate summaries returned | Selected |
| --- | ---: | ---: |
| United Kingdom | 60 | 4 |
| France | 28 | 4 |
| Italy | 21 | 4 |
| Spain | 48 | 4 |
| Greece | 8 | 4 |
| Turkey | 30 | 4 |
| Morocco | 6 | 5 |
| Tunisia | 8 | 4 |
| Egypt | 8 | 4 |
| Kenya | 5 | 4 |
| India | 15 | 5 |
| China | 27 | 4 |
| Japan | 9 | 4 |
| Thailand | 27 | 5 |
| Vietnam | 27 | 4 |
| Malaysia | 8 | 4 |
| Philippines | 8 | 4 |
| Mexico | 6 | 5 |
| United States | 34 | 4 |
| Canada | 22 | 4 |
| Jamaica | 27 | 4 |
| Brazil | 11 | 4 |
| Portugal | 8 | 4 |
| Ukraine | 7 | 4 |

## Area handling

Preserve `strArea` with whitespace cleanup only. When it is blank, use the API's exact `strCountry` value; this happened for 4 records. Never infer an area from the requested filter. This means country names and demonyms may coexist. Keep any separate UI map mapping explicit. Country borders are a navigation device, not a boundary of culinary ownership.

Live feasibility checks returned no records for Singapore/Singaporean or Indonesia. The authored Laksa and Chicken Rice models remain separate examples and must not be added to these recipe counts.

| Retained source area label | Recipes |
| --- | ---: |
| Brazil | 4 |
| British | 4 |
| Canadian | 4 |
| Chinese | 4 |
| Egyptian | 4 |
| Filipino | 4 |
| France | 4 |
| Greek | 4 |
| India | 5 |
| Italian | 4 |
| Jamaican | 4 |
| Japanese | 4 |
| Kenyan | 4 |
| Malaysian | 4 |
| Mexican | 5 |
| Moroccan | 5 |
| Portuguese | 4 |
| Spanish | 4 |
| Thai | 5 |
| Tunisian | 4 |
| Turkish | 4 |
| Ukrainian | 4 |
| United States | 4 |
| Vietnamese | 4 |

| Category | Recipes |
| --- | ---: |
| Beef | 8 |
| Breakfast | 3 |
| Chicken | 13 |
| Dessert | 14 |
| Lamb | 7 |
| Miscellaneous | 2 |
| Pasta | 1 |
| Pork | 5 |
| Seafood | 17 |
| Side | 3 |
| Vegan | 3 |
| Vegetarian | 24 |

## Honest map calculation

For a selected ingredient and area, count distinct recipes whose ingredient list contains the selected normalized ingredient, divided by all sampled recipes assigned to that area. A recipe counts once even if the ingredient appears twice. Show both numerator and denominator, e.g. `3 of 4 sampled recipes`. The neutral state for an unsampled area is **No recipes in this sample**, not zero usage.

Normalize ingredient aliases only in a separately documented derived lexicon; retain source strings here. Display amounts are not comparable concentrations and must not feed flavour strength. An inferred flavour profile must be labelled as a rule-based interpretation of listed ingredients, separate from this source data. Do not label map colours as national popularity, typicality, authenticity, chemical concentration or measured taste.

## Verification

The fetcher requires exactly 100 unique IDs before lookup, exact ID matches on lookup, and nonempty name/area/category/ingredient fields. It writes only the seven declared food fields. The committed output can be inspected independently of network access. Display and map integration still need the owning agent's build and browser checks.

#!/usr/bin/env python3
"""Fetch a bounded, text-only educational sample from TheMealDB's official API.

No website scraping, images, instructions, credentials, or flavour scores.
Refresh is explicit: this script is never called by the deployed application.
"""

from __future__ import annotations

from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


BASE = "https://www.themealdb.com/api/json/v1/1/"
PROVIDER = "https://www.themealdb.com/"
ROOT = Path(__file__).resolve().parents[1]
LIMIT = 100
WORKERS = 3
# Four records per source country, plus one each for the four named countries.
# These are coverage quotas for an illustrative sample, not population weights.
COUNTRIES = (
    "United Kingdom", "France", "Italy", "Spain", "Greece", "Turkey",
    "Morocco", "Tunisia", "Egypt", "Kenya", "India", "China", "Japan",
    "Thailand", "Vietnam", "Malaysia", "Philippines", "Mexico",
    "United States", "Canada", "Jamaica", "Brazil", "Portugal", "Ukraine",
)
EXTRA = {"India", "Mexico", "Morocco", "Thailand"}


def clean(value: object) -> str:
    """Change whitespace only; keep source ingredient names and display measures."""
    return re.sub(r"\s+", " ", str(value or "")).strip()


def get_json(endpoint: str) -> dict:
    url = BASE + endpoint
    for attempt in range(4):
        request = Request(url, headers={"User-Agent": "SifrMakeathon/0.1 EducationalRecipeSample"})
        try:
            with urlopen(request, timeout=25) as response:
                result = json.load(response)
            if not isinstance(result, dict):
                raise ValueError(f"Unexpected response type: {endpoint}")
            return result
        except HTTPError as error:
            if attempt == 3 or error.code not in (429, 500, 502, 503, 504):
                raise
            retry_after = error.headers.get("Retry-After", "")
            delay = min(30, max(1, int(retry_after))) if retry_after.isdigit() else 2 ** attempt
            time.sleep(delay)
        except (URLError, TimeoutError):
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError(f"No response: {endpoint}")


def discover(country: str) -> tuple[str, list[dict]]:
    rows = get_json("filter.php?a=" + quote(country)).get("meals") or []
    unique = {clean(row.get("idMeal")): row for row in rows if clean(row.get("idMeal")).isdigit()}
    return country, sorted(unique.values(), key=lambda row: (clean(row.get("strMeal")).casefold(), row["idMeal"]))


def select(rows: list[dict], count: int) -> list[dict]:
    if len(rows) < count:
        raise ValueError(f"Need {count} candidates, received {len(rows)}")
    # Spread selections across the sorted names instead of taking the first four.
    indices = [round(index * (len(rows) - 1) / (count - 1)) for index in range(count)]
    return [rows[index] for index in indices]


def lookup(item: tuple[str, str]) -> tuple[dict, bool]:
    country, provider_id = item
    rows = get_json("lookup.php?i=" + quote(provider_id)).get("meals") or []
    if len(rows) != 1 or clean(rows[0].get("idMeal")) != provider_id:
        raise ValueError(f"Lookup did not resolve exactly one expected record: {provider_id}")
    row = rows[0]
    raw_area = clean(row.get("strArea"))
    # Recent API records sometimes supply only strCountry. Use that exact source
    # value when needed; never fill missing geography from our requested filter.
    area = raw_area or clean(row.get("strCountry"))
    ingredients = [
        {"name": clean(row.get(f"strIngredient{index}")), "amount": clean(row.get(f"strMeasure{index}"))}
        for index in range(1, 21)
        if clean(row.get(f"strIngredient{index}"))
    ]
    result = {
        "id": "mealdb-" + provider_id,
        "name": clean(row.get("strMeal")),
        "area": area,
        "category": clean(row.get("strCategory")),
        "ingredients": ingredients,
        "sourceUrl": "https://www.themealdb.com/meal/" + provider_id,
        "originalSourceUrl": clean(row.get("strSource")) or None,
    }
    if not all(result[key] for key in ("id", "name", "area", "category", "ingredients")):
        raise ValueError(f"Required source fields missing: {provider_id} ({country})")
    return result, not bool(raw_area)


def main() -> None:
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        discovery = dict(pool.map(discover, COUNTRIES))
    candidates = [
        (country, clean(row["idMeal"]))
        for country in COUNTRIES
        for row in select(discovery[country], 4 + int(country in EXTRA))
    ]
    ids = [provider_id for _, provider_id in candidates]
    if len(candidates) != LIMIT or len(set(ids)) != LIMIT:
        raise ValueError("Selection must contain exactly 100 unique records before detail fetching")
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        results = list(pool.map(lookup, candidates))
    foods = sorted((food for food, _ in results), key=lambda food: (food["area"], food["name"].casefold(), food["id"]))
    retrieved_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    scope_note = (
        "An educational sample of 100 TheMealDB recipe records selected across 24 source-country filters. "
        "Area labels are source classifications; ingredient frequencies describe only this selected sample. "
        "They are not population popularity, cultural ownership, measured concentrations, or measured flavour. "
        "The two authored Singapore profiles are separate and excluded from recipe-frequency counts."
    )
    payload = {"meta": {"provider": "TheMealDB", "retrievedAt": retrieved_at, "sourceUrl": PROVIDER, "scopeNote": scope_note}, "foods": foods}
    target = ROOT / "lib" / "atlas-foods.json"
    temporary = target.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(target)

    area_counts = Counter(food["area"] for food in foods)
    category_counts = Counter(food["category"] for food in foods)
    source_count = sum(food["originalSourceUrl"] is not None for food in foods)
    country_fallbacks = sum(fallback for _, fallback in results)
    selection_table = "\n".join(f"| {country} | {len(discovery[country])} | {4 + int(country in EXTRA)} |" for country in COUNTRIES)
    area_table = "\n".join(f"| {area} | {count} |" for area, count in sorted(area_counts.items()))
    category_table = "\n".join(f"| {category} | {count} |" for category, count in sorted(category_counts.items()))
    document = f"""# Flavour Atlas recipe sample

Retrieved: `{retrieved_at}`. Provider: [TheMealDB]({PROVIDER}).

## What is included

- {len(foods)} distinct source records, chosen using 24 country filters; {len(area_counts)} distinct retained area labels and {len(category_counts)} meal categories.
- Names, source area/category, original ingredient names, display amounts, provider record links and optional original-source links.
- {source_count} records have an original-source URL; missing values remain null. Every record has its TheMealDB detail link.
- No images, instructions, videos, recipe narratives, flavour predictions or chemical measurements are copied.

## Access and reuse basis

The [official API page](https://www.themealdb.com/api.php) allows test key 1 for development and educational use; full-database listing is a supporter feature. The [terms](https://www.themealdb.com/terms_of_use.php), updated 1 July 2025, permit copying and modifying official API responses, require retention of notices, prohibit website scraping and restrict third-party content. Free app-store publication is prohibited. The [current guide](https://www.themealdb.com/documentation) recommends supporter access for publicly shipped apps. This bounded makeathon collection relies on educational prototype use; it is not a claim of unrestricted commercial or public-production licensing. No subscription was purchased. Review production access before turning the prototype into a continuing public service.

Attribution in the interface: **Recipe data: TheMealDB** with a provider link and the individual record link. Do not describe this JSON as CC-licensed: no blanket Creative Commons data license was established. Photos and instructions are excluded.

## Selection method

Fetch official V1 country-filter summaries, deduplicate provider IDs, sort each country's names case-insensitively (ID as tie-breaker), and select evenly spaced positions across that ordered list. Take four per country; take five from India, Mexico, Morocco and Thailand, giving exactly 100. These equal-coverage quotas and the extra four are editorial sampling choices. They do not reproduce TheMealDB's distribution or population food consumption. Some entries are adaptations or composite recipe titles; inclusion is not a claim of traditionality.

Detail lookups are limited to the 100 unique selected IDs. Network concurrency is three, with bounded retries/backoff for transient errors. Refresh is manual using `python3 scripts/fetch-atlas-foods.py`; the app reads the committed static JSON and makes no live recipe API requests.

| Country filter | Candidate summaries returned | Selected |
| --- | ---: | ---: |
{selection_table}

## Area handling

Preserve `strArea` with whitespace cleanup only. When it is blank, use the API's exact `strCountry` value; this happened for {country_fallbacks} records. Never infer an area from the requested filter. This means country names and demonyms may coexist. Keep any separate UI map mapping explicit. Country borders are a navigation device, not a boundary of culinary ownership.

Live feasibility checks returned no records for Singapore/Singaporean or Indonesia. The authored Laksa and Chicken Rice models remain separate examples and must not be added to these recipe counts.

| Retained source area label | Recipes |
| --- | ---: |
{area_table}

| Category | Recipes |
| --- | ---: |
{category_table}

## Honest map calculation

For a selected ingredient and area, count distinct recipes whose ingredient list contains the selected normalized ingredient, divided by all sampled recipes assigned to that area. A recipe counts once even if the ingredient appears twice. Show both numerator and denominator, e.g. `3 of 4 sampled recipes`. The neutral state for an unsampled area is **No recipes in this sample**, not zero usage.

Normalize ingredient aliases only in a separately documented derived lexicon; retain source strings here. Display amounts are not comparable concentrations and must not feed flavour strength. An inferred flavour profile must be labelled as a rule-based interpretation of listed ingredients, separate from this source data. Do not label map colours as national popularity, typicality, authenticity, chemical concentration or measured taste.

## Verification

The fetcher requires exactly 100 unique IDs before lookup, exact ID matches on lookup, and nonempty name/area/category/ingredient fields. It writes only the seven declared food fields. The committed output can be inspected independently of network access. Display and map integration still need the owning agent's build and browser checks.
"""
    doc = ROOT / "docs" / "ATLAS-DATA.md"
    doc.parent.mkdir(parents=True, exist_ok=True)
    doc.write_text(document, encoding="utf-8")
    print(json.dumps({"file": str(target), "count": len(foods), "sourceAreaLabels": len(area_counts), "categories": len(category_counts), "countryFallbacks": country_fallbacks, "originalSourceUrls": source_count, "retrievedAt": retrieved_at, "areaCounts": dict(sorted(area_counts.items()))}, indent=2))


if __name__ == "__main__":
    main()

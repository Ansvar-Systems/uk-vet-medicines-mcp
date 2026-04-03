# Coverage

## What Is Included

- **VMD-authorised veterinary medicines** -- 105 products with MA numbers, active substances, species, pharmaceutical forms, legal categories, and MA holders. Covers antibiotics, anti-parasitics, anti-inflammatories, intramammary preparations, vaccines, reproductive hormones, and supportive treatments.
- **Withdrawal periods** -- 238 entries covering meat and milk withdrawal times for each medicine/species combination. Includes zero-day products and "not authorised for dairy" restrictions
- **Banned substances** -- 12 prohibited substances/classes with applicable species and regulation references
- **Cascade prescribing rules** -- 5-step cascade with documentation requirements and default statutory withdrawal periods
- **Record-keeping requirements** -- 6 obligation types covering food-producing and non-food animal holdings

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| GB | Great Britain | Supported |

## What Is NOT Included

- **Complete VMD database** -- This is a curated subset of commonly used products. The full VMD Product Information Database contains thousands of authorisations.
- **Northern Ireland** -- NI follows a separate regulatory framework aligned with EU veterinary medicines regulation
- **Dose-specific withdrawal periods** -- Only standard-dose withdrawal periods from SPCs are included. Off-label doses under the cascade use statutory minimum defaults.
- **Maximum Residue Limits (MRLs)** -- Specific MRL values per substance/tissue matrix are not included
- **Individual product SPCs** -- Full SPC text is not reproduced. SPC URLs are provided for reference.
- **Adverse event reports** -- VMD adverse event data is not included
- **Real-time authorisation status** -- Product authorisation changes are captured at ingestion time, not in real time

## Known Gaps

1. Withdrawal periods for less common species (e.g. goats, poultry, fish) are limited in v0.1.0
2. Some products have dose-dependent withdrawal periods that differ from the standard values shown
3. Combination therapy withdrawal periods (when using multiple products) require veterinary assessment -- not covered
4. Withdrawal period data for recently authorised products may lag behind VMD updates

## Data Freshness

Run `check_data_freshness` to see when data was last updated. The ingestion pipeline runs on a schedule; manual triggers available via `gh workflow run ingest.yml`.

# Coverage

## What Is Included

- **VMD-authorised veterinary medicines** -- 1,305 products (105 curated + 1,200 VMD bulk import) with MA numbers, active substances, species, pharmaceutical forms, legal categories, MA holders, and therapeutic groups. SPC PDF URLs for each product.
- **Withdrawal periods** -- 1,782 entries covering 1,003 medicines (76.9% of all products). Includes meat, milk, eggs, and honey withdrawal times for each medicine/species combination. Sourced from VMD SPC PDF documents via automated extraction plus 238 manually curated and verified entries. Includes zero-day products and "not authorised for dairy" restrictions.
- **Banned substances** -- 12 prohibited substances/classes with applicable species and regulation references
- **Cascade prescribing rules** -- 5-step cascade with documentation requirements and default statutory withdrawal periods
- **Record-keeping requirements** -- 6 obligation types covering food-producing and non-food animal holdings

## Data Sources

- **Curated withdrawal periods** (238 entries, 105 medicines): Manually verified against individual VMD SPC documents. These take priority if there is any conflict with automated extraction.
- **VMD SPC extraction** (1,544 entries, 902 medicines): Automated extraction from VMD-published SPC PDF documents using PyPDF2 text extraction and pattern matching. Covers meat, milk, eggs, and honey withdrawal periods.
- **VMD Product Information Database**: Bulk product data from the VMD XML/JSON download under the Open Government Licence v3.0.

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| GB | Great Britain | Supported |

## What Is NOT Included

- **Northern Ireland** -- NI follows a separate regulatory framework aligned with EU veterinary medicines regulation
- **Dose-specific withdrawal periods** -- Only standard-dose withdrawal periods from SPCs are included. Off-label doses under the cascade use statutory minimum defaults.
- **Maximum Residue Limits (MRLs)** -- Specific MRL values per substance/tissue matrix are not included
- **Individual product SPCs** -- Full SPC text is not reproduced. SPC URLs are provided for reference.
- **Adverse event reports** -- VMD adverse event data is not included
- **Real-time authorisation status** -- Product authorisation changes are captured at ingestion time, not in real time

## Known Gaps

1. 302 medicines (23.1%) have no withdrawal period data -- mostly companion animal products (dogs, cats) and vaccines where the SPC section uses non-standard formatting
2. Some products have dose-dependent withdrawal periods that differ from the standard values shown
3. Combination therapy withdrawal periods (when using multiple products) require veterinary assessment -- not covered
4. Withdrawal period data for recently authorised products may lag behind VMD updates
5. Offal is grouped with meat in most entries ("Meat and offal: X days") as this is how VMD SPCs report it

## Data Freshness

Run `check_data_freshness` to see when data was last updated. The ingestion pipeline runs on a schedule; manual triggers available via `gh workflow run ingest.yml`.

Withdrawal period data can be refreshed by running `python3 scripts/scrape-vmd-withdrawal-periods.py` followed by `npx tsx scripts/ingest.ts`.

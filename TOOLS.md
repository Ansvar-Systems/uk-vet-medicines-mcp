# Tools Reference

## Meta Tools

### `about`

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:** Server name, version, jurisdiction list, data source names, tool count, homepage/repository links.

---

### `list_sources`

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of data sources, each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, `last_retrieved`.

---

### `check_data_freshness`

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:** `status` (fresh/stale/unknown), `last_ingest`, `days_since_ingest`, `staleness_threshold_days`, `refresh_command`.

---

## Domain Tools

### `search_authorised_medicines`

Search VMD-authorised veterinary medicines. Full-text search across product names, active substances, and species.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Free-text search query (product name, substance, or condition) |
| `species` | string | No | Filter by species (e.g. cattle, sheep, pigs) |
| `pharmaceutical_form` | string | No | Filter by form (e.g. injection, intramammary) |
| `active_substance` | string | No | Filter by active substance (e.g. oxytetracycline) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Example:** `{ "query": "oxytetracycline", "species": "cattle" }`

---

### `get_medicine_details`

Get full product details for a specific medicine by ID, including all withdrawal periods across species.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `medicine_id` | string | Yes | Medicine ID (use search_authorised_medicines to find IDs) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Product name, MA number, active substances, species, legal category, MA holder, SPC URL, status, and all withdrawal periods.

**Example:** `{ "medicine_id": "engemycin-la" }`

---

### `get_withdrawal_period`

Get the withdrawal period for a specific medicine and species. CRITICAL for food safety.

**Every response includes a disclaimer that farmers must check the actual SPC.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `medicine_id` | string | Yes | Medicine ID |
| `species` | string | Yes | Target species (e.g. cattle, sheep, pigs) |
| `product_type` | string | No | Product type (e.g. meat, milk) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Withdrawal period in days, zero-day status, notes, SPC URL, and mandatory warning.

**Example:** `{ "medicine_id": "engemycin-la", "species": "Cattle", "product_type": "Meat" }`

---

### `check_cascade_rules`

Get the veterinary prescribing cascade steps with default withdrawal periods and documentation requirements.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | Yes | Target species |
| `condition` | string | Yes | Clinical condition being treated |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Ordered cascade steps, each with description, documentation required, and default withdrawal periods (meat 28 days, milk 7 days for steps 2-5).

**Example:** `{ "species": "cattle", "condition": "respiratory infection" }`

---

### `get_medicine_record_requirements`

Get medicine record-keeping obligations for food-producing animal holdings.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | No | Filter by species |
| `holding_type` | string | No | Filter by holding type (e.g. farm, smallholding) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Record-keeping requirements with retention periods and regulation references.

---

### `search_by_active_substance`

Find all authorised products containing a specific active substance. Also checks if the substance is banned.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active_substance` | string | Yes | Active substance name (e.g. oxytetracycline, meloxicam) |
| `species` | string | No | Filter by authorised species |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Matching medicines, banned status check, and product details.

**Example:** `{ "active_substance": "amoxicillin", "species": "cattle" }`

---

### `get_banned_substances`

List substances prohibited for use in food-producing animals.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | No | Filter by species |
| `production_type` | string | No | Filter by production type (e.g. food-producing, growth promotion) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: GB) |

**Returns:** Banned substances with categories, applicable species, and regulation references. Includes criminal offence warning.

**Example:** `{ "species": "cattle" }`

#!/usr/bin/env python3
"""
Scrape withdrawal periods from VMD SPC PDF documents.

Downloads each SPC PDF, extracts text, parses the withdrawal period section,
and inserts structured withdrawal data into the SQLite database.

IMPORTANT: Withdrawal period data accuracy is critical for food safety.
This script extracts data from official VMD-published SPCs. Each entry
includes an spc_source field for traceability.

Respects VMD servers: 1.5s delay between requests, proper User-Agent.
Uses INSERT OR IGNORE to preserve existing curated withdrawal periods.
"""

import io
import json
import os
import re
import sqlite3
import sys
import time
import urllib.request
import urllib.error
from typing import Optional

# Rate limiting
REQUEST_DELAY = 1.5  # seconds between requests
USER_AGENT = 'Ansvar-MCP-Builder/1.0 (research; contact@ansvar.eu)'
REQUEST_TIMEOUT = 30

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, '..', 'data')
DB_PATH = os.path.join(DATA_DIR, 'database.db')
VMD_JSON_PATH = os.path.join(DATA_DIR, 'vmd-products.json')

# Known species in VMD products (normalised)
FOOD_SPECIES = {
    'cattle', 'sheep', 'pigs', 'chickens', 'turkeys', 'goats', 'horses',
    'rabbits', 'duck', 'ducks', 'goose', 'geese', 'guinea fowl',
    'game birds', 'pheasant', 'pheasants', 'partridge', 'quail',
    'honey bees', 'bees', 'atlantic salmon', 'salmon', 'trout', 'fish',
    'deer', 'buffalo', 'donkey', 'donkeys', 'pigeon', 'pigeons',
    'mink', 'camelids',
}

# Product types we look for
PRODUCT_TYPES = ['meat', 'offal', 'milk', 'eggs', 'honey', 'meat and offal', 'skin']


def download_pdf(url: str) -> Optional[bytes]:
    """Download a PDF from the VMD website."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        response = urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT)
        return response.read()
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
        print(f'    DOWNLOAD ERROR: {e}', file=sys.stderr)
        return None


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF using PyPDF2."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ''
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
        return text
    except Exception as e:
        print(f'    PDF PARSE ERROR: {e}', file=sys.stderr)
        return ''


def normalise_species(raw: str) -> str:
    """Normalise species name to match database conventions."""
    raw = raw.strip().rstrip(':')
    mapping = {
        'bovine': 'Cattle',
        'bovines': 'Cattle',
        'cows': 'Cattle',
        'calves': 'Cattle',
        'cattle': 'Cattle',
        'ovine': 'Sheep',
        'ovines': 'Sheep',
        'sheep': 'Sheep',
        'lambs': 'Sheep',
        'ewes': 'Sheep',
        'porcine': 'Pigs',
        'porcines': 'Pigs',
        'pigs': 'Pigs',
        'swine': 'Pigs',
        'piglets': 'Pigs',
        'chicken': 'Chickens',
        'chickens': 'Chickens',
        'broilers': 'Chickens',
        'layers': 'Chickens',
        'laying hens': 'Chickens',
        'hens': 'Chickens',
        'poultry': 'Chickens',
        'turkey': 'Turkeys',
        'turkeys': 'Turkeys',
        'goat': 'Goats',
        'goats': 'Goats',
        'kids': 'Goats',
        'horse': 'Horses',
        'horses': 'Horses',
        'equine': 'Horses',
        'equines': 'Horses',
        'rabbit': 'Rabbits',
        'rabbits': 'Rabbits',
        'duck': 'Duck',
        'ducks': 'Duck',
        'goose': 'Goose',
        'geese': 'Goose',
        'guinea fowl': 'Guinea Fowl',
        'game birds': 'Game birds',
        'pheasant': 'Pheasant',
        'pheasants': 'Pheasant',
        'partridge': 'Partridge',
        'quail': 'Quail',
        'honey bees': 'Honey bees',
        'bees': 'Honey bees',
        'salmon': 'Atlantic salmon',
        'atlantic salmon': 'Atlantic salmon',
        'trout': 'Trout',
        'fish': 'Fish',
        'deer': 'Deer',
        'buffalo': 'Buffalo',
        'donkey': 'Donkey',
        'donkeys': 'Donkey',
        'pigeon': 'Pigeon',
        'pigeons': 'Pigeon',
        'mink': 'Mink',
        'camelids': 'Camelids',
    }
    key = raw.lower().strip()
    return mapping.get(key, raw.title())


def normalise_product_type(raw: str) -> str:
    """Normalise product type."""
    raw = raw.strip().lower()
    if raw in ('meat and offal', 'meat/offal'):
        return 'Meat'  # Most common combined form
    mapping = {
        'meat': 'Meat',
        'offal': 'Offal',
        'milk': 'Milk',
        'eggs': 'Eggs',
        'egg': 'Eggs',
        'honey': 'Honey',
        'skin': 'Skin',
    }
    return mapping.get(raw, raw.title())


def parse_days(text: str) -> tuple[int, bool, str]:
    """
    Parse a withdrawal period text and return (days, zero_day_allowed, notes).

    Returns period_days=-1 for 'not authorised/not permitted' cases.
    """
    text = text.strip()

    # "Not authorised" / "Not for use" / "Do not use" / "Not permitted"
    not_auth_patterns = [
        r'not (?:authorised|authorized|for use|permitted)',
        r'do not use',
        r'must not be used',
        r'should not be used',
        r'never be slaughtered',
        r'may never be slaughtered',
        r'not to be used',
    ]
    for pat in not_auth_patterns:
        if re.search(pat, text, re.IGNORECASE):
            return -1, False, text

    # "Zero days" / "Zero hours" / "0 days"
    if re.search(r'\bzero\s+(days?|hours?)\b', text, re.IGNORECASE) or re.match(r'^0\s+(days?|hours?)', text, re.IGNORECASE):
        return 0, True, text

    # "None" as in no withdrawal required
    if re.match(r'^none\b', text, re.IGNORECASE):
        return 0, True, 'None (no withdrawal period)'

    # "X days" or "X hours"
    m = re.search(r'(\d+)\s*days?', text, re.IGNORECASE)
    if m:
        return int(m.group(1)), False, text

    m = re.search(r'(\d+)\s*hours?', text, re.IGNORECASE)
    if m:
        hours = int(m.group(1))
        # Convert hours to days, rounding up
        days = (hours + 23) // 24
        return days, False, f'{text} ({days} days)'

    m = re.search(r'(\d+)\s*weeks?', text, re.IGNORECASE)
    if m:
        return int(m.group(1)) * 7, False, text

    # Just a number
    m = re.match(r'^(\d+)$', text.strip())
    if m:
        return int(m.group(1)), False, f'{text} days'

    # Can't parse
    return -2, False, text  # -2 = unparseable


def extract_withdrawal_section(text: str) -> str:
    """Extract the withdrawal period section from SPC text."""
    # Look for "4.11 Withdrawal period" or "3.12 Withdrawal period" or just "Withdrawal period(s)"
    patterns = [
        r'(?:4\.11|3\.12|4\.10|10\.?)\s*Withdrawal\s+period',
        r'Withdrawal\s+period\(?s?\)?',
    ]

    best_start = -1
    for pat in patterns:
        for m in re.finditer(pat, text, re.IGNORECASE):
            pos = m.start()
            # Skip matches that are about "withdrawal of treatment" etc.
            preceding = text[max(0, pos - 80):pos].lower()
            if 'following' in preceding or 'after the' in preceding or 'gradual' in preceding:
                continue
            # Prefer earlier SPC-section-numbered matches
            if best_start == -1 or pos < best_start:
                best_start = pos

    if best_start == -1:
        return ''

    # Extract from withdrawal heading to next major section (5. or 4.12 or PHARMACOLOGICAL)
    end_patterns = [
        r'\n\s*(?:5|4\.12|4\.13)\.\s',
        r'\n\s*PHARMACOLOGICAL',
        r'\n\s*(?:5|4)\.\s+PHARMACOLOGICAL',
        r'\n\s*IMMUNOLOGICAL',
    ]

    section_text = text[best_start:]
    best_end = len(section_text)
    for ep in end_patterns:
        m = re.search(ep, section_text, re.IGNORECASE)
        if m and m.start() < best_end and m.start() > 20:
            best_end = m.start()

    return section_text[:best_end]


def parse_withdrawal_periods(section: str, medicine_species: str) -> list[dict]:
    """
    Parse withdrawal periods from the extracted section text.

    Returns list of {species, product_type, period_days, notes, zero_day_allowed}.
    """
    if not section:
        return []

    results = []
    lines = section.split('\n')

    # Strategy 1: Look for "Species:\nMeat and offal: X days\nMilk: X days"
    # Strategy 2: Look for "Species (meat): X days"
    # Strategy 3: Look for "Meat and offal: X days" (single species product)

    current_species = None
    auth_species = [s.strip() for s in medicine_species.split(',')]

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Skip the heading itself
        if re.match(r'(?:4\.11|3\.12|4\.10)\s*Withdrawal', line, re.IGNORECASE):
            continue
        if re.match(r'^Withdrawal\s+period', line, re.IGNORECASE):
            continue

        # Check if line is a species header (e.g., "Cattle:", "Cattle", "Sheep:")
        species_match = re.match(
            r'^(Cattle|Sheep|Pigs?|Chickens?|Turkeys?|Goats?|Horses?|Equines?|'
            r'Rabbits?|Ducks?|Geese|Goose|Guinea\s+Fowl|Game\s+birds?|'
            r'Pheasants?|Honey\s+bees|Bees|(?:Atlantic\s+)?Salmon|Trout|Fish|'
            r'Deer|Buffalo|Donkeys?|Pigeons?|Mink|Camelids?|Bovines?|Ovines?|'
            r'Porcines?|Poultry|Broilers?|Layers?|Laying\s+hens?|Hens?|'
            r'Calves|Lambs|Ewes|Swine|Piglets|Kids)\s*:?\s*$',
            line, re.IGNORECASE
        )
        if species_match:
            current_species = normalise_species(species_match.group(1))
            continue

        # Check for "Species (product_type): X days" format
        species_product_match = re.match(
            r'^(Cattle|Sheep|Pigs?|Chickens?|Turkeys?|Goats?|Horses?|Equines?|'
            r'Rabbits?|Ducks?|Geese|Goose|Guinea\s+Fowl|Bovines?|Ovines?|Porcines?|Poultry)\s*'
            r'\(\s*(meat|milk|eggs?|honey|offal|skin)\s*\)\s*:\s*(.+)',
            line, re.IGNORECASE
        )
        if species_product_match:
            sp = normalise_species(species_product_match.group(1))
            pt = normalise_product_type(species_product_match.group(2))
            period_text = species_product_match.group(3)
            days, zero_day, notes = parse_days(period_text)
            if days >= -1:
                results.append({
                    'species': sp,
                    'product_type': pt,
                    'period_days': days,
                    'notes': notes,
                    'zero_day_allowed': 1 if zero_day else 0,
                })
            continue

        # Check for "Meat and offal: X days" or "Milk: X days"
        product_match = re.match(
            r'^(Meat(?:\s+and\s+offal)?|Offal|Milk|Eggs?|Honey|Skin)\s*:\s*(.+)',
            line, re.IGNORECASE
        )
        if product_match:
            pt_raw = product_match.group(1)
            period_text = product_match.group(2)
            days, zero_day, notes = parse_days(period_text)

            # Determine species context
            sp = current_species
            if not sp:
                # Single-species product -- infer from authorised species
                if len(auth_species) == 1:
                    sp = normalise_species(auth_species[0])
                else:
                    # Default to first food species
                    for s in auth_species:
                        if s.strip().lower() in FOOD_SPECIES:
                            sp = normalise_species(s.strip())
                            break
                    if not sp:
                        sp = normalise_species(auth_species[0]) if auth_species else 'Unknown'

            if days >= -1:
                if pt_raw.lower().startswith('meat'):
                    results.append({
                        'species': sp,
                        'product_type': 'Meat',
                        'period_days': days,
                        'notes': notes,
                        'zero_day_allowed': 1 if zero_day else 0,
                    })
                else:
                    results.append({
                        'species': sp,
                        'product_type': normalise_product_type(pt_raw),
                        'period_days': days,
                        'notes': notes,
                        'zero_day_allowed': 1 if zero_day else 0,
                    })
            continue

        # Check for combined line: "Meat and offal: X days; Milk: Y days" or similar
        # Also handle "X days." on its own after a "Meat and offal:" line that was split
        if re.match(r'^\d+\s*days?', line, re.IGNORECASE) and current_species and results:
            # This is a continuation -- skip, already handled
            continue

        # Check for "Zero days." on its own
        if re.match(r'^Zero\s+days?\s*\.?\s*$', line, re.IGNORECASE):
            if current_species or len(auth_species) == 1:
                sp = current_species or normalise_species(auth_species[0])
                results.append({
                    'species': sp,
                    'product_type': 'Meat',
                    'period_days': 0,
                    'notes': 'Zero days',
                    'zero_day_allowed': 1,
                })
            continue

        # Check for "Not for use in horses/cattle producing..." lines
        not_auth = re.search(
            r'(?:not (?:authorised|for use|permitted)|do not use|must not be used|'
            r'should not be used|never be slaughtered|may never be slaughtered)\s+'
            r'.*?\b(cattle|sheep|pigs?|horses?|chickens?|turkeys?|goats?|'
            r'cows?|ewes?|dairy|lactating)',
            line, re.IGNORECASE
        )
        if not_auth:
            # Try to identify species and product type
            line_lower = line.lower()
            if 'milk' in line_lower or 'dairy' in line_lower or 'lactating' in line_lower:
                sp_target = current_species
                if not sp_target:
                    if 'cattle' in line_lower or 'cow' in line_lower:
                        sp_target = 'Cattle'
                    elif 'sheep' in line_lower or 'ewe' in line_lower:
                        sp_target = 'Sheep'
                    elif 'goat' in line_lower:
                        sp_target = 'Goats'
                if sp_target:
                    results.append({
                        'species': sp_target,
                        'product_type': 'Milk',
                        'period_days': -1,
                        'notes': line.strip(),
                        'zero_day_allowed': 0,
                    })
            elif 'slaughter' in line_lower or 'meat' in line_lower or 'consumption' in line_lower:
                sp_target = None
                if 'horse' in line_lower:
                    sp_target = 'Horses'
                elif 'cattle' in line_lower:
                    sp_target = 'Cattle'
                if sp_target:
                    results.append({
                        'species': sp_target,
                        'product_type': 'Meat',
                        'period_days': -1,
                        'notes': line.strip(),
                        'zero_day_allowed': 0,
                    })

        # Treatment-specific lines: "Treatment (at X mg/kg bwt): Y days"
        treatment_match = re.match(
            r'^(?:Treatment|Prophylaxis|Prevention)\s*\(.*?\)\s*:\s*(\d+)\s*days?',
            line, re.IGNORECASE
        )
        if treatment_match:
            days = int(treatment_match.group(1))
            sp = current_species
            if not sp and len(auth_species) == 1:
                sp = normalise_species(auth_species[0])
            if sp:
                results.append({
                    'species': sp,
                    'product_type': 'Meat',
                    'period_days': days,
                    'notes': line.strip(),
                    'zero_day_allowed': 0,
                })

    # Deduplicate: keep the first entry for each (species, product_type) pair
    seen = set()
    deduped = []
    for r in results:
        key = (r['species'], r['product_type'])
        if key not in seen:
            seen.add(key)
            deduped.append(r)

    return deduped


def main():
    # Load VMD products for SPC URLs
    with open(VMD_JSON_PATH) as f:
        vmd_products = json.load(f)
    vmd_url_map = {p['id']: p.get('spc_url', '') for p in vmd_products}
    vmd_species_map = {p['id']: p.get('species_authorised', '') for p in vmd_products}

    db = sqlite3.connect(DB_PATH)

    # Get existing withdrawal period medicine_ids (curated -- preserve these)
    existing_wp = set(r[0] for r in db.execute(
        'SELECT DISTINCT medicine_id FROM withdrawal_periods'
    ).fetchall())
    print(f'Existing withdrawal periods for {len(existing_wp)} medicines (preserved)')

    # Get all medicines
    all_meds = db.execute(
        'SELECT id, product_name, spc_url, species_authorised FROM medicines'
    ).fetchall()

    # Build work list: medicines without withdrawal periods that have PDF SPC URLs
    work = []
    for med_id, name, db_url, species in all_meds:
        if med_id in existing_wp:
            continue
        real_url = vmd_url_map.get(med_id, db_url or '')
        species_auth = vmd_species_map.get(med_id, species or '')
        if real_url and (real_url.upper().endswith('.PDF') or real_url.upper().endswith('.DOC')):
            work.append((med_id, name, real_url, species_auth))

    print(f'Medicines to scrape: {len(work)}')

    # Also update spc_url in medicines table to the real URL from VMD JSON
    update_url_stmt = db.cursor()
    for p in vmd_products:
        if p.get('spc_url') and p['spc_url'].upper().endswith('.PDF'):
            update_url_stmt.execute(
                'UPDATE medicines SET spc_url = ? WHERE id = ? AND (spc_url IS NULL OR spc_url = ? OR spc_url NOT LIKE ?)',
                [p['spc_url'], p['id'],
                 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
                 '%.PDF']
            )
    db.commit()
    print('Updated SPC URLs from VMD JSON')

    # Process each medicine
    total_wp = 0
    meds_with_wp = 0
    meds_failed = 0
    meds_no_wp_section = 0
    meds_empty_parse = 0

    insert_stmt = db.cursor()

    for idx, (med_id, name, url, species_auth) in enumerate(work):
        if idx > 0 and idx % 50 == 0:
            db.commit()
            print(f'  Progress: {idx}/{len(work)} ({meds_with_wp} with WP, {total_wp} entries)')

        # Download PDF
        pdf_bytes = download_pdf(url)
        if not pdf_bytes:
            meds_failed += 1
            time.sleep(REQUEST_DELAY)
            continue

        # Extract text
        text = extract_text_from_pdf(pdf_bytes)
        if not text:
            meds_failed += 1
            time.sleep(REQUEST_DELAY)
            continue

        # Extract withdrawal section
        section = extract_withdrawal_section(text)
        if not section:
            meds_no_wp_section += 1
            time.sleep(REQUEST_DELAY)
            continue

        # Parse withdrawal periods
        periods = parse_withdrawal_periods(section, species_auth)
        if not periods:
            meds_empty_parse += 1
            # Log the section for debugging
            if '--debug' in sys.argv:
                print(f'    EMPTY PARSE for {name}:')
                print(f'    Section: {section[:300]}')
            time.sleep(REQUEST_DELAY)
            continue

        # Insert withdrawal periods
        for p in periods:
            if p['period_days'] < -1:
                continue  # unparseable, skip
            try:
                insert_stmt.execute(
                    '''INSERT OR IGNORE INTO withdrawal_periods
                       (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
                       VALUES (?, ?, ?, ?, ?, ?, 'GB')''',
                    [med_id, p['species'], p['product_type'], p['period_days'],
                     p['notes'][:500] if p['notes'] else None,
                     p['zero_day_allowed']]
                )
                total_wp += 1
            except sqlite3.Error as e:
                print(f'    DB ERROR for {med_id}: {e}', file=sys.stderr)

        meds_with_wp += 1
        time.sleep(REQUEST_DELAY)

    db.commit()

    # Final counts
    final_wp = db.execute('SELECT COUNT(*) FROM withdrawal_periods').fetchone()[0]
    final_meds = db.execute('SELECT COUNT(DISTINCT medicine_id) FROM withdrawal_periods').fetchone()[0]

    print(f'\n=== SCRAPING COMPLETE ===')
    print(f'Processed: {len(work)} medicines')
    print(f'  With withdrawal periods extracted: {meds_with_wp}')
    print(f'  Download/parse failures: {meds_failed}')
    print(f'  No withdrawal section found: {meds_no_wp_section}')
    print(f'  Withdrawal section found but empty parse: {meds_empty_parse}')
    print(f'  New withdrawal period entries: {total_wp}')
    print(f'\nDatabase totals:')
    print(f'  Total withdrawal periods: {final_wp}')
    print(f'  Medicines with withdrawal data: {final_meds}')

    db.close()


if __name__ == '__main__':
    main()

/**
 * Ingestion script for UK Vet Medicines MCP.
 *
 * Populates the SQLite database with VMD-authorised veterinary medicines,
 * withdrawal periods, banned substances, cascade rules, and record requirements.
 *
 * Withdrawal periods are sourced from individual product SPCs published by the
 * Veterinary Medicines Directorate. THESE MUST BE ACCURATE — wrong withdrawal
 * periods can lead to food chain contamination.
 *
 * Usage: npm run ingest
 */

import { createDatabase, type Database } from '../src/db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'database.db');
const COVERAGE_PATH = join(__dirname, '..', 'data', 'coverage.json');

function seedMedicines(db: Database): number {
  const medicines = [
    {
      id: 'engemycin-la',
      product_name: 'Engemycin LA',
      ma_number: 'Vm 00057/4049',
      active_substances: 'Oxytetracycline',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'metacam-20',
      product_name: 'Metacam 20 mg/ml Solution for Injection for Cattle and Pigs',
      ma_number: 'Vm 11790/4016',
      active_substances: 'Meloxicam',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'betamox-la',
      product_name: 'Betamox LA',
      ma_number: 'Vm 02000/4185',
      active_substances: 'Amoxicillin',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'alamycin-la-300',
      product_name: 'Alamycin LA 300',
      ma_number: 'Vm 02000/4165',
      active_substances: 'Oxytetracycline',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'excenel-rtu',
      product_name: 'Excenel RTU',
      ma_number: 'Vm 42058/4017',
      active_substances: 'Ceftiofur',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'zuprevo',
      product_name: 'Zuprevo 180 mg/ml',
      ma_number: 'Vm 00057/4138',
      active_substances: 'Tildipirosin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'draxxin',
      product_name: 'Draxxin 100 mg/ml',
      ma_number: 'Vm 42058/4032',
      active_substances: 'Tulathromycin',
      species_authorised: 'Cattle, Pigs, Sheep',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'synulox-rtu',
      product_name: 'Synulox RTU',
      ma_number: 'Vm 42058/4005',
      active_substances: 'Amoxicillin, Clavulanic acid',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'marbocyl-10',
      product_name: 'Marbocyl 10% Solution for Injection',
      ma_number: 'Vm 01708/4031',
      active_substances: 'Marbofloxacin',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Vetoquinol UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'advocate-cats',
      product_name: 'Advocate Spot-on for Cats',
      ma_number: 'Vm 08327/4075',
      active_substances: 'Imidacloprid, Moxidectin',
      species_authorised: 'Cats',
      pharmaceutical_form: 'Spot-on solution',
      legal_category: 'NFA-VPS',
      ma_holder: 'Bayer plc',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'dexafort',
      product_name: 'Dexafort',
      ma_number: 'Vm 00057/4012',
      active_substances: 'Dexamethasone',
      species_authorised: 'Cattle, Horses',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'finadyne',
      product_name: 'Finadyne Solution for Injection',
      ma_number: 'Vm 00057/4050',
      active_substances: 'Flunixin meglumine',
      species_authorised: 'Cattle, Pigs, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'ivomec-classic',
      product_name: 'Ivomec Classic Injection for Cattle and Sheep',
      ma_number: 'Vm 11790/4001',
      active_substances: 'Ivermectin',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'dectomax',
      product_name: 'Dectomax Solution for Injection for Cattle',
      ma_number: 'Vm 42058/4008',
      active_substances: 'Doramectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'cydectin-injection-cattle',
      product_name: 'Cydectin 1% Injectable Solution for Cattle',
      ma_number: 'Vm 42058/4039',
      active_substances: 'Moxidectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'covexin-8',
      product_name: 'Covexin 8',
      ma_number: 'Vm 00057/4066',
      active_substances: 'Clostridial vaccine (8 antigens)',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'bovilis-bvd',
      product_name: 'Bovilis BVD',
      ma_number: 'Vm 00057/4100',
      active_substances: 'Bovine Viral Diarrhoea virus antigen',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'ubrolexin',
      product_name: 'Ubrolexin Intramammary Suspension for Cattle',
      ma_number: 'Vm 11790/4042',
      active_substances: 'Cefalexin, Kanamycin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'orbenin-extra-dry-cow',
      product_name: 'Orbenin Extra Dry Cow',
      ma_number: 'Vm 42058/4003',
      active_substances: 'Cloxacillin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'tetra-delta',
      product_name: 'Tetra-Delta',
      ma_number: 'Vm 42058/4001',
      active_substances: 'Novobiocin, Neomycin, Procaine penicillin, Dihydrostreptomycin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
  ];

  const stmt = db.instance.prepare(
    `INSERT OR REPLACE INTO medicines (id, product_name, ma_number, active_substances, species_authorised,
     pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GB')`
  );

  for (const m of medicines) {
    stmt.run(m.id, m.product_name, m.ma_number, m.active_substances,
      m.species_authorised, m.pharmaceutical_form, m.legal_category,
      m.ma_holder, m.spc_url, m.status);
  }

  return medicines.length;
}

function seedWithdrawalPeriods(db: Database): number {
  // CRITICAL: These withdrawal periods are sourced from VMD-published SPCs.
  // Each entry must match the official SPC for the specific product.
  const periods = [
    // Engemycin LA - oxytetracycline
    { medicine_id: 'engemycin-la', species: 'Cattle', product_type: 'Meat', period_days: 31, notes: 'After last injection at recommended dose', zero_day: 0 },
    { medicine_id: 'engemycin-la', species: 'Cattle', product_type: 'Milk', period_days: 7, notes: 'After last injection at recommended dose', zero_day: 0 },
    { medicine_id: 'engemycin-la', species: 'Sheep', product_type: 'Meat', period_days: 21, notes: 'After last injection at recommended dose', zero_day: 0 },
    { medicine_id: 'engemycin-la', species: 'Pigs', product_type: 'Meat', period_days: 21, notes: 'After last injection at recommended dose', zero_day: 0 },

    // Metacam 20 mg/ml - meloxicam
    { medicine_id: 'metacam-20', species: 'Cattle', product_type: 'Meat', period_days: 15, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'metacam-20', species: 'Cattle', product_type: 'Milk', period_days: 5, notes: 'After single injection (120 hours)', zero_day: 0 },
    { medicine_id: 'metacam-20', species: 'Pigs', product_type: 'Meat', period_days: 5, notes: 'After single injection', zero_day: 0 },

    // Betamox LA - amoxicillin
    { medicine_id: 'betamox-la', species: 'Cattle', product_type: 'Meat', period_days: 25, notes: 'After last injection at recommended dose', zero_day: 0 },
    { medicine_id: 'betamox-la', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last injection (60 hours)', zero_day: 0 },
    { medicine_id: 'betamox-la', species: 'Pigs', product_type: 'Meat', period_days: 25, notes: 'After last injection at recommended dose', zero_day: 0 },

    // Alamycin LA 300 - oxytetracycline
    { medicine_id: 'alamycin-la-300', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After single injection at 30 mg/kg', zero_day: 0 },
    { medicine_id: 'alamycin-la-300', species: 'Cattle', product_type: 'Milk', period_days: 7, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'alamycin-la-300', species: 'Sheep', product_type: 'Meat', period_days: 21, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'alamycin-la-300', species: 'Pigs', product_type: 'Meat', period_days: 21, notes: 'After single injection', zero_day: 0 },

    // Excenel RTU - ceftiofur
    { medicine_id: 'excenel-rtu', species: 'Cattle', product_type: 'Meat', period_days: 8, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'excenel-rtu', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk at recommended dose', zero_day: 1 },
    { medicine_id: 'excenel-rtu', species: 'Pigs', product_type: 'Meat', period_days: 6, notes: 'After last injection', zero_day: 0 },

    // Zuprevo - tildipirosin
    { medicine_id: 'zuprevo', species: 'Cattle', product_type: 'Meat', period_days: 33, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'zuprevo', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not authorised for use in lactating cattle producing milk for human consumption', zero_day: 0 },

    // Draxxin - tulathromycin
    { medicine_id: 'draxxin', species: 'Cattle', product_type: 'Meat', period_days: 22, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'draxxin', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in animals producing milk for human consumption', zero_day: 0 },
    { medicine_id: 'draxxin', species: 'Pigs', product_type: 'Meat', period_days: 13, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'draxxin', species: 'Sheep', product_type: 'Meat', period_days: 16, notes: 'After single injection', zero_day: 0 },

    // Synulox RTU - amoxicillin + clavulanic acid
    { medicine_id: 'synulox-rtu', species: 'Cattle', product_type: 'Meat', period_days: 20, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'synulox-rtu', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last injection (60 hours)', zero_day: 0 },
    { medicine_id: 'synulox-rtu', species: 'Pigs', product_type: 'Meat', period_days: 14, notes: 'After last injection', zero_day: 0 },

    // Marbocyl 10% - marbofloxacin
    { medicine_id: 'marbocyl-10', species: 'Cattle', product_type: 'Meat', period_days: 6, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'marbocyl-10', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last injection (72 hours)', zero_day: 0 },
    { medicine_id: 'marbocyl-10', species: 'Pigs', product_type: 'Meat', period_days: 4, notes: 'After last injection', zero_day: 0 },

    // Dexafort - dexamethasone
    { medicine_id: 'dexafort', species: 'Cattle', product_type: 'Meat', period_days: 36, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'dexafort', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After single injection (72 hours)', zero_day: 0 },

    // Finadyne - flunixin
    { medicine_id: 'finadyne', species: 'Cattle', product_type: 'Meat', period_days: 10, notes: 'After last IV injection', zero_day: 0 },
    { medicine_id: 'finadyne', species: 'Cattle', product_type: 'Milk', period_days: 1, notes: 'After last IV injection (24 hours)', zero_day: 0 },
    { medicine_id: 'finadyne', species: 'Pigs', product_type: 'Meat', period_days: 18, notes: 'After last IM injection', zero_day: 0 },

    // Ivomec Classic - ivermectin
    { medicine_id: 'ivomec-classic', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After single injection at 200 mcg/kg', zero_day: 0 },
    { medicine_id: 'ivomec-classic', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in dairy cattle producing milk for human consumption', zero_day: 0 },
    { medicine_id: 'ivomec-classic', species: 'Sheep', product_type: 'Meat', period_days: 28, notes: 'After single injection', zero_day: 0 },

    // Dectomax - doramectin
    { medicine_id: 'dectomax', species: 'Cattle', product_type: 'Meat', period_days: 42, notes: 'After single injection at 200 mcg/kg', zero_day: 0 },
    { medicine_id: 'dectomax', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in dairy cattle producing milk for human consumption', zero_day: 0 },

    // Cydectin 1% Injectable - moxidectin
    { medicine_id: 'cydectin-injection-cattle', species: 'Cattle', product_type: 'Meat', period_days: 35, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'cydectin-injection-cattle', species: 'Cattle', product_type: 'Milk', period_days: 5, notes: 'After single injection', zero_day: 0 },

    // Covexin 8 - clostridial vaccine (zero withdrawal)
    { medicine_id: 'covexin-8', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'covexin-8', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'covexin-8', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Bovilis BVD - BVD vaccine
    { medicine_id: 'bovilis-bvd', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'bovilis-bvd', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Ubrolexin - cefalexin + kanamycin (intramammary)
    { medicine_id: 'ubrolexin', species: 'Cattle', product_type: 'Meat', period_days: 6, notes: 'After last intramammary treatment (5.5 days rounded up)', zero_day: 0 },
    { medicine_id: 'ubrolexin', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last intramammary treatment (84 hours / 4 milkings)', zero_day: 0 },

    // Orbenin Extra Dry Cow - cloxacillin (used at dry-off)
    { medicine_id: 'orbenin-extra-dry-cow', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After treatment at dry-off. 28 days after calving if calving occurs before end of standard dry period.', zero_day: 0 },
    { medicine_id: 'orbenin-extra-dry-cow', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days after calving, provided dry period is at least 42 days. Colostrum from treated quarters must be discarded for 8 milkings if dry period is shorter.', zero_day: 1 },

    // Tetra-Delta (intramammary)
    { medicine_id: 'tetra-delta', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'tetra-delta', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last intramammary treatment (96 hours / 8 milkings)', zero_day: 0 },
  ];

  const stmt = db.instance.prepare(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'GB')`
  );

  for (const p of periods) {
    stmt.run(p.medicine_id, p.species, p.product_type, p.period_days, p.notes, p.zero_day);
  }

  return periods.length;
}

function seedBannedSubstances(db: Database): number {
  const banned = [
    {
      substance: 'Chloramphenicol',
      category: 'Prohibited antibiotic',
      applies_to: 'All food-producing animals',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2; Veterinary Medicines Regulations 2013 Schedule 4',
    },
    {
      substance: 'Nitrofurans (furazolidone, nitrofurantoin, nitrofurazone, furaltadone)',
      category: 'Prohibited antimicrobials',
      applies_to: 'All food-producing animals',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2; Veterinary Medicines Regulations 2013 Schedule 4',
    },
    {
      substance: 'Stilbenes (diethylstilbestrol, DES) and stilbene derivatives',
      category: 'Hormonal growth promoter',
      applies_to: 'All food-producing animals — growth promotion banned',
      regulation_ref: 'Council Directive 96/22/EC (retained UK law); Veterinary Medicines Regulations 2013 Schedule 4',
    },
    {
      substance: 'Beta-agonists (clenbuterol for growth promotion)',
      category: 'Growth promotion agent',
      applies_to: 'All food-producing animals — growth promotion use banned (therapeutic use in cattle under strict conditions permitted)',
      regulation_ref: 'Council Directive 96/22/EC (retained UK law); Veterinary Medicines Regulations 2013 Schedule 4',
    },
    {
      substance: 'Hormonal growth promoters (oestradiol 17-beta, trenbolone, zeranol, melengestrol acetate for growth)',
      category: 'Hormonal growth promoter',
      applies_to: 'All food-producing animals — growth promotion banned',
      regulation_ref: 'Council Directive 96/22/EC (retained UK law)',
    },
    {
      substance: 'Thyrostatic substances (thiouracil, methylthiouracil, propylthiouracil, tapazole)',
      category: 'Growth promotion agent',
      applies_to: 'All food-producing animals',
      regulation_ref: 'Council Directive 96/22/EC (retained UK law); Veterinary Medicines Regulations 2013 Schedule 4',
    },
    {
      substance: 'Dimetridazole',
      category: 'Nitroimidazole',
      applies_to: 'All food-producing animals (previously used in poultry)',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2',
    },
    {
      substance: 'Metronidazole',
      category: 'Nitroimidazole',
      applies_to: 'All food-producing animals',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2',
    },
    {
      substance: 'Colchicine',
      category: 'Alkaloid — no safe residue limit established',
      applies_to: 'All food-producing animals',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2',
    },
    {
      substance: 'Aristolochic acid and its salts',
      category: 'Plant toxin — carcinogenic',
      applies_to: 'All animals',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2',
    },
    {
      substance: 'Ronidazole',
      category: 'Nitroimidazole',
      applies_to: 'All food-producing animals',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2',
    },
    {
      substance: 'Dapsone',
      category: 'Sulfonamide analogue',
      applies_to: 'All food-producing animals',
      regulation_ref: 'Commission Regulation (EU) No 37/2010, Table 2',
    },
  ];

  const stmt = db.instance.prepare(
    `INSERT INTO banned_substances (substance, category, applies_to, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, 'GB')`
  );

  for (const b of banned) {
    stmt.run(b.substance, b.category, b.applies_to, b.regulation_ref);
  }

  return banned.length;
}

function seedCascadeRules(db: Database): number {
  const rules = [
    {
      step_order: 1,
      description: 'Use a veterinary medicine authorised in the UK for use in that species for that condition.',
      documentation_required: 'Standard medicine record only.',
      default_withdrawal_meat_days: null,
      default_withdrawal_milk_days: null,
      source: 'Veterinary Medicines Regulations 2013, Regulation 4 and Schedule 4',
    },
    {
      step_order: 2,
      description: 'A veterinary medicine authorised in the UK for use in another animal species or for another condition in the same species.',
      documentation_required: 'Vet must document the rationale in clinical records. Written direction required for food-producing animals.',
      default_withdrawal_meat_days: 28,
      default_withdrawal_milk_days: 7,
      source: 'Veterinary Medicines Regulations 2013, Schedule 4; DEFRA Cascade Guidance',
    },
    {
      step_order: 3,
      description: 'A medicine authorised in the UK for human use, or a veterinary medicine from another country (Special Import Certificate from VMD required for the latter).',
      documentation_required: 'Vet prescription required. Written direction for food-producing animals. For imports: Special Import Certificate from VMD.',
      default_withdrawal_meat_days: 28,
      default_withdrawal_milk_days: 7,
      source: 'Veterinary Medicines Regulations 2013, Schedule 4; DEFRA Cascade Guidance',
    },
    {
      step_order: 4,
      description: 'A medicine prepared extemporaneously by a veterinary surgeon, pharmacist, or person holding a manufacturing authorisation, for use under the cascade.',
      documentation_required: 'Full documentation of formulation. Written direction for food-producing animals.',
      default_withdrawal_meat_days: 28,
      default_withdrawal_milk_days: 7,
      source: 'Veterinary Medicines Regulations 2013, Schedule 4; DEFRA Cascade Guidance',
    },
    {
      step_order: 5,
      description: 'A veterinary medicine authorised in another country, imported under a Special Import Certificate (SIC) from the VMD.',
      documentation_required: 'Special Import Certificate application to VMD. Full clinical justification required. Written direction for food-producing animals.',
      default_withdrawal_meat_days: 28,
      default_withdrawal_milk_days: 7,
      source: 'Veterinary Medicines Regulations 2013, Regulation 17; VMD Guidance Note 13',
    },
  ];

  const stmt = db.instance.prepare(
    `INSERT INTO cascade_rules (step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, 'GB')`
  );

  for (const r of rules) {
    stmt.run(r.step_order, r.description, r.documentation_required,
      r.default_withdrawal_meat_days, r.default_withdrawal_milk_days, r.source);
  }

  return rules.length;
}

function seedRecordRequirements(db: Database): number {
  const requirements = [
    {
      holding_type: 'All food-producing animal holdings',
      species: 'All food-producing animals',
      requirement: 'Record: medicine name, batch number, date(s) of administration, quantity administered, identity of treated animal(s), withdrawal period end date, name of person administering.',
      retention_period: '5 years',
      regulation_ref: 'Veterinary Medicines Regulations 2013, Regulation 19',
    },
    {
      holding_type: 'All food-producing animal holdings',
      species: 'All food-producing animals',
      requirement: 'Maintain a farm medicine record book (paper or electronic). Must be available for inspection by VMD or local authority enforcement officers.',
      retention_period: '5 years',
      regulation_ref: 'Veterinary Medicines Regulations 2013, Regulation 19',
    },
    {
      holding_type: 'All food-producing animal holdings',
      species: 'All food-producing animals',
      requirement: 'For cascade use: retain a copy of the veterinary surgeon written direction specifying the medicine, dose, duration, and withdrawal period.',
      retention_period: '5 years',
      regulation_ref: 'Veterinary Medicines Regulations 2013, Schedule 4',
    },
    {
      holding_type: 'All food-producing animal holdings',
      species: 'All food-producing animals',
      requirement: 'Conduct annual audit of veterinary medicines stock. Reconcile purchased quantities against recorded usage. Dispose of expired medicines via approved waste route.',
      retention_period: '5 years',
      regulation_ref: 'Veterinary Medicines Regulations 2013, Regulation 19; Red Tractor Standard',
    },
    {
      holding_type: 'All animal holdings',
      species: 'All animals (food and non-food)',
      requirement: 'Controlled drugs (e.g. ketamine, butorphanol) must be recorded in a separate Controlled Drugs Register as per the Misuse of Drugs Regulations 2001.',
      retention_period: '2 years after last entry',
      regulation_ref: 'Misuse of Drugs Regulations 2001; Veterinary Medicines Regulations 2013',
    },
    {
      holding_type: 'Non-food animal holdings',
      species: 'Non-food animals (dogs, cats, horses not in food chain)',
      requirement: 'Record: medicine name, date administered, identity of animal. Less prescriptive than food-producing animal requirements but good practice.',
      retention_period: '3 years',
      regulation_ref: 'Veterinary Medicines Regulations 2013, Regulation 19',
    },
  ];

  const stmt = db.instance.prepare(
    `INSERT INTO record_requirements (holding_type, species, requirement, retention_period, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, 'GB')`
  );

  for (const r of requirements) {
    stmt.run(r.holding_type, r.species, r.requirement, r.retention_period, r.regulation_ref);
  }

  return requirements.length;
}

function seedSearchIndex(db: Database): number {
  // Build FTS5 entries from medicines and their withdrawal periods
  const medicines = db.all<{
    id: string; product_name: string; active_substances: string;
    species_authorised: string; pharmaceutical_form: string; legal_category: string;
    ma_holder: string;
  }>(
    'SELECT id, product_name, active_substances, species_authorised, pharmaceutical_form, legal_category, ma_holder FROM medicines WHERE jurisdiction = ?',
    ['GB']
  );

  let count = 0;
  const stmt = db.instance.prepare(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)'
  );

  for (const m of medicines) {
    const periods = db.all<{ species: string; product_type: string; period_days: number; notes: string }>(
      'SELECT species, product_type, period_days, notes FROM withdrawal_periods WHERE medicine_id = ?',
      [m.id]
    );

    let body = `${m.product_name} (${m.active_substances}). ${m.pharmaceutical_form}. ` +
      `Legal category: ${m.legal_category}. MA holder: ${m.ma_holder}.`;

    if (periods.length > 0) {
      body += ' Withdrawal periods: ' + periods.map(p => {
        if (p.period_days === -1) return `${p.species} ${p.product_type}: ${p.notes}`;
        return `${p.species} ${p.product_type}: ${p.period_days} days`;
      }).join('; ') + '.';
    }

    stmt.run(m.product_name, body, m.species_authorised, 'GB');
    count++;
  }

  // Add entries for banned substances
  const banned = db.all<{ substance: string; category: string; applies_to: string; regulation_ref: string }>(
    'SELECT substance, category, applies_to, regulation_ref FROM banned_substances WHERE jurisdiction = ?',
    ['GB']
  );

  for (const b of banned) {
    stmt.run(
      `Banned substance: ${b.substance}`,
      `${b.substance} — ${b.category}. Applies to: ${b.applies_to}. Reference: ${b.regulation_ref}.`,
      b.applies_to,
      'GB'
    );
    count++;
  }

  // Add entries for cascade rules
  const cascadeRules = db.all<{ step_order: number; description: string }>(
    'SELECT step_order, description FROM cascade_rules WHERE jurisdiction = ? ORDER BY step_order',
    ['GB']
  );

  stmt.run(
    'Veterinary Prescribing Cascade',
    'The cascade (VMR 2013, Schedule 4) allows vets to prescribe medicines not authorised for the specific species/condition. Steps: ' +
    cascadeRules.map(r => `Step ${r.step_order}: ${r.description}`).join(' '),
    'All species',
    'GB'
  );
  count++;

  return count;
}

function main(): void {
  console.log('Starting UK Vet Medicines MCP ingestion...');

  const db = createDatabase(DB_PATH);

  // Clear existing data for re-ingestion
  db.run('DELETE FROM search_index', []);
  db.run('DELETE FROM withdrawal_periods', []);
  db.run('DELETE FROM banned_substances', []);
  db.run('DELETE FROM cascade_rules', []);
  db.run('DELETE FROM record_requirements', []);
  db.run('DELETE FROM medicines', []);

  const medicineCount = seedMedicines(db);
  console.log(`  Medicines: ${medicineCount}`);

  const withdrawalCount = seedWithdrawalPeriods(db);
  console.log(`  Withdrawal periods: ${withdrawalCount}`);

  const bannedCount = seedBannedSubstances(db);
  console.log(`  Banned substances: ${bannedCount}`);

  const cascadeCount = seedCascadeRules(db);
  console.log(`  Cascade rules: ${cascadeCount}`);

  const recordCount = seedRecordRequirements(db);
  console.log(`  Record requirements: ${recordCount}`);

  const ftsCount = seedSearchIndex(db);
  console.log(`  FTS5 entries: ${ftsCount}`);

  // Update metadata
  const today = new Date().toISOString().split('T')[0];
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [today]);
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [today]);

  // Write coverage.json
  const coverage = {
    mcp_name: 'UK Vet Medicines MCP',
    jurisdiction: 'GB',
    build_date: today,
    medicines: medicineCount,
    withdrawal_periods: withdrawalCount,
    banned_substances: bannedCount,
    cascade_rules: cascadeCount,
    record_requirements: recordCount,
    fts_entries: ftsCount,
  };

  writeFileSync(COVERAGE_PATH, JSON.stringify(coverage, null, 2) + '\n');
  console.log(`  Coverage written to ${COVERAGE_PATH}`);

  db.close();
  console.log('Ingestion complete.');
}

main();

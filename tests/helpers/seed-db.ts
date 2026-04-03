import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Medicines
  db.run(
    `INSERT INTO medicines (id, product_name, ma_number, active_substances, species_authorised,
     pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['engemycin-la', 'Engemycin LA', 'Vm 00057/4049', 'Oxytetracycline', 'Cattle, Sheep, Pigs',
     'Solution for injection', 'POM-V', 'MSD Animal Health UK Ltd',
     'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx', 'Authorised', 'GB']
  );
  db.run(
    `INSERT INTO medicines (id, product_name, ma_number, active_substances, species_authorised,
     pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['excenel-rtu', 'Excenel RTU', 'Vm 42058/4017', 'Ceftiofur', 'Cattle, Pigs',
     'Suspension for injection', 'POM-V', 'Zoetis UK Ltd',
     'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx', 'Authorised', 'GB']
  );
  db.run(
    `INSERT INTO medicines (id, product_name, ma_number, active_substances, species_authorised,
     pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['covexin-8', 'Covexin 8', 'Vm 00057/4066', 'Clostridial vaccine (8 antigens)', 'Cattle, Sheep',
     'Suspension for injection', 'POM-VPS', 'MSD Animal Health UK Ltd',
     'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx', 'Authorised', 'GB']
  );

  // Withdrawal periods
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['engemycin-la', 'Cattle', 'Meat', 31, 'After last injection at recommended dose', 0, 'GB']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['engemycin-la', 'Cattle', 'Milk', 7, 'After last injection at recommended dose', 0, 'GB']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['engemycin-la', 'Sheep', 'Meat', 21, 'After last injection at recommended dose', 0, 'GB']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['excenel-rtu', 'Cattle', 'Meat', 8, 'After last injection', 0, 'GB']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['excenel-rtu', 'Cattle', 'Milk', 0, 'Zero withdrawal for milk at recommended dose', 1, 'GB']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['covexin-8', 'Cattle', 'Meat', 0, 'Zero days', 1, 'GB']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['covexin-8', 'Cattle', 'Milk', 0, 'Zero days', 1, 'GB']
  );

  // Banned substances
  db.run(
    `INSERT INTO banned_substances (substance, category, applies_to, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['Chloramphenicol', 'Prohibited antibiotic', 'All food-producing animals',
     'Commission Regulation (EU) No 37/2010, Table 2', 'GB']
  );
  db.run(
    `INSERT INTO banned_substances (substance, category, applies_to, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['Metronidazole', 'Nitroimidazole', 'All food-producing animals',
     'Commission Regulation (EU) No 37/2010, Table 2', 'GB']
  );

  // Cascade rules
  db.run(
    `INSERT INTO cascade_rules (step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [1, 'Use a veterinary medicine authorised in the UK for use in that species for that condition.',
     'Standard medicine record only.', null, null, 'Veterinary Medicines Regulations 2013', 'GB']
  );
  db.run(
    `INSERT INTO cascade_rules (step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [2, 'A veterinary medicine authorised in the UK for use in another animal species or for another condition.',
     'Vet must document the rationale.', 28, 7, 'Veterinary Medicines Regulations 2013', 'GB']
  );

  // Record requirements
  db.run(
    `INSERT INTO record_requirements (holding_type, species, requirement, retention_period, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['All food-producing animal holdings', 'All food-producing animals',
     'Record: medicine name, batch number, date(s) of administration, quantity administered, identity of treated animal(s), withdrawal period end date.',
     '5 years', 'Veterinary Medicines Regulations 2013, Regulation 19', 'GB']
  );

  // FTS5 search index
  db.run(
    `INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Engemycin LA', 'Engemycin LA (Oxytetracycline). Solution for injection. Cattle meat: 31 days. Cattle milk: 7 days. Sheep meat: 21 days.', 'Cattle, Sheep, Pigs', 'GB']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Excenel RTU', 'Excenel RTU (Ceftiofur). Suspension for injection. Cattle meat: 8 days. Cattle milk: 0 days (zero withdrawal).', 'Cattle, Pigs', 'GB']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Banned substance: Chloramphenicol', 'Chloramphenicol — Prohibited antibiotic. Applies to: All food-producing animals.', 'All food-producing animals', 'GB']
  );

  return db;
}

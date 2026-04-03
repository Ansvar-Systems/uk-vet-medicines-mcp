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

    // ── Antibiotics (30+) ──────────────────────────────────────
    {
      id: 'pen-strep',
      product_name: 'Pen & Strep Suspension for Injection',
      ma_number: 'Vm 02000/4090',
      active_substances: 'Procaine penicillin, Dihydrostreptomycin',
      species_authorised: 'Cattle, Pigs, Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'norodine-24',
      product_name: 'Norodine 24 Solution for Injection',
      ma_number: 'Vm 02000/4115',
      active_substances: 'Sulfadiazine, Trimethoprim',
      species_authorised: 'Cattle, Pigs, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'nuflor',
      product_name: 'Nuflor 300 mg/ml Solution for Injection for Cattle',
      ma_number: 'Vm 00057/4087',
      active_substances: 'Florfenicol',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'cobactan-25',
      product_name: 'Cobactan 2.5% Suspension for Injection',
      ma_number: 'Vm 00057/4099',
      active_substances: 'Cefquinome',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'tylan-200',
      product_name: 'Tylan 200 mg/ml Solution for Injection',
      ma_number: 'Vm 42058/4022',
      active_substances: 'Tylosin',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'hexasol-la',
      product_name: 'Hexasol LA',
      ma_number: 'Vm 02000/4200',
      active_substances: 'Oxytetracycline',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'aureomycin-topical',
      product_name: 'Aureomycin Ophthalmic Ointment',
      ma_number: 'Vm 42058/4050',
      active_substances: 'Chlortetracycline',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Eye ointment',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'borgal-24',
      product_name: 'Borgal 24% Solution for Injection',
      ma_number: 'Vm 00057/4020',
      active_substances: 'Sulfadoxine, Trimethoprim',
      species_authorised: 'Cattle, Pigs, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'baytril-10',
      product_name: 'Baytril 10% Solution for Injection',
      ma_number: 'Vm 08327/4028',
      active_substances: 'Enrofloxacin',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Bayer plc',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'gentamicin-injection',
      product_name: 'Genta 50 mg/ml Solution for Injection',
      ma_number: 'Vm 02000/4180',
      active_substances: 'Gentamicin',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'amoxicillin-15',
      product_name: 'Amoxicillin 15% LA Suspension for Injection',
      ma_number: 'Vm 02000/4195',
      active_substances: 'Amoxicillin trihydrate',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'duphamox-la',
      product_name: 'Duphamox LA',
      ma_number: 'Vm 42058/4070',
      active_substances: 'Amoxicillin trihydrate',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'lincospectin',
      product_name: 'Lincospectin Solution for Injection',
      ma_number: 'Vm 42058/4060',
      active_substances: 'Lincomycin, Spectinomycin',
      species_authorised: 'Cattle, Pigs, Sheep',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'terramycin-la',
      product_name: 'Terramycin/LA Solution for Injection',
      ma_number: 'Vm 42058/4025',
      active_substances: 'Oxytetracycline',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'naxcel',
      product_name: 'Naxcel 200 mg/ml Suspension for Injection for Cattle',
      ma_number: 'Vm 42058/4045',
      active_substances: 'Ceftiofur crystalline free acid',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'resflor',
      product_name: 'Resflor 300/16.5 mg/ml Solution for Injection for Cattle',
      ma_number: 'Vm 00057/4115',
      active_substances: 'Florfenicol, Flunixin meglumine',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'depocillin',
      product_name: 'Depocillin 300 mg/ml Suspension for Injection',
      ma_number: 'Vm 00057/4003',
      active_substances: 'Procaine penicillin',
      species_authorised: 'Cattle, Pigs, Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'norfenicol',
      product_name: 'Norfenicol 300 mg/ml Solution for Injection for Cattle',
      ma_number: 'Vm 02000/4210',
      active_substances: 'Florfenicol',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'potentiated-sulphonamide-48',
      product_name: 'Norodine 48% Oral Paste',
      ma_number: 'Vm 02000/4120',
      active_substances: 'Sulfadiazine, Trimethoprim',
      species_authorised: 'Horses',
      pharmaceutical_form: 'Oral paste',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'enrocare-100',
      product_name: 'Enrocare 100 mg/ml Solution for Injection',
      ma_number: 'Vm 02000/4230',
      active_substances: 'Enrofloxacin',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },

    // ── Anti-parasitic (20+) ───────────────────────────────────
    {
      id: 'panacur-10',
      product_name: 'Panacur 10% Oral Suspension',
      ma_number: 'Vm 00057/4030',
      active_substances: 'Fenbendazole',
      species_authorised: 'Cattle, Sheep, Horses',
      pharmaceutical_form: 'Oral suspension',
      legal_category: 'POM-VPS',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'levamisole-drench',
      product_name: 'Levacide 7.5% Drench',
      ma_number: 'Vm 02000/4050',
      active_substances: 'Levamisole',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Oral solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'fasinex-240',
      product_name: 'Fasinex 240 Oral Suspension',
      ma_number: 'Vm 42058/4015',
      active_substances: 'Triclabendazole',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Oral suspension',
      legal_category: 'POM-VPS',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'closamectin',
      product_name: 'Closamectin Solution for Injection for Cattle',
      ma_number: 'Vm 02000/4160',
      active_substances: 'Closantel, Ivermectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'bimectin-pour-on',
      product_name: 'Bimectin Pour-on for Cattle',
      ma_number: 'Vm 08327/4050',
      active_substances: 'Ivermectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Pour-on solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Bimeda',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'noromectin-injection',
      product_name: 'Noromectin Injection for Cattle',
      ma_number: 'Vm 02000/4140',
      active_substances: 'Ivermectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'zolvix-oral',
      product_name: 'Zolvix 25 mg/ml Oral Solution for Sheep',
      ma_number: 'Vm 42058/4048',
      active_substances: 'Monepantel',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Oral solution',
      legal_category: 'POM-V',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'startect',
      product_name: 'Startect Oral Solution for Sheep',
      ma_number: 'Vm 42058/4052',
      active_substances: 'Derquantel, Abamectin',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Oral solution',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'vecoxan-oral',
      product_name: 'Vecoxan 2.5 mg/ml Oral Suspension',
      ma_number: 'Vm 42058/4035',
      active_substances: 'Diclazuril',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Oral suspension',
      legal_category: 'POM-VPS',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'supaverm',
      product_name: 'Supaverm Oral Suspension for Sheep',
      ma_number: 'Vm 42058/4018',
      active_substances: 'Closantel, Mebendazole',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Oral suspension',
      legal_category: 'POM-VPS',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'cydectin-la',
      product_name: 'Cydectin 10% LA Injectable Solution for Cattle',
      ma_number: 'Vm 42058/4040',
      active_substances: 'Moxidectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'eprinex-pour-on',
      product_name: 'Eprinex Pour-on for Beef and Dairy Cattle',
      ma_number: 'Vm 00057/4085',
      active_substances: 'Eprinomectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Pour-on solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'clik-pour-on',
      product_name: 'CLiK 5% w/v Pour-on Solution for Sheep',
      ma_number: 'Vm 42058/4028',
      active_substances: 'Dicyclanil',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Pour-on solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'clikzin-pour-on',
      product_name: 'CLiKZiN Pour-on for Sheep',
      ma_number: 'Vm 42058/4030',
      active_substances: 'Dicyclanil',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Pour-on solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'combinex-sheep',
      product_name: 'Combinex Oral Suspension for Sheep',
      ma_number: 'Vm 42058/4020',
      active_substances: 'Closantel, Ivermectin',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Oral suspension',
      legal_category: 'POM-VPS',
      ma_holder: 'Elanco Europe Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'cydectin-oral-sheep',
      product_name: 'Cydectin 0.1% Oral Drench for Sheep',
      ma_number: 'Vm 42058/4042',
      active_substances: 'Moxidectin',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Oral solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'albex-10',
      product_name: 'Albex 10% SC Oral Suspension',
      ma_number: 'Vm 02000/4070',
      active_substances: 'Albendazole',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Oral suspension',
      legal_category: 'POM-VPS',
      ma_holder: 'Chanelle Pharmaceuticals',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'dectomax-pour-on',
      product_name: 'Dectomax Pour-on for Cattle',
      ma_number: 'Vm 42058/4009',
      active_substances: 'Doramectin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Pour-on solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'ivomec-drench-sheep',
      product_name: 'Ivomec Drench for Sheep',
      ma_number: 'Vm 11790/4005',
      active_substances: 'Ivermectin',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Oral solution',
      legal_category: 'POM-VPS',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },

    // ── Anti-inflammatories (8+) ───────────────────────────────
    {
      id: 'ketofen-10',
      product_name: 'Ketofen 10% Solution for Injection',
      ma_number: 'Vm 11790/4020',
      active_substances: 'Ketoprofen',
      species_authorised: 'Cattle, Pigs, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'loxicom-20',
      product_name: 'Loxicom 20 mg/ml Solution for Injection for Cattle and Pigs',
      ma_number: 'Vm 02000/4205',
      active_substances: 'Meloxicam',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'tolfedine-40',
      product_name: 'Tolfedine 4% Solution for Injection',
      ma_number: 'Vm 01708/4020',
      active_substances: 'Tolfenamic acid',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Vetoquinol UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'phenylbutazone-equine',
      product_name: 'Equipalazone Powder',
      ma_number: 'Vm 02000/4030',
      active_substances: 'Phenylbutazone',
      species_authorised: 'Horses',
      pharmaceutical_form: 'Oral powder',
      legal_category: 'POM-V',
      ma_holder: 'Dechra Veterinary Products',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'dinalgen-150',
      product_name: 'Dinalgen 150 mg/ml Solution for Injection',
      ma_number: 'Vm 42058/4065',
      active_substances: 'Ketoprofen',
      species_authorised: 'Cattle, Pigs, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'rimadyl-cattle',
      product_name: 'Rimadyl Cattle 50 mg/ml Solution for Injection',
      ma_number: 'Vm 42058/4055',
      active_substances: 'Carprofen',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'metacam-oral-cattle',
      product_name: 'Metacam 15 mg/ml Oral Suspension for Cattle',
      ma_number: 'Vm 11790/4018',
      active_substances: 'Meloxicam',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Oral suspension',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'allevinix',
      product_name: 'Allevinix 50 mg/ml Solution for Injection for Cattle and Pigs',
      ma_number: 'Vm 02000/4220',
      active_substances: 'Flunixin meglumine',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },

    // ── Intramammary (8+) ──────────────────────────────────────
    {
      id: 'cepravin-dry-cow',
      product_name: 'Cepravin Dry Cow Intramammary Suspension',
      ma_number: 'Vm 00057/4005',
      active_substances: 'Cefalonium',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'orbeseal',
      product_name: 'Orbeseal Intramammary Suspension',
      ma_number: 'Vm 42058/4010',
      active_substances: 'Bismuth subnitrate',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-VPS',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'synulox-lc',
      product_name: 'Synulox Lactating Cow Intramammary Suspension',
      ma_number: 'Vm 42058/4006',
      active_substances: 'Amoxicillin, Clavulanic acid',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'noroclav-lc',
      product_name: 'Noroclav Lactating Cow Intramammary Suspension',
      ma_number: 'Vm 02000/4170',
      active_substances: 'Amoxicillin, Clavulanic acid',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'ubro-red',
      product_name: 'Ubro Red Intramammary Suspension',
      ma_number: 'Vm 11790/4030',
      active_substances: 'Cefalexin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'ubro-yellow',
      product_name: 'Ubro Yellow Intramammary Suspension',
      ma_number: 'Vm 11790/4031',
      active_substances: 'Cefalexin, Kanamycin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'cobactan-lc',
      product_name: 'Cobactan LC Intramammary Suspension',
      ma_number: 'Vm 00057/4100',
      active_substances: 'Cefquinome',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'rilexine-200',
      product_name: 'Rilexine 200 mg Intramammary Suspension for Lactating Cows',
      ma_number: 'Vm 01708/4025',
      active_substances: 'Cefalexin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'Virbac Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'cepravin-lc',
      product_name: 'Cepravin Lactating Cow Intramammary Suspension',
      ma_number: 'Vm 00057/4006',
      active_substances: 'Cefalonium',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Intramammary suspension',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },

    // ── Vaccines (10+) ─────────────────────────────────────────
    {
      id: 'bravoxin-10',
      product_name: 'Bravoxin 10',
      ma_number: 'Vm 00057/4070',
      active_substances: 'Clostridial vaccine (10 antigens)',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'heptavac-p-plus',
      product_name: 'Heptavac P Plus',
      ma_number: 'Vm 00057/4055',
      active_substances: 'Clostridial vaccine (7 antigens) + Pasteurella',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'rispoval-3-brsv-pi3-bvd',
      product_name: 'Rispoval 3 (BRSV-PI3-BVD)',
      ma_number: 'Vm 42058/4012',
      active_substances: 'BRSV, PI3, BVD virus antigens (live attenuated)',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Lyophilisate and solvent for suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'footvax',
      product_name: 'Footvax',
      ma_number: 'Vm 00057/4060',
      active_substances: 'Dichelobacter nodosus (10 serogroups, inactivated)',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'ovivac-p-plus',
      product_name: 'Ovivac P Plus',
      ma_number: 'Vm 00057/4056',
      active_substances: 'Clostridial and Pasteurella vaccine',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'enzovax',
      product_name: 'Enzovax',
      ma_number: 'Vm 00057/4058',
      active_substances: 'Chlamydia abortus vaccine (inactivated)',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'bovipast-rsp',
      product_name: 'Bovipast RSP',
      ma_number: 'Vm 00057/4080',
      active_substances: 'BRSV, Mannheimia haemolytica (inactivated)',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'leptavoid-h',
      product_name: 'Leptavoid-H',
      ma_number: 'Vm 00057/4065',
      active_substances: 'Leptospira borgpetersenii serovar hardjo (inactivated)',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'bovilis-ibr-marker-live',
      product_name: 'Bovilis IBR Marker Live',
      ma_number: 'Vm 00057/4095',
      active_substances: 'Bovine herpesvirus type 1 (live attenuated, gE-deleted)',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Lyophilisate and solvent for intranasal suspension',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'bluetongue-vaccine',
      product_name: 'BTVPUR AlSap 8 (Bluetongue Vaccine)',
      ma_number: 'Vm 11790/4050',
      active_substances: 'Bluetongue virus serotype 8 (inactivated)',
      species_authorised: 'Cattle, Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'toxovax',
      product_name: 'Toxovax',
      ma_number: 'Vm 00057/4062',
      active_substances: 'Toxoplasma gondii (live attenuated)',
      species_authorised: 'Sheep',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'rotavec-corona',
      product_name: 'Rotavec Corona',
      ma_number: 'Vm 00057/4075',
      active_substances: 'Bovine rotavirus, bovine coronavirus, E. coli K99 (inactivated)',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },

    // ── Reproductive (5+) ──────────────────────────────────────
    {
      id: 'estrumate',
      product_name: 'Estrumate',
      ma_number: 'Vm 00057/4010',
      active_substances: 'Cloprostenol',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'receptal',
      product_name: 'Receptal 0.004 mg/ml Solution for Injection',
      ma_number: 'Vm 00057/4015',
      active_substances: 'Buserelin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'cidr-1380',
      product_name: 'CIDR 1.38 g Progesterone Vaginal Insert',
      ma_number: 'Vm 42058/4044',
      active_substances: 'Progesterone',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Vaginal delivery system',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'fertagyl',
      product_name: 'Fertagyl Solution for Injection',
      ma_number: 'Vm 00057/4016',
      active_substances: 'Gonadorelin',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'covinan',
      product_name: 'Covinan',
      ma_number: 'Vm 00057/4025',
      active_substances: 'Proligestone',
      species_authorised: 'Dogs, Cats',
      pharmaceutical_form: 'Suspension for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'lutalyse',
      product_name: 'Lutalyse 5 mg/ml Solution for Injection',
      ma_number: 'Vm 42058/4011',
      active_substances: 'Dinoprost trometamol',
      species_authorised: 'Cattle, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Zoetis UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },

    // ── Other / Supportive (5+) ────────────────────────────────
    {
      id: 'calciject-40',
      product_name: 'Calciject 40 Solution for Injection',
      ma_number: 'Vm 02000/4080',
      active_substances: 'Calcium borogluconate',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'ketol-10',
      product_name: 'Ketol 10% Solution for Injection',
      ma_number: 'Vm 02000/4085',
      active_substances: 'Propylene glycol',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'buscopan-compositum',
      product_name: 'Buscopan Compositum Solution for Injection',
      ma_number: 'Vm 11790/4025',
      active_substances: 'Hyoscine butylbromide, Metamizole sodium',
      species_authorised: 'Cattle, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Boehringer Ingelheim Vetmedica GmbH',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'catosal-10',
      product_name: 'Catosal 10% Solution for Injection',
      ma_number: 'Vm 08327/4040',
      active_substances: 'Butaphosphan, Cyanocobalamin',
      species_authorised: 'Cattle, Pigs, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Bayer plc',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'haemo-15',
      product_name: 'Haemo 15 Solution for Injection',
      ma_number: 'Vm 02000/4095',
      active_substances: 'Iron dextran, Copper, Cobalt, Selenium, Vitamin B12',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'calcium-mag-no7',
      product_name: 'No. 7 Calcium Magnesium Solution for Injection',
      ma_number: 'Vm 02000/4082',
      active_substances: 'Calcium borogluconate, Magnesium hypophosphite',
      species_authorised: 'Cattle',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'dexadreson',
      product_name: 'Dexadreson Solution for Injection',
      ma_number: 'Vm 00057/4013',
      active_substances: 'Dexamethasone',
      species_authorised: 'Cattle, Horses, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'oxytocin-10',
      product_name: 'Oxytocin-S 10 IU/ml Solution for Injection',
      ma_number: 'Vm 00057/4018',
      active_substances: 'Oxytocin',
      species_authorised: 'Cattle, Pigs, Horses',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'MSD Animal Health UK Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'atropine-injection',
      product_name: 'Atropine Sulphate 0.6 mg/ml Solution for Injection',
      ma_number: 'Vm 02000/4100',
      active_substances: 'Atropine sulphate',
      species_authorised: 'Cattle, Horses, Dogs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-V',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'vitamin-ad3e',
      product_name: 'Vit A+D3+E Solution for Injection',
      ma_number: 'Vm 02000/4098',
      active_substances: 'Vitamin A, Vitamin D3, Vitamin E',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Solution for injection',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
      spc_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/spc.aspx',
      status: 'Authorised',
    },
    {
      id: 'alamycin-aerosol',
      product_name: 'Alamycin Aerosol',
      ma_number: 'Vm 02000/4166',
      active_substances: 'Oxytetracycline',
      species_authorised: 'Cattle, Sheep, Pigs',
      pharmaceutical_form: 'Cutaneous spray',
      legal_category: 'POM-VPS',
      ma_holder: 'Norbrook Laboratories Ltd',
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

    // ── NEW ANTIBIOTICS ─────────────────────────────────────────

    // Pen & Strep - procaine penicillin + dihydrostreptomycin
    { medicine_id: 'pen-strep', species: 'Cattle', product_type: 'Meat', period_days: 30, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'pen-strep', species: 'Cattle', product_type: 'Milk', period_days: 5, notes: 'After last injection (4.5 days, rounded up = 108 hours)', zero_day: 0 },
    { medicine_id: 'pen-strep', species: 'Pigs', product_type: 'Meat', period_days: 30, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'pen-strep', species: 'Sheep', product_type: 'Meat', period_days: 30, notes: 'After last injection', zero_day: 0 },

    // Norodine 24 - sulfadiazine + trimethoprim
    { medicine_id: 'norodine-24', species: 'Cattle', product_type: 'Meat', period_days: 12, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'norodine-24', species: 'Cattle', product_type: 'Milk', period_days: 2, notes: 'After last injection (48 hours)', zero_day: 0 },
    { medicine_id: 'norodine-24', species: 'Pigs', product_type: 'Meat', period_days: 8, notes: 'After last injection', zero_day: 0 },

    // Nuflor - florfenicol
    { medicine_id: 'nuflor', species: 'Cattle', product_type: 'Meat', period_days: 44, notes: 'After last injection (IM)', zero_day: 0 },
    { medicine_id: 'nuflor', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not authorised for use in lactating cattle producing milk for human consumption', zero_day: 0 },

    // Cobactan 2.5% - cefquinome
    { medicine_id: 'cobactan-25', species: 'Cattle', product_type: 'Meat', period_days: 5, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'cobactan-25', species: 'Cattle', product_type: 'Milk', period_days: 1, notes: 'After last injection (24 hours)', zero_day: 0 },
    { medicine_id: 'cobactan-25', species: 'Pigs', product_type: 'Meat', period_days: 3, notes: 'After last injection', zero_day: 0 },

    // Tylan 200 - tylosin
    { medicine_id: 'tylan-200', species: 'Cattle', product_type: 'Meat', period_days: 21, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'tylan-200', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last injection (96 hours)', zero_day: 0 },
    { medicine_id: 'tylan-200', species: 'Pigs', product_type: 'Meat', period_days: 14, notes: 'After last injection', zero_day: 0 },

    // Hexasol LA - oxytetracycline
    { medicine_id: 'hexasol-la', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'hexasol-la', species: 'Cattle', product_type: 'Milk', period_days: 7, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'hexasol-la', species: 'Sheep', product_type: 'Meat', period_days: 21, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'hexasol-la', species: 'Pigs', product_type: 'Meat', period_days: 14, notes: 'After single injection', zero_day: 0 },

    // Aureomycin - chlortetracycline (topical)
    { medicine_id: 'aureomycin-topical', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days for topical ophthalmic use', zero_day: 1 },
    { medicine_id: 'aureomycin-topical', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days for topical ophthalmic use', zero_day: 1 },

    // Borgal 24% - sulfadoxine + trimethoprim
    { medicine_id: 'borgal-24', species: 'Cattle', product_type: 'Meat', period_days: 18, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'borgal-24', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last injection (96 hours)', zero_day: 0 },
    { medicine_id: 'borgal-24', species: 'Pigs', product_type: 'Meat', period_days: 10, notes: 'After last injection', zero_day: 0 },

    // Baytril 10% - enrofloxacin
    { medicine_id: 'baytril-10', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'baytril-10', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not authorised for use in lactating cattle producing milk for human consumption', zero_day: 0 },
    { medicine_id: 'baytril-10', species: 'Pigs', product_type: 'Meat', period_days: 10, notes: 'After last injection', zero_day: 0 },

    // Gentamicin injection
    { medicine_id: 'gentamicin-injection', species: 'Cattle', product_type: 'Meat', period_days: 63, notes: 'After last injection (prolonged due to tissue persistence)', zero_day: 0 },
    { medicine_id: 'gentamicin-injection', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not authorised for use in lactating cattle producing milk for human consumption', zero_day: 0 },

    // Amoxicillin 15% LA
    { medicine_id: 'amoxicillin-15', species: 'Cattle', product_type: 'Meat', period_days: 25, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'amoxicillin-15', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last injection (60 hours)', zero_day: 0 },
    { medicine_id: 'amoxicillin-15', species: 'Pigs', product_type: 'Meat', period_days: 25, notes: 'After last injection', zero_day: 0 },

    // Duphamox LA
    { medicine_id: 'duphamox-la', species: 'Cattle', product_type: 'Meat', period_days: 25, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'duphamox-la', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last injection (60 hours)', zero_day: 0 },
    { medicine_id: 'duphamox-la', species: 'Pigs', product_type: 'Meat', period_days: 25, notes: 'After last injection', zero_day: 0 },

    // Lincospectin
    { medicine_id: 'lincospectin', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'lincospectin', species: 'Cattle', product_type: 'Milk', period_days: 2, notes: 'After last injection (48 hours)', zero_day: 0 },
    { medicine_id: 'lincospectin', species: 'Pigs', product_type: 'Meat', period_days: 14, notes: 'After last injection', zero_day: 0 },

    // Terramycin/LA
    { medicine_id: 'terramycin-la', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'terramycin-la', species: 'Cattle', product_type: 'Milk', period_days: 7, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'terramycin-la', species: 'Sheep', product_type: 'Meat', period_days: 21, notes: 'After single injection', zero_day: 0 },

    // Naxcel - ceftiofur CFA
    { medicine_id: 'naxcel', species: 'Cattle', product_type: 'Meat', period_days: 9, notes: 'After single injection (ear base)', zero_day: 0 },
    { medicine_id: 'naxcel', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk', zero_day: 1 },

    // Resflor - florfenicol + flunixin
    { medicine_id: 'resflor', species: 'Cattle', product_type: 'Meat', period_days: 46, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'resflor', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in lactating cattle producing milk for human consumption', zero_day: 0 },

    // Depocillin - procaine penicillin
    { medicine_id: 'depocillin', species: 'Cattle', product_type: 'Meat', period_days: 10, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'depocillin', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last injection (84 hours)', zero_day: 0 },
    { medicine_id: 'depocillin', species: 'Sheep', product_type: 'Meat', period_days: 7, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'depocillin', species: 'Pigs', product_type: 'Meat', period_days: 7, notes: 'After last injection', zero_day: 0 },

    // Norfenicol - florfenicol
    { medicine_id: 'norfenicol', species: 'Cattle', product_type: 'Meat', period_days: 44, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'norfenicol', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not authorised for use in dairy cattle producing milk for human consumption', zero_day: 0 },
    { medicine_id: 'norfenicol', species: 'Pigs', product_type: 'Meat', period_days: 20, notes: 'After last injection', zero_day: 0 },

    // Enrocare 100 - enrofloxacin
    { medicine_id: 'enrocare-100', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'enrocare-100', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not authorised for lactating dairy cattle', zero_day: 0 },
    { medicine_id: 'enrocare-100', species: 'Pigs', product_type: 'Meat', period_days: 10, notes: 'After last injection', zero_day: 0 },

    // ── NEW ANTI-PARASITICS ─────────────────────────────────────

    // Panacur - fenbendazole
    { medicine_id: 'panacur-10', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After last dose', zero_day: 0 },
    { medicine_id: 'panacur-10', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk', zero_day: 1 },
    { medicine_id: 'panacur-10', species: 'Sheep', product_type: 'Meat', period_days: 14, notes: 'After last dose', zero_day: 0 },

    // Levamisole drench
    { medicine_id: 'levamisole-drench', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After oral dose', zero_day: 0 },
    { medicine_id: 'levamisole-drench', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After oral dose (72 hours)', zero_day: 0 },
    { medicine_id: 'levamisole-drench', species: 'Sheep', product_type: 'Meat', period_days: 14, notes: 'After oral dose', zero_day: 0 },

    // Fasinex 240 - triclabendazole
    { medicine_id: 'fasinex-240', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After single oral dose (liver fluke treatment)', zero_day: 0 },
    { medicine_id: 'fasinex-240', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After single oral dose (72 hours)', zero_day: 0 },
    { medicine_id: 'fasinex-240', species: 'Sheep', product_type: 'Meat', period_days: 28, notes: 'After single oral dose', zero_day: 0 },

    // Closamectin - closantel + ivermectin
    { medicine_id: 'closamectin', species: 'Cattle', product_type: 'Meat', period_days: 49, notes: 'After single injection (closantel drives the long withdrawal)', zero_day: 0 },
    { medicine_id: 'closamectin', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in dairy cattle producing milk for human consumption', zero_day: 0 },

    // Bimectin pour-on - ivermectin
    { medicine_id: 'bimectin-pour-on', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After single pour-on application', zero_day: 0 },
    { medicine_id: 'bimectin-pour-on', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in dairy cattle producing milk for human consumption', zero_day: 0 },

    // Noromectin injection - ivermectin
    { medicine_id: 'noromectin-injection', species: 'Cattle', product_type: 'Meat', period_days: 28, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'noromectin-injection', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in dairy cattle producing milk for human consumption', zero_day: 0 },

    // Zolvix - monepantel
    { medicine_id: 'zolvix-oral', species: 'Sheep', product_type: 'Meat', period_days: 7, notes: 'After single oral dose', zero_day: 0 },

    // Startect - derquantel + abamectin
    { medicine_id: 'startect', species: 'Sheep', product_type: 'Meat', period_days: 35, notes: 'After single oral dose', zero_day: 0 },

    // Vecoxan - diclazuril
    { medicine_id: 'vecoxan-oral', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'vecoxan-oral', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'vecoxan-oral', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Supaverm - closantel + mebendazole
    { medicine_id: 'supaverm', species: 'Sheep', product_type: 'Meat', period_days: 42, notes: 'After single oral dose (closantel drives the long withdrawal)', zero_day: 0 },

    // Cydectin LA - moxidectin long-acting
    { medicine_id: 'cydectin-la', species: 'Cattle', product_type: 'Meat', period_days: 63, notes: 'After single injection (long-acting formulation)', zero_day: 0 },
    { medicine_id: 'cydectin-la', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in dairy cattle producing milk for human consumption', zero_day: 0 },

    // Eprinex pour-on - eprinomectin
    { medicine_id: 'eprinex-pour-on', species: 'Cattle', product_type: 'Meat', period_days: 15, notes: 'After single pour-on application', zero_day: 0 },
    { medicine_id: 'eprinex-pour-on', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk (eprinomectin is specifically approved for lactating dairy cattle)', zero_day: 1 },

    // CLiK - dicyclanil (full dose)
    { medicine_id: 'clik-pour-on', species: 'Sheep', product_type: 'Meat', period_days: 40, notes: 'After single pour-on application (full dose blowfly prevention)', zero_day: 0 },

    // CLiKZiN - dicyclanil (reduced dose)
    { medicine_id: 'clikzin-pour-on', species: 'Sheep', product_type: 'Meat', period_days: 7, notes: 'After single pour-on application (reduced dose, shorter protection and withdrawal)', zero_day: 0 },

    // Combinex sheep - closantel + ivermectin
    { medicine_id: 'combinex-sheep', species: 'Sheep', product_type: 'Meat', period_days: 28, notes: 'After single oral dose', zero_day: 0 },

    // Cydectin oral sheep - moxidectin
    { medicine_id: 'cydectin-oral-sheep', species: 'Sheep', product_type: 'Meat', period_days: 14, notes: 'After single oral dose', zero_day: 0 },

    // Albex - albendazole
    { medicine_id: 'albex-10', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After single oral dose', zero_day: 0 },
    { medicine_id: 'albex-10', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After single oral dose (60 hours, discard 4 milkings)', zero_day: 0 },
    { medicine_id: 'albex-10', species: 'Sheep', product_type: 'Meat', period_days: 10, notes: 'After single oral dose', zero_day: 0 },

    // Dectomax pour-on - doramectin
    { medicine_id: 'dectomax-pour-on', species: 'Cattle', product_type: 'Meat', period_days: 35, notes: 'After single pour-on application', zero_day: 0 },
    { medicine_id: 'dectomax-pour-on', species: 'Cattle', product_type: 'Milk', period_days: -1, notes: 'Not for use in dairy cattle producing milk for human consumption', zero_day: 0 },

    // Ivomec drench sheep
    { medicine_id: 'ivomec-drench-sheep', species: 'Sheep', product_type: 'Meat', period_days: 14, notes: 'After single oral dose', zero_day: 0 },

    // ── NEW ANTI-INFLAMMATORIES ─────────────────────────────────

    // Ketofen - ketoprofen
    { medicine_id: 'ketofen-10', species: 'Cattle', product_type: 'Meat', period_days: 4, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'ketofen-10', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk', zero_day: 1 },
    { medicine_id: 'ketofen-10', species: 'Pigs', product_type: 'Meat', period_days: 4, notes: 'After last injection', zero_day: 0 },

    // Loxicom - meloxicam
    { medicine_id: 'loxicom-20', species: 'Cattle', product_type: 'Meat', period_days: 15, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'loxicom-20', species: 'Cattle', product_type: 'Milk', period_days: 5, notes: 'After single injection (120 hours)', zero_day: 0 },
    { medicine_id: 'loxicom-20', species: 'Pigs', product_type: 'Meat', period_days: 5, notes: 'After single injection', zero_day: 0 },

    // Tolfedine - tolfenamic acid
    { medicine_id: 'tolfedine-40', species: 'Cattle', product_type: 'Meat', period_days: 12, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'tolfedine-40', species: 'Cattle', product_type: 'Milk', period_days: 1, notes: 'After last injection (24 hours)', zero_day: 0 },

    // Phenylbutazone - HORSES ONLY, banned in food animals
    { medicine_id: 'phenylbutazone-equine', species: 'Horses', product_type: 'Meat', period_days: -1, notes: 'BANNED in food-producing animals. Horses treated with phenylbutazone MUST be excluded from the food chain permanently (signed equine passport declaration required)', zero_day: 0 },

    // Dinalgen - ketoprofen
    { medicine_id: 'dinalgen-150', species: 'Cattle', product_type: 'Meat', period_days: 4, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'dinalgen-150', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk', zero_day: 1 },
    { medicine_id: 'dinalgen-150', species: 'Pigs', product_type: 'Meat', period_days: 4, notes: 'After last injection', zero_day: 0 },

    // Rimadyl cattle - carprofen
    { medicine_id: 'rimadyl-cattle', species: 'Cattle', product_type: 'Meat', period_days: 21, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'rimadyl-cattle', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk', zero_day: 1 },

    // Metacam oral cattle - meloxicam
    { medicine_id: 'metacam-oral-cattle', species: 'Cattle', product_type: 'Meat', period_days: 15, notes: 'After last oral dose', zero_day: 0 },
    { medicine_id: 'metacam-oral-cattle', species: 'Cattle', product_type: 'Milk', period_days: 5, notes: 'After last oral dose (120 hours)', zero_day: 0 },

    // Allevinix - flunixin meglumine
    { medicine_id: 'allevinix', species: 'Cattle', product_type: 'Meat', period_days: 10, notes: 'After last IV injection', zero_day: 0 },
    { medicine_id: 'allevinix', species: 'Cattle', product_type: 'Milk', period_days: 1, notes: 'After last IV injection (24 hours)', zero_day: 0 },
    { medicine_id: 'allevinix', species: 'Pigs', product_type: 'Meat', period_days: 18, notes: 'After last IM injection', zero_day: 0 },

    // ── NEW INTRAMAMMARY ────────────────────────────────────────

    // Cepravin Dry Cow - cefalonium
    { medicine_id: 'cepravin-dry-cow', species: 'Cattle', product_type: 'Meat', period_days: 14, notes: 'After calving (if calving within dry period)', zero_day: 0 },
    { medicine_id: 'cepravin-dry-cow', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal after calving provided dry period is at least 49 days. Colostrum from treated quarters must be discarded for 8 milkings if dry period is shorter.', zero_day: 1 },

    // Orbeseal - teat sealant (no active antibiotic)
    { medicine_id: 'orbeseal', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days (internal teat sealant, no antibiotic)', zero_day: 1 },
    { medicine_id: 'orbeseal', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days (internal teat sealant, no antibiotic)', zero_day: 1 },

    // Synulox LC - amoxicillin + clavulanic acid (lactating cow)
    { medicine_id: 'synulox-lc', species: 'Cattle', product_type: 'Meat', period_days: 7, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'synulox-lc', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last intramammary treatment (60 hours / 5 milkings)', zero_day: 0 },

    // Noroclav LC - amoxicillin + clavulanic acid
    { medicine_id: 'noroclav-lc', species: 'Cattle', product_type: 'Meat', period_days: 7, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'noroclav-lc', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last intramammary treatment (60 hours)', zero_day: 0 },

    // Ubro Red - cefalexin
    { medicine_id: 'ubro-red', species: 'Cattle', product_type: 'Meat', period_days: 7, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'ubro-red', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last intramammary treatment (7 milkings)', zero_day: 0 },

    // Ubro Yellow - cefalexin + kanamycin
    { medicine_id: 'ubro-yellow', species: 'Cattle', product_type: 'Meat', period_days: 6, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'ubro-yellow', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last intramammary treatment (84 hours / 4 milkings)', zero_day: 0 },

    // Cobactan LC - cefquinome
    { medicine_id: 'cobactan-lc', species: 'Cattle', product_type: 'Meat', period_days: 2, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'cobactan-lc', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last intramammary treatment (5 milkings)', zero_day: 0 },

    // Rilexine 200 - cefalexin
    { medicine_id: 'rilexine-200', species: 'Cattle', product_type: 'Meat', period_days: 4, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'rilexine-200', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last intramammary treatment (5 milkings)', zero_day: 0 },

    // Cepravin LC - cefalonium (lactating cow)
    { medicine_id: 'cepravin-lc', species: 'Cattle', product_type: 'Meat', period_days: 2, notes: 'After last intramammary treatment', zero_day: 0 },
    { medicine_id: 'cepravin-lc', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last intramammary treatment (6 milkings)', zero_day: 0 },

    // ── NEW VACCINES ────────────────────────────────────────────

    // Bravoxin 10
    { medicine_id: 'bravoxin-10', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'bravoxin-10', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'bravoxin-10', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Heptavac P Plus
    { medicine_id: 'heptavac-p-plus', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Rispoval 3
    { medicine_id: 'rispoval-3-brsv-pi3-bvd', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'rispoval-3-brsv-pi3-bvd', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Footvax
    { medicine_id: 'footvax', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Ovivac P Plus
    { medicine_id: 'ovivac-p-plus', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Enzovax
    { medicine_id: 'enzovax', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Bovipast RSP
    { medicine_id: 'bovipast-rsp', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'bovipast-rsp', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Leptavoid-H
    { medicine_id: 'leptavoid-h', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'leptavoid-h', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Bovilis IBR Marker Live
    { medicine_id: 'bovilis-ibr-marker-live', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'bovilis-ibr-marker-live', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Bluetongue vaccine
    { medicine_id: 'bluetongue-vaccine', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'bluetongue-vaccine', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'bluetongue-vaccine', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Toxovax
    { medicine_id: 'toxovax', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days (do not vaccinate within 3 weeks before mating)', zero_day: 1 },

    // Rotavec Corona
    { medicine_id: 'rotavec-corona', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'rotavec-corona', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // ── NEW REPRODUCTIVE ────────────────────────────────────────

    // Estrumate - cloprostenol
    { medicine_id: 'estrumate', species: 'Cattle', product_type: 'Meat', period_days: 2, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'estrumate', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk', zero_day: 1 },

    // Receptal - buserelin
    { medicine_id: 'receptal', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'receptal', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // CIDR - progesterone
    { medicine_id: 'cidr-1380', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days after device removal', zero_day: 1 },
    { medicine_id: 'cidr-1380', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days after device removal', zero_day: 1 },

    // Fertagyl - gonadorelin
    { medicine_id: 'fertagyl', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'fertagyl', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Lutalyse - dinoprost
    { medicine_id: 'lutalyse', species: 'Cattle', product_type: 'Meat', period_days: 2, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'lutalyse', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero withdrawal for milk', zero_day: 1 },
    { medicine_id: 'lutalyse', species: 'Pigs', product_type: 'Meat', period_days: 1, notes: 'After single injection', zero_day: 0 },

    // ── NEW OTHER / SUPPORTIVE ──────────────────────────────────

    // Calciject 40 - calcium borogluconate
    { medicine_id: 'calciject-40', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'calciject-40', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Ketol - propylene glycol
    { medicine_id: 'ketol-10', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'ketol-10', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Buscopan Compositum
    { medicine_id: 'buscopan-compositum', species: 'Cattle', product_type: 'Meat', period_days: 12, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'buscopan-compositum', species: 'Cattle', product_type: 'Milk', period_days: 4, notes: 'After last injection (96 hours)', zero_day: 0 },

    // Catosal - butaphosphan + cyanocobalamin
    { medicine_id: 'catosal-10', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'catosal-10', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'catosal-10', species: 'Pigs', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Haemo 15 - iron, trace elements
    { medicine_id: 'haemo-15', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'haemo-15', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'haemo-15', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // No. 7 Calcium Magnesium
    { medicine_id: 'calcium-mag-no7', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'calcium-mag-no7', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Dexadreson - dexamethasone
    { medicine_id: 'dexadreson', species: 'Cattle', product_type: 'Meat', period_days: 8, notes: 'After last injection', zero_day: 0 },
    { medicine_id: 'dexadreson', species: 'Cattle', product_type: 'Milk', period_days: 3, notes: 'After last injection (72 hours)', zero_day: 0 },
    { medicine_id: 'dexadreson', species: 'Pigs', product_type: 'Meat', period_days: 2, notes: 'After last injection', zero_day: 0 },

    // Oxytocin
    { medicine_id: 'oxytocin-10', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'oxytocin-10', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'oxytocin-10', species: 'Pigs', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Atropine
    { medicine_id: 'atropine-injection', species: 'Cattle', product_type: 'Meat', period_days: 2, notes: 'After single injection', zero_day: 0 },
    { medicine_id: 'atropine-injection', species: 'Cattle', product_type: 'Milk', period_days: 1, notes: 'After single injection (24 hours)', zero_day: 0 },

    // Vitamin A+D3+E
    { medicine_id: 'vitamin-ad3e', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'vitamin-ad3e', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days', zero_day: 1 },
    { medicine_id: 'vitamin-ad3e', species: 'Sheep', product_type: 'Meat', period_days: 0, notes: 'Zero days', zero_day: 1 },

    // Alamycin Aerosol - topical oxytetracycline
    { medicine_id: 'alamycin-aerosol', species: 'Cattle', product_type: 'Meat', period_days: 0, notes: 'Zero days for topical cutaneous spray', zero_day: 1 },
    { medicine_id: 'alamycin-aerosol', species: 'Cattle', product_type: 'Milk', period_days: 0, notes: 'Zero days for topical cutaneous spray', zero_day: 1 },
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

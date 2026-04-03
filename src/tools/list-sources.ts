import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'VMD Product Information Database',
      authority: 'Veterinary Medicines Directorate',
      official_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'monthly',
      license: 'Open Government Licence v3',
      coverage: 'Authorised veterinary medicines with SPC data, withdrawal periods, species, and legal categories',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Veterinary Medicines Regulations 2013',
      authority: 'UK Government (DEFRA)',
      official_url: 'https://www.legislation.gov.uk/uksi/2013/2033/contents',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Open Government Licence v3',
      coverage: 'Cascade prescribing rules, banned substances, record-keeping requirements',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'DEFRA Veterinary Cascade Guidance',
      authority: 'Department for Environment, Food and Rural Affairs',
      official_url: 'https://www.gov.uk/guidance/the-cascade-prescribing-unauthorised-medicines',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'as_amended',
      license: 'Open Government Licence v3',
      coverage: 'Cascade step order, default withdrawal periods, documentation requirements',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://www.vmd.defra.gov.uk/productinformationdatabase/' }),
  };
}

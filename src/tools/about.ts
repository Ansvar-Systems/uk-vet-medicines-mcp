import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'UK Vet Medicines MCP',
    description:
      'UK veterinary medicines data from the Veterinary Medicines Directorate (VMD). ' +
      'Covers authorised products, withdrawal periods for food-producing animals, ' +
      'cascade prescribing rules, banned substances, and record-keeping requirements.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'VMD Product Information Database',
      'Veterinary Medicines Regulations 2013',
      'DEFRA Veterinary Cascade Guidance',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/Ansvar-Systems/uk-vet-medicines-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}

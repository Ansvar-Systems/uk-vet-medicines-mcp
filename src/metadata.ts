export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This server provides guidance based on VMD published data. Withdrawal periods shown are for ' +
  'standard dosing — always check the specific SPC for your product and dose. Wrong withdrawal ' +
  'periods can lead to food chain contamination. Consult your veterinary surgeon for prescribing decisions.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.gov.uk/government/organisations/veterinary-medicines-directorate',
    copyright: 'Data: Crown Copyright and VMD. Server: Apache-2.0 Ansvar Systems.',
    server: 'uk-vet-medicines-mcp',
    version: '0.1.0',
    ...overrides,
  };
}

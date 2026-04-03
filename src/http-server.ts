import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createDatabase, type Database } from './db.js';
import { handleAbout } from './tools/about.js';
import { handleListSources } from './tools/list-sources.js';
import { handleCheckFreshness } from './tools/check-freshness.js';
import { handleSearchAuthorisedMedicines } from './tools/search-authorised-medicines.js';
import { handleGetMedicineDetails } from './tools/get-medicine-details.js';
import { handleGetWithdrawalPeriod } from './tools/get-withdrawal-period.js';
import { handleCheckCascadeRules } from './tools/check-cascade-rules.js';
import { handleGetMedicineRecordRequirements } from './tools/get-medicine-record-requirements.js';
import { handleSearchByActiveSubstance } from './tools/search-by-active-substance.js';
import { handleGetBannedSubstances } from './tools/get-banned-substances.js';

const SERVER_NAME = 'uk-vet-medicines-mcp';
const SERVER_VERSION = '0.1.0';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

const SearchArgsSchema = z.object({
  query: z.string(),
  species: z.string().optional(),
  pharmaceutical_form: z.string().optional(),
  active_substance: z.string().optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().optional(),
});

const MedicineDetailsArgsSchema = z.object({
  medicine_id: z.string(),
  jurisdiction: z.string().optional(),
});

const WithdrawalPeriodArgsSchema = z.object({
  medicine_id: z.string(),
  species: z.string(),
  product_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const CascadeArgsSchema = z.object({
  species: z.string(),
  condition: z.string(),
  jurisdiction: z.string().optional(),
});

const RecordRequirementsArgsSchema = z.object({
  species: z.string().optional(),
  holding_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const ActiveSubstanceArgsSchema = z.object({
  active_substance: z.string(),
  species: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const BannedSubstancesArgsSchema = z.object({
  species: z.string().optional(),
  production_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const TOOLS = [
  {
    name: 'about',
    description: 'Get server metadata: name, version, coverage, data sources, and links.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'list_sources',
    description: 'List all data sources with authority, URL, license, and freshness info.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'check_data_freshness',
    description: 'Check when data was last ingested, staleness status, and how to trigger a refresh.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'search_authorised_medicines',
    description: 'Search VMD-authorised veterinary medicines. Full-text search across product names, active substances, and species. Use for broad queries.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Free-text search query (product name, substance, or condition)' },
        species: { type: 'string', description: 'Filter by species (e.g. cattle, sheep, pigs)' },
        pharmaceutical_form: { type: 'string', description: 'Filter by form (e.g. injection, intramammary)' },
        active_substance: { type: 'string', description: 'Filter by active substance (e.g. oxytetracycline)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
        limit: { type: 'number', description: 'Max results (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_medicine_details',
    description: 'Get full product details for a specific medicine by ID, including all withdrawal periods across species.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        medicine_id: { type: 'string', description: 'Medicine ID (use search_authorised_medicines to find IDs)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
      required: ['medicine_id'],
    },
  },
  {
    name: 'get_withdrawal_period',
    description: 'Get the withdrawal period for a specific medicine and species. CRITICAL for food safety — always verify against the actual SPC.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        medicine_id: { type: 'string', description: 'Medicine ID' },
        species: { type: 'string', description: 'Target species (e.g. cattle, sheep, pigs)' },
        product_type: { type: 'string', description: 'Product type (e.g. meat, milk)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
      required: ['medicine_id', 'species'],
    },
  },
  {
    name: 'check_cascade_rules',
    description: 'Get the veterinary prescribing cascade steps with default withdrawal periods and documentation requirements.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        species: { type: 'string', description: 'Target species' },
        condition: { type: 'string', description: 'Clinical condition being treated' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
      required: ['species', 'condition'],
    },
  },
  {
    name: 'get_medicine_record_requirements',
    description: 'Get medicine record-keeping obligations for food-producing animal holdings.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        species: { type: 'string', description: 'Filter by species' },
        holding_type: { type: 'string', description: 'Filter by holding type (e.g. farm, smallholding)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
    },
  },
  {
    name: 'search_by_active_substance',
    description: 'Find all authorised products containing a specific active substance. Also checks if the substance is banned.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        active_substance: { type: 'string', description: 'Active substance name (e.g. oxytetracycline, meloxicam)' },
        species: { type: 'string', description: 'Filter by authorised species' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
      required: ['active_substance'],
    },
  },
  {
    name: 'get_banned_substances',
    description: 'List substances prohibited for use in food-producing animals. Use of banned substances is a criminal offence.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        species: { type: 'string', description: 'Filter by species' },
        production_type: { type: 'string', description: 'Filter by production type (e.g. food-producing, growth promotion)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: GB)' },
      },
    },
  },
];

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
}

function registerTools(server: Server, db: Database): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'about':
          return textResult(handleAbout());
        case 'list_sources':
          return textResult(handleListSources(db));
        case 'check_data_freshness':
          return textResult(handleCheckFreshness(db));
        case 'search_authorised_medicines':
          return textResult(handleSearchAuthorisedMedicines(db, SearchArgsSchema.parse(args)));
        case 'get_medicine_details':
          return textResult(handleGetMedicineDetails(db, MedicineDetailsArgsSchema.parse(args)));
        case 'get_withdrawal_period':
          return textResult(handleGetWithdrawalPeriod(db, WithdrawalPeriodArgsSchema.parse(args)));
        case 'check_cascade_rules':
          return textResult(handleCheckCascadeRules(db, CascadeArgsSchema.parse(args)));
        case 'get_medicine_record_requirements':
          return textResult(handleGetMedicineRecordRequirements(db, RecordRequirementsArgsSchema.parse(args)));
        case 'search_by_active_substance':
          return textResult(handleSearchByActiveSubstance(db, ActiveSubstanceArgsSchema.parse(args)));
        case 'get_banned_substances':
          return textResult(handleGetBannedSubstances(db, BannedSubstancesArgsSchema.parse(args)));
        default:
          return errorResult(`Unknown tool: ${name}`);
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  });
}

const db = createDatabase();
const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: Server }>();

function createMcpServer(): Server {
  const mcpServer = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );
  registerTools(mcpServer, db);
  return mcpServer;
}

async function handleMCPRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
    return;
  }

  if (req.method === 'GET' || req.method === 'DELETE') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid or missing session ID' }));
    return;
  }

  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await mcpServer.connect(transport);

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
    }
    mcpServer.close().catch(() => {});
  };

  await transport.handleRequest(req, res);

  if (transport.sessionId) {
    sessions.set(transport.sessionId, { transport, server: mcpServer });
  }
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', server: SERVER_NAME, version: SERVER_VERSION }));
    return;
  }

  if (url.pathname === '/mcp' || url.pathname === '/') {
    try {
      await handleMCPRequest(req, res);
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }));
      }
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

httpServer.listen(PORT, () => {
  console.log(`${SERVER_NAME} v${SERVER_VERSION} listening on port ${PORT}`);
});

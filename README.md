# UK Vet Medicines MCP

[![CI](https://github.com/Ansvar-Systems/uk-vet-medicines-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/uk-vet-medicines-mcp/actions/workflows/ci.yml)
[![GHCR](https://github.com/Ansvar-Systems/uk-vet-medicines-mcp/actions/workflows/ghcr-build.yml/badge.svg)](https://github.com/Ansvar-Systems/uk-vet-medicines-mcp/actions/workflows/ghcr-build.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

UK veterinary medicines data via the [Model Context Protocol](https://modelcontextprotocol.io). Query VMD-authorised products, withdrawal periods, cascade prescribing rules, banned substances, and record-keeping requirements -- all from your AI assistant.

Part of [Ansvar Open Agriculture](https://ansvar.eu/open-agriculture).

## Why This Exists

Farmers, vets, and farm assurance inspectors need quick access to withdrawal period data, cascade rules, and banned substance lists. This information is published by the Veterinary Medicines Directorate (VMD) but is spread across individual product SPCs, legislation, and guidance documents. This MCP server makes it all searchable in one place.

**Food safety warning:** Wrong withdrawal periods can lead to medicine residues entering the human food chain. This server is a reference tool -- always check the actual SPC for your specific product, dose, and route.

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "uk-vet-medicines": {
      "command": "npx",
      "args": ["-y", "@ansvar/uk-vet-medicines-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add uk-vet-medicines npx @ansvar/uk-vet-medicines-mcp
```

### Streamable HTTP (remote)

```
https://mcp.ansvar.eu/uk-vet-medicines/mcp
```

### Docker (self-hosted)

```bash
docker run -p 3000:3000 ghcr.io/ansvar-systems/uk-vet-medicines-mcp:latest
```

### npm (stdio)

```bash
npx @ansvar/uk-vet-medicines-mcp
```

## Example Queries

Ask your AI assistant:

- "What is the meat withdrawal period for Engemycin LA in cattle?"
- "Can I use Excenel RTU and still sell the milk?"
- "What are the cascade rules if there's no authorised medicine for my sheep?"
- "Is chloramphenicol allowed in food-producing animals?"
- "What records do I need to keep for medicines on a cattle farm?"
- "Which products contain oxytetracycline for cattle?"

## Stats

| Metric | Value |
|--------|-------|
| Tools | 10 (3 meta + 7 domain) |
| Jurisdiction | GB |
| Medicines | 20+ VMD-authorised products |
| Withdrawal periods | 50+ entries (meat, milk) |
| Data sources | VMD Product Information Database, VMR 2013, DEFRA Cascade Guidance |
| License (data) | Open Government Licence v3 |
| License (code) | Apache-2.0 |
| Transport | stdio + Streamable HTTP |

## Tools

| Tool | Description |
|------|-------------|
| `about` | Server metadata and links |
| `list_sources` | Data sources with freshness info |
| `check_data_freshness` | Staleness status and refresh command |
| `search_authorised_medicines` | FTS5 search across medicines, substances, and species |
| `get_medicine_details` | Full product details with all withdrawal periods |
| `get_withdrawal_period` | Specific withdrawal lookup for medicine + species + product type |
| `check_cascade_rules` | Prescribing cascade steps with default withdrawal periods |
| `get_medicine_record_requirements` | Record-keeping obligations for animal holdings |
| `search_by_active_substance` | Find products by substance, with banned substance check |
| `get_banned_substances` | Prohibited substances list for food-producing animals |

See [TOOLS.md](TOOLS.md) for full parameter documentation.

## Security Scanning

This repository runs security checks on every push:

- **CodeQL** -- static analysis for JavaScript/TypeScript
- **Gitleaks** -- secret detection across full history
- **Dependency review** -- via Dependabot
- **Container scanning** -- via GHCR build pipeline

See [SECURITY.md](SECURITY.md) for reporting policy.

## Disclaimer

This tool provides reference data for informational purposes only. Withdrawal periods must be verified against the actual product SPC. It is not professional veterinary advice. See [DISCLAIMER.md](DISCLAIMER.md).

## Contributing

Issues and pull requests welcome. For security vulnerabilities, email security@ansvar.eu (do not open a public issue).

## License

Apache-2.0. Data sourced under Open Government Licence v3.

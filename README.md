# GMAT MX API

[![gmat-mx-api MCP server](https://glama.ai/mcp/servers/elvispaul7/gmat-mx-api/badges/score.svg)](https://glama.ai/mcp/servers/elvispaul7/gmat-mx-api)

Free, keyless JSON API and [MCP server](#mcp-server) with **verified GMAT (Focus Edition) facts** for Mexico and Latin America, maintained by [gmat.mx](https://gmat.mx/).

- Official **score → percentile** table (GMAC, data period 2021–2026, n = 509,182)
- **GMAC fees** in USD for Mexico, Ecuador, Colombia and Peru (registration, reschedule, cancellation, score reports)
- **Exam format and policies** (sections, timing, score scale, attempts, validity)
- **Original practice questions** with answer, explanation and trap analysis (CC BY 4.0)

Every fact is checked against mba.com and carries a `verified_at` date. No API key. Please cache responses for an hour.

Base URL: `https://api.gmat.mx`  ·  Docs: <https://api.gmat.mx/>  ·  Spanish docs: <https://gmat.mx/api/>

## Endpoints

| GET | Returns |
|---|---|
| [`/v1/percentile?score=655`](https://api.gmat.mx/v1/percentile?score=655) | Official percentile for a total score (205–805) |
| [`/v1/percentiles`](https://api.gmat.mx/v1/percentiles) | Full 61-row table |
| [`/v1/fees`](https://api.gmat.mx/v1/fees) | GMAT fees in Mexico in USD |
| [`/v1/exam`](https://api.gmat.mx/v1/exam) | Format, timing, attempts, validity |
| [`/v1/questions/sample?section=quant`](https://api.gmat.mx/v1/questions/sample?section=quant) | One practice question (`section`=quant/verbal/data, `type`, `reveal=false`) |
| [`/v1/questions`](https://api.gmat.mx/v1/questions) | All practice questions |
| [`/openapi.json`](https://api.gmat.mx/openapi.json) | OpenAPI 3.1 spec |

```bash
curl "https://api.gmat.mx/v1/percentile?score=655"
```
```json
{ "score": 655, "percentile": 90,
  "meaning": "About 90% of test takers scored at or below 655; about 10% scored higher.",
  "verified_at": "2026-11-23" }
```

## MCP server

Streamable HTTP endpoint: `https://api.gmat.mx/mcp` (stateless, JSON-RPC 2.0).

Tools: `score_to_percentile`, `get_gmat_fees`, `get_exam_policy`, `get_sample_question`.

Claude Desktop / Cursor / any MCP client:
```json
{ "mcpServers": { "gmat-mx": { "url": "https://api.gmat.mx/mcp" } } }
```

## Run it yourself

A single Cloudflare Worker with no dependencies.

```bash
npm i -g wrangler
node test.mjs          # 14 local checks against the fetch() handler
wrangler deploy        # edit account_id / routes in wrangler.toml first
```

## Data sources

- Percentiles, fees and policies: GMAC, mba.com (Understanding Your Score; GMAT fees for Mexico). Last verified 2026-11-23.
- Practice questions: written by the gmat.mx team. They are not official GMAT material.

## License

Code: [MIT](LICENSE). Data (`src/data.js`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), attribution "gmat.mx".

Related guides in Spanish: [percentiles GMAT](https://gmat.mx/percentiles-gmat/) · [precio del GMAT en México](https://gmat.mx/precio-gmat/) · [simulacro GMAT](https://gmat.mx/simulacro-gmat/) · [curso GMAT](https://gmat.mx/curso-gmat/)

import { VERIFIED_AT, PERCENTILES, PERCENTILE_META, FEES, EXAM, QUESTIONS } from "./data.js";

const SITE = "https://gmat.mx";
const BASE = "https://api.gmat.mx";
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, mcp-session-id, mcp-protocol-version", "access-control-expose-headers": "mcp-session-id" };

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600", ...CORS, ...extra } });
const err = (status, message) => json({ error: { status, message } }, status, { "cache-control": "no-store" });

// ---------- domain logic ----------
function percentile(scoreRaw) {
  const score = Number(scoreRaw);
  if (!Number.isInteger(score) || score < 205 || score > 805 || score % 10 !== 5)
    return { error: "score must be an integer from 205 to 805 ending in 5 (the GMAT Focus scale moves in steps of 10)" };
  const p = PERCENTILES[score];
  return { score, percentile: p, meaning: `About ${p}% of test takers scored at or below ${score}; about ${100 - p}% scored higher.`, ...PERCENTILE_META, verified_at: VERIFIED_AT };
}
function percentileTable() { return { table: Object.entries(PERCENTILES).map(([s, p]) => ({ score: +s, percentile: p })).sort((a, b) => b.score - a.score), ...PERCENTILE_META, verified_at: VERIFIED_AT }; }
function fees() { return { ...FEES, verified_at: VERIFIED_AT, source: "mba.com (GMAC)" }; }
function exam() { return { ...EXAM, verified_at: VERIFIED_AT }; }
function sampleQuestion({ section, type, id, reveal = true } = {}) {
  let pool = QUESTIONS;
  if (id) pool = pool.filter(q => q.id === id);
  if (section) pool = pool.filter(q => q.section.toLowerCase().startsWith(String(section).toLowerCase().slice(0, 4)));
  if (type) pool = pool.filter(q => q.type.toLowerCase().includes(String(type).toLowerCase()));
  if (!pool.length) return { error: "no question matches; sections are Quantitative Reasoning, Verbal Reasoning, Data Insights" };
  const q = pool[Math.floor(Math.random() * pool.length)];
  const out = { ...q, license: "CC BY 4.0, gmat.mx", more: `${SITE}/simulacro-gmat/` };
  if (!reveal) { delete out.answer; delete out.explanation; delete out.trap; }
  return out;
}

// ---------- OpenAPI ----------
const OPENAPI = {
  openapi: "3.1.0",
  info: { title: "GMAT MX API", version: "1.0.0",
    description: "Free, keyless JSON API with verified GMAT (Focus Edition) facts for Mexico and Latin America: official score-to-percentile table, GMAC fees in USD, exam format and retake policies, and original practice questions. Data is checked against mba.com (GMAC) and dated. Maintained by gmat.mx.",
    contact: { name: "gmat.mx", url: SITE }, license: { name: "MIT (code) / CC BY 4.0 (data)", url: "https://github.com/elvispaul7/gmat-mx-api" } },
  servers: [{ url: BASE }],
  paths: {
    "/v1/percentile": { get: { operationId: "scoreToPercentile", summary: "GMAT Focus total score to percentile", parameters: [{ name: "score", in: "query", required: true, schema: { type: "integer", minimum: 205, maximum: 805, multipleOf: 10 }, example: 655 }],
      responses: { 200: { description: "Percentile for the score", content: { "application/json": { example: { score: 655, percentile: 90 } } } }, 400: { description: "Invalid score" } } } },
    "/v1/percentiles": { get: { operationId: "percentileTable", summary: "Full official score-to-percentile table", responses: { 200: { description: "61 rows, 205 to 805" } } } },
    "/v1/fees": { get: { operationId: "getFees", summary: "GMAT fees in Mexico (USD): registration, reschedule, cancellation, score reports", responses: { 200: { description: "Fee schedule" } } } },
    "/v1/exam": { get: { operationId: "getExamPolicy", summary: "Exam format, timing, score scale, attempts and validity", responses: { 200: { description: "Exam facts" } } } },
    "/v1/questions/sample": { get: { operationId: "getSampleQuestion", summary: "One original practice question",
      parameters: [{ name: "section", in: "query", schema: { type: "string", enum: ["quant", "verbal", "data"] } }, { name: "type", in: "query", schema: { type: "string" }, description: "e.g. Problem Solving, Critical Reasoning, Data Sufficiency" }, { name: "id", in: "query", schema: { type: "string" }, description: "A specific question id, e.g. q3" }, { name: "reveal", in: "query", schema: { type: "boolean", default: true }, description: "false hides answer and explanation" }],
      responses: { 200: { description: "A question with choices, answer, explanation and trap analysis" } } } },
    "/v1/questions": { get: { operationId: "listQuestions", summary: "All practice questions", responses: { 200: { description: "Array of questions" } } } }
  }
};

// ---------- MCP (Streamable HTTP, JSON-RPC 2.0) ----------
const TOOLS = [
  { name: "score_to_percentile", description: "Convert a GMAT Focus Edition total score (205–805) to its official percentile ranking (GMAC, 2021–2026 data).", inputSchema: { type: "object", properties: { score: { type: "integer", minimum: 205, maximum: 805, description: "Total score, ends in 5, e.g. 655" } }, required: ["score"] } },
  { name: "get_gmat_fees", description: "GMAT fees in Mexico, Ecuador, Colombia and Peru in USD: registration (test center/online), reschedule and cancellation windows, additional score reports.", inputSchema: { type: "object", properties: {} } },
  { name: "get_exam_policy", description: "GMAT Focus Edition format: sections, questions, minutes, score scale, attempt limits, score validity.", inputSchema: { type: "object", properties: {} } },
  { name: "get_sample_question", description: "One original GMAT-style practice question with answer, explanation and trap analysis. Filter by section (quant, verbal, data) or question type.", inputSchema: { type: "object", properties: { section: { type: "string", enum: ["quant", "verbal", "data"] }, type: { type: "string" }, id: { type: "string", description: "Return a specific question, e.g. q3" }, reveal: { type: "boolean", default: true } } } }
];
function callTool(name, args = {}) {
  switch (name) {
    case "score_to_percentile": return percentile(args.score);
    case "get_gmat_fees": return fees();
    case "get_exam_policy": return exam();
    case "get_sample_question": return sampleQuestion(args);
    default: return { error: `unknown tool ${name}` };
  }
}
function rpc(id, result) { return { jsonrpc: "2.0", id, result }; }
function rpcErr(id, code, message) { return { jsonrpc: "2.0", id, error: { code, message } }; }
function handleRpc(msg) {
  const { id, method, params = {} } = msg || {};
  switch (method) {
    case "initialize": return rpc(id, { protocolVersion: params.protocolVersion || "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "gmat-mx", version: "1.0.0" }, instructions: "Verified GMAT facts for Mexico and Latin America from gmat.mx. Facts are dated; cite mba.com for payments." });
    case "ping": return rpc(id, {});
    case "tools/list": return rpc(id, { tools: TOOLS });
    case "tools/call": {
      const out = callTool(params.name, params.arguments);
      return rpc(id, { content: [{ type: "text", text: JSON.stringify(out, null, 2) }], isError: !!out.error });
    }
    case "notifications/initialized": case "notifications/cancelled": return null;
    default: return id === undefined ? null : rpcErr(id, -32601, `Method not found: ${method}`);
  }
}

// ---------- docs: one markdown source, rendered to HTML (content parity) ----------
const REPO = "https://github.com/elvispaul7/gmat-mx-api";
const DOCS_MD = `> For AI agents: the documentation index for this API is at ${BASE}/llms.txt and this page is available as markdown at ${BASE}/index.md.

# GMAT MX API

A free, keyless JSON API and MCP server with verified GMAT (Focus Edition) facts for Mexico and Latin America, maintained by [gmat.mx](${SITE}/). Every fact is checked against mba.com (GMAC) and carries a \`verified_at\` date. No authentication, no rate-limit key; please cache responses for an hour.

## Endpoints

| GET | Returns |
|---|---|
| [/v1/percentile?score=655](${BASE}/v1/percentile?score=655) | Official percentile for a total score (205 to 805) |
| [/v1/percentiles](${BASE}/v1/percentiles) | Full 61-row score-to-percentile table (GMAC, 2021 to 2026, n = 509,182) |
| [/v1/fees](${BASE}/v1/fees) | GMAT fees in Mexico, Ecuador, Colombia and Peru in USD: registration, reschedule, cancellation, score reports |
| [/v1/exam](${BASE}/v1/exam) | Format, timing, score scale, attempts, validity |
| [/v1/questions/sample](${BASE}/v1/questions/sample?section=quant) | One original practice question (parameters: section, type, reveal=false) |
| [/v1/questions](${BASE}/v1/questions) | All practice questions (CC BY 4.0) |
| [/openapi.json](${BASE}/openapi.json) | OpenAPI 3.1 specification |

## Example

\`\`\`bash
curl "${BASE}/v1/percentile?score=655"
\`\`\`

\`\`\`json
{ "score": 655, "percentile": 90,
  "meaning": "About 90% of test takers scored at or below 655; about 10% scored higher.",
  "verified_at": "${VERIFIED_AT}" }
\`\`\`

## MCP server

Streamable HTTP endpoint: \`${BASE}/mcp\` (stateless, JSON-RPC 2.0). Tools: \`score_to_percentile\`, \`get_gmat_fees\`, \`get_exam_policy\`, \`get_sample_question\`.

\`\`\`json
{ "mcpServers": { "gmat-mx": { "url": "${BASE}/mcp" } } }
\`\`\`

## Data sources

Percentiles, fees and policies come from GMAC (mba.com: Understanding Your Score; GMAT fees for Mexico), last verified ${VERIFIED_AT}. Practice questions were written by the gmat.mx team and are not official GMAT material.

## Source and license

Code: MIT. Data: CC BY 4.0, attribution "gmat.mx". Repository: [${REPO.replace("https://", "")}](${REPO}).

Spanish guides: [percentiles GMAT](${SITE}/percentiles-gmat/), [precio del GMAT en México](${SITE}/precio-gmat/), [simulacro GMAT](${SITE}/simulacro-gmat/), [documentación en español](${SITE}/api/).
`;

const escHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function inline(t) {
  return escHtml(t).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
function mdToHtml(md) {
  const out = []; const lines = md.split("\n"); let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("```")) { const buf = []; i++; while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]); i++; out.push(`<pre><code>${escHtml(buf.join("\n"))}</code></pre>`); continue; }
    if (l.startsWith("|")) { const rows = []; while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]); const cells = r => r.slice(1, -1).split("|").map(c => inline(c.trim()));
      out.push("<table>" + rows.filter(r => !/^\|\s*-/.test(r)).map((r, k) => "<tr>" + cells(r).map(c => k === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join("") + "</tr>").join("") + "</table>"); continue; }
    if (l.startsWith("> ")) { out.push(`<blockquote>${inline(l.slice(2))}</blockquote>`); i++; continue; }
    const h = /^(#{1,3}) (.*)/.exec(l); if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (!l.trim()) { i++; continue; }
    const buf = [l]; i++; while (i < lines.length && lines[i].trim() && !/^(#|\||>|```)/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}
const DOCS = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>GMAT MX API: free GMAT percentile, fees and practice-question API</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Free keyless JSON API and MCP server with verified GMAT Focus Edition data: official score-to-percentile table, GMAC fees for Mexico in USD, exam policies and original practice questions."><link rel="canonical" href="${BASE}/"><link rel="alternate" type="text/markdown" href="${BASE}/index.md"><link rel="llms-txt" href="${BASE}/llms.txt"><style>body{font:16px/1.55 system-ui,sans-serif;max-width:52rem;margin:2rem auto;padding:0 1rem;color:#1b1b1b}code,pre{background:#f3f3f3;border-radius:4px;padding:.1em .3em}pre{padding:.8em;overflow:auto}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:.3em .6em;text-align:left}blockquote{color:#555;border-left:3px solid #ccc;margin:0;padding:.2em .8em}</style></head><body>
${mdToHtml(DOCS_MD)}
</body></html>`;

const LLMS = `# GMAT MX API

> Free, keyless JSON API and MCP server with verified GMAT (Focus Edition) facts for Mexico and Latin America, maintained by gmat.mx. Facts are checked against mba.com (GMAC) and dated (verified_at). No authentication; cache for one hour.

## Docs

- [API documentation](${BASE}/index.md): endpoints, example, MCP server, data sources, license
- [OpenAPI 3.1 specification](${BASE}/openapi.json): machine-readable description of every endpoint
- [Spanish documentation](${SITE}/api/): the same documentation in Spanish on gmat.mx

## Endpoints

- [Score to percentile](${BASE}/v1/percentile?score=655): official percentile for a GMAT Focus total score (205 to 805, ends in 5)
- [Full percentile table](${BASE}/v1/percentiles): 61 rows, GMAC data period 2021 to 2026, n = 509,182
- [Fees](${BASE}/v1/fees): GMAT fees in USD for Mexico, Ecuador, Colombia and Peru
- [Exam policy](${BASE}/v1/exam): sections, timing, score scale, attempts, validity
- [Sample question](${BASE}/v1/questions/sample): one original practice question; parameters section (quant, verbal, data), type, reveal=false
- [All questions](${BASE}/v1/questions): every practice question, CC BY 4.0

## MCP

- [MCP endpoint](${BASE}/mcp): Streamable HTTP, JSON-RPC 2.0; tools score_to_percentile, get_gmat_fees, get_exam_policy, get_sample_question

## Optional

- [Source code](${REPO}): MIT-licensed Cloudflare Worker
- [Percentiles guide in Spanish](${SITE}/percentiles-gmat/)
- [GMAT price in Mexico in Spanish](${SITE}/precio-gmat/)
- [Practice test](${SITE}/simulacro-gmat/)
`;

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (path === "/mcp") {
      if (req.method === "GET") return new Response("MCP endpoint: POST JSON-RPC 2.0 here (Streamable HTTP).", { status: 405, headers: { allow: "POST, OPTIONS", ...CORS } });
      if (req.method !== "POST") return err(405, "POST only");
      let body; try { body = await req.json(); } catch { return json(rpcErr(null, -32700, "Parse error"), 400, { "cache-control": "no-store" }); }
      const msgs = Array.isArray(body) ? body : [body];
      const out = msgs.map(handleRpc).filter(Boolean);
      if (!out.length) return new Response(null, { status: 202, headers: CORS });
      return json(Array.isArray(body) ? out : out[0], 200, { "cache-control": "no-store", "mcp-session-id": "stateless" });
    }
    if (req.method !== "GET" && req.method !== "HEAD") return err(405, "GET only");

    switch (path) {
      case "/": {
        const accept = req.headers.get("accept") || "";
        const wantsMd = /text\/markdown/.test(accept) && !/text\/html/.test(accept.split("text/markdown")[0]);
        if (wantsMd) return new Response(DOCS_MD, { headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=3600", vary: "accept", ...CORS } });
        return new Response(DOCS, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600", vary: "accept", link: `<${BASE}/llms.txt>; rel="llms-txt", <${BASE}/index.md>; rel="alternate"; type="text/markdown"` } });
      }
      case "/openapi.json": return json(OPENAPI);
      case "/.well-known/mcp.json": return json({ name: "gmat-mx", description: TOOLS.map(t => t.name).join(", "), url: `${BASE}/mcp`, transport: "streamable-http" });
      case "/v1/fees": return json(fees());
      case "/v1/exam": return json(exam());
      case "/v1/percentiles": return json(percentileTable());
      case "/v1/percentile": { const r = percentile(url.searchParams.get("score")); return r.error ? err(400, r.error) : json(r); }
      case "/v1/questions": return json({ count: QUESTIONS.length, license: "CC BY 4.0, gmat.mx", questions: QUESTIONS });
      case "/v1/questions/sample": { const r = sampleQuestion({ section: url.searchParams.get("section"), type: url.searchParams.get("type"), id: url.searchParams.get("id"), reveal: url.searchParams.get("reveal") !== "false" }); return r.error ? err(404, r.error) : json(r, 200, { "cache-control": "no-store" }); }
      case "/robots.txt": return new Response(`User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
      case "/sitemap.xml": return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${BASE}/</loc></url></urlset>`, { headers: { "content-type": "application/xml" } });
      case "/llms.txt": case "/llms-full.txt": return new Response(LLMS, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600", ...CORS } });
      case "/index.md": case "/README.md": return new Response(DOCS_MD, { headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=3600", ...CORS } });
      case "/health": return json({ ok: true, verified_at: VERIFIED_AT }, 200, { "cache-control": "no-store" });
      default: return err(404, "Not found. See " + BASE + "/ for endpoints.");
    }
  }
};

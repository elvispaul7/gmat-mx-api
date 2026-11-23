import w from "./src/index.js";
const get = async (p) => { const r = await w.fetch(new Request("https://api.gmat.mx" + p)); return [r.status, await r.text()]; };
const post = async (b) => { const r = await w.fetch(new Request("https://api.gmat.mx/mcp", { method: "POST", body: JSON.stringify(b), headers: { "content-type": "application/json" } })); return [r.status, await r.text()]; };
const assert = (c, m) => { if (!c) { console.error("FAIL", m); process.exit(1); } console.log("ok", m); };
let [s, t] = await get("/v1/percentile?score=655"); assert(s === 200 && JSON.parse(t).percentile === 90, "655 -> 90");
[s, t] = await get("/v1/percentile?score=565"); assert(JSON.parse(t).percentile === 50, "565 -> 50");
[s, t] = await get("/v1/percentile?score=650"); assert(s === 400, "650 rejected");
[s, t] = await get("/v1/percentiles"); assert(JSON.parse(t).table.length === 61, "61 rows");
[s, t] = await get("/v1/fees"); assert(JSON.parse(t).registration.test_center === 250, "fee 250");
[s, t] = await get("/v1/questions/sample?section=data&reveal=false"); assert(s === 200 && !JSON.parse(t).answer && JSON.parse(t).section === "Data Insights", "sample hidden answer");
[s, t] = await get("/v1/questions"); assert(JSON.parse(t).count === 7, "7 questions");
[s, t] = await get("/openapi.json"); assert(JSON.parse(t).openapi === "3.1.0", "openapi");
[s, t] = await get("/"); assert(s === 200 && t.includes("<h1>GMAT MX API"), "docs html");
[s, t] = await get("/nope"); assert(s === 404, "404");
[s, t] = await post({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }); assert(JSON.parse(t).result.serverInfo.name === "gmat-mx", "mcp init");
[s, t] = await post({ jsonrpc: "2.0", id: 2, method: "tools/list" }); assert(JSON.parse(t).result.tools.length === 4, "mcp tools/list 4");
[s, t] = await post({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "score_to_percentile", arguments: { score: 705 } } }); assert(JSON.parse(JSON.parse(t).result.content[0].text).percentile === 98, "mcp call 705 -> 98");
[s, t] = await post({ jsonrpc: "2.0", method: "notifications/initialized" }); assert(s === 202, "notification 202");
console.log("ALL OK");
{ const r = await w.fetch(new Request("https://api.gmat.mx/", { headers: { accept: "text/markdown" } })); const t = await r.text(); assert(r.headers.get("content-type").startsWith("text/markdown") && t.startsWith("> For AI agents"), "content negotiation md"); }
{ const r = await w.fetch(new Request("https://api.gmat.mx/", { headers: { accept: "text/html,*/*" } })); const t = await r.text(); assert(t.includes("<table>") && t.includes("<blockquote>") && t.includes('rel="llms-txt"'), "html render + directive"); }
{ const r = await w.fetch(new Request("https://api.gmat.mx/llms.txt")); const t = await r.text(); assert((t.match(/\]\(https:\/\//g) || []).length >= 10, "llms.txt markdown links"); }
console.log("ALL OK 2");

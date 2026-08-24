/*
Configure an approved TAAFT API/export/feed:
TAAFT_SOURCE_URL=https://...
TAAFT_SOURCE_TOKEN=optional
Expected JSON: [{name,description,category,useCases,url,sourceUrl}]
*/
import fs from "node:fs/promises";
import path from "node:path";

const sourceUrl = process.env.TAAFT_SOURCE_URL;
if (!sourceUrl) {
  console.error("TAAFT_SOURCE_URL is not configured. No data was downloaded.");
  process.exit(1);
}

const headers = {};
if (process.env.TAAFT_SOURCE_TOKEN) headers.Authorization = `Bearer ${process.env.TAAFT_SOURCE_TOKEN}`;

const response = await fetch(sourceUrl, { headers });
if (!response.ok) throw new Error(`TAAFT source returned HTTP ${response.status}`);

const data = await response.json();
if (!Array.isArray(data)) throw new Error("Expected the configured source to return a JSON array.");

const normalized = data.map(item => ({
  name: String(item.name || "").trim(),
  description: String(item.description || "").trim(),
  category: String(item.category || "Other").trim(),
  useCases: Array.isArray(item.useCases) ? item.useCases.map(String) : [],
  url: String(item.url || "").trim(),
  sourceUrl: String(item.sourceUrl || item.url || "").trim(),
  source: "TAAFT",
  verifiedAt: new Date().toISOString()
})).filter(x => x.name && x.description && x.url);

const output = path.join(process.cwd(), "knowledge", "taaft", "tools.generated.json");
await fs.writeFile(output, JSON.stringify(normalized, null, 2), "utf8");
console.log(`Wrote ${normalized.length} TAAFT tools.`);

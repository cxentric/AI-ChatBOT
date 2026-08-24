import fs from "node:fs/promises";
import path from "node:path";
const file = path.join(process.cwd(),"knowledge","taaft","tools.generated.json");
try {
  const tools = JSON.parse(await fs.readFile(file,"utf8"));
  if (!Array.isArray(tools)) throw new Error("KB must be an array");
  console.log(`Validated ${tools.length} TAAFT tools.`);
} catch {
  console.log("No generated TAAFT KB found. Run sync:taaft after configuring a permitted source.");
}
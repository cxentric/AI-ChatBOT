import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import { seeniProfile } from "../knowledge/seeni-profile.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
let toolCache = null;

async function loadTools() {
  if (toolCache) return toolCache;
  const file = path.join(process.cwd(),"knowledge","taaft","tools.generated.json");
  try { toolCache = JSON.parse(await fs.readFile(file,"utf8")); }
  catch { toolCache = []; }
  return toolCache;
}

function scoreTool(tool, query) {
  const q = query.toLowerCase();
  const text = [tool.name,tool.description,tool.category,...(tool.useCases||[])].join(" ").toLowerCase();
  const terms = q.replace(/[^\w\s-]/g," ").split(/\s+/).filter(x=>x.length>2);
  let score=0;
  for (const term of terms) {
    if (text.includes(term)) score += 1;
    if (String(tool.name).toLowerCase().includes(term)) score += 2;
    if (String(tool.category).toLowerCase().includes(term)) score += 2;
  }
  return score;
}

function retrieveTools(query, tools, limit=8) {
  return tools.map(tool=>({tool,score:scoreTool(tool,query)}))
    .sort((a,b)=>b.score-a.score)
    .filter(x=>x.score>0).slice(0,limit).map(x=>x.tool);
}

const wantsTools = text => /\b(ai tool|ai tools|tool for|tools for|recommend|recommendation|best ai|find an ai|which ai|what ai|software for|app for)\b/i.test(text);
const wantsSeeni = text => /\b(seeni|seenivaasan|his experience|his work|his projects|his skills|zoho|ascendion)\b/i.test(text);

export default async function handler(req,res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  try {
    const {messages=[]}=req.body||{};
    if (!Array.isArray(messages)) return res.status(400).json({error:"Invalid messages format"});

    const safeMessages=messages.slice(-10)
      .filter(m=>m&&["user","assistant"].includes(m.role)&&typeof m.content==="string")
      .map(m=>({role:m.role,content:m.content.slice(0,3500)}));

    const latest=[...safeMessages].reverse().find(m=>m.role==="user")?.content||"";
    const tools=await loadTools();
    const retrievedTools=wantsTools(latest)?retrieveTools(latest,tools):[];
    const toolContext=retrievedTools.length
      ? retrievedTools.map((t,i)=>`TOOL ${i+1}\nName: ${t.name}\nDescription: ${t.description}\nCategory: ${t.category}\nUse cases: ${(t.useCases||[]).join(", ")}\nURL: ${t.url}\nSource: ${t.sourceUrl||t.url}`).join("\n\n")
      : "No matching TAAFT tools were found in the local knowledge base.";

    const system=`You are Seeni AI, an AI tool discovery assistant on Seenivaasan Venkat's professional website.

PRIMARY JOB: Help visitors discover useful AI tools.

TAAFT RULES:
- The TAAFT context contains the only tool records you may recommend.
- Never invent a tool, URL, feature, pricing claim, ranking or capability.
- Give 3-5 tools when enough matches exist.
- Explain why each matches the user's need.
- Include a source link for recommendations.
- If no match exists, say the current TAAFT KB did not return a match.
- Never claim "best" unless clearly framed as subjective.

PORTFOLIO RULES:
Use the profile context for questions about Seeni. Do not invent private information.
You are his AI assistant, not Seeni himself.

STYLE: concise, practical and professional.

RETRIEVED TAAFT TOOLS:
${toolContext}

SEENI PORTFOLIO:
${JSON.stringify(seeniProfile,null,2)}`;

    const completion=await client.chat.completions.create({
      model:process.env.OPENAI_MODEL||"gpt-4o-mini",
      temperature:0.2,
      max_tokens:700,
      messages:[{role:"system",content:system},...safeMessages]
    });

    const answer=completion.choices?.[0]?.message?.content||"I couldn't generate a response.";
    return res.status(200).json({
      answer,
      tools:retrievedTools.map(t=>({name:t.name,url:t.url,sourceUrl:t.sourceUrl||t.url}))
    });
  } catch(error) {
    console.error(error);
    return res.status(500).json({error:"The AI assistant is temporarily unavailable."});
  }
}
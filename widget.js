(function(){
const BASE_URL="https://YOUR-CHATBOT-DOMAIN.vercel.app";
const API_URL=`${BASE_URL}/api/chat`;
const link=document.createElement("link");link.rel="stylesheet";link.href=`${BASE_URL}/widget.css`;document.head.appendChild(link);

const button=document.createElement("button");button.id="seeni-ai-button";button.setAttribute("aria-label","Open Seeni AI");button.innerHTML="✦";
const windowEl=document.createElement("div");windowEl.id="seeni-ai-window";windowEl.innerHTML=`
<div class="seeni-ai-header"><div class="seeni-ai-brand"><div class="seeni-ai-avatar">SV</div><div><div class="seeni-ai-title">Seeni AI</div><div class="seeni-ai-status">AI Tool Discovery Assistant</div></div></div><button class="seeni-ai-close" aria-label="Close chatbot">×</button></div>
<div class="seeni-ai-messages" id="seeni-ai-messages"></div>
<div class="seeni-ai-input-area"><div class="seeni-ai-suggestions">
<button class="seeni-ai-suggestion">Find an AI tool for presentations</button><button class="seeni-ai-suggestion">AI tools for coding</button><button class="seeni-ai-suggestion">AI tools for project management</button><button class="seeni-ai-suggestion">Tell me about Seeni</button></div>
<div class="seeni-ai-input-row"><input id="seeni-ai-input" type="text" placeholder="What do you need an AI tool for?" autocomplete="off"><button id="seeni-ai-send" aria-label="Send">→</button></div></div>`;
document.body.appendChild(button);document.body.appendChild(windowEl);

const messagesEl=document.getElementById("seeni-ai-messages"),inputEl=document.getElementById("seeni-ai-input"),sendEl=document.getElementById("seeni-ai-send"),closeEl=windowEl.querySelector(".seeni-ai-close");
let messages=[];

function addMessage(text,role,sources=[]){
const m=document.createElement("div");m.className=`seeni-ai-message ${role}`;m.textContent=text;
sources.slice(0,5).forEach(s=>{if(!s.url)return;const a=document.createElement("a");a.className="seeni-ai-source";a.href=s.sourceUrl||s.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=`Source: ${s.name||"TAAFT"}`;m.appendChild(a);});
messagesEl.appendChild(m);messagesEl.scrollTop=messagesEl.scrollHeight;return m;
}
function welcome(){addMessage("Hi! I'm Seeni AI. I can help you discover AI tools by use case, category, or workflow — and I can also answer questions about Seeni's professional background.","ai");}
async function sendMessage(text){
text=text.trim();if(!text)return;addMessage(text,"user");messages.push({role:"user",content:text});inputEl.value="";
const typing=addMessage("Searching the AI tool knowledge base…","ai");typing.classList.add("seeni-ai-typing");
try{const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages})});if(!r.ok)throw new Error("Request failed");const d=await r.json();typing.remove();const answer=d.answer||"I couldn't generate a response.";addMessage(answer,"ai",d.tools||[]);messages.push({role:"assistant",content:answer});}
catch(e){console.error(e);typing.remove();addMessage("I couldn't reach the AI service right now. Please try again shortly.","ai");}
}
button.addEventListener("click",()=>{windowEl.classList.toggle("open");if(windowEl.classList.contains("open")&&messages.length===0)welcome();if(windowEl.classList.contains("open"))setTimeout(()=>inputEl.focus(),100);});
closeEl.addEventListener("click",()=>windowEl.classList.remove("open"));sendEl.addEventListener("click",()=>sendMessage(inputEl.value));inputEl.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();sendMessage(inputEl.value);}});
windowEl.querySelectorAll(".seeni-ai-suggestion").forEach(el=>el.addEventListener("click",()=>sendMessage(el.textContent)));
})();
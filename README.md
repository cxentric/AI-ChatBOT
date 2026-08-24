# Seeni AI — AI Tool Discovery Chatbot

GitHub/Vercel-ready embeddable chatbot for Seenivaasan Venkat's portfolio.

## Features
- AI tool discovery by natural-language use case
- TAAFT knowledge-base retrieval
- Source links
- Categories and use cases
- Seeni portfolio knowledge base
- Combined questions
- Embeddable widget
- Server-side API key

## Important TAAFT integration note
This project deliberately does NOT scrape TAAFT HTML. The public URL supplied for
TAAFT could not be verified as an official API/export endpoint during build.
Configure `TAAFT_SOURCE_URL` only when you have an approved API, export, feed, or
other permitted data-access method.

## Environment
Required:
OPENAI_API_KEY=...

Optional:
OPENAI_MODEL=gpt-4o-mini
TAAFT_SOURCE_URL=https://...
TAAFT_SOURCE_TOKEN=...

## Sync
npm install
npm run sync:taaft

The configured source should return normalized JSON:
[{name,description,category,useCases,url,sourceUrl}]

## Embed
Change `BASE_URL` in `public/widget.js` to your deployed Vercel URL, then add:

<script src="https://YOUR-CHATBOT-DOMAIN.vercel.app/widget.js" defer></script>

Do not commit API keys or credentials.

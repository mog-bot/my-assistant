# Workstream: My Assistant (AI Agent Platform)

## Project
- **Repo:** https://github.com/mog-bot/my-assistant
- **Live URL:** https://my-assistant-bhre.vercel.app/
- **Local path:** /home/ubuntu/.openclaw/workspace/my-assistant/
- **Stack:** Next.js 14, Groq (llama-3.1-8b-instant), Tailwind CSS, Cheerio (scraping)
- **Groq API Key:** stored in `.env.local`

## What It Does
Platform where businesses get a custom AI chatbot trained on their data. Visitors:
1. Sign up with email
2. Go to Dashboard → paste website URL → auto-scrape
3. Test the AI agent with questions
4. Copy one-line embed code → paste on their site → live

## Features Built
- Landing page with hero, features, how-it-works, pricing sections
- 3 themes: Purple Dark, Matrix (green), Light
- Dashboard: scrape → test → embed workflow
- Chat API with Groq (llama-3.1-8b-instant), rate limiting, SSRF protection
- Embeddable widget (public/widget.js) — works on any external site
- DemoChatBot React component on homepage
- Email signup form

## Updates Log

### 2026-05-07 — Smart AI Chatbot Added
- Replaced basic demo chatbot with full-knowledge agent
- Chatbot answers: product questions (pricing, features, how it works) AND guides users on adding chatbot to their website
- Integration instructions for WordPress, Shopify, Wix, Squarespace, HTML
- Suggested quick-action buttons: "How does it work?", "How do I add this to my site?", etc.
- Updated both: React DemoChatBot component (homepage) + widget.js (external embed)
- Removed WidgetLoader from layout.js to avoid duplicate chat bubbles
- Build passes clean
- **Status:** Committed locally, needs `git push origin main` (no GitHub creds on server)

## Pending / Next Steps
- Mog needs to push to GitHub (no creds set up on server)
- Vercel auto-deploys from GitHub on push
- Consider: niche down to one vertical (dentists?), add lead capture, Google Business Profile onboarding
- Get 10 real businesses testing it

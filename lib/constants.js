// lib/constants.js
// Centralized config — easy to edit in one place

export const SITE_NAME = 'My Assistant'
export const SITE_DESCRIPTION = 'Custom AI assistants trained on your business data. Help your customers 24/7.'

export const GROQ_MODEL = 'llama-3.1-8b-instant'
export const MAX_MESSAGE_LENGTH = 2000
export const MAX_CONTEXT_LENGTH = 15000
export const MAX_SCRAPE_CONTENT_LENGTH = 10000
export const MAX_SCRAPE_LINKS = 20

export const FEATURES = [
  {
    icon: 'AI',
    title: 'Trained on Your Data',
    description: 'We learn from your website, docs, and knowledge base. Your agent knows your business inside out.',
  },
  {
    icon: 'ms',
    title: 'Lightning Fast',
    description: 'Powered by the fastest AI inference available. Customers get answers in milliseconds.',
  },
  {
    icon: '< />',
    title: 'One-Line Embed',
    description: "Copy one line of code onto your site. That's it. Your AI agent is live.",
  },
  {
    icon: '—',
    title: 'Your Data Stays Yours',
    description: 'We never share your business data. It powers your agent and nothing else.',
  },
  {
    icon: '+',
    title: 'Captures Leads',
    description: 'Detects buying intent and captures visitor info so you never miss a potential customer.',
  },
  {
    icon: '24/7',
    title: 'Always Available',
    description: 'Never miss a customer question. Your agent works while you sleep.',
  },
]

export const STEPS = [
  { number: '1', title: 'Sign Up', description: 'Create your account in 30 seconds.' },
  { number: '2', title: 'Connect', description: 'Share your website URL. We learn everything about your business.' },
  { number: '3', title: 'Train', description: 'Your custom AI agent is built automatically from your data.' },
  { number: '4', title: 'Deploy', description: 'Paste one line of code. Your agent is live on your site.' },
]

export const PRICING_TIERS = [
  {
    tier: 'Starter',
    price: 'Free',
    features: ['1 AI agent', '50 messages/month', 'Website scraping', 'Basic widget', '"Powered by My Assistant" badge'],
  },
  {
    tier: 'Pro',
    price: '$29/mo',
    features: ['3 AI agents', 'Unlimited messages', 'Lead capture', 'Custom branding', 'Weekly insights email', 'Priority support'],
    highlighted: true,
  },
  {
    tier: 'Business',
    price: '$79/mo',
    features: ['Unlimited agents', 'Unlimited messages', 'Review response drafts', 'White-label widget', 'API access', 'Human handoff', 'Dedicated support'],
  },
]

// Allowed URL schemes for scraping
export const ALLOWED_SCHEMES = ['http:', 'https:']

// Blocked hostnames for SSRF protection
export const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata
  'metadata.google.internal', // GCP metadata
  '10.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.',
]

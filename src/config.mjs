// Site-wide configuration for the Signals of the Week public hub.
export const SITE = {
  brand: 'Futuros',
  title: 'Signals of the Week',
  tagline: 'Weekly foresight on the shifts reshaping strategy.',
  description: 'A weekly foresight brief — the strategic signals reshaping one sector at a time: technology, FMCG, energy & climate, and mobility.',
  origin: 'https://blog.futuros.io',          // the hub's own subdomain
  siteUrl: 'https://futuros.io',               // the marketing site
  newsletterUrl: 'https://futuros.io/#subscribe', // TODO: point at the MailerLite form
  twitter: '@futuros',
  defaultLang: 'en',
  langs: ['en', 'es', 'ca'],
  // Nav order for the sector hubs. Hubs are still data-driven (only sectors that
  // actually have issues get a page); this just orders the known ones first.
  sectorOrder: ['Technology', 'FMCG', 'Energy & Climate', 'Mobility'],
  author: { name: 'Oliver Henares', org: 'Futuros' },
  // Released-issues feed (your n8n endpoint; returns Content JSON + Status).
  // Override at build time with BLOG_FEED, or read a local file with BLOG_DATA_FILE.
  feed: process.env.BLOG_FEED || 'https://futuros.app.n8n.cloud/webhook/api/signals',
};

// Site-wide configuration for the Signals of the Week public hub.
export const SITE = {
  brand: 'Futuros',
  // The blog is a multi-format publication, not a single newsletter:
  // Signals of the Week (the weekly brief) + Foundations (evergreen explainers),
  // with room for more types. `newsletter` names just the weekly section/feed.
  newsletter: 'Signals of the Week',
  kicker: 'Foresight & strategy',     // header sub-label + home hero eyebrow
  tagline: 'Foresight on the forces reshaping strategy.',
  description: 'Strategic foresight from Futuros — weekly signals on one sector at a time, plus foundations on the methods and language of the field.',
  origin: 'https://blog.futuros.io',          // the hub's own subdomain
  siteUrl: 'https://futuros.io',               // the marketing site
  // Base path of the subscribe page (rendered into dist/subscribe.html
  // by build.mjs). Templates append `?lang=<lang>` so the form renders
  // in the same language as the blog page the visitor came from.
  newsletterUrl: '/subscribe.html',
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
  // Foundations feed — the same endpoint the ops editor reads; the build keeps
  // only Status = Released. Override with BLOG_FOUNDATIONS_FEED or a local file
  // via BLOG_FOUNDATIONS_FILE.
  foundationsFeed: process.env.BLOG_FOUNDATIONS_FEED || 'https://futuros.app.n8n.cloud/webhook/api/foundations',
};

# foresight-blog — the Futuros blog

The public **Futuros** foresight blog, served at **blog.futuros.io**. A multi-format
publication, not a single newsletter:

- **Signals of the Week** — the weekly brief (one sector per issue).
- **Foundations** — evergreen explainers on foresight methods & vocabulary.

A zero-dependency static-site generator: it reads the *released* issues and foundations
from the n8n feeds and renders fully pre-rendered, SEO-indexable HTML (one page per
item × language, plus per-sector hubs, a signals archive, a foundations index, a
sitemap and an RSS feed).

Static HTML is the whole point — crawlers and AI answer engines see the full article
text in the initial response, which the internal ops viewer (client-rendered) can't offer.

## Stack
- **No framework, no build deps.** Plain Node ≥18 (uses global `fetch`).
- Data source: `SITE.feed` (the `api/signals` endpoint) — returns `Content JSON` + `Status`.
- Output: `dist/` — a complete static site ready for Cloudflare Pages.

## Develop
```bash
npm run build      # build dist/ from the live feed
npm run serve      # serve dist/ at http://localhost:8088
npm run dev        # build + serve
```
Override the data source:
```bash
BLOG_FEED="https://…/api/signals" npm run build      # different feed URL
BLOG_DATA_FILE=./sample.json npm run build           # build from a local feed dump
```

## URL structure
```
/                                   home (latest + grid)        ·  /es/  /ca/
/signals/                           archive index               ·  /es/signals/  …
/signals/sector/<slug>/             per-sector hub              ·  /es/signals/sector/<slug>/
/signals/<date>-<sector>-<slug>/    an issue                    ·  /es/signals/…  /ca/signals/…
/sitemap.xml  /rss.xml  /robots.txt  /_headers
```
English is at the root; `es`/`ca` live under a language prefix and are cross-linked
with `hreflang` (+ `x-default` → English). Sector hubs are **data-driven** — only
sectors that actually have a released issue get a page.

## Deploy — Cloudflare Pages
1. Push this folder to its own Git repo.
2. Cloudflare → **Pages → Create → Connect to Git** → this repo.
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - (Optional) env var `BLOG_FEED` if the endpoint ever moves.
3. **Custom domains → add `blog.futuros.io`** (Cloudflare provisions the cert).
4. **Rebuild on publish:** Pages → Settings → **Deploy hooks** → create one, then have
   the n8n "release / schedule campaign" step `POST` that hook URL. The hub is tiny, so
   every publish triggers a full rebuild (simple, no incremental state). A daily
   scheduled rebuild is a good fallback so nothing depends on the webhook firing.

## Marketing site
Add a nav link on **futuros.io** → `https://blog.futuros.io` ("Signals" / "Blog").
That lives in the marketing repo, not here.

## TODO assets
- `assets/og-default.png` — the social-share card (1200×630). Referenced by every page's
  `og:image`; add the real image (a branded "Signals of the Week" card) before launch.
- `assets/favicon.svg` (optional).

## Layout
```
build.mjs            orchestrator: fetch → render all pages → sitemap/rss/robots/_headers
src/config.mjs       site config (domain, langs, sectors, feed, author)
src/data.mjs         fetch + normalize released issues
src/render.mjs       issue text → HTML fragments (ported from ops signals-render.js)
src/templates.mjs    page shells (home, archive, sector, issue) + SEO head + JSON-LD
src/urls.mjs         URL builders
src/util.mjs         slugify / escape
assets/styles.css    public theme
```

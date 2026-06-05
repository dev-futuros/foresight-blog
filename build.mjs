// Static site generator for the Signals of the Week hub.
// Reads released issues from the feed and writes a full static site into dist/.
//   node build.mjs                 → live build from SITE.feed
//   BLOG_DATA_FILE=x.json node …    → build from a local feed dump
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from './src/config.mjs';
import { fetchIssues } from './src/data.mjs';
import { renderHome, renderArchive, renderSector, renderIssue } from './src/templates.mjs';
import { urlHome, urlArchive, urlSector, urlIssue } from './src/urls.mjs';
import { slugify } from './src/util.mjs';

const DIST = path.resolve('dist');
const sameSector = (a, b) => slugify(a) === slugify(b);

function writePage(urlPath, html){
  const dir = path.join(DIST, urlPath.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
function writeFile(rel, content){
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
function copyDir(src, dst){
  if(!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for(const e of fs.readdirSync(src, { withFileTypes: true })){
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function sitemap(issues, present){
  const urls = [];
  const add = (p, lastmod) => urls.push(`<url><loc>${SITE.origin}${p}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`);
  for(const lang of SITE.langs){
    add(urlHome(lang)); add(urlArchive(lang));
    for(const s of present) add(urlSector(lang, s));
    for(const it of issues.filter(i => i.content && i.content[lang])) add(urlIssue(lang, it), it.date);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
function rss(issues){
  const x = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const items = issues.filter(i => i.content && i.content.en).slice(0, 30).map(it => {
    const cc = it.content.en, link = SITE.origin + urlIssue('en', it);
    return `<item><title>${x(cc.subject_line)}</title><link>${link}</link><guid>${link}</guid>` +
      `<pubDate>${new Date(it.date + 'T08:00:00Z').toUTCString()}</pubDate><description>${x(cc.preview_text)}</description></item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>` +
    `<title>${x(SITE.brand)} — ${x(SITE.title)}</title><link>${SITE.origin}</link>` +
    `<description>${x(SITE.description)}</description>\n${items}\n</channel></rss>\n`;
}

async function main(){
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  copyDir(path.resolve('assets'), path.join(DIST, 'assets'));

  const issues = (await fetchIssues()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  console.log(`Building ${issues.length} released issue(s)…`);

  // Sector hubs are data-driven: only sectors that actually have issues get a
  // page, ordered by the known set first, then any legacy sectors after.
  const present = [...new Set(issues.map(i => i.sector).filter(Boolean))];
  const sectors = [
    ...SITE.sectorOrder.filter(s => present.some(p => sameSector(p, s))),
    ...present.filter(p => !SITE.sectorOrder.some(s => sameSector(s, p))),
  ];
  const ctx = { sectors };

  let pageCount = 0;
  for(const lang of SITE.langs){
    const li = issues.filter(it => it.content && it.content[lang]);
    writePage(urlHome(lang), renderHome(li, lang, ctx)); pageCount++;
    writePage(urlArchive(lang), renderArchive(li, lang, ctx)); pageCount++;
    for(const sector of sectors){
      writePage(urlSector(lang, sector), renderSector(li.filter(it => sameSector(it.sector, sector)), sector, lang, ctx)); pageCount++;
    }
    for(const it of li){ writePage(urlIssue(lang, it), renderIssue(it, lang, ctx)); pageCount++; }
  }

  writeFile('sitemap.xml', sitemap(issues, present));
  writeFile('rss.xml', rss(issues));
  writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);
  writeFile('_headers', `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Robots-Tag: index, follow\n  Cache-Control: public, max-age=600, must-revalidate\n`);

  console.log(`Done → ${DIST}  (${pageCount} pages, sectors: ${sectors.join(', ') || 'none'})`);
}

main().catch(e => { console.error(e); process.exit(1); });

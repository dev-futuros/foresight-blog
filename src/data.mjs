// Data layer: fetch released issues from the feed (or a local file) and
// normalize them into a flat shape the templates consume.
import fs from 'node:fs';
import { SITE } from './config.mjs';
import { slugify } from './util.mjs';

export async function fetchIssues(){
  let raw;
  if(process.env.BLOG_DATA_FILE){
    raw = JSON.parse(fs.readFileSync(process.env.BLOG_DATA_FILE, 'utf8'));
  } else {
    const res = await fetch(SITE.feed, { headers: { 'cache-control': 'no-cache' } });
    if(!res.ok) throw new Error('feed fetch failed: ' + res.status);
    const text = await res.text();
    raw = text.trim() ? JSON.parse(text) : [];
  }
  // tolerate [{records:[...]}], {records}, {issues}, or [...]
  if(Array.isArray(raw) && raw.length === 1 && raw[0] && raw[0].records) raw = raw[0];
  const arr = raw.issues || raw.records || (Array.isArray(raw) ? raw : []);
  // Public hub = released issues only, and only those with usable content.
  return arr.map(normalize).filter(it => it && it.released && it.content);
}

function pickFirst(c){ return c.en || c.es || c.ca || Object.values(c)[0] || {}; }
function stripPrefix(s){
  return String(s || '')
    .replace(/^signals of the week\s*[:|-]?\s*/i, '')
    .replace(/^se(ñ|n)yals?.*?[:|-]\s*/i, '')
    .replace(/^[\p{L}\s&]+\|\s*/u, '')   // drop a leading "FMCG | " style sector prefix
    .trim();
}

function normalize(rec){
  const f = rec.fields || rec;
  const status = String(f.Status || f.status || '').trim().toLowerCase();
  let content = f['Content JSON'] ?? f.content_json ?? f.content;
  if(typeof content === 'string'){ try { content = JSON.parse(content); } catch { content = null; } }
  const date = f.Date || f.date || '';
  const sector = f.Sector || f.sector || '';
  const subj = (content && (content.en?.subject_line || pickFirst(content).subject_line)) || f['Subject Line'] || '';
  return {
    id: rec.id || f.record_id || '',
    date, sector,
    released: status === 'released',
    content,   // { en, es, ca } each { subject_line, preview_text, intro, purpose, signals[], close }
    signalCount: f['Signal Count'] || (content && (pickFirst(content).signals || []).length) || 0,
    slug: [date, slugify(sector), slugify(stripPrefix(subj))].filter(Boolean).join('-').replace(/-+/g, '-'),
  };
}

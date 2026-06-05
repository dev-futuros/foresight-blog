// Page templates. Each renderer returns a full HTML document string.
import { SITE } from './config.mjs';
import { esc } from './util.mjs';
import { paras, bodyToHtml, plainText } from './render.mjs';
import { urlHome, urlArchive, urlSector, urlIssue } from './urls.mjs';

const HTML_LANG = { en: 'en', es: 'es', ca: 'ca' };
const YEAR = new Date().getFullYear();

const T = {
  en: { tagline: SITE.tagline, latest: 'Latest issue', archive: 'Archive', subscribe: 'Subscribe',
    subscribeCta: 'Get Signals of the Week', subscribeSub: 'One sector, the week’s strategic signals, every Tuesday. Free.',
    readIssue: 'Read the issue', allIssues: 'All issues', bottomLine: 'The bottom line',
    archiveTitle: 'The archive', archiveSub: 'Every issue of Signals of the Week.',
    sectorIn: 'Sector', noIssues: 'No issues published yet.', back: '← All issues', dateLocale: 'en-GB' },
  es: { tagline: 'Foresight semanal sobre los cambios que están redefiniendo la estrategia.', latest: 'Última edición', archive: 'Archivo', subscribe: 'Suscríbete',
    subscribeCta: 'Recibe Signals of the Week', subscribeSub: 'Un sector, las señales estratégicas de la semana, cada martes. Gratis.',
    readIssue: 'Leer la edición', allIssues: 'Todas las ediciones', bottomLine: 'En resumen',
    archiveTitle: 'El archivo', archiveSub: 'Todas las ediciones de Signals of the Week.',
    sectorIn: 'Sector', noIssues: 'Aún no hay ediciones publicadas.', back: '← Todas las ediciones', dateLocale: 'es-ES' },
  ca: { tagline: 'Foresight setmanal sobre els canvis que redefineixen l’estratègia.', latest: 'Última edició', archive: 'Arxiu', subscribe: 'Subscriu-t’hi',
    subscribeCta: 'Rep Signals of the Week', subscribeSub: 'Un sector, els senyals estratègics de la setmana, cada dimarts. Gratis.',
    readIssue: 'Llegir l’edició', allIssues: 'Totes les edicions', bottomLine: 'En resum',
    archiveTitle: 'L’arxiu', archiveSub: 'Totes les edicions de Signals of the Week.',
    sectorIn: 'Sector', noIssues: 'Encara no hi ha edicions publicades.', back: '← Totes les edicions', dateLocale: 'ca-ES' },
};
function t(lang){ return T[lang] || T.en; }
function fmtDate(iso, lang){
  if(!iso) return '';
  try { return new Date(iso + 'T00:00:00').toLocaleDateString(t(lang).dateLocale, { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return iso; }
}
function c(issue, lang){ return (issue.content && issue.content[lang]) || {}; }
function cleanSubject(s){ return String(s || '').replace(/^signals of the week\s*[:|-]?\s*/i, '').trim() || SITE.title; }
function altsFor(getPath){ return SITE.langs.map(l => ({ lang: l, path: getPath(l) })); }

function head({ lang, title, description, path, alternates, type, published, jsonld }){
  const canonical = SITE.origin + path;
  const altTags = (alternates || []).map(a =>
    `<link rel="alternate" hreflang="${a.lang}" href="${SITE.origin + a.path}">`).join('');
  const xDefault = (alternates || []).find(a => a.lang === 'en');
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${altTags}${xDefault ? `<link rel="alternate" hreflang="x-default" href="${SITE.origin + xDefault.path}">` : ''}
<meta property="og:type" content="${type === 'article' ? 'article' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(SITE.brand)} — ${esc(SITE.title)}">
<meta property="og:image" content="${SITE.origin}/assets/og-default.png">
${published ? `<meta property="article:published_time" content="${published}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SITE.twitter}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}`;
}

function page({ lang, title, description, path, alternates, type = 'website', published, jsonld, body, sectors = [], active }){
  const L = t(lang);
  const nav = sectors.map(s =>
    `<a href="${urlSector(lang, s)}"${active === 'sector:' + s ? ' class="on"' : ''}>${esc(s)}</a>`).join('');
  const langSwitch = (alternates && alternates.length > 1)
    ? `<div class="lang-switch">${alternates.map(a => `<a href="${a.path}"${a.lang === lang ? ' class="on"' : ''}>${a.lang.toUpperCase()}</a>`).join('')}</div>` : '';
  return `<!DOCTYPE html><html lang="${HTML_LANG[lang] || 'en'}"><head>${head({ lang, title, description, path, alternates, type, published, jsonld })}</head>
<body>
<header class="site-head"><div class="wrap site-head-in">
  <a class="brand" href="${urlHome(lang)}"><span class="brand-mark">Futuros</span><span class="brand-sub">${esc(SITE.title)}</span></a>
  <nav class="site-nav"><a href="${urlArchive(lang)}"${active === 'archive' ? ' class="on"' : ''}>${esc(L.archive)}</a>${nav}<a class="nav-cta" href="${SITE.newsletterUrl}?lang=${lang}">${esc(L.subscribe)}</a></nav>
</div></header>
<main class="wrap main">${body}</main>
<section class="subscribe"><div class="wrap subscribe-in">
  <h2>${esc(L.subscribeCta)}</h2><p>${esc(L.subscribeSub)}</p>
  <a class="btn-cta" href="${SITE.newsletterUrl}?lang=${lang}">${esc(L.subscribe)} →</a>
</div></section>
<footer class="site-foot"><div class="wrap site-foot-in">
  <div>© ${YEAR} ${esc(SITE.brand)} · <a href="${SITE.siteUrl}">futuros.io</a></div>${langSwitch}
</div></footer>
</body></html>`;
}

function issueCard(issue, lang){
  const cc = c(issue, lang); const L = t(lang);
  return `<a class="card" href="${urlIssue(lang, issue)}">
  <div class="card-meta"><span class="card-sector">${esc(String(issue.sector).toUpperCase())}</span><span class="card-date">${fmtDate(issue.date, lang)}</span></div>
  <h3 class="card-title">${esc(cleanSubject(cc.subject_line))}</h3>
  ${cc.preview_text ? `<p class="card-preview">${esc(cc.preview_text)}</p>` : ''}
  <span class="card-more">${esc(L.readIssue)} →</span></a>`;
}

export function renderHome(issues, lang, ctx){
  const L = t(lang);
  const alternates = altsFor(urlHome);
  const [latest, ...rest] = issues;
  let body = `<section class="hero">
    <div class="hero-eyebrow">${esc(SITE.title)}</div>
    <h1 class="hero-title">${esc(L.tagline)}</h1>
    <p class="hero-sub">${esc(SITE.description)}</p></section>`;
  if(latest){
    const cc = c(latest, lang);
    body += `<section class="latest"><div class="section-label">${esc(L.latest)}</div>
      <a class="card card--feature" href="${urlIssue(lang, latest)}">
        <div class="card-meta"><span class="card-sector">${esc(String(latest.sector).toUpperCase())}</span><span class="card-date">${fmtDate(latest.date, lang)}</span></div>
        <h2 class="card-title">${esc(cleanSubject(cc.subject_line))}</h2>
        ${cc.preview_text ? `<p class="card-preview">${esc(cc.preview_text)}</p>` : ''}
        <span class="card-more">${esc(L.readIssue)} →</span></a></section>`;
  }
  if(rest.length){
    body += `<section class="grid-section"><div class="section-label">${esc(L.allIssues)}</div>
      <div class="card-grid">${rest.map(it => issueCard(it, lang)).join('')}</div></section>`;
  }
  if(!issues.length) body += `<p class="empty">${esc(L.noIssues)}</p>`;
  return page({ lang, title: `${SITE.title} — ${SITE.brand}`, description: SITE.description, path: urlHome(lang), alternates, body, sectors: ctx.sectors, active: 'home' });
}

export function renderArchive(issues, lang, ctx){
  const L = t(lang);
  const body = `<section class="page-head"><h1>${esc(L.archiveTitle)}</h1><p>${esc(L.archiveSub)}</p></section>
    <div class="card-grid">${issues.map(it => issueCard(it, lang)).join('') || `<p class="empty">${esc(L.noIssues)}</p>`}</div>`;
  return page({ lang, title: `${L.archiveTitle} — ${SITE.title}`, description: `${SITE.title}: ${SITE.description}`, path: urlArchive(lang), alternates: altsFor(urlArchive), body, sectors: ctx.sectors, active: 'archive' });
}

export function renderSector(issues, sector, lang, ctx){
  const L = t(lang);
  const body = `<section class="page-head"><div class="ph-eyebrow">${esc(L.sectorIn)}</div><h1>${esc(sector)}</h1></section>
    <div class="card-grid">${issues.map(it => issueCard(it, lang)).join('') || `<p class="empty">${esc(L.noIssues)}</p>`}</div>`;
  return page({ lang, title: `${sector} — ${SITE.title}`, description: `${SITE.title}: weekly ${sector} foresight signals.`, path: urlSector(lang, sector), alternates: altsFor(l => urlSector(l, sector)), body, sectors: ctx.sectors, active: 'sector:' + sector });
}

export function renderIssue(issue, lang, ctx){
  const cc = c(issue, lang); const L = t(lang);
  const subject = cleanSubject(cc.subject_line);
  const signals = Array.isArray(cc.signals) ? cc.signals : [];
  const alternates = SITE.langs.filter(l => issue.content[l]).map(l => ({ lang: l, path: urlIssue(l, issue) }));
  const articleBody = [cc.intro, ...signals.map(s => `${s.headline}. ${plainText(s.body)}`), cc.close].filter(Boolean).map(plainText).join(' ').slice(0, 5000);
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: subject, description: cc.preview_text || '',
    datePublished: issue.date, dateModified: issue.date, inLanguage: lang,
    author: { '@type': 'Person', name: SITE.author.name },
    publisher: { '@type': 'Organization', name: SITE.author.org, url: SITE.siteUrl },
    mainEntityOfPage: SITE.origin + urlIssue(lang, issue),
    image: SITE.origin + '/assets/og-default.png',
    articleSection: issue.sector, articleBody,
  };
  let body = `<article class="issue">
    <div class="issue-meta"><a class="issue-sector" href="${urlSector(lang, issue.sector)}">${esc(String(issue.sector).toUpperCase())}</a><span class="dot">·</span><time datetime="${issue.date}">${fmtDate(issue.date, lang)}</time></div>
    <h1 class="issue-title">${esc(subject)}</h1>
    ${cc.preview_text ? `<p class="issue-lede">${esc(cc.preview_text)}</p>` : ''}
    ${cc.intro ? `<div class="issue-intro">${paras(cc.intro)}</div>` : ''}
    <div class="issue-signals">`;
  signals.forEach((s, i) => {
    body += `<section class="sig"><div class="sig-num">${String(i + 1).padStart(2, '0')}</div>
      <h2 class="sig-headline">${esc(s.headline || '')}</h2>
      <div class="sig-body">${bodyToHtml(s.body)}</div></section>`;
  });
  body += '</div>';
  if(cc.close) body += `<div class="issue-close"><div class="issue-close-label">${esc(L.bottomLine)}</div>${paras(cc.close)}</div>`;
  body += `<div class="issue-foot"><a href="${urlArchive(lang)}">${esc(L.back)}</a></div></article>`;
  return page({ lang, title: `${subject} — ${SITE.title}`, description: cc.preview_text || SITE.description, path: urlIssue(lang, issue), alternates, type: 'article', published: issue.date + 'T08:00:00Z', jsonld, body, sectors: ctx.sectors, active: 'sector:' + issue.sector });
}

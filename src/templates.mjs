// Page templates. Each renderer returns a full HTML document string.
import { SITE } from './config.mjs';
import { esc } from './util.mjs';
import { paras, bodyToHtml, plainText, mdToHtml } from './render.mjs';
import { urlHome, urlArchive, urlSector, urlIssue, urlFoundations, urlFoundation } from './urls.mjs';

const HTML_LANG = { en: 'en', es: 'es', ca: 'ca' };
const YEAR = new Date().getFullYear();

const T = {
  en: { tagline: SITE.tagline, latest: 'Latest issue', archive: 'Archive', subscribe: 'Subscribe',
    subscribeCta: 'Get Signals of the Week', subscribeSub: 'One sector, the week’s strategic signals, every Tuesday. Free.',
    readIssue: 'Read the issue', allIssues: 'All issues', bottomLine: 'The bottom line',
    archiveTitle: 'The archive', archiveSub: 'Every issue of Signals of the Week.',
    sectorIn: 'Sector', noIssues: 'No issues published yet.', back: '← All issues', dateLocale: 'en-GB',
    foundations: 'Foundations', foundationsTitle: 'Foundations',
    foundationsSub: 'Foresight, explained — the methods and the vocabulary behind the practice.',
    foundationsRead: 'Read', foundationsBack: '← All Foundations', foundationsEmpty: 'Nothing here yet.',
    allFoundations: 'All Foundations',
    cookiesTitle: 'Cookies & analytics',
    cookiesBody: "We may use analytics tools to understand how Futuros is used and improve it. We don't share data with advertisers or ad-tech third parties.",
    cookiesLearn: 'Privacy Policy', cookiesAccept: 'Accept', cookiesReject: 'Decline' },
  es: { tagline: 'Foresight sobre las fuerzas que están redefiniendo la estrategia.', latest: 'Última edición', archive: 'Archivo', subscribe: 'Suscríbete',
    subscribeCta: 'Recibe Signals of the Week', subscribeSub: 'Un sector, las señales estratégicas de la semana, cada martes. Gratis.',
    readIssue: 'Leer la edición', allIssues: 'Todas las ediciones', bottomLine: 'En resumen',
    archiveTitle: 'El archivo', archiveSub: 'Todas las ediciones de Signals of the Week.',
    sectorIn: 'Sector', noIssues: 'Aún no hay ediciones publicadas.', back: '← Todas las ediciones', dateLocale: 'es-ES',
    foundations: 'Fundamentos', foundationsTitle: 'Fundamentos',
    foundationsSub: 'El foresight, explicado — los métodos y el vocabulario de la práctica.',
    foundationsRead: 'Leer', foundationsBack: '← Todos los fundamentos', foundationsEmpty: 'Aún no hay nada aquí.',
    allFoundations: 'Todos los fundamentos',
    cookiesTitle: 'Cookies y analítica',
    cookiesBody: 'Podemos usar herramientas de analítica para entender cómo se usa Futuros y mejorarlo. No compartimos datos con anunciantes ni terceros publicitarios.',
    cookiesLearn: 'Política de Privacidad', cookiesAccept: 'Aceptar', cookiesReject: 'Rechazar' },
  ca: { tagline: 'Foresight sobre les forces que redefineixen l’estratègia.', latest: 'Última edició', archive: 'Arxiu', subscribe: 'Subscriu-t’hi',
    subscribeCta: 'Rep Signals of the Week', subscribeSub: 'Un sector, els senyals estratègics de la setmana, cada dimarts. Gratis.',
    readIssue: 'Llegir l’edició', allIssues: 'Totes les edicions', bottomLine: 'En resum',
    archiveTitle: 'L’arxiu', archiveSub: 'Totes les edicions de Signals of the Week.',
    sectorIn: 'Sector', noIssues: 'Encara no hi ha edicions publicades.', back: '← Totes les edicions', dateLocale: 'ca-ES',
    foundations: 'Fonaments', foundationsTitle: 'Fonaments',
    foundationsSub: 'El foresight, explicat — els mètodes i el vocabulari de la pràctica.',
    foundationsRead: 'Llegir', foundationsBack: '← Tots els fonaments', foundationsEmpty: 'Encara no hi ha res aquí.',
    allFoundations: 'Tots els fonaments',
    cookiesTitle: 'Cookies i analítica',
    cookiesBody: "Podem fer servir eines d'analítica per entendre com s'utilitza Futuros i millorar-lo. No compartim dades amb anunciants ni tercers publicitaris.",
    cookiesLearn: 'Política de Privacitat', cookiesAccept: 'Acceptar', cookiesReject: 'Rebutjar' },
};
function t(lang){ return T[lang] || T.en; }
function fmtDate(iso, lang){
  if(!iso) return '';
  try { return new Date(iso + 'T00:00:00').toLocaleDateString(t(lang).dateLocale, { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return iso; }
}
function c(issue, lang){ return (issue.content && issue.content[lang]) || {}; }
function cleanSubject(s){ return String(s || '').replace(/^signals of the week\s*[:|-]?\s*/i, '').trim() || SITE.newsletter; }
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
<meta property="og:site_name" content="${esc(SITE.brand)}">
<meta property="og:image" content="${SITE.origin}/assets/og-default.png">
${published ? `<meta property="article:published_time" content="${published}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SITE.twitter}">
<!-- Cross-domain language redirect — runs before paint so users with
     a stored 'es'/'ca' preference (set on the marketing site, app, or
     elsewhere in the .futuros.io family) skip the English home and
     land directly on their preferred-language home. Only fires at the
     root URL ("/"); other URLs reflect explicit user intent. -->
<script>
(function(){
  if (window.location.pathname !== '/') return;
  var m = (document.cookie || '').match(/(?:^|; )futuros_lang=([^;]+)/);
  var l = m ? decodeURIComponent(m[1]) : null;
  if (l === 'es') window.location.replace('/es/');
  else if (l === 'ca') window.location.replace('/ca/');
})();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
<!-- Mixpanel analytics (EU residency, opt-out by default). Same project
     as the marketing site so dashboards span the .futuros.io family.
     Tagged with surface='blog' to separate from the marketing site
     ('marketing') and the app ('app'). -->
<script>
(function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
mixpanel.init('a4b409c01e5f9a3b21db626b1cdefbbb', { api_host: 'https://api-eu.mixpanel.com', opt_out_tracking_by_default: true, record_sessions_percent: 100, record_mask_text_selector: 'input, textarea, [data-mp-mask]', cookie_domain: 'futuros.io', cross_subdomain_cookie: true, loaded: function(mp) { try { mp.register({ surface: 'blog' }); } catch(_) {} } });
// Belt-and-suspenders sync register — the canonical path is the
// loaded callback above (which runs after the SDK has read its
// persisted state, avoiding the post-init register race that strips
// surface from events like Article Viewed and server-synthesized
// session_start / session_end). This sync call is a harmless
// duplicate when loaded fires, a fallback if it ever doesn't.
try { mixpanel.register({ surface: 'blog' }); } catch(_) {}
try {
  var _seg = (document.cookie || '').split('; ').find(function (c) { return c.indexOf('futuros_consent=') === 0; });
  var _v = _seg ? decodeURIComponent(_seg.slice(16)) : null;
  if (_v === 'accepted') {
    mixpanel.opt_in_tracking();
    if (typeof mixpanel.start_session_recording === 'function') mixpanel.start_session_recording();
  }
} catch(_) {}
try { mixpanel.track('Page Viewed', { surface: 'blog', path: window.location.pathname, lang: '${lang}' }); } catch(_) {}
</script>`;
}

function page({ lang, title, description, path, alternates, type = 'website', published, jsonld, body, sectors = [], active }){
  const L = t(lang);
  // Signals of the Week → for now a plain link to the archive (the "All" page).
  // The sector dropdown is parked; the .nav-dd styles/JS stay for an easy re-enable.
  const sigActive = (active === 'archive' || String(active || '').indexOf('sector:') === 0) ? ' class="on"' : '';
  const signalsNav = `<a href="${urlArchive(lang)}"${sigActive}>${esc(SITE.newsletter)}</a>`;
  // Always render all 3 language pills, even if the current page has no
  // alternate in some language. Missing alternates fall back to that
  // language's home so the pill always navigates somewhere useful.
  const altMap = Object.fromEntries((alternates || []).map(a => [a.lang, a.path]));
  const langPills = SITE.langs.map(l => ({ lang: l, path: altMap[l] || urlHome(l) }));
  const langToggle = `<div class="lang-toggle">${langPills.map(p =>
    `<a class="lt-btn${p.lang === lang ? ' active' : ''}" href="${p.path}" data-lang="${p.lang}">${p.lang.toUpperCase()}</a>`).join('')}</div>`;
  return `<!DOCTYPE html><html lang="${HTML_LANG[lang] || 'en'}"><head>${head({ lang, title, description, path, alternates, type, published, jsonld })}</head>
<body>
<!-- Cross-domain cookie consent banner. Hidden if the visitor has
     already decided on any .futuros.io subdomain — the cookie carries
     the choice across the family. -->
<div class="fs-cookies" id="fsCookies" role="dialog" aria-live="polite" aria-label="Cookies consent">
  <div class="fs-cookies-text">
    <div class="fs-cookies-title">${esc(L.cookiesTitle)}</div>
    <div class="fs-cookies-body">${esc(L.cookiesBody)} <a href="${SITE.siteUrl}/terms.html?lang=${lang}">${esc(L.cookiesLearn)}</a>.</div>
  </div>
  <div class="fs-cookies-actions">
    <button type="button" class="fs-cookies-reject" id="fsCookiesReject">${esc(L.cookiesReject)}</button>
    <button type="button" class="fs-cookies-accept" id="fsCookiesAccept">${esc(L.cookiesAccept)}</button>
  </div>
</div>
<header class="site-head"><div class="wrap site-head-in">
  <a class="brand" href="${urlHome(lang)}"><span class="brand-mark">Futuros</span><span class="brand-sub">${esc(SITE.kicker)}</span></a>
  <nav class="site-nav">${signalsNav}<a href="${urlFoundations(lang)}"${active === 'foundations' ? ' class="on"' : ''}>${esc(L.foundations)}</a><a class="nav-ghost" href="${SITE.siteUrl}/?lang=${lang}">futuros.io ↗</a><a class="nav-cta" href="${SITE.newsletterUrl}?lang=${lang}">${esc(L.subscribe)}</a></nav>
</div></header>
<main class="wrap main">${body}</main>
<section class="subscribe"><div class="wrap subscribe-in">
  <h2>${esc(L.subscribeCta)}</h2><p>${esc(L.subscribeSub)}</p>
  <a class="btn-cta" href="${SITE.newsletterUrl}?lang=${lang}">${esc(L.subscribe)} →</a>
</div></section>
<footer class="site-foot"><div class="wrap site-foot-in">
  <div>© ${YEAR} ${esc(SITE.brand)} · <a href="${SITE.siteUrl}">futuros.io</a></div>
</div></footer>
${langToggle}
<!-- Cross-domain language cookie + consent banner control.
     Cookie write: every page load stamps futuros_lang with the current
     page's language so a later visit to futuros.io / beta.futuros.io
     inherits it. Banner: shows only if no prior consent on .futuros.io. -->
<script>
(function(){
  var LANG = '${lang}';
  // Compute the .futuros.io domain attribute once; reused by the
  // page-load write and the pill click-handler write below.
  var DOMAIN_ATTR = (function(){
    try {
      var host = window.location.hostname;
      var isLocal = host === 'localhost' || /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(host);
      var parts = host.split('.');
      return !isLocal && parts.length >= 2 ? '; domain=.' + parts.slice(-2).join('.') : '';
    } catch(_) { return ''; }
  })();
  function writeLangCookie(v){
    try { document.cookie = 'futuros_lang=' + v + '; path=/; max-age=31536000; SameSite=Lax' + DOMAIN_ATTR; } catch(_) {}
  }
  // Write the language cookie scoped to the parent .futuros.io so every
  // subdomain sees the user's current choice. 1-year max-age matches
  // the marketing site's lang cookie.
  writeLangCookie(LANG);
  // Close the Signals-of-the-Week nav dropdown when clicking outside it.
  document.addEventListener('click', function(e){
    var dds = document.querySelectorAll('details.nav-dd[open]');
    for (var k = 0; k < dds.length; k++) { if (!dds[k].contains(e.target)) dds[k].removeAttribute('open'); }
  });
  // Pill click handler: write the NEW language to the cookie BEFORE the
  // browser navigates to the new page. Without this, the head-script
  // redirect on the next page reads the stale cookie (=current page's
  // lang) and bounces you back. With this, navigation from /es/ → /
  // writes 'en' first, so the head-script sees 'en' and stays at /.
  document.querySelectorAll('.lt-btn').forEach(function(el){
    el.addEventListener('click', function(){
      var next = el.getAttribute('data-lang');
      if (next === 'en' || next === 'es' || next === 'ca') writeLangCookie(next);
    });
  });
  // Cookie consent banner.
  var banner = document.getElementById('fsCookies');
  function readCookie(name){
    var prefix = name + '=';
    var seg = (document.cookie || '').split('; ').find(function(c){return c.indexOf(prefix) === 0;});
    if (!seg) return null;
    try { return decodeURIComponent(seg.slice(prefix.length)); } catch(_) { return null; }
  }
  function cookieDomainAttr(){
    var host = window.location.hostname;
    var isLocal = host === 'localhost' || /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(host);
    var parts = host.split('.');
    if (isLocal || parts.length < 2) return '';
    return '; domain=.' + parts.slice(-2).join('.');
  }
  function writeConsent(v){
    var maxAge = v === 'accepted' ? '; max-age=31536000' : '';
    document.cookie = 'futuros_consent=' + encodeURIComponent(v) + '; path=/; SameSite=Lax' + maxAge + cookieDomainAttr();
  }
  function apply(decision){
    if (!window.mixpanel) return;
    if (decision === 'accepted' && typeof mixpanel.opt_in_tracking === 'function') {
      mixpanel.opt_in_tracking();
      if (typeof mixpanel.start_session_recording === 'function') {
        try { mixpanel.start_session_recording(); } catch(_) {}
      }
    } else if (decision === 'rejected' && typeof mixpanel.opt_out_tracking === 'function') {
      mixpanel.opt_out_tracking();
    }
  }
  var stored = readCookie('futuros_consent');
  if (stored === 'accepted' || stored === 'rejected') {
    bindClickTracking();
    return;
  }
  setTimeout(function(){ banner.classList.add('fs-cookies-show'); }, 600);
  document.getElementById('fsCookiesAccept').addEventListener('click', function(){
    writeConsent('accepted'); apply('accepted');
    try { mixpanel.track('Page Viewed', { surface: 'blog', path: window.location.pathname, lang: LANG }); } catch(_) {}
    banner.classList.remove('fs-cookies-show');
  });
  document.getElementById('fsCookiesReject').addEventListener('click', function(){
    writeConsent('rejected'); apply('rejected');
    banner.classList.remove('fs-cookies-show');
  });
  bindClickTracking();

  // Click-tracking for funnel transitions:
  //   - Subscribe Clicked: blog → blog.futuros.io/subscribe.html (Newsletter Subscribed)
  //   - Article Clicked:   blog list view → article page (Article Viewed)
  // Uses mixpanel.track_links — purpose-built to fire the event before
  // navigation so it isn't dropped. Safe to call while opted out: the
  // SDK silently discards the events.
  function bindClickTracking(){
    if (!window.mixpanel || typeof mixpanel.track_links !== 'function') return;
    try {
      mixpanel.track_links('a.nav-cta, a.btn-cta', 'Subscribe Clicked', function(el){
        return {
          location: el.classList.contains('nav-cta') ? 'top-nav' : 'bottom-cta',
          lang: LANG,
          source_path: window.location.pathname
        };
      });
      mixpanel.track_links('a.card', 'Article Clicked', function(el){
        var sectorEl = el.querySelector('.card-sector');
        return {
          target_path: el.getAttribute('href') || '',
          target_sector: sectorEl ? sectorEl.textContent.trim() : '',
          source_path: window.location.pathname,
          lang: LANG
        };
      });
    } catch(_){}
  }
})();
</script>
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

export function renderHome(issues, lang, ctx, foundations = []){
  const L = t(lang);
  const alternates = altsFor(urlHome);
  const [latest, ...rest] = issues;
  let body = `<section class="hero">
    <div class="hero-eyebrow">${esc(SITE.kicker)}</div>
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
  // Foundations: a visually distinct block (cool pill) below the issues.
  if(foundations && foundations.length){
    body += `<section class="grid-section grid-section--fnd"><div class="section-label section-label--fnd">${esc(L.foundations)}</div>
      <div class="card-grid">${foundations.slice(0, 4).map(it => foundationCard(it, lang)).join('')}</div>
      <a class="see-all" href="${urlFoundations(lang)}">${esc(L.allFoundations)} →</a></section>`;
  }
  return page({ lang, title: `${SITE.brand} — ${SITE.kicker}`, description: SITE.description, path: urlHome(lang), alternates, body, sectors: ctx.sectors, active: 'home' });
}

export function renderArchive(issues, lang, ctx){
  const L = t(lang);
  const body = `<section class="page-head"><h1>${esc(L.archiveTitle)}</h1><p>${esc(L.archiveSub)}</p></section>
    <div class="card-grid">${issues.map(it => issueCard(it, lang)).join('') || `<p class="empty">${esc(L.noIssues)}</p>`}</div>`;
  return page({ lang, title: `${L.archiveTitle} — ${SITE.newsletter}`, description: L.archiveSub, path: urlArchive(lang), alternates: altsFor(urlArchive), body, sectors: ctx.sectors, active: 'archive' });
}

export function renderSector(issues, sector, lang, ctx){
  const L = t(lang);
  const body = `<section class="page-head"><div class="ph-eyebrow">${esc(L.sectorIn)}</div><h1>${esc(sector)}</h1></section>
    <div class="card-grid">${issues.map(it => issueCard(it, lang)).join('') || `<p class="empty">${esc(L.noIssues)}</p>`}</div>`;
  return page({ lang, title: `${sector} — ${SITE.newsletter}`, description: `Weekly ${sector} foresight signals — ${SITE.newsletter}.`, path: urlSector(lang, sector), alternates: altsFor(l => urlSector(l, sector)), body, sectors: ctx.sectors, active: 'sector:' + sector });
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
  // Article-specific Mixpanel event. Fires in addition to the generic
  // Page Viewed from the page template — Page Viewed gives top-line
  // traffic; Article Viewed feeds article-grained funnels (e.g.,
  // "Article Viewed (sector=Technology) → Subscribe Clicked → Newsletter
  // Subscribed"). Safe whether the user is opted in or out — track() is
  // a no-op on the SDK side when opted out.
  body += `<script>
try {
  mixpanel.track('Article Viewed', {
    surface: 'blog',
    article_slug: ${JSON.stringify(issue.slug)},
    article_sector: ${JSON.stringify(issue.sector)},
    article_date: ${JSON.stringify(issue.date)},
    article_title: ${JSON.stringify(subject)},
    lang: ${JSON.stringify(lang)}
  });
} catch(_) {}
</script>`;
  return page({ lang, title: `${subject} — ${SITE.newsletter}`, description: cc.preview_text || SITE.description, path: urlIssue(lang, issue), alternates, type: 'article', published: issue.date + 'T08:00:00Z', jsonld, body, sectors: ctx.sectors, active: 'sector:' + issue.sector });
}

// ── Foundations (evergreen educational entries) ─────────────────────────────
function fc(item, lang){ return (item.content && item.content[lang]) || {}; }

function foundationCard(item, lang){
  const cc = fc(item, lang); const L = t(lang);
  const tag = item.keyword ? String(item.keyword).toUpperCase() : L.foundations.toUpperCase();
  return `<a class="card card--fnd" href="${urlFoundation(lang, item)}">
  <div class="card-meta"><span class="card-sector">${esc(tag)}</span>${item.date ? `<span class="card-date">${fmtDate(item.date, lang)}</span>` : ''}</div>
  <h3 class="card-title">${esc(cc.title || '')}</h3>
  ${cc.summary ? `<p class="card-preview">${esc(cc.summary)}</p>` : ''}
  <span class="card-more">${esc(L.foundationsRead)} →</span></a>`;
}

export function renderFoundationsIndex(items, lang, ctx){
  const L = t(lang);
  const body = `<section class="page-head"><h1>${esc(L.foundationsTitle)}</h1><p>${esc(L.foundationsSub)}</p></section>
    <div class="card-grid">${items.map(it => foundationCard(it, lang)).join('') || `<p class="empty">${esc(L.foundationsEmpty)}</p>`}</div>`;
  return page({ lang, title: `${L.foundationsTitle} — ${SITE.brand}`, description: L.foundationsSub, path: urlFoundations(lang), alternates: altsFor(urlFoundations), body, sectors: ctx.sectors, active: 'foundations' });
}

export function renderFoundation(item, lang, ctx){
  const cc = fc(item, lang); const L = t(lang);
  const title = cc.title || '';
  const desc = cc.meta || cc.summary || SITE.description;
  const alternates = SITE.langs.filter(l => item.content[l] && item.content[l].title).map(l => ({ lang: l, path: urlFoundation(l, item) }));
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'TechArticle',
    headline: title, description: cc.meta || cc.summary || '',
    inLanguage: lang,
    ...(item.date ? { datePublished: item.date, dateModified: item.date } : {}),
    author: { '@type': 'Organization', name: SITE.author.org },
    publisher: { '@type': 'Organization', name: SITE.author.org, url: SITE.siteUrl },
    mainEntityOfPage: SITE.origin + urlFoundation(lang, item),
    image: SITE.origin + '/assets/og-default.png',
    articleBody: plainText([cc.summary, cc.body].filter(Boolean).join(' ')).slice(0, 5000),
  };
  let body = `<article class="issue fnd">
    <div class="issue-meta"><a class="issue-sector" href="${urlFoundations(lang)}">${esc(L.foundations.toUpperCase())}</a>${item.date ? `<span class="dot">·</span><time datetime="${item.date}">${fmtDate(item.date, lang)}</time>` : ''}</div>
    <h1 class="issue-title">${esc(title)}</h1>
    ${cc.summary ? `<p class="issue-lede">${esc(cc.summary)}</p>` : ''}
    <div class="fnd-prose">${mdToHtml(cc.body)}</div>
    <div class="issue-foot"><a href="${urlFoundations(lang)}">${esc(L.foundationsBack)}</a></div></article>`;
  body += `<script>
try {
  mixpanel.track('Article Viewed', {
    surface: 'blog', article_type: 'foundation',
    article_slug: ${JSON.stringify(item.slug)},
    article_title: ${JSON.stringify(title)},
    article_keyword: ${JSON.stringify(item.keyword || '')},
    lang: ${JSON.stringify(lang)}
  });
} catch(_) {}
</script>`;
  return page({ lang, title: `${title} — ${SITE.brand}`, description: desc, path: urlFoundation(lang, item), alternates, type: 'article', published: item.date ? item.date + 'T08:00:00Z' : undefined, jsonld, body, sectors: ctx.sectors, active: 'foundations' });
}

// Standalone subscribe page rendered to dist/subscribe.html.
//
// Lives on blog.futuros.io. The subscribe button at the bottom of every
// blog page (templates.mjs `<a class="btn-cta">`) links here with `?lang=`
// so the form renders in the same language as the source page.
//
// Notes on cross-origin assets:
// - Marketing's styles.css is loaded via an absolute URL. The form, cookie
//   banner, and button classes were authored over there and the blog's
//   own styles.css is a separate, smaller theme that doesn't cover them.
// - Favicons load from marketing too — same icon family across the family.
//
// The page is self-contained: Mixpanel snippet, consent banner, i18n,
// form submission. All cookies are written to `.futuros.io` so they
// sync with the marketing site, the app, and the rest of the blog.
export function renderSubscribe(){
  return `<!DOCTYPE html>
<html lang="es" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title data-i18n-title="sub.meta.title">Suscríbete — Futuros</title>
<meta name="description" data-i18n-meta-desc="sub.meta.desc" content="Recibe el newsletter de Futuros directamente en tu inbox. Sin spam.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://blog.futuros.io/subscribe.html">
<meta name="theme-color" content="#09090b">

<link rel="icon" type="image/svg+xml" href="https://futuros.io/icons/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="https://futuros.io/icons/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="https://futuros.io/icons/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap">

<!-- Marketing site's stylesheet — owns .cta-form, .fs-cookies, .btn, etc.
     Loaded cross-subdomain; cached after first hit. Bump the ?v= here
     when bumping it on the marketing side. -->
<link rel="stylesheet" href="https://futuros.io/styles.css?v=2026-05-23">

<!-- Mixpanel analytics (EU residency) -->
<script>
(function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
mixpanel.init('a4b409c01e5f9a3b21db626b1cdefbbb', {
  api_host: 'https://api-eu.mixpanel.com',
  opt_out_tracking_by_default: true,
  record_sessions_percent: 100,
  record_mask_text_selector: 'input, textarea, [data-mp-mask]'
});
try { mixpanel.register({ surface: 'blog' }); } catch(_) {}
try {
  var _seg = (document.cookie || '').split('; ').find(function (c) { return c.indexOf('futuros_consent=') === 0; });
  var _v = _seg ? decodeURIComponent(_seg.slice(16)) : null;
  if (_v !== 'accepted' && localStorage.getItem('futuros_consent_v1') === 'granted') _v = 'accepted';
  if (_v === 'accepted') {
    mixpanel.opt_in_tracking();
    if (typeof mixpanel.start_session_recording === 'function') mixpanel.start_session_recording();
  }
} catch(_) {}
try { mixpanel.track('Page Viewed', { surface: 'blog', path: window.location.pathname }); } catch(_) {}
</script>
</head>
<body>

<!-- Cross-domain cookie consent banner. Identical to the marketing site
     so a visitor who already decided on futuros.io / beta.futuros.io
     doesn't see it again. -->
<div class="fs-cookies" id="fsCookies" role="dialog" aria-live="polite" aria-label="Cookies consent">
  <div class="fs-cookies-text">
    <div class="fs-cookies-title" data-i18n="cookies.title">Cookies y analítica</div>
    <div class="fs-cookies-body">
      <span data-i18n="cookies.body">Podemos usar herramientas de analítica para entender cómo se usa Futuros y mejorarlo. No compartimos datos con anunciantes ni terceros publicitarios.</span> <a href="https://futuros.io/terms.html" data-i18n="cookies.learn">Política de Privacidad</a>.
    </div>
  </div>
  <div class="fs-cookies-actions">
    <button type="button" class="fs-cookies-reject" id="fsCookiesReject" data-i18n="cookies.reject">Rechazar</button>
    <button type="button" class="fs-cookies-accept" id="fsCookiesAccept" data-i18n="cookies.accept">Aceptar</button>
  </div>
</div>

<nav class="nav" id="mainNav">
  <div class="nav-inner">
    <a href="/" class="nav-brand">
      <div class="nav-logo">Futuros</div>
      <div class="nav-tag" data-i18n="nav.tag">Advanced AI Strategic Tools</div>
    </a>
    <div class="nav-links">
      <a href="/" class="nav-link" data-i18n="sub.back">← Volver al blog</a>
    </div>
  </div>
</nav>

<section class="section cta-final" id="newsletter" style="min-height:calc(100dvh - var(--nav-h));display:flex;align-items:center">
  <div class="container">
    <div id="subscribe-form-wrap">
      <div class="eyebrow" style="justify-content:center" data-i18n="sub.eyebrow">Newsletter</div>
      <h2 class="cta-final-title" data-i18n-html="sub.title">Sigue al día con <em>Futuros.</em></h2>
      <p class="cta-final-sub" data-i18n="sub.lede">Actualizaciones de producto, ideas de foresight estratégico y novedades en tu inbox. Sin spam, sin cesión a terceros.</p>
      <form class="cta-form" onsubmit="submitSubscribe(event)">
        <div class="cta-form-row">
          <input class="cta-input" type="text" id="ns-name" required data-i18n-ph="form.name" placeholder="Nombre">
          <input class="cta-input" type="text" id="ns-lastname" required data-i18n-ph="form.lastname" placeholder="Apellido">
        </div>
        <input class="cta-input" type="email" id="ns-email" required data-i18n-ph="form.email" placeholder="tu@email.com">
        <select class="cta-select" id="ns-profile">
          <option value="" disabled selected data-i18n="form.profile.ph">¿Cuál es tu perfil?</option>
          <option value="company" data-i18n="form.profile.o1">Empresa</option>
          <option value="consultant" data-i18n="form.profile.o2">Consultor</option>
          <option value="other" data-i18n="form.profile.o3">Otro</option>
        </select>
        <label class="cta-checkbox">
          <input type="checkbox" id="ns-marketing" required>
          <span class="cta-checkbox-box" aria-hidden="true"></span>
          <span class="cta-checkbox-text" data-i18n="form.marketing">Acepto recibir comunicaciones de marketing de Futuros.</span>
        </label>
        <button type="submit" class="btn btn-primary cta-submit" data-i18n="sub.btn">Suscribirme</button>
        <p class="cta-fine" data-i18n-html="form.fine">Sin spam. Sin cesión a terceros.<br>Contacto directo: <a href="mailto:hello@futuros.io">hello@futuros.io</a></p>
      </form>
    </div>
    <div class="cta-done" id="subscribe-done">
      <div class="cta-done-icon">◈</div>
      <div class="cta-done-title" data-i18n="sub.done.title">¡Suscrito!</div>
      <div class="cta-done-sub" data-i18n="sub.done.sub">Te llegarán las novedades a tu inbox.</div>
    </div>
  </div>
</section>

<script>
/* ═══════════════════════════════════════════════
   SUBSCRIBE PAGE — i18n + consent banner + form submit
   Lives on blog.futuros.io. Language comes from ?lang= URL param
   passed by the blog's subscribe button. Falls back to the
   cross-domain `futuros_lang` cookie if no param.
═══════════════════════════════════════════════ */

const TRANSLATIONS = {
  es: {
    'sub.meta.title':'Suscríbete — Futuros',
    'sub.meta.desc':'Recibe el newsletter de Futuros directamente en tu inbox. Sin spam.',
    'nav.tag':'Advanced AI Strategic Tools',
    'sub.back':'← Volver al blog',
    'sub.eyebrow':'Newsletter',
    'sub.title':'Sigue al día con <em>Futuros.</em>',
    'sub.lede':'Actualizaciones de producto, ideas de foresight estratégico y novedades en tu inbox. Sin spam, sin cesión a terceros.',
    'sub.btn':'Suscribirme',
    'sub.done.title':'¡Suscrito!','sub.done.sub':'Te llegarán las novedades a tu inbox.',
    'form.name':'Nombre','form.lastname':'Apellido','form.email':'tu@email.com',
    'form.profile.ph':'¿Cuál es tu perfil?','form.profile.o1':'Empresa','form.profile.o2':'Consultor','form.profile.o3':'Otro',
    'form.marketing':'Acepto recibir comunicaciones de marketing de Futuros.',
    'form.fine':'Sin spam. Sin cesión a terceros.<br>Contacto directo: <a href="mailto:hello@futuros.io">hello@futuros.io</a>',
    'form.sending':'Enviando...',
    'cookies.title':'Cookies y analítica',
    'cookies.body':'Podemos usar herramientas de analítica para entender cómo se usa Futuros y mejorarlo. No compartimos datos con anunciantes ni terceros publicitarios.',
    'cookies.learn':'Política de Privacidad',
    'cookies.accept':'Aceptar','cookies.reject':'Rechazar',
  },
  en: {
    'sub.meta.title':'Subscribe — Futuros',
    'sub.meta.desc':'Get the Futuros newsletter directly in your inbox. No spam.',
    'nav.tag':'Advanced AI Strategic Tools',
    'sub.back':'← Back to blog',
    'sub.eyebrow':'Newsletter',
    'sub.title':'Stay in the loop with <em>Futuros.</em>',
    'sub.lede':'Product updates, strategic-foresight ideas, and news in your inbox. No spam, no third-party sharing.',
    'sub.btn':'Subscribe',
    'sub.done.title':'Subscribed.','sub.done.sub':"You'll receive Futuros updates in your inbox.",
    'form.name':'First name','form.lastname':'Last name','form.email':'your@email.com',
    'form.profile.ph':"What's your profile?",'form.profile.o1':'Company','form.profile.o2':'Consultant','form.profile.o3':'Other',
    'form.marketing':'I agree to receive marketing communications from Futuros.',
    'form.fine':'No spam. No data sharing.<br>Direct contact: <a href="mailto:hello@futuros.io">hello@futuros.io</a>',
    'form.sending':'Sending...',
    'cookies.title':'Cookies & analytics',
    'cookies.body':"We may use analytics tools to understand how Futuros is used and improve it. We don't share data with advertisers or ad-tech third parties.",
    'cookies.learn':'Privacy Policy',
    'cookies.accept':'Accept','cookies.reject':'Decline',
  },
  ca: {
    'sub.meta.title':'Subscriu-te — Futuros',
    'sub.meta.desc':'Rep el newsletter de Futuros directament al teu correu. Sense spam.',
    'nav.tag':'Advanced AI Strategic Tools',
    'sub.back':'← Tornar al blog',
    'sub.eyebrow':'Newsletter',
    'sub.title':'Segueix al dia amb <em>Futuros.</em>',
    'sub.lede':'Actualitzacions de producte, idees de foresight estratègic i novetats al teu correu. Sense spam, sense cessió a tercers.',
    'sub.btn':"Subscriure'm",
    'sub.done.title':'Subscrit!','sub.done.sub':"T'arribaran les novetats al teu correu.",
    'form.name':'Nom','form.lastname':'Cognom','form.email':'tu@email.com',
    'form.profile.ph':'Quin és el teu perfil?','form.profile.o1':'Empresa','form.profile.o2':'Consultor','form.profile.o3':'Altre',
    'form.marketing':'Accepto rebre comunicacions de màrqueting de Futuros.',
    'form.fine':"Sense spam. Sense cessió a tercers.<br>Contacte directe: <a href=\\"mailto:hello@futuros.io\\">hello@futuros.io</a>",
    'form.sending':'Enviant...',
    'cookies.title':'Cookies i analítica',
    'cookies.body':"Podem fer servir eines d'analítica per entendre com s'utilitza Futuros i millorar-lo. No compartim dades amb anunciants ni tercers publicitaris.",
    'cookies.learn':'Política de Privacitat',
    'cookies.accept':'Acceptar','cookies.reject':'Rebutjar',
  }
};

const N8N_WEBHOOK = 'https://futuros.app.n8n.cloud/webhook/api/user/subscribe';
const SUPPORTED_LANGS = ['es','en','ca'];
const LANG_COOKIE = 'futuros_lang';
let currentLang = 'es';

function readLangCookie(){
  try {
    const prefix = LANG_COOKIE + '=';
    const seg = (document.cookie || '').split('; ').find(c => c.indexOf(prefix) === 0);
    if (!seg) return null;
    return decodeURIComponent(seg.slice(prefix.length));
  } catch(e) { return null; }
}

function detectLang(){
  const param = new URLSearchParams(window.location.search).get('lang');
  if (SUPPORTED_LANGS.includes(param)) return param;
  const cookieLang = readLangCookie();
  if (SUPPORTED_LANGS.includes(cookieLang)) return cookieLang;
  const stored = localStorage.getItem(LANG_COOKIE);
  if (SUPPORTED_LANGS.includes(stored)) return stored;
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('ca')) return 'ca';
  return 'en';
}

function t(key){ return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS.es[key] ?? key }

function applyTranslations(lang){
  currentLang = lang;
  const T = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (T[k]) el.textContent = T[k]; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { const k = el.dataset.i18nHtml; if (T[k]) el.innerHTML = T[k]; });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { const k = el.dataset.i18nPh; if (T[k]) el.placeholder = T[k]; });
  if (T['sub.meta.title']) document.title = T['sub.meta.title'];
  const md = document.querySelector('meta[name="description"]');
  if (md && T['sub.meta.desc']) md.setAttribute('content', T['sub.meta.desc']);
  document.documentElement.lang = lang;
}

/* ── Cookie consent banner (cross-domain on .futuros.io) ── */
(function(){
  const COOKIE_NAME = 'futuros_consent';
  const LEGACY_KEY  = 'futuros_consent_v1';
  const banner = document.getElementById('fsCookies');

  function readCookie(name){
    try {
      const prefix = name + '=';
      const seg = (document.cookie || '').split('; ').find(c => c.indexOf(prefix) === 0);
      if (!seg) return null;
      return decodeURIComponent(seg.slice(prefix.length));
    } catch(e){ return null; }
  }
  function cookieDomainAttr(){
    var host = window.location.hostname;
    var isLocal = host === 'localhost' || /^\\d{1,3}(\\.\\d{1,3}){3}$/.test(host);
    var parts = host.split('.');
    if (isLocal || parts.length < 2) return '';
    return '; domain=.' + parts.slice(-2).join('.');
  }
  function writeCookie(v){
    var base = 'path=/; SameSite=Lax';
    var maxAge = v === 'accepted' ? '; max-age=31536000' : '';
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(v) + '; ' + base + maxAge + cookieDomainAttr();
    try { localStorage.removeItem(LEGACY_KEY); } catch(_) {}
  }
  function readConsent(){
    var v = readCookie(COOKIE_NAME);
    if (v === 'accepted' || v === 'rejected') return v;
    try { if (localStorage.getItem(LEGACY_KEY) === 'granted') return 'accepted'; } catch(_) {}
    return null;
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
  function hide(){ banner.classList.remove('fs-cookies-show'); }

  window.fsCookies = {
    open: () => banner.classList.add('fs-cookies-show'),
    reset: () => {
      document.cookie = COOKIE_NAME + '=; path=/; max-age=0' + cookieDomainAttr();
      try { localStorage.removeItem(LEGACY_KEY); } catch(_) {}
      banner.classList.add('fs-cookies-show');
    }
  };

  var stored = readConsent();
  if (stored){
    apply(stored);
    if (stored === 'accepted' && !readCookie(COOKIE_NAME)) writeCookie('accepted');
    return;
  }

  setTimeout(() => banner.classList.add('fs-cookies-show'), 600);

  document.getElementById('fsCookiesAccept').addEventListener('click', () => {
    writeCookie('accepted');
    apply('accepted');
    try { mixpanel.track('Page Viewed', { surface: 'blog', path: window.location.pathname }); } catch(_) {}
    hide();
  });
  document.getElementById('fsCookiesReject').addEventListener('click', () => {
    writeCookie('rejected');
    apply('rejected');
    hide();
  });
})();

async function submitSubscribe(e){
  e.preventDefault();
  const name = document.getElementById('ns-name').value.trim();
  const lastName = document.getElementById('ns-lastname').value.trim();
  const email = document.getElementById('ns-email').value.trim();
  const profile = document.getElementById('ns-profile').value;
  const marketing = document.getElementById('ns-marketing').checked;
  const btn = e.target.querySelector('button[type="submit"]');
  if (!name || !lastName || !email) return;

  if (window.mixpanel) {
    try {
      if (typeof mixpanel.identify === 'function') mixpanel.identify(email);
      if (mixpanel.people && typeof mixpanel.people.set === 'function') {
        mixpanel.people.set({
          $email: email,
          $first_name: name,
          $last_name: lastName,
          $name: name + ' ' + lastName,
          profile: profile || 'no indicado',
          marketing: marketing,
          lang: currentLang
        });
      }
      if (typeof mixpanel.track === 'function') {
        mixpanel.track('Newsletter Subscribed', {
          lang: currentLang,
          profile: profile || 'no indicado',
          marketing: marketing
        });
      }
    } catch(_) {}
  }

  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('form.sending');
  try {
    await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        lastName,
        email,
        lang: currentLang,
        profile: profile || 'no indicado',
        marketing,
        ts: new Date().toISOString(),
        source: 'blog.futuros.io/subscribe.html',
        campaign: 'newsletter'
      })
    });
  } catch(err) { console.warn('Newsletter submission failed:', err); }
  try {
    const l = JSON.parse(localStorage.getItem('futuros_subscribers') || '[]');
    l.push({ name, lastName, email, profile, marketing, lang: currentLang, ts: new Date().toISOString(), campaign: 'newsletter' });
    localStorage.setItem('futuros_subscribers', JSON.stringify(l));
  } catch(_) {}
  document.getElementById('subscribe-form-wrap').style.display = 'none';
  document.getElementById('subscribe-done').classList.add('show');
  btn.disabled = false;
  btn.textContent = orig;
}

applyTranslations(detectLang());
</script>
</body>
</html>`;
}

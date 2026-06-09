// Content-fragment rendering: issue Markdown-ish text → HTML.
// Ported from the ops signals-render.js so the public hub and the internal
// reading view stay structurally identical.
import { esc } from './util.mjs';

function mdInline(escaped){
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}
export function inlineMd(raw){ return mdInline(esc(raw)); }

// Intro / close: plain Markdown paragraphs.
export function paras(md){
  return String(md || '').trim().split(/\n\s*\n/).filter(Boolean)
    .map(p => `<p>${inlineMd(p)}</p>`).join('');
}

// Signal body: plain paragraphs, plus any block opening with a **bold label**
// (the Horizon line) or a "Label: rest" lead becomes a labelled note. Language-
// agnostic — works for EN/ES/CA ("What this means", "Lo que…", "Què significa…").
export function bodyToHtml(md){
  const blocks = String(md || '').trim().split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(block => {
    const e = esc(block);
    const bold = e.match(/^\*\*([\s\S]+?)\*\*\s*([\s\S]*)$/);
    let m = bold;
    if(!m){ const cm = e.match(/^([^\n:：.,]{2,40})[:：]\s+([\s\S]+)$/); if(cm) m = cm; }
    if(m){
      const label = m[1].replace(/\*\*/g, '').replace(/[:：]\s*$/, '').trim();
      const rest = (m[2] || '').trim();
      const cls = bold ? 'sig-note sig-note--bar' : 'sig-note';
      return `<div class="${cls}"><span class="sig-note-label">${label}</span>` +
        (rest ? `<p>${mdInline(rest)}</p>` : '') + '</div>';
    }
    return `<p>${mdInline(e)}</p>`;
  }).join('');
}

// Plain text (for meta descriptions / JSON-LD articleBody).
export function plainText(md){
  return String(md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]+/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// ── Full Markdown → HTML (Foundations bodies) ───────────────────────────────
// A compact, dependency-free block renderer for the educational content the
// pipeline produces (headings, lists, links, images, quotes, code, hr, bold/
// italic). Inline elements run on already-escaped text. Headings are downshifted
// one level so the page's <h1> (the title) stays the sole h1.
function mdInlineFull(escaped){
  return escaped
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g,
      '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>');
}

export function mdToHtml(md){
  const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
  const blank = l => /^\s*$/.test(l);
  const isHeading = l => /^#{1,6}\s+/.test(l);
  const isQuote   = l => /^\s*>\s?/.test(l);
  const isUL      = l => /^\s*[-*+]\s+/.test(l);
  const isOL      = l => /^\s*\d+[.)]\s+/.test(l);
  const isHR      = l => /^\s*([-*_])(\s*\1){2,}\s*$/.test(l);
  const isFence   = l => /^\s*```/.test(l);
  const out = [];
  let i = 0;
  while(i < lines.length){
    const line = lines[i];
    if(blank(line)){ i++; continue; }

    if(isFence(line)){
      const buf = []; i++;
      while(i < lines.length && !isFence(lines[i])){ buf.push(lines[i]); i++; }
      i++;                                   // consume closing fence
      out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
      continue;
    }
    if(isHR(line)){ out.push('<hr>'); i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if(h){
      // Clamp to h2..h6 so the page's <h1> (the title) stays the only h1, but
      // the author's ## sections still render as <h2> (not downshifted to h3).
      const lvl = Math.min(6, Math.max(2, h[1].length));
      out.push(`<h${lvl}>${mdInlineFull(esc(h[2].trim()))}</h${lvl}>`);
      i++; continue;
    }
    if(isQuote(line)){
      const buf = [];
      while(i < lines.length && isQuote(lines[i])){ buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push('<blockquote>' + mdToHtml(buf.join('\n')) + '</blockquote>');
      continue;
    }
    if(isUL(line) || isOL(line)){
      const ordered = isOL(line);
      const re = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
      const items = [];
      while(i < lines.length && re.test(lines[i])){
        let item = lines[i].match(re)[1]; i++;
        while(i < lines.length && !blank(lines[i]) && !isUL(lines[i]) && !isOL(lines[i]) && !isHeading(lines[i]) && !isFence(lines[i])){
          item += ' ' + lines[i].trim(); i++;
        }
        items.push('<li>' + mdInlineFull(esc(item)) + '</li>');
      }
      out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>'));
      continue;
    }
    // paragraph: gather until a blank line or the start of another block
    const buf = [];
    while(i < lines.length && !blank(lines[i]) && !isHeading(lines[i]) && !isQuote(lines[i])
          && !isUL(lines[i]) && !isOL(lines[i]) && !isFence(lines[i]) && !isHR(lines[i])){
      buf.push(lines[i]); i++;
    }
    out.push('<p>' + mdInlineFull(esc(buf.join('\n'))).replace(/\n/g, '<br>') + '</p>');
  }
  return out.join('\n');
}

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
    .replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
    .replace(/\s+/g, ' ').trim();
}

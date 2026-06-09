// URL builders. English lives at the root; es/ca under a language prefix.
import { slugify } from './util.mjs';
export function pfx(lang){ return lang === 'en' ? '' : '/' + lang; }
export function urlHome(lang){ return pfx(lang) + '/'; }
export function urlArchive(lang){ return pfx(lang) + '/signals/'; }
export function urlSector(lang, sector){ return pfx(lang) + '/signals/sector/' + slugify(sector) + '/'; }
export function urlIssue(lang, issue){ return pfx(lang) + '/signals/' + issue.slug + '/'; }
export function urlFoundations(lang){ return pfx(lang) + '/foundations/'; }
export function urlFoundation(lang, item){ return pfx(lang) + '/foundations/' + item.slug + '/'; }

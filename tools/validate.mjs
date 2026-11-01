// Validate concept JSON files against SCHEMA.md rules.
// Usage: node tools/validate.mjs content/3-Consonantes/C-02-flap-t.json [more files or dirs]   (or: node tools/validate.mjs content)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOCKS = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/blocks.json'), 'utf8'));
const EXPLAIN_TYPES = ['intro', 'rule', 'note', 'tip', 'table', 'examples', 'errors', 'vocab', 'dialogue', 'steps', 'compare', 'anchors', 'pairs', 'spoken', 'stress', 'mouth', 'twister', 'listen'];
const ITEM_TYPES = ['fill', 'choose', 'rewrite', 'error', 'translate', 'order', 'write', 'truefalse', 'spell', 'reading', 'readaloud', 'stressmark'];
const OTHER_TYPES = ['match', 'classify', 'tablefill', 'wordsearch'];
const COLORS = ['green', 'blue', 'purple', 'orange', 'red', 'teal', 'pink', 'yellow'];
const PARTS = ['lips', 'tongue', 'teeth', 'jaw', 'air', 'voice', 'nose', 'ear'];

const strip = s => String(s ?? '').replace(/<[^>]+>/g, '');
const norm = s => strip(s).toLowerCase().replace(/[.,!?¿¡;:"“”]/g, ' ').replace(/’/g, "'").split(/\s+/).filter(Boolean).sort().join(' ');

function checkHtml(s, where, errs) {
  if (typeof s !== 'string') return;
  const stack = [];
  for (const m of s.matchAll(/<\/?([a-z0-9]+)[^>]*>/gi)) {
    const tag = m[1].toLowerCase(); if (['br', 'img'].includes(tag)) continue;
    if (m[0][1] === '/') { if (stack.pop() !== tag) { errs.push(`${where}: unbalanced </${tag}> in "${s.slice(0, 60)}"`); return; } }
    else stack.push(tag);
  }
  if (stack.length) errs.push(`${where}: unclosed <${stack.join('>, <')}> in "${s.slice(0, 60)}"`);
  const allowed = ['b', 'em', 'i', 's', 'u', 'mark', 'small', 'br', 'code', 'span'];
  for (const m of s.matchAll(/<([a-z0-9]+)/gi)) if (!allowed.includes(m[1].toLowerCase())) errs.push(`${where}: tag <${m[1]}> not allowed`);
}
function walkStrings(o, where, errs) {
  if (typeof o === 'string') return checkHtml(o, where, errs);
  if (Array.isArray(o)) o.forEach((x, i) => walkStrings(x, `${where}[${i}]`, errs));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walkStrings(v, `${where}.${k}`, errs);
}

// ---- figured pronunciation ("say" / <code>) ----
const SAY_OK = /^[a-zñáéíóúüəæǽ'’ ,.\-‑?!¡¿()\/…:;=+·↗↘]+$/i;
const VG = /[aeiouáéíóúüəæǽ]+/gi;
function checkSay(raw, where, errs, warns, single) {
  if (raw == null || raw === '') return;
  const s = strip(raw).trim();
  if (!SAY_OK.test(s)) errs.push(`${where}: say "${s}" has characters outside the system (letters, á é í ó ú ə æ ǽ ' only)`);
  const low = s.toLowerCase();
  if (/rr/.test(low)) warns.push(`${where}: say "${s}" has "rr" (no trills in English: use a single r)`);
  if (/q/.test(low)) warns.push(`${where}: say "${s}" uses q (write k)`);
  if (/c(?!h)/.test(low)) warns.push(`${where}: say "${s}" uses c (write k, or z for /θ/, s for /s/)`);
  if (/x/.test(low)) warns.push(`${where}: say "${s}" uses x (write ks)`);
  if (/g[eéií]/.test(low)) warns.push(`${where}: say "${s}" has ge/gi (Spanish reads it as jota: write gue/gui)`);
  if (/(^|[^cs])h/.test(low)) warns.push(`${where}: say "${s}" has h outside sh/ch (write j for /h/; silent h is not written)`);
  if ((single || !/\s/.test(s)) && !/^[-‑]/.test(s)) {
    for (const w of low.split(/[\s,.\-?!¡¿()\/…]+/).filter(Boolean)) {
      const groups = (w.replace(/gu(?=[eéií])/g, 'g').match(VG) || []).length;
      if (groups >= 2 && !/[áéíóúǽ]/.test(w)) warns.push(`${where}: say "${w}" has ${groups} syllables but no stress mark (tilde)`);
    }
  }
}
function scanCode(o, where, errs, warns) {
  if (/\.bad$|exercises\[\d+\]\(error\)/.test(where)) return; // deliberate wrong forms
  if (typeof o === 'string') { for (const m of o.matchAll(/<code>(.*?)<\/code>/g)) checkSay(m[1], where + ' <code>', errs, warns, false); return; }
  if (Array.isArray(o)) o.forEach((x, i) => scanCode(x, `${where}[${i}]`, errs, warns));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) scanCode(v, `${where}.${k}`, errs, warns);
}
// ---- IPA ----
const IPA_OK = /^[a-zæɑɒɔəɚɝɛɪʊʌɾŋθðʃʒʔʧʤɡˈˌː.\s\u0329]+$/;
function checkIpa(raw, where, errs, warns) {
  if (raw == null) { errs.push(`${where}: ipa required`); return; }
  const s = String(raw).trim();
  if (/^[\/\[]|[\/\]]$/.test(s)) errs.push(`${where}: write ipa without slashes ("ˈwɑɾɚ", not "/ˈwɑɾɚ/")`);
  const core = s.replace(/^[\/\[]|[\/\]]$/g, '');
  if (!IPA_OK.test(core)) errs.push(`${where}: ipa "${s}" has unexpected characters`);
  if (/əʊ|ɒ|eə|(?<!a)ɪə|ʊə/.test(core)) warns.push(`${where}: ipa "${s}" looks British (use oʊ, ɑ, ɛr, ɪr, ʊr)`);
  if (/ɹ/.test(core)) warns.push(`${where}: use r instead of ɹ in ipa`);
}

function validate(file) {
  const errs = [], warns = [];
  let d;
  try { d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return { errs: [`JSON parse error: ${e.message}`], warns }; }
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  const want = (cond, msg) => { if (!cond) warns.push(msg); };

  const B = BLOCKS[d.block];
  need(B, `block must be one of ${Object.keys(BLOCKS).join(', ')}`);
  need(/^[A-Z]-\d\d$/.test(d.id || ''), 'id must look like "C-02"');
  need(d.id && d.id[0] === d.block, 'id must start with the block letter');
  need(path.basename(file).startsWith(d.id + '-'), `file name must start with "${d.id}-"`);
  if (B) need(path.basename(path.dirname(path.resolve(file))) === B.dir, `file must live in content/${B.dir}/`);
  need(typeof d.title === 'string' && d.title.length, 'title required');
  want(strip(d.title).length <= 24, `title is long (${strip(d.title).length} chars) – it may shrink on the map`);
  need(typeof d.subtitle === 'string', 'subtitle required');
  need(typeof d.icon === 'string', 'icon (emoji) required');

  // map
  const m = d.map || {};
  need(typeof m.center === 'string' && m.center.length, 'map.center required');
  want(strip(m.center).length <= 120, `map.center long (${strip(m.center).length} chars, keep ≤ 120)`);
  need(typeof m.listen === 'string' && m.listen.length, 'map.listen (word or phrase for the QR) required');
  need(Array.isArray(m.nodes) && m.nodes.length === 6, 'map.nodes must have exactly 6 nodes');
  (m.nodes || []).forEach((n, i) => {
    need(n.title, `map.nodes[${i}].title required`);
    need(n.items || n.rows || n.html || n.chips, `map.nodes[${i}] needs items/rows/html/chips`);
    if (n.color) need(COLORS.includes(n.color), `map.nodes[${i}].color invalid`);
    const len = strip([n.html, ...(n.items || []), ...((n.rows || []).flat()), ...(n.chips || []), n.after].filter(Boolean).join(' ')).length;
    want(len <= 175, `map.nodes[${i}] has ${len} chars of text (keep ≤ 175 so the map stays big and readable)`);
    want((n.items || []).length <= 5, `map.nodes[${i}] has more than 5 bullets`);
  });
  need(m.error && (m.error.bad || m.error.good), 'map.error with bad/good required');
  need(m.mini && Array.isArray(m.mini.items) && m.mini.items.length === 5, 'map.mini.items must have exactly 5 items');
  (m.mini?.items || []).forEach((it, i) => {
    need(it.q && it.a != null, `map.mini.items[${i}] needs q and a`);
    want(strip(it.q).length <= 46, `map.mini.items[${i}].q is long (${strip(it.q).length} chars, keep ≤ 46)`);
  });

  // explain
  const ex = d.explain || [];
  need(ex.length >= 10, `explain needs ≥ 10 blocks (has ${ex.length})`);
  let nAnch = 0;
  ex.forEach((b, i) => {
    const w = `explain[${i}](${b.t})`;
    need(EXPLAIN_TYPES.includes(b.t), `${w}: unknown type`);
    if (['intro', 'rule', 'note', 'tip'].includes(b.t)) { need(b.es, `${w}: es required`); need(b.en, `${w}: en required`); }
    if (b.t === 'rule') (b.examples || []).forEach((x, k) => { need(x.en, `${w}: example ${k} needs en`); checkSay(x.say, `${w} example ${k}`, errs, warns); });
    if (b.t === 'table') { need(Array.isArray(b.head) && Array.isArray(b.rows) && b.rows.length, `${w}: head + rows required`); (b.rows || []).forEach((r, k) => need(r.length === b.head.length, `${w}: row ${k} has ${r.length} cells, head has ${b.head?.length}`)); }
    if (['examples', 'vocab'].includes(b.t)) { need(Array.isArray(b.items) && b.items.length, `${w}: items required`); (b.items || []).forEach((x, k) => { need(x.en && x.es, `${w}: item ${k} needs en + es`); checkSay(x.say, `${w} item ${k}`, errs, warns); }); }
    if (b.t === 'errors') (b.items || []).forEach((x, k) => need(x.bad && x.good, `${w}: item ${k} needs bad + good`));
    if (b.t === 'dialogue') (b.lines || []).forEach((x, k) => { need(x.who && x.en, `${w}: line ${k} needs who + en`); checkSay(x.say, `${w} line ${k}`, errs, warns); });
    if (b.t === 'steps') (b.items || []).forEach((x, k) => need(x.es, `${w}: item ${k} needs es`));
    if (b.t === 'compare') need(Array.isArray(b.cols) && b.cols.length >= 2 && b.cols.length <= 4, `${w}: 2-4 cols required`);
    if (b.t === 'anchors') {
      need(Array.isArray(b.items) && b.items.length >= 6, `${w}: ≥ 6 items required`);
      nAnch += (b.items || []).length;
      (b.items || []).forEach((x, k) => { need(x.en && x.say, `${w}: item ${k} needs en + say`); checkIpa(x.ipa, `${w} item ${k}`, errs, warns); checkSay(x.say, `${w} item ${k}`, errs, warns, true); want(x.anchor, `${w}: item ${k} (${x.en}) has no Spanish anchor`); });
    }
    if (b.t === 'pairs') (b.items || []).forEach((x, k) => { for (const sd of ['a', 'b']) { const y = x[sd] || {}; need(y.en && y.say, `${w}: pair ${k}.${sd} needs en + say`); checkIpa(y.ipa, `${w} pair ${k}.${sd}`, errs, warns); checkSay(y.say, `${w} pair ${k}.${sd}`, errs, warns, true); } });
    if (b.t === 'spoken') (b.items || []).forEach((x, k) => { need(x.written && x.spoken && x.say, `${w}: item ${k} needs written + spoken + say`); checkSay(x.say, `${w} item ${k}`, errs, warns); });
    if (b.t === 'stress') (b.items || []).forEach((x, k) => { need(Array.isArray(x.syl) && x.syl.length >= 2 && Number.isInteger(x.s) && x.s >= 0 && x.s < x.syl.length, `${w}: item ${k} needs syl (≥ 2) and a valid s index`); checkSay(x.say, `${w} item ${k}`, errs, warns, true); });
    if (b.t === 'mouth') (b.items || []).forEach((x, k) => { need(PARTS.includes(x.part), `${w}: item ${k} part must be one of ${PARTS}`); need(x.es, `${w}: item ${k} needs es`); });
    if (b.t === 'twister') (b.items || []).forEach((x, k) => { need(x.en, `${w}: item ${k} needs en`); checkSay(x.say, `${w} item ${k}`, errs, warns); });
    if (b.t === 'listen') need(Array.isArray(b.items) && b.items.length >= 3 && b.items.length <= 8, `${w}: 3-8 items required`);
    if (b.color) need(COLORS.includes(b.color), `${w}: color invalid`);
  });
  const nEx = ex.filter(b => b.t === 'examples').reduce((a, b) => a + (b.items || []).length, 0) + ex.filter(b => b.t === 'rule').reduce((a, b) => a + (b.examples || []).length, 0);
  want(nEx >= 18, `only ${nEx} example sentences in explain (aim for ≥ 18)`);
  need(ex.some(b => b.t === 'errors'), 'explain needs an "errors" block');
  need(nAnch >= 8, `explain needs anchors (≥ 8 anchor items in total, has ${nAnch})`);
  want(ex.some(b => b.t === 'table'), 'explain should have at least one "table" block');
  want(ex.some(b => b.t === 'listen'), 'explain should have a "listen" (QR) block');
  want(ex.some(b => b.t === 'twister'), 'explain should have a "twister" block');

  // exercises
  const xs = d.exercises || [];
  need(xs.length >= 12, `exercises needs ≥ 12 (has ${xs.length})`);
  const types = new Set(xs.map(x => x.t));
  want(types.size >= 8, `only ${types.size} different exercise types (aim for ≥ 8)`);
  want(types.has('readaloud'), 'exercises should include a "readaloud"');
  let items = 0;
  xs.forEach((x, i) => {
    const w = `exercises[${i}](${x.t})`;
    need(ITEM_TYPES.includes(x.t) || OTHER_TYPES.includes(x.t), `${w}: unknown type`);
    need(x.title, `${w}: title required`);
    need(x.es, `${w}: es instructions required`);
    want(x.en, `${w}: en instructions missing`);
    if (ITEM_TYPES.includes(x.t)) {
      need(Array.isArray(x.items) && x.items.length >= (x.t === 'write' ? 2 : 4), `${w}: ≥ ${x.t === 'write' ? 2 : 4} items required`);
      items += (x.items || []).length;
      (x.items || []).forEach((y, k) => {
        const wi = `${w} item ${k + 1}`;
        if (x.t === 'stressmark') { need(Array.isArray(y.syl) && y.syl.length >= 2 && Number.isInteger(y.s) && y.s >= 0 && y.s < y.syl.length, `${wi}: needs syl (≥ 2) and a valid s index`); return; }
        need(y.q, `${wi}: q required`);
        if (x.t === 'error') return void need(y.a != null && y.a !== '', `${wi}: a (answer) required`);
        if (x.t === 'readaloud') { checkSay(y.say, wi, errs, warns); return; }
        if (x.t !== 'write') need(y.a != null && y.a !== '', `${wi}: a (answer) required`);
        if (x.t === 'fill') need(/_{3,}/.test(y.q || ''), `${wi}: fill item needs ___ blank`);
        if (x.t === 'choose') {
          const opts = [...String(y.q).matchAll(/\[([^\]]+\|[^\]]+)\]/g)];
          need(opts.length >= 1, `${wi}: choose item needs [a|b] options`);
          if (opts.length === 1) need(opts[0][1].split('|').map(s => s.trim()).includes(String(y.a).trim()), `${wi}: answer "${y.a}" is not one of the options [${opts[0][1]}]`);
        }
        if (x.t === 'order') {
          const tiles = String(y.q).split(/\s*\/\s*/).join(' ');
          need(norm(tiles) === norm(y.a), `${wi}: answer words ≠ tiles\n      tiles:  ${norm(tiles)}\n      answer: ${norm(y.a)}`);
        }
        if (x.t === 'spell') need(/^[a-zA-Z' -]+$/.test(String(y.a)), `${wi}: spell answer must be letters only`);
        if (x.t === 'truefalse') need(typeof y.a === 'boolean', `${wi}: truefalse answer must be true/false`);
        if (x.t === 'reading' && y.tf) need(typeof y.a === 'boolean', `${wi}: tf answer must be true/false`);
        if (x.t === 'rewrite' && Array.isArray(y.a)) { const L = y.labels || x.labels || []; need(L.length === y.a.length, `${wi}: ${y.a.length} answers but ${L.length} labels`); }
      });
      if (x.t === 'reading') need(x.text, `${w}: text required`);
    }
    if (x.t === 'match') { need(Array.isArray(x.pairs) && x.pairs.length >= 4 && x.pairs.length <= 8, `${w}: 4-8 pairs required`); items += (x.pairs || []).length; }
    if (x.t === 'classify') { need(Array.isArray(x.cats) && x.cats.length >= 2 && x.cats.length <= 4, `${w}: 2-4 cats required`); items += (x.cats || []).reduce((a, c) => a + c.words.length, 0); }
    if (x.t === 'tablefill') { need(x.head && x.rows && x.rows.flat().some(c => String(c).startsWith('?')), `${w}: head + rows with "?answer" cells required`); (x.rows || []).forEach((r, k) => need(r.length === x.head?.length, `${w}: row ${k} cell count ≠ head`)); items += (x.rows || []).flat().filter(c => String(c).startsWith('?')).length; }
    if (x.t === 'wordsearch') { need(Array.isArray(x.words) && x.words.length >= 6 && x.words.length <= 10, `${w}: 6-10 words`); (x.words || []).forEach(wd => need(wd.replace(/[^A-Za-z]/g, '').length <= 11, `${w}: word "${wd}" too long (≤ 11 letters)`)); items += (x.words || []).length; }
  });
  want(items >= 100, `only ${items} exercise items in total (aim for ≥ 100)`);
  need(Array.isArray(d.checklist) && d.checklist.length >= 4, 'checklist needs ≥ 4 items');
  walkStrings(d, 'root', errs);
  scanCode(Object.assign({}, d, { exercises: (d.exercises || []).map(x => x.t === 'error' ? Object.assign({}, x, { items: (x.items || []).map(y => ({ a: y.a })) }) : x) }), 'root', errs, warns);
  return { errs, warns, stats: { explain: ex.length, anchors: nAnch, examples: nEx, exercises: xs.length, types: types.size, items } };
}

const expand = t => fs.statSync(t).isDirectory() ? fs.readdirSync(t).sort().flatMap(f => { const p = path.join(t, f); return fs.statSync(p).isDirectory() ? expand(p) : f.endsWith('.json') ? [p] : []; }) : [t];
const targets = process.argv.slice(2).flatMap(expand);
let bad = 0;
for (const f of targets) {
  const { errs, warns, stats } = validate(f);
  const tag = errs.length ? '✗' : warns.length ? '△' : '✓';
  console.log(`${tag} ${f}${stats ? `  [explain ${stats.explain} · anchors ${stats.anchors} · examples ${stats.examples} · exercises ${stats.exercises} · types ${stats.types} · items ${stats.items}]` : ''}`);
  errs.forEach(e => console.log('   ERROR ' + e));
  warns.forEach(w => console.log('   warn  ' + w));
  if (errs.length) bad++;
}
process.exit(bad ? 1 : 0);

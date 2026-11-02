// Visually lossless size/performance pass over a scene's markup.
//
//  1. Resolve var(--token) to the theme's literal colours and turn paint declarations into attributes.
//  2. Merge plain rect/polygon shapes that share a paint (fill, opacity, animation class and delay) into
//     one <path>. A shape may be hoisted back to an earlier group of the same paint only if nothing drawn in
//     between overlaps it, so stacking order, and therefore every pixel, is unchanged. This cuts the node count
//     (and the number of separately animated elements) by an order of magnitude.
//  3. Keep only the CSS rules the scene uses.
import { PAL } from './palette.mjs';
import { ANIM } from './animations.mjs';
import { glyphDefs } from './font.mjs';

const PAINT = new Set(['fill', 'opacity', 'fill-opacity', 'stroke', 'stroke-width', 'stop-color', 'stop-opacity']);
const NUMERIC = new Set(['x', 'y', 'width', 'height', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'x2', 'y1', 'y2', 'transform', 'd', 'offset']);
const NON_RENDERING = new Set(['defs', 'clipPath', 'mask', 'linearGradient', 'radialGradient', 'pattern', 'style']);
const KEEP_AS_IS = new Set(['defs', 'clipPath', 'mask', 'linearGradient', 'radialGradient', 'pattern']);
// Classes whose animation changes only opacity; they can be merged and keep their static box.
const STATIC_CLASSES = new Set(['tw', 'fl', 'pulse', 'flick', 'ember', 'legA', 'legB', 'tick']);
// Classes that translate the element (no transform-origin dependence): mergeable, but their box grows.
const MOVING_CLASSES = { steam: [0, -44, 0, 0], rain: [0, -30, 0, 500], drip: [0, 0, 0, 64] };
const MERGEABLE_ATTRS = new Set(['x', 'y', 'width', 'height', 'points', 'fill', 'opacity', 'fill-opacity', 'class', 'style']);
const INF = 'inf';

const fmt = (v) => {
  let s = String(+Number(v).toFixed(2));
  if (s.startsWith('0.')) s = s.slice(1); else if (s.startsWith('-0.')) s = '-' + s.slice(2);
  return s;
};
const join = (nums) => nums.map(fmt).reduce((a, b) => (a === '' ? b : a + (b.startsWith('-') ? '' : ' ') + b), '');
const tidy = (v) => v.replace(/-?\d*\.\d{3,}/g, (m) => fmt(m));

// ---------- tiny XML tree ----------
function parse(markup) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  for (const t of markup.match(/<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>|[^<]+/g) ?? []) {
    if (t.startsWith('<!--')) continue;
    const top = stack[stack.length - 1];
    if (t[0] !== '<') { top.children.push({ tag: '#text', text: t }); continue; }
    if (t[1] === '/') { stack.pop(); continue; }
    const m = /^<([A-Za-z][\w:-]*)([\s\S]*?)(\/?)>$/.exec(t);
    const attrs = {};
    for (const a of m[2].matchAll(/([:\w-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    const node = { tag: m[1], attrs, children: [] };
    top.children.push(node);
    if (!m[3]) stack.push(node);
  }
  return root;
}

function normalise(node, vars) {
  if (node.tag === '#text') return;
  const a = node.attrs;
  if (a.style !== undefined) {
    const keep = [];
    for (const decl of a.style.split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const k = decl.slice(0, i).trim(), v = decl.slice(i + 1).trim();
      if (PAINT.has(k)) a[k] = v; else keep.push(`${k}:${v}`);
    }
    if (keep.length) a.style = keep.join(';'); else delete a.style;
  }
  for (const k of Object.keys(a)) if (NUMERIC.has(k)) a[k] = k === 'transform' ? a[k].replace(/-?\d*\.\d{5,}/g, (m) => String(+(+m).toFixed(4))) : tidy(a[k]); // scale factors keep 4 decimals
  if (['ellipse', 'circle', 'polyline', 'line'].includes(node.tag) || (node.tag === 'path' && !a['shape-rendering'])) a['shape-rendering'] = 'auto';
  for (const c of node.children) normalise(c, vars);
}

// ---------- boxes ----------
const num = (v, d = 0) => (v === undefined ? d : parseFloat(v));
const union = (a, b) => (a === INF || b === INF ? INF : !a ? b : !b ? a : [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
const hit = (a, b) => a === INF || b === INF || (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]);

function classExtent(cls) {
  if (!cls) return [0, 0, 0, 0];
  let e = [0, 0, 0, 0];
  for (const c of cls.split(/\s+/)) {
    if (STATIC_CLASSES.has(c)) continue;
    if (!MOVING_CLASSES[c]) return INF;
    e = e.map((v, i) => (i < 2 ? Math.min(v, MOVING_CLASSES[c][i]) : Math.max(v, MOVING_CLASSES[c][i])));
  }
  return e;
}
const grow = (box, e) => (box === INF || e === INF ? INF : box && [box[0] + e[0], box[1] + e[1], box[2] + e[2], box[3] + e[3]]);
const pad = (box, p) => (box === INF || !box ? box : [box[0] - p, box[1] - p, box[2] + p, box[3] + p]);

function affine(transform) {
  let m = [1, 0, 0, 1, 0, 0];
  const mul = (n) => { m = [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]]; };
  for (const [, fn, args] of transform.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = args.split(/[\s,]+/).filter(Boolean).map(Number);
    if (fn === 'translate') mul([1, 0, 0, 1, v[0], v[1] ?? 0]);
    else if (fn === 'scale') mul([v[0], 0, 0, v[1] ?? v[0], 0, 0]);
    else if (fn === 'matrix') mul(v);
    else if (fn === 'rotate') { const r = (v[0] * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); mul([1, 0, 0, 1, v[1] ?? 0, v[2] ?? 0]); mul([c, s, -s, c, 0, 0]); mul([1, 0, 0, 1, -(v[1] ?? 0), -(v[2] ?? 0)]); }
    else return null;
  }
  return m;
}

function bboxOf(node) {
  if (node.box !== undefined) return node.box;
  if (node.tag === '#text' || NON_RENDERING.has(node.tag)) return null;
  const a = node.attrs;
  if (node.children.some((c) => /^animate/.test(c.tag))) return INF;
  if (a.style && /filter/.test(a.style)) return INF;
  if (a['data-bb']) { const b = a['data-bb'].split(' ').map(Number); return grow(b, classExtent(a.class)); }
  const sw = a.stroke && a.stroke !== 'none' ? num(a['stroke-width'], 1) / 2 : 0;
  let box;
  switch (node.tag) {
    case 'rect': box = [num(a.x), num(a.y), num(a.x) + num(a.width), num(a.y) + num(a.height)]; break;
    case 'polygon': case 'polyline': {
      const n = a.points.split(/[\s,]+/).map(Number);
      const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
      box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      break;
    }
    case 'ellipse': box = [num(a.cx) - num(a.rx), num(a.cy) - num(a.ry), num(a.cx) + num(a.rx), num(a.cy) + num(a.ry)]; break;
    case 'circle': box = [num(a.cx) - num(a.r), num(a.cy) - num(a.r), num(a.cx) + num(a.r), num(a.cy) + num(a.r)]; break;
    case 'line': box = [Math.min(num(a.x1), num(a.x2)), Math.min(num(a.y1), num(a.y2)), Math.max(num(a.x1), num(a.x2)), Math.max(num(a.y1), num(a.y2))]; break;
    case 'path': box = a['data-bb'] ? a['data-bb'].split(' ').map(Number) : INF; break;
    case 'g': {
      box = null;
      for (const c of node.children) box = union(box, bboxOf(c));
      if (a.transform && box && box !== INF) {
        const m = affine(a.transform);
        if (!m) return INF;
        const pts = [[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]].map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
        box = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
      }
      break;
    }
    default: return INF;
  }
  return grow(pad(box, sw), classExtent(a.class));
}

// ---------- merging ----------
const mergeable = (n) => {
  if (n.tag !== 'rect' && n.tag !== 'polygon') return false;
  if (n.children.length) return false; // animated (SMIL) shapes stay individual
  const a = n.attrs;
  if (!Object.keys(a).every((k) => MERGEABLE_ATTRS.has(k))) return false;
  if (!a.fill || a.fill === 'none' || a.fill.startsWith('url(')) return false;
  if (a.class && !a.class.split(/\s+/).every((c) => STATIC_CLASSES.has(c) || MOVING_CLASSES[c])) return false;
  return true;
};
const keyOf = (a) => [a.fill, a.opacity ?? '', a['fill-opacity'] ?? '', a.class ?? '', a.style ?? ''].join('|');
const translucent = (a) => (a.opacity !== undefined && +a.opacity < 1) || (a['fill-opacity'] !== undefined && +a['fill-opacity'] < 1);

// Subpath as absolute points; polygons are wound like rects so overlapping members union under nonzero fill.
function shapePoints(n) {
  const a = n.attrs;
  if (n.tag === 'rect') { const x = +a.x, y = +a.y, w = +a.width, h = +a.height; return w > 0 && h > 0 ? [x, y, x + w, y, x + w, y + h, x, y + h] : null; }
  const p = a.points.split(/[\s,]+/).map(Number);
  let s = 0;
  for (let i = 0; i < p.length; i += 2) { const j = (i + 2) % p.length; s += p[i] * p[j + 1] - p[j] * p[i + 1]; }
  if (s === 0) return null;
  if (s > 0) return p;
  const r = [];
  for (let i = p.length - 2; i >= 0; i -= 2) r.push(p[i], p[i + 1]);
  return r;
}

class Group {
  constructor(key, attrs) { this.key = key; this.attrs = attrs; this.subs = []; this.box = null; this.cells = new Map(); this.boxes = []; this.translucent = translucent(attrs); }
  cellsOf(b) {
    const r = [];
    for (let cx = Math.floor(b[0] / 64); cx <= Math.floor(b[2] / 64); cx++) for (let cy = Math.floor(b[1] / 64); cy <= Math.floor(b[3] / 64); cy++) r.push(cx * 4096 + cy);
    return r;
  }
  overlaps(b) {
    if (!this.box) return false;
    if (b === INF) return true;
    if (!hit(this.box, b)) return false;
    const seen = new Set();
    for (const c of this.cellsOf(b)) for (const i of this.cells.get(c) ?? []) if (!seen.has(i)) { seen.add(i); if (hit(this.boxes[i], b)) return true; }
    return false;
  }
  add(pts, b) {
    this.subs.push(pts);
    this.box = union(this.box, b);
    const i = this.boxes.push(b) - 1;
    for (const c of this.cellsOf(b)) { if (!this.cells.has(c)) this.cells.set(c, []); this.cells.get(c).push(i); }
  }
  toNode() {
    let px = 0, py = 0, d = '';
    for (const p of this.subs) {
      if (p.length === 8 && p[1] === p[3] && p[2] === p[4] && p[5] === p[7] && p[6] === p[0]) d += `m${join([p[0] - px, p[1] - py])}h${fmt(p[2] - p[0])}v${fmt(p[5] - p[1])}h${fmt(p[0] - p[2])}z`;
      else { const v = [p[0] - px, p[1] - py]; for (let i = 2; i < p.length; i += 2) v.push(p[i] - p[i - 2], p[i + 1] - p[i - 1]); d += `m${join(v)}z`; }
      px = p[0]; py = p[1];
    }
    return { tag: 'path', attrs: { ...this.attrs, d }, children: [], box: this.box };
  }
}

// Rect and path rasterisation can differ by a pixel at fractional device coordinates. So inside a group that is
// scaled/skewed, only plain (non-animated) shapes are merged ('static'); inside a group whose class animates its
// transform (a moving train, a flying plane) nothing is merged ('none'). Everywhere else every shape merges ('all').
const modeFor = (g, parent) => {
  if (parent === 'none') return 'none';
  if (g.attrs.class && g.attrs.class.split(/\s+/).some((c) => !STATIC_CLASSES.has(c) && !MOVING_CLASSES[c])) return 'none';
  if (g.attrs.transform) { const m = affine(g.attrs.transform); if (!m) return 'none'; if (m[0] !== 1 || m[1] !== 0 || m[2] !== 0 || m[3] !== 1) return 'static'; }
  return parent;
};
function mergeChildren(nodes, mode = 'all') {
  const out = [];
  for (const n of nodes) {
    if (n.tag === '#text') { out.push({ item: n, box: null }); continue; }
    if (KEEP_AS_IS.has(n.tag)) { out.push({ item: n, box: null }); continue; }
    if (n.tag === 'g') n.children = mergeChildren(n.children, modeFor(n, mode));
    if (mode === 'none' || !mergeable(n) || (mode === 'static' && n.attrs.class)) {
      out.push({ item: n, box: bboxOf(n) });
      continue;
    }
    const pts = shapePoints(n);
    if (!pts) continue; // zero-area: draws nothing
    const key = keyOf(n.attrs);
    const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1);
    const box = grow([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], classExtent(n.attrs.class));
    let target = null;
    for (let i = out.length - 1; i >= 0; i--) {
      const it = out[i];
      if (it.item instanceof Group) {
        if (it.item.key === key && (!it.item.translucent || !it.item.overlaps(box))) { target = it.item; break; }
        if (it.item.overlaps(box)) break;
      } else if (it.box && hit(it.box, box)) break;
    }
    if (!target) {
      const { fill, opacity, 'fill-opacity': fo, class: cls, style } = n.attrs;
      const attrs = { fill };
      if (opacity !== undefined) attrs.opacity = opacity;
      if (fo !== undefined) attrs['fill-opacity'] = fo;
      if (cls) attrs.class = cls;
      if (style) attrs.style = style;
      target = new Group(key, attrs);
      out.push({ item: target, box: null });
    }
    target.add(pts, box);
  }
  return out.map((o) => (o.item instanceof Group ? o.item.toNode() : o.item));
}

// ---------- output ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function emit(node) {
  if (node.tag === '#text') return node.text;
  const a = Object.entries(node.attrs).filter(([k]) => k !== 'data-bb').map(([k, v]) => ` ${k}="${v}"`).join('');
  return node.children.length ? `<${node.tag}${a}>${node.children.map(emit).join('')}</${node.tag}>` : `<${node.tag}${a}/>`;
}
function usedClasses(markup) {
  const s = new Set();
  for (const m of markup.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) s.add(c);
  return s;
}

// Split ANIM into top-level blocks once.
const BLOCKS = (() => {
  const blocks = [];
  let i = 0;
  const css = ANIM;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    let depth = 1, j = open + 1;
    while (depth && j < css.length) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    blocks.push({ head: css.slice(i, open).trim(), text: css.slice(i, j).trim() });
    i = j;
  }
  return blocks;
})();
function animationCss(markup) {
  const used = usedClasses(markup);
  const rules = BLOCKS.filter((b) => !b.head.startsWith('@') && [...b.head.matchAll(/\.([\w-]+)/g)].some((m) => used.has(m[1])));
  if (!rules.length) return '';
  const body = rules.map((r) => r.text).join('');
  const kfs = BLOCKS.filter((b) => b.head.startsWith('@keyframes') && new RegExp(`animation[^;}]*\\b${b.head.split(/\s+/)[1]}\\b`).test(body));
  const media = BLOCKS.find((b) => b.head.startsWith('@media'));
  return body + kfs.map((k) => k.text).join('') + (media ? media.text : '');
}

export function themeScene({ h, label, inner }, mode) {
  const vars = PAL[mode];
  const resolved = inner.replace(/var\((--[\w-]+)\)/g, (_, n) => {
    if (!(n in vars)) throw new Error(`unknown colour token ${n}`);
    return vars[n];
  });
  const tree = parse(resolved);
  normalise(tree, vars);
  tree.children = mergeChildren(tree.children);
  let body = tree.children.map(emit).join('');
  body = glyphDefs(new Set(body.match(/href="#(p[0-9a-z]+)"/g)?.map((m) => m.slice(7, -1)))) + body;
  const css = animationCss(body);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${h}" role="img" aria-label="${esc(label)}" shape-rendering="crispEdges">${css ? `<style>${css}</style>` : ''}${body}</svg>\n`;
}

// Estrellas que mueren sin explotar · Sci-fi Hologram HUD · 1080×1920 · audio fixed (cue map from the existing mix)
import { Holo, prepModel, drawPad, drawScanPlane, makeCamera } from './engine/holo.js';
import * as U from './engine/hud.js';

export const W = 1080, H = 1920, DUR = 96.9;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const T = U.theme(205, 22);
const HOLO = new Holo(W, H);
const CUTS = [12.2, 24.0, 27.0, 43.4, 60.8, 72.0, 83.0, 88.5];

// ---------------- model builders (world metres, y up) ----------------
function sphere(r, c, nLat = 9, nLon = 16, lon0 = 0, lon1 = TAU, full = true) {
  const v = [], e = [], q = []; const nl = full ? nLon : nLon + 1;
  for (let i = 0; i <= nLat; i++) { const th = i / nLat * Math.PI; for (let j = 0; j < nl; j++) { const ph = lon0 + (lon1 - lon0) * j / nLon; v.push(c[0] + r * Math.sin(th) * Math.cos(ph), c[1] + r * Math.cos(th), c[2] + r * Math.sin(th) * Math.sin(ph)); } }
  const id = (i, j) => i * nl + (full ? (j % nLon) : j);
  for (let i = 0; i <= nLat; i++) for (let j = 0; j < (full ? nLon : nLon); j++) { if (i > 0 && i < nLat) e.push(id(i, j), id(i, j + 1)); }
  for (let i = 0; i < nLat; i++) for (let j = 0; j < nl; j++) { e.push(id(i, j), id(i + 1, j)); if (j < (full ? nLon : nLon)) q.push(id(i, j), id(i, j + 1), id(i + 1, j + 1), id(i + 1, j)); }
  return { v, e, q };
}
function ring(r, c, n = 64, tilt = 0) { const v = [], e = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const x = Math.cos(a) * r, z = Math.sin(a) * r; v.push(c[0] + x, c[1] + z * Math.sin(tilt), c[2] + z * Math.cos(tilt)); e.push(i, (i + 1) % n); } return { v, e, q: [] }; }
function merge(list) { const v = [], e = [], q = []; for (const g of list) { const o = v.length / 3; v.push(...g.v); g.e.forEach(i => e.push(i + o)); (g.q || []).forEach(i => q.push(i + o)); } return { v, e, q }; }
function box(x0, y0, z0, x1, y1, z1) { const v = [x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1, x0, y1, z0, x1, y1, z0, x1, y1, z1, x0, y1, z1]; const e = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]; const q = [0, 1, 5, 4, 1, 2, 6, 5, 2, 3, 7, 6, 3, 0, 4, 7, 4, 5, 6, 7]; return { v, e, q }; }
const piece = (id, g, o = {}) => ({ id, v: g.v, e: g.e, q: g.q, explode: o.explode || [0, 0, 0], internal: o.internal, hot: o.hot, box: o.box });
const model = parts => prepModel({ name: 'm', parts });

// star: two envelope halves (slide apart on x), three inner shells, an iron core. s = overall scale (collapse), cy = centre height
function starModel(s = 1, cy = 1.15, inward = 0) {
  const R = 0.82 * s, C = [0, cy, 0];
  const halfL = sphere(R, C, 10, 10, Math.PI / 2, Math.PI * 1.5, false), halfR = sphere(R, C, 10, 10, -Math.PI / 2, Math.PI / 2, false);
  const sh = (r, n) => sphere(r * s * (1 - 0.6 * inward), C, n, n + 4);
  return model([
    { id: 'env', anchor: [R * .7, cy + R * .5, R * .3], pieces: [piece('envL', halfL, { explode: [-0.62, 0, 0] }), piece('envR', halfR, { explode: [0.62, 0, 0] })] },
    { id: 'shells', anchor: [0, cy + 0.5 * s, 0.3], pieces: [piece('he', sh(0.6, 7), { internal: true }), piece('co', sh(0.42, 6), { internal: true }), piece('si', sh(0.28, 5), { internal: true })] },
    { id: 'core', anchor: [0, cy, 0.14 * s], center: [0, cy, 0], pieces: [piece('fe', sphere(0.15 * s * (1 - 0.7 * inward), C, 5, 8), { internal: true, hot: true })] },
  ]);
}
// black hole: horizon sphere + accretion disk rings (rotating by phase) + photon ring
function bhModel(s = 1, cy = 1.0, ph = 0, cx = 0) {
  const C = [cx, cy, 0], tilt = 0.32;
  const hz = sphere(0.26 * s, C, 7, 12);
  const disk = []; for (let k = 0; k < 7; k++) disk.push(ring((0.42 + k * 0.1) * s, C, 72, tilt));
  const sp = { v: [], e: [] }; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + ph; const r0 = 0.42 * s, r1 = 1.02 * s; const z0 = Math.sin(a), x0 = Math.cos(a); const p = (r) => [C[0] + x0 * r, C[1] + z0 * r * Math.sin(tilt), C[2] + z0 * r * Math.cos(tilt)]; const o = sp.v.length / 3; sp.v.push(...p(r0), ...p(r1)); sp.e.push(o, o + 1); }
  return model([
    { id: 'bh', anchor: [cx, cy + 0.26 * s, 0.2 * s], pieces: [piece('hz', hz), piece('pr', ring(0.3 * s, C, 72, Math.PI / 2), { hot: true })] },
    { id: 'disk', anchor: [cx + 0.8 * s, cy, 0.3], pieces: [piece('disk', merge([...disk, sp]), {})] },
  ]);
}
// spacetime grid with two wells + ripple, plus two small black holes inspiralling
function binModel(t, o = {}) {
  const sep = o.sep ?? 0.9, ph = o.ph ?? t * 2.4, N = 26, S = 4.4, y0 = 0.0;
  const p1 = [Math.cos(ph) * sep / 2, Math.sin(ph) * sep / 2], p2 = [-p1[0], -p1[1]];
  const hgt = (x, z) => { const d1 = Math.hypot(x - p1[0], z - p1[1]), d2 = Math.hypot(x - p2[0], z - p2[1]), r = Math.hypot(x, z); let y = -0.5 / (1 + d1 * d1 * 8) - 0.5 / (1 + d2 * d2 * 8); y += (o.wave ?? 1) * 0.06 * Math.sin(r * 7 - t * 5 - 2 * Math.atan2(z, x)) * clamp(r / 0.8) * Math.exp(-r * 0.25); return y0 + y; };
  const g = { v: [], e: [] };
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { const x = -S / 2 + S * i / N, z = -S / 2 + S * j / N; g.v.push(x, hgt(x, z), z); const k = i * (N + 1) + j; if (j < N) g.e.push(k, k + 1); if (i < N) g.e.push(k, k + N + 1); }
  const b1 = sphere(0.13, [p1[0], hgt(p1[0], p1[1]) + 0.13, p1[1]], 5, 9), b2 = sphere(0.13, [p2[0], hgt(p2[0], p2[1]) + 0.13, p2[1]], 5, 9);
  const r1 = ring(0.22, [p1[0], hgt(p1[0], p1[1]) + 0.13, p1[1]], 40, Math.PI / 2), r2 = ring(0.22, [p2[0], hgt(p2[0], p2[1]) + 0.13, p2[1]], 40, Math.PI / 2);
  return model([
    { id: 'grid', anchor: [0, 0, 0], pieces: [piece('grid', g, { box: false })] },
    { id: 'pair', anchor: [0, 0.2, 0], pieces: [piece('b1', merge([b1, r1])), piece('b2', merge([b2, r2]))] },
  ]);
}
// histogram (schematic): bins 5..29 masas solares; peak 9–11; gap 12–16
const HB = [3, 6, 14, 38, 72, 100, 60, 4, 2, 1, 2, 3, 10, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 3];
const BX = i => -1.92 + i * 0.16;
function histModel(gapBox = false) {
  const peak = [], rest = [];
  HB.forEach((h, i) => { const m = 5 + i, x = BX(i), hh = 0.04 + h / 100 * 1.7; const b = box(x - 0.06, 0, -0.06, x + 0.06, hh, 0.06); (m >= 9 && m <= 11 ? peak : rest).push(b); });
  const parts = [
    { id: 'bars', anchor: [0, 0.3, 0], pieces: [piece('bars', merge(rest))] },
    { id: 'peak', anchor: [BX(5), 1.76, 0.06], pieces: [piece('peak', merge(peak))] },
  ];
  if (gapBox) { const g = box(BX(7) - 0.07, 0, -0.08, BX(11) + 0.07, 0.95, 0.08); parts.push({ id: 'gap', anchor: [BX(9), 0.95, 0.08], pieces: [piece('gap', { v: g.v, e: g.e, q: [] })] }); }
  // mass axis ticks on the floor
  const ax = { v: [], e: [] }; for (let i = 0; i < HB.length; i++) { const o = ax.v.length / 3, x = BX(i); ax.v.push(x, 0, 0.14, x, 0, 0.2); ax.e.push(o, o + 1); } { const o = ax.v.length / 3; ax.v.push(BX(0) - .08, 0, 0.14, BX(24) + .08, 0, 0.14); ax.e.push(o, o + 1); }
  parts.push({ id: 'axis', anchor: [0, 0, 0.2], pieces: [piece('axis', ax, { box: false })] });
  return model(parts);
}
// field of star points on a flat grid (top-down ending)
const FIELD = Array.from({ length: 46 }, (_, k) => ({ x: (hash(k) - .5) * 3.6, z: (hash(k + 50) - .5) * 3.6, out: 84.2 + hash(k + 90) * 3.8 }));
function fieldModel(t) {
  const pts = []; FIELD.forEach(f => { if (t < f.out) { const s = 0.05 * (1 - prog(t, f.out - 0.25, f.out)); const y = 0.12; pts.push({ v: [f.x, y + s, f.z, f.x + s, y, f.z, f.x, y, f.z + s, f.x - s, y, f.z, f.x, y, f.z - s, f.x, y - s, f.z], e: [0, 1, 0, 2, 0, 3, 0, 4, 5, 1, 5, 2, 5, 3, 5, 4, 1, 2, 2, 3, 3, 4, 4, 1], q: [] }); } });
  const g = { v: [], e: [] }; const N = 12, S = 4; for (let i = 0; i <= N; i++) { const o = g.v.length / 3; g.v.push(-S / 2 + S * i / N, 0, -S / 2, -S / 2 + S * i / N, 0, S / 2, -S / 2, 0, -S / 2 + S * i / N, S / 2, 0, -S / 2 + S * i / N); g.e.push(o, o + 1, o + 2, o + 3); }
  return model([{ id: 'stars', anchor: [0, 0.1, 0], pieces: pts.length ? [piece('st', merge(pts))] : [] }, { id: 'floor', anchor: [0, 0, 0], pieces: [piece('floor', g, { box: false })] }]);
}

// ---------------- helpers ----------------
const camAt = (o) => ({ target: o.target || [0, 1, 0], yaw: o.yaw ?? 0.6, pitch: o.pitch ?? 0.25, dist: o.dist ?? 5.2, fov: o.fov ?? 0.8, cx: o.cx ?? W / 2, cy: o.cy ?? 980 });
function lock(ctx, t, t0, bb, tag, o = {}) { if (!bb || t < t0 - 0.22) return; const k = prog(t, t0 - 0.22, t0); const fl = t >= t0 && t < t0 + 0.1; U.targetBox(ctx, T, bb, 1, { lockK: eo(k), flash: fl, tag, alpha: o.alpha ?? 1, pad: o.pad ?? 26 }); }
function card(ctx, t, t0, c, o = {}) { if (t < t0) return; const out = o.out ? 1 - prog(t, o.out, o.out + 0.35) : 1; if (out <= 0) return; const f = Math.floor(t * 30);
  U.specCard(ctx, T, o.x ?? 92, o.y ?? 250, c, { reveal: prog(t, t0, t0 + 0.35), roll: c.value != null ? prog(t, t0 + (o.rd ?? 0.15), t0 + (o.rd ?? 0.15) + (o.rl ?? 0.6)) : 0, detail: prog(t, t0 + (o.dd ?? 0.6), t0 + (o.dd ?? 0.6) + 0.5), frame: f, flash: t > t0 + (o.rd ?? .15) + (o.rl ?? .6) && t < t0 + (o.rd ?? .15) + (o.rl ?? .6) + 0.1 }, { w: o.w ?? 640, big: o.big ?? 120, index: o.index || '', alpha: out }); }
function tag(ctx, t, t0, txt, x, y, o = {}) { if (t < t0) return; const out = o.out ? 1 - prog(t, o.out, o.out + .3) : 1; const a = prog(t, t0, t0 + 0.25) * out; if (a <= 0) return; const f = Math.floor(t * 30);
  ctx.save(); ctx.font = `600 ${o.size || 40}px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; const s = U.rollText(txt, prog(t, t0, t0 + (o.rl ?? 0.4)), f, x); const w = ctx.measureText(txt).width + 44; const h = (o.size || 40) + 30; const X = o.align === 'center' ? x - w / 2 : x;
  U.plate(ctx, T, X, y - h / 2, w, h, a); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = o.acc && t > t0 + (o.rl ?? .4) ? T.acc(a) : T.hi(0.95 * a); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(s, X + 22, y + 2); ctx.restore(); }
const SUBS = [];
function sub(ctx, text, a, t) { if (a <= 0) return; ctx.save(); ctx.font = `500 50px ${U.FONT.ui}`; const tw = ctx.measureText(text).width, x = W / 2 - tw / 2 + 20, y = H - 170, h = 60;
  ctx.fillStyle = `rgba(1,8,12,${0.66 * a})`; ctx.fillRect(x - 70, y - h - 10, tw + 100, h + 34); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.line(0.6 * a); ctx.lineWidth = 1.4; ctx.beginPath();
  ctx.moveTo(x - 70, y - h + 4); ctx.lineTo(x - 70, y - h - 10); ctx.lineTo(x - 56, y - h - 10); ctx.moveTo(x + tw + 16, y + 24); ctx.lineTo(x + tw + 30, y + 24); ctx.lineTo(x + tw + 30, y + 10); ctx.stroke();
  ctx.fillStyle = T.line(0.9 * a); for (let i = 0; i < 4; i++) { const hh = 8 + 18 * Math.abs(Math.sin(t * 9 + i * 1.7)); ctx.fillRect(x - 54 + i * 9, y - h / 2 + 2 - hh / 2, 4, hh); }
  ctx.fillStyle = T.hi(0.97 * a); ctx.textBaseline = 'alphabetic'; ctx.fillText(text, x, y); ctx.restore(); }
function subtitles(ctx, t) { const s = SUBS.find(s => t >= s.t0 && t < s.t1); if (!s) return; const a = Math.min(prog(t, s.t0, s.t0 + 0.1), 1 - prog(t, s.t1 - 0.08, s.t1)); sub(ctx, s.text, a, t); }
// scan transitions: erase (top-down) in the last 0.35 s of a segment, scan-in (bottom-up) in its first 0.7 s
function scanState(t, a, b, top) { if (t > b - 0.35) return { scanDown: { y: lerp(top, -0.05, eio(prog(t, b - 0.35, b))) } }; if (t < a + 0.7 && a > 0.01) return { scan: { y: lerp(-0.05, top + 0.05, eio(prog(t, a, a + 0.7))) } }; return {}; }

// ---------------- segments ----------------
const SEG = [];
// A · hook: star implodes into a black hole without a flash
SEG.push({ a: 0, b: 12.2, top: 2.1, tl: 'OBJ // ESTRELLA MASIVA', f(ctx, t, st) {
  const cam = camAt({ yaw: lerp(0.9, 0.45, eio(prog(t, 0, 6))), pitch: lerp(0.42, 0.2, eio(prog(t, 0, 4))), dist: lerp(5.4, 4.7, prog(t, 0, 12)), target: [0, 1.1, 0] });
  const k = eio(prog(t, 4.7, 6.5)); const scan0 = { scan: { y: lerp(-0.05, 2.1, eio(prog(t, 0, 2.2))) } };
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12 });
  let info = null;
  if (k < 0.98) info = HOLO.draw(ctx, starModel(1 - k, 1.15, k), cam, { hue: T.hue, ...(t < 2.2 ? scan0 : st), gain: 1 - k * 0.3 });
  if (t > 6.2) info = HOLO.draw(ctx, bhModel(lerp(0.2, 1, eo(prog(t, 6.2, 7.2))), 1.1, t * 0.6), cam, { hue: T.hue, ...st });
  if (t < 2.2) drawScanPlane(ctx, cam, W, H, lerp(-0.05, 2.1, eio(prog(t, 0, 2.2))), { hue: T.hue, r: 1.0 });
  if (t < 6.2) lock(ctx, t, 1.4, info?.bbox.env, 'TGT 01 · ESTRELLA', { alpha: 1 - prog(t, 4.6, 5.0) });
  tag(ctx, t, 2.3, 'SIN EXPLOSIÓN', 92, 1380, { out: 6.0 }); tag(ctx, t, 3.5, 'SIN SUPERNOVA', 92, 1480, { out: 6.0 });
  if (t > 6.4) lock(ctx, t, 6.6, info?.bbox.bh, 'AGUJERO NEGRO');
  card(ctx, t, 8.9, { label: 'Hallazgo', value: '1ª', unit: 'PISTA', detail: 'Y podría pasar muchísimo' }, { index: '01', dd: 1.6 });
  return { status: t < 2.2 ? `SCANNING ${String(Math.round(prog(t, 0, 2.2) * 100)).padStart(3, '0')}%` : t < 6.2 ? 'COLAPSO · SIN DESTELLO' : 'OBJETO: AGUJERO NEGRO' };
} });
// B · the textbook: explode the layers, fuel runs out, core collapses, supernova
SEG.push({ a: 12.2, b: 24.0, top: 2.1, tl: 'OBJ // ESTRELLA MASIVA · TEÓRICO', f(ctx, t, st) {
  const cam = camAt({ yaw: lerp(0.3, 0.75, prog(t, 12.2, 24)), pitch: 0.18, fov: 0.8, dist: lerp(5.2, 4.4, eio(prog(t, 12.4, 15.5))) + 2.2 * eio(prog(t, 18.75, 21)), target: [0, 1.15, 0], cy: 930 });
  const ex = eio(prog(t, 14.9, 16.2)) * (1 - eio(prog(t, 17.4, 18.3)));
  const coll = eio(prog(t, 17.4, 18.7)), boom = prog(t, 18.75, 23.8);
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12 });
  let info;
  if (t < 18.75) info = HOLO.draw(ctx, starModel(1 - 0.12 * coll, 1.15, coll * 0.8), cam, { hue: T.hue, ...st, explode: { env: ex, shells: Math.max(ex, 0.001 + coll), core: Math.max(ex, coll) }, focus: t > 15.5 && t < 18.3 ? 'core' : undefined, dim: 0.45 });
  else { // supernova: the shell flies outward as a solid light wave, then fades
    const s = 1 + eo(boom) * 0.5; info = HOLO.draw(ctx, starModel(s, 1.15, 0), cam, { hue: T.hue, solid: 0.35 * (1 - clamp(boom * 2)), wave: { y: 1.15 + (boom * 3 - 1.2), w: 0.18 }, gain: 1 - clamp(boom * 1.5), lineWidth: 1.35 * (1.5 - boom * 0.4), explode: { env: eo(boom) * 1.2 } });
    const sh = []; for (let k = 0; k < 3; k++) { const r = (0.9 + eo(clamp(boom * 1.4 - k * 0.12)) * 2.2) ; for (let j = 0; j < 4; j++) sh.push(ring(r * (1 - j * 0.03), [0, 1.15, 0], 96, j * 0.8 + k)); } HOLO.draw(ctx, model([{ id: 'shock', anchor: [0, 1.15, 0], pieces: [piece('shock', merge(sh), { box: false })] }]), cam, { hue: T.hue, gain: 1 - boom, lineWidth: 2 });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const p = new Float32Array(3); makeCamera(cam, W, H).project(0, 1.15, 0, p); const fl = Math.pow(1 - clamp(boom * 3), 2); const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 900); g.addColorStop(0, T.hi(0.9 * fl)); g.addColorStop(0.3, T.line(0.35 * fl)); g.addColorStop(1, T.line(0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (t < 15.0) lock(ctx, t, 15.0, info.bbox.env, 'TGT 02 · CAPAS', { alpha: 1 });
  if (t > 15.6 && t < 18.6) { lock(ctx, t, 15.9, info.bbox.core, 'NÚCLEO · HIERRO'); }
  card(ctx, t, 15.8, { label: 'Combustible', value: String(Math.round(100 * (1 - eio(prog(t, 15.9, 17.0))))).padStart(3, '0'), unit: '%' }, { index: '02', rl: 0.05, out: 18.6 });
  tag(ctx, t, 17.4, 'EL NÚCLEO SE HUNDE', 92, 1350, { out: 18.6 });
  card(ctx, t, 19.4, { label: 'Resultado', value: 'SUPERNOVA', unit: '', detail: 'Una de las explosiones más brillantes del universo' }, { index: '02', rl: 0.6, big: 104, dd: 1.5 });
  return { status: t < 18.75 ? 'MODO: TEORÍA · VISTA EXPLOSIONADA' : 'EVENTO: SUPERNOVA', glitch: t >= 18.8 && t < 18.9 ? 1 : 0 };
} });
// C · remnant
SEG.push({ a: 24.0, b: 27.0, top: 1.6, tl: 'OBJ // REMANENTE', f(ctx, t, st) {
  const cam = camAt({ yaw: 0.0, pitch: lerp(0.12, 0.2, prog(t, 24, 27)), dist: 4.2, target: [0, 1.0, 0] });
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12 });
  const info = HOLO.draw(ctx, bhModel(1, 1.0, t * 0.6), cam, { hue: T.hue, ...st });
  tag(ctx, t, 24.1, 'LO QUE QUEDA EN EL CENTRO', 92, 300);
  lock(ctx, t, 26.2, info.bbox.bh, 'AGUJERO NEGRO');
  return { status: 'REMANENTE · COMPACTO' };
} });
// D · evidence: two black holes inspiralling over spacetime
SEG.push({ a: 27.0, b: 43.4, top: 0.6, tl: 'OBS // ONDAS GRAVITACIONALES', f(ctx, t, st) {
  const cam = camAt({ yaw: 0.4 + (t - 27) * 0.05, pitch: lerp(0.55, 0.42, prog(t, 27, 43.4)), dist: 5.6, target: [0, -0.1, 0], cy: 1000 });
  const sep = lerp(1.1, 0.7, prog(t, 27, 43.4)), ph = (t - 27) * (2 + (t - 27) * 0.08);
  const info = HOLO.draw(ctx, binModel(t, { sep, ph }), cam, { hue: T.hue, ...st });
  card(ctx, t, 29.4, { label: 'Colisiones revisadas', value: String(Math.round(257 * eo(prog(t, 29.6, 31.0)))), unit: '', detail: 'Equipo de Caltech' }, { index: '03', rd: 0.2, rl: 0.01, out: 35.0, dd: 1.6 });
  tag(ctx, t, 27.2, 'CALTECH', 92, 640, { out: 29.3 });
  [['LIGO', 33.3], ['VIRGO', 34.0], ['KAGRA', 34.6]].forEach(([s, t0], i) => tag(ctx, t, t0, s, 92 + i * 300, 1330, { size: 36 }));
  tag(ctx, t, 36.8, 'ONDAS GRAVITACIONALES', 92, 380, { size: 44, acc: true });
  tag(ctx, t, 38.4, 'TEMBLORES DEL PROPIO ESPACIO', 92, 470, { size: 30, out: 40.3 });
  tag(ctx, t, 40.4, 'VIAJAN CIENTOS DE MILLONES DE AÑOS', 92, 470, { size: 30 });
  lock(ctx, t, 31.6, info.bbox.pair, 'PAR BINARIO', { alpha: 1 - prog(t, 34.8, 35.2) });
  return { status: `EVENTOS ${String(Math.round(257 * eo(prog(t, 29.6, 31.0)))).padStart(3, '0')} · RED LIGO-VIRGO-KAGRA` };
} });
// E · the histogram: peak ≈10 and the 12–16 gap
SEG.push({ a: 43.4, b: 60.8, top: 1.8, tl: 'DATOS // MASAS DE AGUJEROS NEGROS', f(ctx, t, st) {
  const cam = camAt({ yaw: lerp(-0.3, -0.12, prog(t, 43.4, 60.8)), pitch: 0.2, dist: lerp(8.2, 7.0, eio(prog(t, 46, 56))), target: [lerp(0, -0.35, eio(prog(t, 46, 55))), 0.75, 0], cy: 1000 });
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.08, alpha: 0.6 });
  const grow = { scan: { y: lerp(-0.05, 1.9, eio(prog(t, 45.2, 47.2))) } };
  const info = HOLO.draw(ctx, histModel(t > 54.6), cam, { hue: T.hue, ...(t < 47.3 ? grow : st), focus: t > 48 && t < 52 ? 'peak' : t > 54.6 ? 'gap' : undefined, dim: 0.5, keep: t > 54.6 ? { gap: '#ff7a3d' } : undefined });
  if (t > 45.2 && t < 47.3) drawScanPlane(ctx, cam, W, H, grow.scan.y, { hue: T.hue, r: 2.1 });
  // mass labels under the axis
  ctx.save(); ctx.font = `26px ${U.FONT.mono}`; ctx.textAlign = 'center'; ctx.fillStyle = T.dim(0.85 * prog(t, 46, 47)); const p = new Float32Array(3); const PJ = makeCamera(cam, W, H).project;
  [0, 5, 10, 15, 20].forEach(i => { PJ(BX(i), 0, 0.3, p); ctx.fillText(String(5 + i), p[0], p[1] + 22); }); PJ(0, 0, 0.3, p); ctx.font = `500 28px ${U.FONT.ui}`; ctx.fillText('MASA (VECES EL SOL)', p[0], p[1] + 70); ctx.restore();
  tag(ctx, t, 43.6, 'DOS COSAS RARAS', 92, 260, { out: 47.6 });
  tag(ctx, t, 46.2, 'ESQUEMA ILUSTRATIVO', W / 2, 1450, { size: 26, align: 'center' });
  lock(ctx, t, 48.0, info.bbox.peak, '01 · EL PICO', { alpha: 1 - prog(t, 52.0, 52.3) });
  card(ctx, t, 47.8, { label: 'Los más abundantes', value: '≈10', unit: 'VECES EL SOL', detail: 'Con diferencia' }, { index: '04', out: 52.0, rl: 0.5, dd: 3.2 });
  lock(ctx, t, 54.8, info.bbox.gap, '02 · EL HUECO');
  card(ctx, t, 53.6, { label: 'Casi ninguno', value: '12–16', unit: 'VECES EL SOL' }, { index: '05', rd: 1.2, rl: 0.6, out: 57.4 });
  tag(ctx, t, 57.8, 'UN HUECO', 92, 300, { size: 64, acc: true, rl: 0.2 });
  tag(ctx, t, 59.0, 'PRIMERA VEZ QUE SE DETECTA', 92, 420, { size: 30 });
  return { status: t < 48 ? 'MUESTRA: 257 FUSIONES' : t < 52 ? 'TARGET 1/2 · PICO' : 'TARGET 2/2 · HUECO' };
} });
// F · the turn: the star collapses inward with no flash
SEG.push({ a: 60.8, b: 72.0, top: 2.1, tl: 'OBJ // ESTRELLA MASIVA · HIPÓTESIS', f(ctx, t, st) {
  const cam = camAt({ yaw: lerp(-0.5, -0.1, prog(t, 60.8, 72)), pitch: 0.22, dist: lerp(5.2, 4.3, eio(prog(t, 61, 66))), target: [0, 1.12, 0] });
  const k = eio(prog(t, 66.7, 69.5));
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12 });
  let info;
  if (k < 0.98) info = HOLO.draw(ctx, starModel(lerp(1, 0.02, k), 1.15, k), cam, { hue: T.hue, ...st, explode: { shells: 0.4 + k, core: 0.4 + k }, gain: 1 - k * 0.4 });
  if (t > 68.6) info = HOLO.draw(ctx, bhModel(lerp(0.1, 1, eo(prog(t, 68.6, 69.8))), 1.1, t * 0.6), cam, { hue: T.hue, ...st });
  tag(ctx, t, 60.9, '¿CÓMO SE EXPLICA?', 92, 260, { size: 44 });
  tag(ctx, t, 62.2, 'HIPÓTESIS', 92, 360, { size: 30 });
  tag(ctx, t, 64.9, 'COLAPSAN DIRECTAMENTE', 92, 1350, { out: 68.3 });
  tag(ctx, t, 68.5, 'ANTES DE QUE PUEDA EXPLOTAR', 92, 1350, { out: 70.2 });
  if (t < 66.6) lock(ctx, t, 63.0, info?.bbox.env, 'TGT 03 · ESTRELLA');
  if (t > 70.0) lock(ctx, t, 70.4, info?.bbox.bh, 'SIN DESTELLO');
  card(ctx, t, 70.3, { label: 'Diagnóstico', value: 'FALLIDA', unit: '', detail: 'Supernova fallida' }, { index: '06', rl: 0.4, big: 110, y: 470 });
  return { status: k > 0 && k < 1 ? 'COLAPSO DIRECTO · 0 DESTELLOS' : 'MODO: HIPÓTESIS' };
} });
// G · caveat checklist
SEG.push({ a: 72.0, b: 83.0, top: 1.6, tl: 'INFORME // ESTADO DE LA PRUEBA', f(ctx, t, st) {
  const cam = camAt({ yaw: lerp(0.5, 0.75, prog(t, 72, 83)), pitch: 0.2, dist: lerp(4.6, 4.4, prog(t, 72, 83)), target: [0, 1.0, 0], cy: 1180 });
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12, alpha: 0.7 });
  HOLO.draw(ctx, bhModel(0.9, 1.0, t * 0.6), cam, { hue: T.hue, ...st, gain: 0.7 });
  tag(ctx, t, 72.1, 'OJO', 92, 250, { size: 54, acc: true, rl: 0.15 });
  const rows = [['PRUEBA DIRECTA', 'NO', 72.9, false], ['CASO CONFIRMADO', 'NINGUNO', 74.5, false], ['MÁS INVESTIGACIÓN', 'NECESARIA', 77.4, false], ['ENCAJA CON LA TEORÍA', 'SÍ', 80.6, true]];
  rows.forEach(([l, v, t0, acc], i) => { if (t < t0) return; const a = prog(t, t0, t0 + 0.3), y = 360 + i * 120, f = Math.floor(t * 30);
    U.plate(ctx, T, 92, y, 896, 96, a); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `600 32px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; ctx.textBaseline = 'middle'; ctx.fillStyle = T.line(0.9 * a); ctx.fillText(U.rollText(l, prog(t, t0, t0 + 0.4), f, i), 120, y + 50);
    ctx.textAlign = 'right'; ctx.font = `400 44px ${U.FONT.ui}`; const lk = prog(t, t0 + 0.2, t0 + 0.7); ctx.fillStyle = acc && lk >= 1 ? (t < t0 + 0.8 ? T.hi(a) : T.acc(a)) : T.hi(0.9 * a); ctx.fillText(U.rollText(v, lk, f, i + 7), 960, y + 50); ctx.restore(); });
  return { status: `VERIFICACIÓN ${rows.filter(r => t > r[2] + 0.7).length}/4` };
} });
// H · stars going out, top-down
SEG.push({ a: 83.0, b: 88.5, top: 0.4, tl: 'MAPA // ESTRELLAS MASIVAS', f(ctx, t, st) {
  const cam = camAt({ yaw: 0.2 + (t - 83) * 0.03, pitch: lerp(1.15, 1.3, prog(t, 83, 88.5)), dist: lerp(6.0, 5.4, prog(t, 83, 88.5)), target: [0, 0, 0], cy: 980 });
  HOLO.draw(ctx, fieldModel(t), cam, { hue: T.hue, ...st });
  tag(ctx, t, 83.1, 'SI TIENEN RAZÓN', 92, 260, { size: 34 });
  tag(ctx, t, 84.5, 'ESTRELLAS QUE SE ESFUMARON', 92, 360, { size: 40 });
  tag(ctx, t, 87.3, 'SIN DESPEDIRSE', 92, 1380, { size: 40, acc: true });
  return { status: `ACTIVAS ${String(FIELD.filter(f => t < f.out).length).padStart(2, '0')}/46` };
} });
// I · the question, then the name
SEG.push({ a: 88.5, b: 99, top: 2.1, tl: 'COMPARATIVA // DOS FINALES', f(ctx, t, st) {
  const cam = camAt({ yaw: lerp(0.05, -0.05, prog(t, 88.5, 96.9)), pitch: 0.12, dist: 6.0, target: [0, 1.1, 0], cy: 960 });
  const end = t > 94.6 ? { scanDown: { y: lerp(2.2, -0.05, eio(prog(t, 94.6, 96.2))) } } : st;
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12, c: [-0.72, 0, 0], alpha: 0.4 }); drawPad(ctx, cam, W, H, { hue: T.hue, rot: -t * 0.12, c: [0.72, 0, 0], alpha: 0.4 });
  const a = HOLO.draw(ctx, (() => { const m = starModel(0.5, 1.15, 0); m.parts.forEach(P => P.pieces.forEach(C => { for (let i = 0; i < C.v.length; i += 3) C.v[i] -= 0.72; })); m.parts.forEach(P => P.anchor = [P.anchor[0] - 0.72, P.anchor[1], P.anchor[2]]); return m; })(), cam, { hue: T.hue, ...end });
  const b = HOLO.draw(ctx, bhModel(0.45, 1.15, t * 0.6, 0.72), cam, { hue: T.hue, ...end });
  if (t < 93.25) { tag(ctx, t, 88.6, '¿QUÉ TE INQUIETA MÁS?', W / 2, 330, { size: 46, align: 'center' });
    lock(ctx, t, 90.9, a.bbox.env, 'EXPLOTAR'); lock(ctx, t, 92.4, b.bbox.bh, 'ESFUMARSE'); }
  if (t > 93.25) { const k = prog(t, 93.25, 94.1), f = Math.floor(t * 30); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    U.plate(ctx, T, 90, 230, 900, 250, prog(t, 93.25, 93.5)); ctx.letterSpacing = '10px'; ctx.font = `300 64px ${U.FONT.ui}`; ctx.fillStyle = T.line(0.95); ctx.fillText(U.rollText('LO QUE', k, f, 1), W / 2, 300);
    ctx.letterSpacing = '14px'; ctx.font = `400 104px ${U.FONT.ui}`; ctx.fillStyle = k >= 1 ? (t < 94.2 ? T.hi(1) : T.acc(1)) : T.hi(0.9); ctx.fillText(U.rollText('IGNORAMOS', k, f, 2), W / 2, 395); ctx.restore(); }
  return { status: t > 94.6 ? 'BORRANDO · FIN' : 'EXPLOTAR / ESFUMARSE' };
} });

export function render(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  U.background(ctx, W, H, T, { cx: W / 2, cy: 960, px: -t * 6, py: t * 2 });
  const seg = SEG.find(s => t >= s.a && t < s.b) || SEG[SEG.length - 1];
  const st = scanState(t, seg.a, seg.b, seg.top);
  const r = seg.f(ctx, t, st) || {};
  if (st.scan) drawScanPlane(ctx, camAt({}), W, H, -10, { alpha: 0 });
  U.vignette(ctx, W, H, 0.5);
  U.chrome(ctx, W, H, T, { tl: seg.tl, tr: r.status || '', bl: `T+${t.toFixed(2).padStart(5, '0')}`, br: 'HOLO-SCAN 205', px: t * 20 });
  subtitles(ctx, t);
  if (r.glitch) U.glitch(ctx, W, H, r.glitch, Math.floor(t * 30));
}
export function setSubs(s) { SUBS.push(...s); }

// cover: star half-collapsed into a black hole, title as locked HUD values
export function cover(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); U.background(ctx, W, H, T, { cx: W / 2, cy: 1100 });
  const cam = camAt({ yaw: 0.5, pitch: 0.22, dist: 4.6, target: [0, 1.1, 0], cy: 1150 });
  drawPad(ctx, cam, W, H, { hue: T.hue, rot: 0.4 });
  const k = 0.45; HOLO.draw(ctx, starModel(1 - k * 0.5, 1.15, k), cam, { hue: T.hue, explode: { env: 0.5, shells: 0.8, core: 0.8 }, gain: 1, lineWidth: 1.8 });
  const b = HOLO.draw(ctx, bhModel(0.55, 1.15, 0.3), cam, { hue: T.hue, lineWidth: 2 });
  U.targetBox(ctx, T, b.bbox.bh, 1, { lockK: 1, tag: 'SIN DESTELLO', pad: 30 });
  U.vignette(ctx, W, H, 0.5);
  U.plate(ctx, T, 70, 170, 940, 420, 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.letterSpacing = '12px'; ctx.font = `600 150px ${U.FONT.ui}`; ctx.fillStyle = T.hi(1); ctx.fillText('MUEREN', W / 2, 290);
  ctx.letterSpacing = '6px'; ctx.font = `600 116px ${U.FONT.ui}`; ctx.fillStyle = T.acc(1); ctx.fillText('SIN EXPLOTAR', W / 2, 460); ctx.restore();
  U.chrome(ctx, W, H, T, { tl: 'OBJ // ESTRELLA MASIVA', tr: 'COLAPSO · 0 DESTELLOS', bl: '257 FUSIONES', br: 'HOLO-SCAN 205' });
}

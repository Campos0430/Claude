// 2D motion-graphics layer
const ov = document.getElementById('ov'), ctx = ov.getContext('2d');
function text(s, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.size || 80}px ${o.font || 'MontBlack'}`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.ls) ctx.letterSpacing = `${o.ls}px`;
  ctx.globalAlpha = clamp(o.a ?? 1);
  ctx.translate(x, y); if (o.scale) ctx.scale(o.scale, o.scale); if (o.rot) ctx.rotate(o.rot);
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 40; ctx.fillStyle = o.color || C.white; ctx.fillText(s, 0, 0); }
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 6;
  if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = 'rgba(5,10,22,0.92)'; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); ctx.shadowColor = 'transparent'; }
  ctx.fillStyle = o.color || C.white; ctx.fillText(s, 0, 0);
  ctx.restore();
}
// kinetic pop: scale overshoot + motion smear
function pop(t, t0, s, x, y, o = {}) {
  if (t < t0) return; const p = clamp((t - t0) / 0.42);
  if (p < 0.5) for (let k = 3; k >= 1; k--) text(s, x, y + (1 - eOut(clamp(p - k * 0.05))) * 70, { ...o, scale: lerp(0.5, 1, back(clamp(p - k * 0.05))), a: 0.12 * (o.a ?? 1), stroke: 0, glow: null });
  text(s, x, y + (1 - eOut(p)) * 70, { ...o, scale: lerp(0.5, 1, back(p)) * (o.scale || 1), a: (o.a ?? 1) * clamp(p * 3) });
}
function pill(x, y, w, h, fill, stroke) { ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); } }
function kicker(t, t0, s, y = 250, col = C.cyan, out = 99) {
  if (t < t0 || t > out + 0.3) return; const p = eOut(clamp((t - t0) / 0.45)) * (1 - eOut(prog(t, out, out + 0.3)));
  ctx.save(); ctx.globalAlpha = p; ctx.font = '40px MontXB'; ctx.letterSpacing = '6px';
  const w = ctx.measureText(s).width + 80;
  ctx.shadowColor = col; ctx.shadowBlur = 24;
  pill(W / 2, y, w * lerp(0.4, 1, p), 78, rgba(C.night, 0.55), rgba(col, 0.9));
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - w / 2 * p, y - 40, w * p, 80); ctx.clip();
  text(s, W / 2, y + 2, { size: 40, font: 'MontXB', color: col, ls: 6, a: p });
  ctx.restore();
}
// HUD reticle around a projected planet
function reticle(x, y, r, t, col, a = 1, label) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
  ctx.lineWidth = 2.5; ctx.setLineDash([4, 14]); ctx.lineDashOffset = -t * 30;
  ctx.beginPath(); ctx.arc(x, y, r * 1.18, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.lineWidth = 4; const s = t * 0.35;
  for (let i = 0; i < 4; i++) { const a0 = s + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, r * 1.28, a0 - 0.18, a0 + 0.18); ctx.stroke(); }
  for (let i = 0; i < 4; i++) { const a0 = i * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * r * 1.34, y + Math.sin(a0) * r * 1.34); ctx.lineTo(x + Math.cos(a0) * r * 1.42, y + Math.sin(a0) * r * 1.42); ctx.stroke(); }
  ctx.restore();
  if (label) text(label, x, y - r * 1.5, { size: 30, font: 'MontXB', color: col, ls: 6, a });
}
function callout(x, y, tx, ty, l1, l2, col, a) {
  if (a <= 0) return; const p = eOut(a);
  ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.stroke();
  const mx = lerp(x, tx, p), my = lerp(y, ty, p);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mx, my); ctx.stroke(); ctx.restore();
  const al = tx > x ? 'left' : 'right', off = tx > x ? 16 : -16;
  text(l1, tx + off, ty - 22, { size: 40, font: 'MontXB', color: col, align: al, a: clamp((a - 0.4) * 3) });
  if (l2) text(l2, tx + off, ty + 24, { size: 30, font: 'InterSB', color: C.white, align: al, a: clamp((a - 0.5) * 3) });
}
function arc2(cx, cy, rx, ry, a0, a1, color, lw = 10, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 18;
  ctx.beginPath(); const n = 60; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); const px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
  ctx.restore();
}
function sunriseIcon(x, y, s, color, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(x, y, s * 0.42, Math.PI, 0); ctx.fill();
  for (let i = 0; i < 5; i++) { const a2 = Math.PI + (i + 0.5) * Math.PI / 5; ctx.beginPath(); ctx.moveTo(x + Math.cos(a2) * s * 0.58, y + Math.sin(a2) * s * 0.58); ctx.lineTo(x + Math.cos(a2) * s * 0.8, y + Math.sin(a2) * s * 0.8); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x - s * 0.85, y + s * 0.06); ctx.lineTo(x + s * 0.85, y + s * 0.06); ctx.stroke();
  ctx.restore();
}
function burst(x, y, t, t0, col, n = 14, R = 160) {
  const p = prog(t, t0, t0 + 0.6); if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.lineCap = 'round'; ctx.globalAlpha = 1 - p; ctx.lineWidth = 5 * (1 - p) + 1;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.2; const r0 = R * (0.5 + eOut(p) * 0.6), r1 = R * (0.6 + eOut(p) * 0.9); ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke(); }
  ctx.globalAlpha = (1 - p) * 0.8; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R * eOut(p) * 1.4, 0, TAU); ctx.stroke(); ctx.restore();
}
function shockRing(x, y, t, t0, col, R = 300) {
  const p = prog(t, t0, t0 + 0.7); if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = (1 - p) * 0.7; ctx.lineWidth = 10 * (1 - p) + 1; ctx.shadowColor = col; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(x, y, R * eOut(p), 0, TAU); ctx.stroke(); ctx.restore();
}
// transition: light sweep + flash around cut
function transition(t, c) {
  const d = t - c; if (Math.abs(d) > 0.3) return;
  const p = (d + 0.3) / 0.6; // 0..1
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const fx = lerp(-700, W + 700, eIO(p));
  const g = ctx.createLinearGradient(fx - 380, 0, fx + 380, 0);
  g.addColorStop(0, 'rgba(63,208,232,0)'); g.addColorStop(0.42, 'rgba(63,208,232,0.18)'); g.addColorStop(0.5, 'rgba(255,250,235,0.55)'); g.addColorStop(0.58, 'rgba(245,166,35,0.18)'); g.addColorStop(1, 'rgba(245,166,35,0)');
  ctx.translate(W / 2, H / 2); ctx.rotate(-0.35); ctx.translate(-W / 2, -H / 2);
  ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  ctx.restore();
  const f = Math.pow(1 - Math.abs(d) / 0.3, 3);
  ctx.save(); ctx.fillStyle = `rgba(244,241,234,${f * 0.55})`; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function lightLeak(t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const x = W * (0.85 + 0.12 * Math.sin(t * 0.21)), y = H * (0.12 + 0.05 * Math.cos(t * 0.17));
  let g = ctx.createRadialGradient(x, y, 0, x, y, 700); g.addColorStop(0, 'rgba(245,166,35,0.10)'); g.addColorStop(1, 'rgba(245,166,35,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const x2 = W * (0.1 + 0.1 * Math.cos(t * 0.13)), y2 = H * (0.8 + 0.05 * Math.sin(t * 0.19));
  g = ctx.createRadialGradient(x2, y2, 0, x2, y2, 650); g.addColorStop(0, 'rgba(63,208,232,0.08)'); g.addColorStop(1, 'rgba(63,208,232,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function vignette() {
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}
// letterbox gradient behind captions for legibility
function captionScrim() { const g = ctx.createLinearGradient(0, 1250, 0, 1600); g.addColorStop(0, 'rgba(5,9,20,0)'); g.addColorStop(0.5, 'rgba(5,9,20,0.35)'); g.addColorStop(1, 'rgba(5,9,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 350); }

// ---------- captions ----------
let groups = [];
function buildCaptions(words) {
  let g = []; const clean = w => w.replace(/[.,…:;]+$/g, '');
  words.forEach((w, i) => {
    g.push({ ...w, t: clean(w.w) });
    const len = g.map(x => x.t).join(' ').length, brk = /[.,…:;]$/.test(w.w), nxt = words[i + 1], gap = nxt ? nxt.s - w.e : 9;
    if (brk || len >= 14 || g.length >= 3 || gap > 0.15 || !nxt) { groups.push(g); g = []; }
  });
  groups.forEach((g, i) => { g.s = g[0].s; g.e = Math.min(g[g.length - 1].e + 0.35, groups[i + 1] ? groups[i + 1][0].s : 99); });
}
const HOT = /^(tumba|siberia|pruebas|tres|mil|años|cannabis|efectos|pista|pipa|pelo|muertos|tunnug|túmulo|gigantesco|ciento|cuarenta|metros|valle|reyes|nómadas|caballo|escitas|ochocientos|cristo|arqueólogos|diecisiete|cámaras|madera|ataúdes|troncos|caballos|sacrificados|cuatrocientas|semillas|silvestre|no|cabello|humano|cannabinol|thc|tiempo|antigua|china|quinientos|siglos|sabe|recreativo|rituales|funerarios|calmar|víctimas|sacrificios|especulación|críticas|experto|débil|fumaban|comían|heródoto|humo|cáñamo|dudó|historias|antiguas|exageradas|ciertas)$/i;
function captions(t) {
  if (t > 101.85) return;
  const g = groups.find(g => t >= g.s - 0.05 && t < g.e); if (!g) return;
  const y = 1420, size = 78;
  ctx.save(); ctx.font = `${size}px MontBlack`;
  const sp = 28, ws = g.map(w => ctx.measureText(w.t).width), total = ws.reduce((a, b) => a + b, 0) + sp * (g.length - 1);
  const fit = Math.min(1, (W - 90) / total); ctx.translate(W / 2, y); ctx.scale(fit, fit); ctx.translate(-W / 2, -y);
  let x = W / 2 - total / 2; const ap = eOut(clamp((t - g.s + 0.05) / 0.16));
  g.forEach((w, i) => {
    const nx = g[i + 1] ? g[i + 1].s : g.e, active = t >= w.s && t < nx, said = t >= w.s;
    const col = active ? C.cyan : (HOT.test(w.t) ? C.amber : C.white);
    const pw = active ? eOut(clamp((t - w.s) / 0.12)) : 0, sc = 1 + 0.06 * pw;
    ctx.save(); ctx.translate(x + ws[i] / 2, y + (1 - ap) * 22 - pw * 6); ctx.scale(sc, sc);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = ap * (said ? 1 : 0.5);
    ctx.lineJoin = 'round'; ctx.lineWidth = 15; ctx.strokeStyle = 'rgba(5,10,22,0.95)'; ctx.strokeText(w.t, 0, 0);
    if (active) { ctx.shadowColor = C.cyan; ctx.shadowBlur = 30; } else { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; }
    ctx.fillStyle = col; ctx.fillText(w.t, 0, 0);
    ctx.restore(); x += ws[i] + sp;
  });
  ctx.restore();
}
function chrome(t) {
  ctx.save(); ctx.globalAlpha = 0.8 * (t < 102.0 ? 1 : 0);
  ctx.font = '28px MontXB'; ctx.letterSpacing = '5px'; ctx.textAlign = 'center'; ctx.fillStyle = C.white; ctx.fillText('LO QUE IGNORAMOS', W / 2, 140);
  ctx.fillStyle = C.cyan; ctx.fillRect(W / 2 - 30, 158, 60, 4); ctx.restore();
  ctx.fillStyle = rgba(C.white, 0.12); ctx.fillRect(0, H - 8, W, 8);
  ctx.fillStyle = C.cyan; ctx.fillRect(0, H - 8, W * t / DUR, 8);
}

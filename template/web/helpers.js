function orbitCam(az, el, D, tgt, fov = 40) { look(cam, V(tgt.x + Math.sin(az) * Math.cos(el) * D, tgt.y + Math.sin(el) * D, tgt.z + Math.cos(az) * Math.cos(el) * D), tgt, fov); }
const whip = (t, a, dur = 0.9) => 1 - eOut5(prog(t, a, a + dur));
function chip(x, y, s, col, a, size = 56, fg) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px MontBlack`; const w = ctx.measureText(s).width + 80; ctx.shadowColor = col; ctx.shadowBlur = 26; pill(x, y, w * lerp(0.6, 1, eOut(a)), size * 1.6, rgba(C.night, 0.85), col); ctx.restore(); text(s, x, y + 3, { size, color: fg || col, a }); }
function label(p3, s, col, dy = -60, a = 1, size = 40) { const q = proj(p3); text(s, q.x, q.y + dy, { size, font: 'MontXB', color: col, stroke: 10, a }); return q; }
function panel(x, y, w, h, a, col = C.white) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,12,24,0.78)'; ctx.strokeStyle = rgba(col, 0.6); ctx.lineWidth = 3; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 34); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke(); ctx.restore(); }
function redX(x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = RED; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.shadowColor = RED; ctx.shadowBlur = 20; const k = s * back(clamp(a)); ctx.beginPath(); ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k); ctx.stroke(); ctx.restore(); }
function bubble(x, y, s, a, t) {
  if (a <= 0) return; const b = 1 + 0.06 * Math.sin(t * 9);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s * b, s * b); ctx.fillStyle = C.cyan; ctx.shadowColor = C.cyan; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.roundRect(-46, -36, 92, 64, 20); ctx.fill(); ctx.beginPath(); ctx.moveTo(-18, 26); ctx.lineTo(-30, 46); ctx.lineTo(2, 26); ctx.fill();
  ctx.fillStyle = C.night; [-22, 0, 22].forEach(dx => { ctx.beginPath(); ctx.arc(dx, -4, 6.5, 0, TAU); ctx.fill(); }); ctx.restore();
}
function ctaPill(t, t0, y = 250) {
  if (t < t0) return; const p = eOut(prog(t, t0, t0 + 0.35));
  ctx.save(); ctx.globalAlpha = p; ctx.font = '42px MontXB'; ctx.letterSpacing = '4px'; const w = ctx.measureText('RESPONDE EN COMENTARIOS').width + 150;
  ctx.shadowColor = C.cyan; ctx.shadowBlur = 30; pill(W / 2, y, w * lerp(0.5, 1, p), 96, rgba(C.night, 0.85), C.cyan); ctx.restore();
  text('RESPONDE EN COMENTARIOS', W / 2 + 40, y + 2, { size: 42, font: 'MontXB', ls: 4, a: p });
  bubble(W / 2 - w / 2 + 62, y - 2, 0.7, p, t);
}
function handIcon(x, y, s, a, col = C.white, rot = 0) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = col; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.roundRect(-38, -10, 76, 70, 26); ctx.fill();
  [[-30, -62, 15], [-10, -78, 15], [10, -74, 15], [29, -58, 14]].forEach(([fx, fy, w]) => { ctx.beginPath(); ctx.roundRect(fx - w / 2, fy, w, 80, 8); ctx.fill(); });
  ctx.save(); ctx.translate(-38, 22); ctx.rotate(-0.8); ctx.beginPath(); ctx.roundRect(-8, -50, 17, 58, 8); ctx.fill(); ctx.restore(); ctx.restore(); }
const RED = '#ff4a3a';
function stamp(t, t0, s, x, y, col = RED, rot = -0.1, size = 110, out = 999, fg = C.white) {
  if (t < t0 || t > out + 0.25) return; const p = prog(t, t0, t0 + 0.22), a = clamp(p * 3) * (1 - prog(t, out, out + 0.25)), sc = lerp(1.9, 1, eOut(p));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.font = `${size}px MontBlack`; const w = ctx.measureText(s).width + size * 0.7, h = size * 1.35;
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 18); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, size * 0.05); ctx.restore();
  if (p < 1) shockRing(x, y, t, t0, col, 260); }
function optionCard(y, label2, col, t, t0, iconFn, size = 120) {
  if (t < t0) return; const p = clamp((t - t0) / 0.4), x = W / 2 + (1 - eOut(p)) * 500;
  ctx.save(); ctx.globalAlpha = clamp(p * 2.5); ctx.shadowColor = col; ctx.shadowBlur = 26; ctx.fillStyle = rgba(C.night, 0.88); ctx.strokeStyle = col; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(x - 400, y - 105, 800, 210, 40); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.font = `${size}px MontBlack`; const tw = ctx.measureText(label2).width; ctx.restore(); const fs = Math.min(size, size * 470 / tw); text(label2, x - 130, y + 5, { size: fs, color: col, a: clamp(p * 2.5) });
  if (iconFn) { ctx.save(); ctx.globalAlpha = clamp(p * 2.5); ctx.translate(x + 220, y); iconFn(t); ctx.restore(); }
}

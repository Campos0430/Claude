// Timeline — "El teorema del mono infinito"
const CUTS = [9.0, 22.9, 37.6, 46.9, 63.9, 77.1, 82.6];
const GOLD = '#ffc44a', REDC = '#ff4a3a';
const ABC = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ .,;';
function dimBG(a) { ctx.save(); ctx.fillStyle = `rgba(5,9,20,${a})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function dot(x, y, r, col, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
function monkeyShot(t, o = {}) { hideAll(); mk.visible = desk.visible = true; setMonkey(t, o); setKeys(t, o); const k = o.k ?? 0; look(cam, V(lerp(2.6, 1.8, k) * (o.side ?? 1), lerp(3.2, 2.9, k), lerp(9.2, 8.2, k) * (o.zoom ?? 1)), V(0, o.ty ?? 2.3, 0.8), 40); }
// sheet of paper with typed characters on a fixed grid
function paper(cx, cy, w, h, a, rot = 0) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.rotate(rot); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = '#f2ecdc'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.restore(); }
function typed(str, x0, y0, cols, size, n, a, colFn) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px InterSB`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const dx = size * 0.72, dy = size * 1.45;
  for (let i = 0; i < Math.min(n, str.length); i++) { ctx.fillStyle = colFn ? colFn(i) : '#1a2030'; ctx.fillText(str[i], x0 + (i % cols) * dx, y0 + Math.floor(i / cols) * dy); } ctx.restore(); }
const GIB = Array.from({ length: 400 }, (_, i) => ABC[Math.floor(hsh(i + 3) * ABC.length)]).join('');
const SSS = Array.from({ length: 400 }, (_, i) => hsh(i + 11) < 0.82 ? 'S' : 'AJLMQ '[Math.floor(hsh(i + 5) * 6)]).join('');
const PHR = 'EN UN LUGAR DE LA MANCHA';
function slots(t, a, y0) { if (a <= 0) return; const n = PHR.length, per = 12, bw = 68, x0 = W / 2 - (per - 1) * bw / 2;
  for (let i = 0; i < n; i++) { const x = x0 + (i % per) * bw, y = y0 + Math.floor(i / per) * 200; const tick = Math.floor(t * 9 + i * 0.37); const ch = ABC[Math.floor(hsh(tick * 31 + i * 7) * ABC.length)]; const ok = ch === PHR[i];
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(244,241,234,0.08)'; ctx.strokeStyle = rgba(C.amber, 0.7); ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 29, y - 38, 58, 76, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ok ? 'rgba(60,220,140,0.25)' : 'rgba(255,74,58,0.10)'; ctx.strokeStyle = ok ? '#3cdc8c' : rgba(C.white, 0.25); ctx.beginPath(); ctx.roundRect(x - 29, y + 52, 58, 76, 10); ctx.fill(); ctx.stroke(); ctx.restore();
    text(PHR[i] === ' ' ? '␣' : PHR[i], x, y + 2, { size: 44, color: GOLD, a }); text(ch === ' ' ? '␣' : ch, x, y + 92, { size: 44, color: ok ? '#3cdc8c' : rgba(C.white, 0.75), a }); }
  text('OBJETIVO', x0 - 30, y0 - 70, { size: 26, font: 'MontXB', color: GOLD, ls: 3, a, align: 'left' }); }
function infinity(cx, cy, s, a, col, t) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 0.16 * s; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const u = i / 100 * TAU, d = 1 + Math.sin(u) ** 2; const x = cx + s * Math.cos(u) / d, y = cy + s * Math.sin(u) * Math.cos(u) / d; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke(); ctx.restore();
  const u = t * 1.6, d = 1 + Math.sin(u) ** 2; dot(cx + s * Math.cos(u) / d, cy + s * Math.sin(u) * Math.cos(u) / d, 0.11 * s, C.white, a); }
function gauge5(cx, cy, R, v, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 44; ctx.lineCap = 'round'; ctx.strokeStyle = rgba(C.white, 0.14); ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, TAU); ctx.stroke(); ctx.strokeStyle = C.cyan; ctx.shadowColor = C.cyan; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI + Math.PI * v); ctx.stroke(); ctx.restore(); }
function chimps(t, a) { if (a <= 0) return; const p = prog(t, 58.8, 61.0); for (let j = 0; j < 6; j++) for (let i = 0; i < 12; i++) { const k = j * 12 + i; const al = a * clamp(p * 1.6 - hsh(k) * 0.6); if (al <= 0) continue; const x = 150 + i * 71, y = 620 + j * 86; ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = '#8a5a36'; ctx.beginPath(); ctx.arc(x, y, 24, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x - 26, y - 4, 10, 0, TAU); ctx.arc(x + 26, y - 4, 10, 0, TAU); ctx.fill(); ctx.fillStyle = '#d9b48a'; ctx.beginPath(); ctx.ellipse(x, y + 5, 16, 14, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x - 7, y - 2, 3, 0, TAU); ctx.arc(x + 7, y - 2, 3, 0, TAU); ctx.fill(); ctx.restore(); } }

const SC = [];
// 1 ── Hook
SC.push({ a: 0, b: 9.0, f(t) {
  monkeyShot(t, { k: eIO(prog(t, 0, 9)), ty: 2.1 });
  pop(t, 0.1, '¿PUEDE UN MONO', W / 2, 310, { size: 86, stroke: 12 }); pop(t, 0.5, 'ESCRIBIR EL QUIJOTE?', W / 2, 410, { size: 70, color: GOLD, stroke: 12 });
  const pa = prog(t, 1.3, 1.7) * (1 - prog(t, 7.4, 7.7)); paper(W / 2, 1195, 900, 190, pa, -0.01);
  const n = Math.floor((t - 1.5) * 9); const good = 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme…'; const k = prog(t, 2.6, 4.2);
  if (t < 2.6) typed(GIB, 140, 1150, 30, 38, n, pa); else typed(good, 130, 1150, 32, 36, Math.floor(k * good.length), pa);
  if (t > 4.8 && t < 7.5) chip(W / 2, 1040, 'SIN UNA SOLA ERRATA', C.cyan, prog(t, 5.14, 5.45), 44, C.white);
  stamp(t, 7.8, 'ES UN TEOREMA', W / 2, 1180, C.amber, -0.04, 76, 999, C.night);
  return world;
} });
// 2 ── Infinite monkey theorem — Émile Borel, 1913; possible + infinite time = it will happen
SC.push({ a: 9.0, b: 22.9, f(t) {
  monkeyShot(t, { k: 0.5, side: -1, ty: 1.6 }); dimBG(0.72);
  kicker(t, 9.2, 'SE LLAMA', 250, C.white); pop(t, 10.02, 'TEOREMA DEL', W / 2, 340, { size: 66, stroke: 10 }); pop(t, 10.64, 'MONO INFINITO', W / 2, 440, { size: 100, color: C.cyan, stroke: 14, glow: C.cyan });
  infinity(W / 2, 800, 260, prog(t, 10.9, 11.5), C.amber, t);
  if (t < 16.1) { chip(W / 2, 1130, 'ÉMILE BOREL', C.white, prog(t, 13.54, 13.9), 54, C.white); chip(W / 2, 1240, 'MATEMÁTICO FRANCÉS · 1913', C.amber, prog(t, 14.6, 14.9), 38, C.white); }
  else { chip(W / 2 - 250, 1130, 'POSIBLE', C.white, prog(t, 18.04, 18.4), 44, C.white); text('+', W / 2 - 85, 1132, { size: 60, color: GOLD, a: prog(t, 20.4, 20.7) }); chip(W / 2 + 185, 1130, 'TIEMPO INFINITO', C.amber, prog(t, 20.6, 20.95), 44, C.white); pop(t, 21.6, '= ACABARÁ OCURRIENDO', W / 2, 1250, { size: 56, color: C.cyan, stroke: 10 }); }
  return world;
} });
// 3 ── Don Quixote: 380,000+ words; just the first sentence on 30 keys: more combinations than stars
SC.push({ a: 22.9, b: 37.6, f(t) {
  hideAll(); book.visible = true; const sh = eIO(prog(t, 27.4, 28.4)); book.rotation.set(0.08, -0.5 + Math.sin(t * 0.6) * 0.35, 0.05); book.position.set(0, lerp(0.2, 0.4, sh), 0); look(cam, V(0, 0.6, lerp(9.5, 13, sh)), V(0, lerp(-0.5, -2.6, sh), 0), 40);
  if (t < 27.5) { pop(t, 24.0, '+380.000', W / 2, 330, { size: 130, color: GOLD, stroke: 16 }); pop(t, 25.7, 'PALABRAS', W / 2, 445, { size: 70, stroke: 10 }); }
  else { dimBG(0.72 * sh); kicker(t, 28.5, 'SOLO LA PRIMERA FRASE', 250, C.amber);
    if (t < 33.9) { slots(t, prog(t, 29.4, 29.9), 480); chip(W / 2, 980, 'TECLADO DE 30 TECLAS', C.cyan, prog(t, 32.18, 32.5), 44, C.white); }
    else { for (let i = 0; i < 160; i++) { const x = hsh(i) * W, y = 330 + hsh(i + 200) * 1000; dot(x, y, 1.5 + hsh(i + 9) * 3.5, hsh(i + 4) < 0.7 ? '#ffffff' : GOLD, prog(t, 35.4, 36.4) * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))); }
      pop(t, 34.06, 'COMBINACIONES POSIBLES', W / 2, 400, { size: 52, stroke: 10 }); text('300.000.000.000.000.000', W / 2, 560, { size: 62, color: GOLD, a: prog(t, 34.3, 34.7), stroke: 10 }); text('.000.000.000.000.000', W / 2, 640, { size: 62, color: GOLD, a: prog(t, 34.5, 34.9), stroke: 10 }); text('(aprox. 3 × 10³⁵)', W / 2, 715, { size: 30, font: 'InterSB', color: rgba(C.white, 0.75), a: prog(t, 34.8, 35.2) });
      pop(t, 35.62, 'MÁS QUE ESTRELLAS', W / 2, 1120, { size: 76, color: C.cyan, stroke: 12 }); text('EN EL UNIVERSO OBSERVABLE', W / 2, 1210, { size: 40, font: 'MontBlack', color: C.white, a: prog(t, 36.4, 36.8), stroke: 8 }); } }
  return world;
} });
// 4 ── One key per second: hundreds of thousands of billions of times the age of the universe, just for that sentence
SC.push({ a: 37.6, b: 46.9, f(t) {
  monkeyShot(t, { k: 0.3, ty: 1.4, speed: 0.55 }); dimBG(0.35 + 0.35 * prog(t, 40.6, 41.2));
  chip(W / 2, 290, '1 TECLA POR SEGUNDO', C.white, prog(t, 38.88, 39.2), 46, C.white);
  if (t > 40.6) { const a = prog(t, 40.8, 41.2); panel(W / 2, 860, 920, 420, a * 0.92);
    text('EDAD DEL UNIVERSO', 130, 720, { size: 30, font: 'MontXB', color: C.cyan, align: 'left', ls: 2, a }); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.cyan; ctx.shadowColor = C.cyan; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(130, 750, 10, 34, 5); ctx.fill(); ctx.restore(); text('13.800 millones de años', 160, 768, { size: 28, font: 'InterSB', color: C.white, align: 'left', a });
    text('LO QUE TARDARÍA EL MONO (DE MEDIA)', 130, 860, { size: 30, font: 'MontXB', color: GOLD, align: 'left', ls: 2, a: prog(t, 41.6, 42.0) }); const p = eOut(prog(t, 41.74, 44.4)); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = C.amber; ctx.shadowColor = C.amber; ctx.shadowBlur = 18; ctx.beginPath(); ctx.roundRect(130, 890, Math.max(10, 830 * p), 34, 17); ctx.fill(); ctx.restore();
    if (p > 0.95) { ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { const xx = 975 + i * 18 + ((t * 120) % 18); ctx.beginPath(); ctx.moveTo(xx, 890); ctx.lineTo(xx + 14, 907); ctx.lineTo(xx, 924); ctx.stroke(); } ctx.restore(); }
    text('× CIENTOS DE MILES DE BILLONES', W / 2, 990, { size: 44, color: GOLD, a: prog(t, 41.74, 42.2), stroke: 8 }); text('(escala no proporcional: no cabe en pantalla)', W / 2, 1040, { size: 24, font: 'InterSB', color: rgba(C.white, 0.6), a: prog(t, 43.5, 44) }); }
  stamp(t, 45.3, 'SOLO PARA ESA FRASE', W / 2, 1210, REDC, -0.03, 54, 999, C.white);
  return world;
} });
// 5 ── 2024, Australian mathematicians: 5% chance of "bananas" in a lifetime; all chimps until the end of the universe: no book
SC.push({ a: 46.9, b: 63.9, f(t) {
  monkeyShot(t, { k: 0.6, side: -1, ty: 1.4 }); dimBG(0.45 + 0.3 * prog(t, 51.8, 52.3));
  if (t < 51.8) { pop(t, 47.36, '2024', W / 2, 330, { size: 130, color: C.cyan, stroke: 16 }); chip(W / 2, 460, 'DOS MATEMÁTICOS AUSTRALIANOS', C.white, prog(t, 48.62, 49.0), 38, C.white); chip(W / 2, 1180, 'LA CUENTA CON MONOS REALES', C.amber, prog(t, 50.38, 50.7), 40, C.white); }
  else if (t < 58.3) { kicker(t, 52.0, 'UN CHIMPANCÉ, EN TODA SU VIDA', 250, C.white);
    const a = prog(t, 53.9, 54.3); gauge5(W / 2, 640, 220, 0.05 * eOut(prog(t, 54.4, 55.2)), a); text(`${Math.round(5 * eOut(prog(t, 54.4, 55.2)))} %`, W / 2, 610, { size: 120, color: C.cyan, a, stroke: 14 });
    paper(W / 2, 1180, 620, 150, prog(t, 56.9, 57.3), 0.01); typed('BANANAS', 345, 1182, 7, 86, Math.floor(prog(t, 57.4, 58.1) * 7.99), prog(t, 56.9, 57.3)); }
  else { kicker(t, 58.5, 'TODOS LOS CHIMPANCÉS', 250, C.white); text('≈ 200.000', W / 2, 400, { size: 90, color: GOLD, a: prog(t, 59.0, 59.4), stroke: 12 }); chimps(t, 1);
    chip(W / 2, 520, 'HASTA EL FIN DEL UNIVERSO', C.cyan, prog(t, 61.2, 61.5), 40, C.white); if (t > 62.6) { redX(W / 2, 835, 200, prog(t, 62.72, 63.0)); stamp(t, 62.9, 'NI UN LIBRO', W / 2, 1210, REDC, -0.04, 72, 999, C.white); } }
  return world;
} });
// 6 ── 2003: a computer for six macaques in an English zoo; five pages, mostly the letter S; then they smashed the keyboard
SC.push({ a: 63.9, b: 77.1, f(t) {
  const up = eIO(prog(t, 74.6, 75.6)) * (1 - eIO(prog(t, 76.25, 76.5))), sm = Math.max(0, t - 76.5);
  monkeyShot(t, { k: 0.4, ty: 2.1, up, smash: sm, typing: t < 74.6 ? 1 : 0, speed: t < 74.6 ? 1.2 : 0 });
  rock.visible = t > 74.9; const dn = eIO(prog(t, 76.25, 76.5)); rock.position.set(0, lerp(3.9, 1.05, dn) + (sm > 0 ? Math.abs(Math.sin(sm * 9)) * 0.25 * Math.exp(-sm * 4) : 0), lerp(0.9, 1.75, dn)); rock.rotation.set(t * 2, t, 0);
  if (t < 70.1) { pop(t, 64.2, '¿Y SI SE PRUEBA', W / 2, 310, { size: 76, stroke: 12 }); pop(t, 64.9, 'DE VERDAD?', W / 2, 405, { size: 84, color: GOLD, stroke: 12 });
    chip(W / 2, 1090, '2003 · ZOO INGLÉS', C.white, prog(t, 66.0, 66.3), 46, C.white); chip(W / 2, 1195, '6 MACACOS + 1 ORDENADOR', C.amber, prog(t, 67.4, 67.7), 42, C.white); }
  else if (t < 74.5) { dimBG(0.55); pop(t, 71.42, '5 PÁGINAS', W / 2, 320, { size: 100, color: C.cyan, stroke: 14 }); const pa = prog(t, 70.4, 70.8); paper(W / 2, 830, 760, 720, pa, -0.015); typed(SSS, 215, 540, 22, 40, Math.floor(prog(t, 70.6, 74.2) * 264), pa, i => SSS[i] === 'S' ? '#1a2030' : '#8a8f9c');
    chip(W / 2, 1270, 'CASI TODAS CON LA LETRA «S»', C.amber, prog(t, 72.64, 73.0), 40, C.white); }
  else { if (sm > 0) { shake(t, 76.5); stamp(t, 76.55, 'A PEDRADAS', W / 2, 340, REDC, -0.05, 96, 999, C.white); } }
  return world;
} });
// 7 ── The theorem is true — but infinity is far bigger than our universe
SC.push({ a: 77.1, b: 82.6, f(t) {
  monkeyShot(t, { k: 0.5, ty: 1.4, typing: 0, speed: 0 }); dimBG(0.75);
  pop(t, 77.9, 'EL TEOREMA ES CIERTO', W / 2, 330, { size: 70, color: '#3cdc8c', stroke: 12 });
  infinity(W / 2, 760, lerp(120, 380, eOut(prog(t, 79.5, 81.4))), prog(t, 79.5, 79.9), C.amber, t);
  if (t > 80.8) { dot(W / 2, 1120, 14, C.cyan, prog(t, 81.0, 81.3)); text('NUESTRO UNIVERSO', W / 2, 1180, { size: 38, font: 'MontBlack', color: C.cyan, a: prog(t, 81.3, 81.6), stroke: 8 }); }
  if (t > 79.4) text('EL INFINITO', W / 2, 470, { size: 54, color: GOLD, a: prog(t, 79.6, 79.9), stroke: 10 });
  return world;
} });
// 8 ── Question + logo
SC.push({ a: 82.6, b: 999, f(t) {
  monkeyShot(t, { k: 0.8, ty: 2.1 }); dimBG(0.35);
  if (t < 85.1) { kicker(t, 82.7, 'TE PREGUNTO', 250, C.amber); pop(t, 82.8, '¿QUÉ LIBRO', W / 2, 370, { size: 100, stroke: 14 }); pop(t, 83.3, 'ESCRIBIRÍA TU MONO?', W / 2, 470, { size: 66, color: GOLD, stroke: 12 }); ctaPill(t, 83.9, 1180); }
  const a = eOut(prog(t, 85.1, 85.55)), q = eOut(prog(t, 85.4, 85.9));
  if (a > 0) { const g = ctx.createRadialGradient(W / 2, 960, 0, W / 2, 960, 560); g.addColorStop(0, `rgba(5,9,20,${0.85 * a})`); g.addColorStop(1, 'rgba(5,9,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 400, W, 1200); }
  text('LO QUE', W / 2, 900, { size: 72, font: 'MontXB', ls: 16, a });
  text('IGNORAMOS', W / 2, 1005, { size: 124, color: C.cyan, a: q, scale: lerp(0.85, 1, back(q)), glow: C.cyan });
  ctx.save(); ctx.globalAlpha = q; ctx.fillStyle = C.amber; ctx.shadowColor = C.amber; ctx.shadowBlur = 20; ctx.fillRect(W / 2 - 170 * q, 1090, 340 * q, 8); ctx.restore();
  return world;
} });

function renderFrame(t) {
  ctx.clearRect(0, 0, W, H); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const s = SC.find(s => t >= s.a && t < s.b) || SC[SC.length - 1];
  vignette(); lightLeak(t); captionScrim();
  const which = s.f(t); R.render(which, cam);
  captions(t); chrome(t); CUTS.forEach(c => transition(t, c));
  return true;
}
window.renderFrame = renderFrame;
window.init = (words) => { buildCaptions(words); return document.fonts.ready.then(() => Promise.all(['MontBlack', 'MontXB', 'InterSB'].map(f => document.fonts.load(`40px ${f}`)))).then(() => true); };

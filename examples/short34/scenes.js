// Timeline — "El tercer tipo de magnetismo"
const CUTS = [10.2, 20.4, 33.3, 50.4, 65.9, 77.0, 82.5, 93.6];
const GOLD = '#ffc44a', REDC = '#ff4a3a', GRN = '#3cdc8c';
function dimBG(a) { if (a <= 0) return; ctx.save(); ctx.fillStyle = `rgba(5,9,20,${a})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function latShot(t, o = {}) { hideAll(); lat.visible = true; setLat(t, o); setElec(t, o.el ?? 0); lat.rotation.y = 0.12 * Math.sin(t * 0.5); const z = o.zoom ?? 1; look(cam, V(1.6, -0.4, 20 * z), V(0, -1.3 * z, 0), 40); }
function bar(x, y, w, h, v, col, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = rgba(C.white, 0.12); ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * v), h, h / 2); ctx.fill(); ctx.restore(); }
function tick(x, y, s, a, col = GRN) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.4); ctx.stroke(); ctx.restore(); }
function cross(x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = REDC; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.4); ctx.lineTo(x + s * 0.4, y + s * 0.4); ctx.moveTo(x + s * 0.4, y - s * 0.4); ctx.lineTo(x - s * 0.4, y + s * 0.4); ctx.stroke(); ctx.restore(); }
function num(n, x, y, col, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, y, 46, 0, TAU); ctx.fill(); ctx.restore(); text(n, x, y + 3, { size: 58, color: C.night, a }); }

const SC = [];
// 1 ── Hook: ~90 years, two types… there is a third, sitting in lab drawers
SC.push({ a: 0, b: 10.2, f(t) {
  hideAll();
  if (t < 6.3) { mag.visible = true; mag.rotation.set(0.1, Math.sin(t * 0.9) * 0.5, Math.PI + 0.12 * Math.sin(t * 1.3)); mag.position.y = 0.2 * Math.sin(t * 1.6); look(cam, V(0, 0.3, lerp(15, 13.5, eIO(prog(t, 0, 6)))), V(0, -0.1, 0), 40);
    kicker(t, 0.1, 'DURANTE CASI 90 AÑOS', 250, C.white); pop(t, 2.2, 'SOLO 2 TIPOS', W / 2, 360, { size: 104, color: GOLD, stroke: 14 }); text('DE MATERIALES MAGNÉTICOS', W / 2, 450, { size: 40, font: 'MontBlack', color: C.white, a: prog(t, 2.9, 3.3), stroke: 8 });
    stamp(t, 5.45, 'HAY UN TERCERO', W / 2, 1230, C.cyan, -0.04, 84, 999, C.night); }
  else { drw.visible = true; const k = eIO(prog(t, 7.6, 9.2)); setDrawer(t, k); drw.rotation.y = -0.35; look(cam, V(0, 5.2, 11.5), V(0, 0.3, 0.6), 40);
    pop(t, 6.5, 'LLEVABA DÉCADAS', W / 2, 310, { size: 82, stroke: 12 }); pop(t, 7.9, 'EN UN CAJÓN', W / 2, 410, { size: 92, color: GOLD, stroke: 12 }); }
  return world;
} });
// 2 ── Type 1: the fridge magnet. Atoms like tiny compasses, all pointing the same way → ferromagnetism
SC.push({ a: 10.2, b: 20.4, f(t) {
  if (t < 13.3) { hideAll(); mag.visible = true; mag.rotation.set(0.1, 0.4 + Math.sin(t) * 0.3, Math.PI); look(cam, V(0, 0.3, 13.5), V(0, -0.1, 0), 40); num('1', W / 2 - 330, 330, C.cyan, prog(t, 10.4, 10.7)); pop(t, 10.5, 'EL PRIMERO', W / 2 + 50, 330, { size: 84, stroke: 12 }); chip(W / 2, 1200, 'EL IMÁN DE LA NEVERA', C.amber, prog(t, 11.94, 12.3), 48, C.white); }
  else { latShot(t, { a: 0, zoom: lerp(0.8, 1, eOut(prog(t, 13.3, 14.4))) }); num('1', 110, 300, C.cyan, 1); text('POR DENTRO', 190, 303, { size: 52, align: 'left', color: C.white, stroke: 10 });
    chip(W / 2, 1305, 'TODAS HACIA EL MISMO LADO', C.cyan, prog(t, 16.1, 16.4) * (1 - prog(t, 18.2, 18.4)), 44, C.white);
    pop(t, 18.5, 'FERROMAGNETISMO', W / 2, 1305, { size: 80, color: C.cyan, stroke: 12, glow: C.cyan }); }
  return world;
} });
// 3 ── Type 2 (1930s): compasses alternate up/down, cancel out → antiferromagnetism
SC.push({ a: 20.4, b: 33.3, f(t) {
  latShot(t, { a: eIO(prog(t, 23.6, 25.0)) });
  num('2', 110, 300, C.amber, 1); text('EL SEGUNDO', 190, 303, { size: 52, align: 'left', color: C.white, stroke: 10 }); chip(820, 300, 'AÑOS 30', C.white, prog(t, 22.2, 22.5), 44, C.white);
  if (t < 27.4) { chip(W / 2 - 220, 1305, '↑ ARRIBA', C.cyan, prog(t, 25.3, 25.55), 46, C.white); chip(W / 2 + 220, 1305, '↓ ABAJO', C.amber, prog(t, 26.3, 26.55), 46, C.white); }
  else if (t < 31.1) { pop(t, 27.5, 'SE ANULAN', W / 2 - 160, 1305, { size: 70, stroke: 12 }); pop(t, 29.3, '= 0', W / 2 + 260, 1305, { size: 96, color: GOLD, stroke: 12 }); }
  else pop(t, 31.6, 'ANTIFERROMAGNETISMO', W / 2, 1305, { size: 64, color: C.amber, stroke: 12 });
  return world;
} });
// 4 ── Type 3 (2022): altermagnetism. Spins cancel, but surroundings are rotated; electrons feel it like a magnet
SC.push({ a: 33.3, b: 50.4, f(t) {
  latShot(t, { a: 1, env: prog(t, 41.2, 42.2), rot: eIO(prog(t, 43.0, 44.6)), el: prog(t, 47.1, 47.8) * 0.9 });
  num('3', 110, 300, GRN, 1);
  if (t < 39.3) { dimBG(0.6 * (1 - prog(t, 38.9, 39.3))); text('EL TERCERO', 190, 303, { size: 52, align: 'left', color: C.white, stroke: 10 }); pop(t, 33.5, '2022', W / 2, 620, { size: 150, color: GOLD, stroke: 16 }); chip(W / 2, 760, 'LO PROPONEN FÍSICOS TEÓRICOS', C.white, prog(t, 34.9, 35.2), 40, C.white);
    pop(t, 37.6, 'ALTERMAGNETISMO', W / 2, 980, { size: 86, color: GRN, stroke: 14, glow: GRN }); }
  else { text('ALTERMAGNETISMO', 190, 303, { size: 52, align: 'left', color: GRN, stroke: 10 });
    if (t < 41.2) chip(W / 2, 1305, 'TAMBIÉN SE ANULAN', C.white, prog(t, 39.5, 39.8), 46, C.white);
    else if (t < 45.2) chip(W / 2, 1305, 'ENTORNO GIRADO 90°', '#b9a6ff', prog(t, 43.0, 43.3), 46, C.white);
    else if (t < 47.1) { chip(W / 2, 1305, 'POR FUERA: NO ATRAE NADA', C.white, prog(t, 45.4, 45.7), 44, C.white); }
    else { chip(W / 2, 1305, 'POR DENTRO: COMO UN IMÁN', GRN, prog(t, 48.4, 48.7), 44, C.white); } }
  return world;
} });
// 5 ── How do you prove it? Spinning X-rays. SLAC-led team at the European synchrotron (Grenoble), left/right on MnTe
SC.push({ a: 50.4, b: 65.9, f(t) {
  hideAll(); xr.visible = true; const L = t < 60.6 ? 1 : (t < 63.0 ? 1 : 0), Rr = t < 60.6 ? 0 : (t < 63.0 ? 0 : 1); setBeam(t, { l: L * prog(t, 52.3, 53.0), r: Rr });
  look(cam, V(0.3, -0.2, 10.5), V(-0.9, -0.3, 0), 40);
  if (t < 54.0) { pop(t, 50.6, '¿CÓMO SE', W / 2, 300, { size: 80, stroke: 12 }); pop(t, 51.0, 'DEMUESTRA?', W / 2, 395, { size: 92, color: GOLD, stroke: 12 }); chip(W / 2, 1305, 'CON RAYOS X QUE GIRAN', C.cyan, prog(t, 52.5, 52.8), 48, C.white); }
  else if (t < 60.4) { chip(W / 2, 290, 'EQUIPO DIRIGIDO POR SLAC · EE. UU.', C.white, prog(t, 54.6, 54.9), 40, C.white); chip(W / 2, 390, 'SINCROTRÓN EUROPEO · GRENOBLE', C.amber, prog(t, 57.9, 58.2), 40, C.white); }
  else { chip(W / 2, 290, t < 63.0 ? '↺ GIRO A LA IZQUIERDA' : '↻ GIRO A LA DERECHA', t < 63.0 ? C.cyan : C.amber, t < 63.0 ? prog(t, 60.8, 61.1) : prog(t, 63.0, 63.2), 46, C.white); chip(W / 2, 1305, 'CRISTAL DE TELURURO DE MANGANESO', C.white, prog(t, 64.1, 64.4), 38, C.white); }
  return world;
} });
// 6 ── A normal antiferromagnet would respond the same to both. This one didn't. Repeated a year later. Science.
SC.push({ a: 65.9, b: 77.0, f(t) {
  hideAll(); xr.visible = true; const ph = Math.floor(t * 1.2) % 2; const diff = t > 69.4; setBeam(t, { l: 1 - ph, r: ph, gl: 0.5, gr: diff ? 0.12 : 0.5 }); look(cam, V(0.3, -0.6, 10.5), V(-0.9, -1.2, 0), 40);
  const a = prog(t, 66.0, 66.4); panel(W / 2, 1040, 940, 520, a * 0.95);
  text('ANTIFERROMAGNETO NORMAL', 110, 840, { size: 34, font: 'MontXB', color: C.white, align: 'left', ls: 2, a }); text('↺', 130, 905, { size: 44, color: C.cyan, a }); bar(175, 890, 590, 30, 0.6 * eOut(prog(t, 66.4, 67.2)), C.cyan, a); text('↻', 130, 955, { size: 44, color: C.amber, a }); bar(175, 940, 590, 30, 0.6 * eOut(prog(t, 66.6, 67.4)), C.amber, a); text('IGUAL', 890, 925, { size: 36, color: C.white, a: prog(t, 67.9, 68.2) });
  const b = prog(t, 69.2, 69.5); text('TELURURO DE MANGANESO', 110, 1070, { size: 34, font: 'MontXB', color: GRN, align: 'left', ls: 2, a: b }); text('↺', 130, 1135, { size: 44, color: C.cyan, a: b }); bar(175, 1120, 590, 30, 0.85 * eOut(prog(t, 69.5, 70.2)), C.cyan, b); text('↻', 130, 1185, { size: 44, color: C.amber, a: b }); bar(175, 1170, 590, 30, 0.3 * eOut(prog(t, 69.5, 70.2)), C.amber, b); text('DISTINTO', 890, 1155, { size: 32, color: GRN, a: prog(t, 70.0, 70.3) });
  text('(barras ilustrativas)', W / 2, 1270, { size: 24, font: 'InterSB', color: rgba(C.white, 0.6), a });
  if (t < 70.7) { if (t > 69.3) stamp(t, 69.44, 'ESTE NO', W / 2, 330, GRN, -0.04, 110, 70.5, C.night); else chip(W / 2, 300, '¿RESPONDE IGUAL A LOS DOS?', C.white, prog(t, 66.2, 66.5), 44, C.white); }
  else if (t < 74.4) { chip(W / 2, 290, 'REPETIDO UN AÑO DESPUÉS', C.white, prog(t, 70.9, 71.2), 44, C.white); chip(W / 2, 395, 'MISMO RESULTADO', GRN, prog(t, 73.0, 73.3), 48, C.white); tick(W / 2 + 330, 392, 50, prog(t, 73.2, 73.5)); }
  else { pop(t, 74.6, 'PUBLICADO EN', W / 2, 290, { size: 56, stroke: 10 }); pop(t, 75.6, 'SCIENCE · 2026', W / 2, 390, { size: 88, color: GOLD, stroke: 12 }); }
  return world;
} });
// 7 ── There were already hints since 2024; this is one of the most direct proofs so far
SC.push({ a: 77.0, b: 82.5, f(t) {
  latShot(t, { a: 1, env: 1, rot: 1, el: 0.5 }); dimBG(0.72);
  const ys = [560, 820, 1080], it = [['2022', 'SE PROPONE LA TEORÍA', C.white, 77.1], ['2024', 'PRIMEROS INDICIOS', C.amber, 77.9], ['2026', 'UNA DE LAS PRUEBAS MÁS DIRECTAS', GRN, 79.6]];
  ctx.save(); ctx.strokeStyle = rgba(C.white, 0.3); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(170, 560); ctx.lineTo(170, 560 + 520 * eOut(prog(t, 77.1, 80))); ctx.stroke(); ctx.restore();
  it.forEach(([y, s, col, t0], i) => { const a = prog(t, t0, t0 + 0.3); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(170, ys[i], 22, 0, TAU); ctx.fill(); ctx.restore(); text(y, 230, ys[i] - 26, { size: 84, color: col, align: 'left', a, stroke: 10 }); text(s, 232, ys[i] + 48, { size: i === 2 ? 34 : 38, font: 'MontBlack', color: C.white, align: 'left', a, stroke: 8 }); });
  kicker(t, 77.1, 'LA HISTORIA', 300, C.white);
  return world;
} });
// 8 ── What for? Faster, lower-energy memories: the best of the other two. But still lab science.
SC.push({ a: 82.5, b: 93.6, f(t) {
  latShot(t, { a: 1, env: 1, rot: 1, el: 0.9 }); dimBG(0.72);
  if (t < 89.1) { pop(t, 82.7, '¿PARA QUÉ SIRVE?', W / 2, 320, { size: 84, color: GOLD, stroke: 12 });
    chip(W / 2, 520, 'MEMORIAS MÁS RÁPIDAS', C.cyan, prog(t, 83.9, 84.2), 50, C.white); chip(W / 2, 640, 'QUE GASTAN MENOS ENERGÍA', C.amber, prog(t, 85.6, 85.9), 46, C.white);
    const a = prog(t, 86.9, 87.3); panel(W / 2, 1020, 940, 460, a * 0.95); const cx = [520, 720, 920], hd = ['FERRO', 'ANTIFERRO', 'ALTER'], hc = [C.cyan, C.amber, GRN];
    hd.forEach((h, i) => text(h, cx[i], 850, { size: 32, color: hc[i], a })); [['FÁCIL DE LEER', [1, 0, 1]], ['NO SE ALTERA CON', [0, 1, 1]]].forEach(([r, v], j) => { const y = 960 + j * 130; text(r, 100, y, { size: 30, font: 'MontXB', color: C.white, align: 'left', a }); if (j === 1) text('IMANES CERCANOS', 100, y + 36, { size: 30, font: 'MontXB', color: C.white, align: 'left', a });
      v.forEach((ok, i) => { const p = prog(t, 87.4 + i * 0.35 + j * 0.2, 87.7 + i * 0.35 + j * 0.2); ok ? tick(cx[i], y + (j ? 16 : 0), 50, p) : cross(cx[i], y + (j ? 16 : 0), 44, p); }); }); }
  else { stamp(t, 89.24, 'PERO OJO', W / 2, 330, C.amber, -0.04, 100, 999, C.night); pop(t, 90.1, 'TODAVÍA ES CIENCIA', W / 2, 700, { size: 76, stroke: 12 }); pop(t, 90.9, 'DE LABORATORIO', W / 2, 800, { size: 88, color: C.cyan, stroke: 12 }); chip(W / 2, 1100, 'NINGÚN APARATO LO USA', REDC, prog(t, 92.0, 92.3), 50, C.white); }
  return world;
} });
// 9 ── Question + logo
SC.push({ a: 93.6, b: 999, f(t) {
  latShot(t, { a: 1, env: 1, rot: 1, el: 0.8 }); dimBG(0.45);
  if (t < 100.6) { kicker(t, 93.8, 'TE PREGUNTO', 250, C.amber); pop(t, 95.3, '90 AÑOS DELANTE DE NOSOTROS', W / 2, 345, { size: 50, stroke: 10 }); pop(t, 99.0, '¿QUÉ MÁS SE NOS', W / 2, 1130, { size: 84, stroke: 12 }); pop(t, 99.5, 'ESTÁ ESCAPANDO?', W / 2, 1230, { size: 90, color: GOLD, stroke: 12 }); ctaPill(t, 99.9, 450); }
  const a = eOut(prog(t, 100.6, 101.05)), q = eOut(prog(t, 100.9, 101.4));
  if (a > 0) { const g = ctx.createRadialGradient(W / 2, 960, 0, W / 2, 960, 620); g.addColorStop(0, `rgba(5,9,20,${0.9 * a})`); g.addColorStop(1, 'rgba(5,9,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1320); }
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

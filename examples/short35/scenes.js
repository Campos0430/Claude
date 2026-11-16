// Timeline — "Cannabis en una tumba de hace 2.800 años"
const CUTS = [7.0, 12.2, 32.3, 42.8, 54.6, 63.0, 77.2, 85.9, 95.8];
const GOLD = '#ffc44a', REDC = '#ff4a3a', GRN = '#3cdc8c';
function dimBG(a) { if (a <= 0) return; ctx.save(); ctx.fillStyle = `rgba(5,9,20,${a})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function tick(x, y, s, a, col = GRN) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.4); ctx.stroke(); ctx.restore(); }
function cross(x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = REDC; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.4); ctx.lineTo(x + s * 0.4, y + s * 0.4); ctx.moveTo(x + s * 0.4, y - s * 0.4); ctx.lineTo(x - s * 0.4, y + s * 0.4); ctx.stroke(); ctx.restore(); }
function qmark(x, y, s, a, col = GOLD) { text('?', x, y, { size: s, color: col, a, stroke: 10 }); }
// stylised horse silhouette (facing right), origin at body centre
function horse(x, y, s, col, a, ph = 0, rider = false) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.ellipse(0, 0, 58, 24, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(34, -14); ctx.lineTo(70, -66); ctx.lineTo(92, -60); ctx.lineTo(60, 6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(66, -72); ctx.lineTo(112, -50); ctx.lineTo(108, -36); ctx.lineTo(78, -44); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(70, -70); ctx.lineTo(74, -88); ctx.lineTo(82, -68); ctx.fill();
  ctx.lineWidth = 11; [[-44, 1], [-30, -1], [34, -1], [46, 1]].forEach(([lx, sg], i) => { const sw = Math.sin(ph + i * 1.7) * 16 * sg; ctx.beginPath(); ctx.moveTo(lx, 12); ctx.lineTo(lx + sw * 0.4, 42); ctx.lineTo(lx + sw, 72); ctx.stroke(); });
  ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-56, -8); ctx.quadraticCurveTo(-86, -4 + Math.sin(ph) * 6, -84, 34); ctx.stroke();
  if (rider) { ctx.beginPath(); ctx.ellipse(4, -44, 13, 26, 0.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(8, -82, 12, 0, TAU); ctx.fill(); ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(2, -30); ctx.lineTo(10, 14); ctx.stroke(); ctx.beginPath(); ctx.moveTo(8, -56); ctx.lineTo(40, -36); ctx.stroke(); }
  ctx.restore(); }
function kurShot(t, o = {}) { hideAll(); kur.visible = true; kurGlow.material.opacity = o.glow ?? 0; world.fog.density = 0.004; orbitCam(0.4 + t * 0.035, o.el ?? 0.27, o.D ?? 40, V(0, o.ty ?? -1.6, 0), 40); }
function chmShot(t, o = {}) { hideAll(); chm.visible = true; warm.intensity = 1.2; warm.position.set(0, 4, 1); seeds.visible = (o.k ?? 0) > 0; if (seeds.visible) setSeeds(t, { r: 0.55, k: o.k, y: 0.08, zs: 0.5, pile: 0.6, s: 0.8 }); orbitCam(0.25 * Math.sin(t * 0.25), 0.95, o.D ?? 17, V(0, o.ty ?? -1.6, 0), 40); }
function hairShot(t, o = {}) { hideAll(); hair.visible = true; setHair(t, o); hair.rotation.z = 0.08; look(cam, V(0.6 * Math.sin(t * 0.3), 0.4, o.D ?? 12), V(0, o.ty ?? -0.9, 0), 40); }

const SC = [];
// 1 ── Hook: a tomb in Siberia, almost 3,000 years ago, cannabis consumed for its effects
SC.push({ a: 0, b: 7.0, f(t) {
  kurShot(t, { D: lerp(48, 40, eOut(prog(t, 0, 7))), glow: 0.5 * prog(t, 4.6, 5.4) });
  kicker(t, 0.2, 'UNA TUMBA DE SIBERIA', 250, C.white); pop(t, 2.7, 'HACE CASI', W / 2, 340, { size: 60, stroke: 10 }); pop(t, 3.3, '3.000 AÑOS', W / 2, 440, { size: 120, color: GOLD, stroke: 16 });
  chip(W / 2, 1300, 'YA SE CONSUMÍA POR SUS EFECTOS', C.amber, prog(t, 4.9, 5.2), 40, C.white);
  return world;
} });
// 2 ── The decisive clue wasn't in a pipe. It was in the hair of the dead.
SC.push({ a: 7.0, b: 12.2, f(t) {
  hairShot(t, { found: prog(t, 10.6, 11.2), D: lerp(13, 11, eIO(prog(t, 7, 12.2))) });
  pop(t, 7.3, 'LA PISTA DEFINITIVA', W / 2, 320, { size: 76, stroke: 12 });
  if (t < 9.8) { chip(W / 2, 1300, 'NO ESTABA EN UNA PIPA', C.white, prog(t, 8.2, 8.5), 46, C.white); }
  else stamp(t, 10.3, 'EN EL PELO', W / 2, 1290, C.amber, -0.04, 96, 999, C.night);
  return world;
} });
// 3 ── Tunnug 1: giant mound ~140 m, "Siberian Valley of the Kings"; horse nomads, ~800 BC; excavated since 2017
SC.push({ a: 12.2, b: 32.3, f(t) {
  kurShot(t, {});
  if (t < 22.6) { pop(t, 13.2, 'TUNNUG 1', W / 2, 330, { size: 120, color: GOLD, stroke: 16 });
    if (t > 16.2 && t < 20.4) { const a = prog(t, 16.4, 16.8), p1 = proj(V(-7.1, 0.3, 0).applyAxisAngle(V(0, 1, 0), 0.4 + t * 0.035)), p2 = proj(V(7.1, 0.3, 0).applyAxisAngle(V(0, 1, 0), 0.4 + t * 0.035)); const k = eOut(prog(t, 16.4, 17.4)); const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); ctx.shadowColor = C.cyan; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(lerp(mx, p1.x, k), lerp(my, p1.y, k)); ctx.lineTo(lerp(mx, p2.x, k), lerp(my, p2.y, k)); ctx.stroke(); ctx.restore(); chip(mx, my - 70, '≈ 140 METROS', C.cyan, prog(t, 16.8, 17.1), 50, C.white); }
    if (t < 20.4) chip(W / 2, 1300, 'SUR DE SIBERIA', C.white, prog(t, 19.1, 19.4), 46, C.white); else { pop(t, 20.9, 'EL «VALLE DE LOS REYES»', W / 2, 1185, { size: 58, stroke: 10 }); pop(t, 21.8, 'SIBERIANO', W / 2, 1262, { size: 62, color: C.cyan, stroke: 10 }); } }
  else if (t < 29.1) { kicker(t, 22.8, '¿QUIÉN LO LEVANTÓ?', 250, C.white); pop(t, 23.3, 'NÓMADAS A CABALLO', W / 2, 345, { size: 72, color: GOLD, stroke: 12 });
    for (let i = 0; i < 3; i++) { const x = -200 + ((t - 22.9) * 150 + i * 330); horse(x, 1090 + (i % 2) * 70, 1.25 - (i % 2) * 0.2, rgba(C.white, 0.92), prog(t, 22.9, 23.3), t * 9 + i * 2, true); }
    chip(W / 2, 1300, t < 27.0 ? 'ANTEPASADOS CULTURALES DE LOS ESCITAS' : 'HACIA EL AÑO 800 a. C.', t < 27.0 ? C.white : C.amber, t < 27.0 ? prog(t, 24.3, 24.6) : prog(t, 27.1, 27.4), t < 27.0 ? 36 : 48, C.white); }
  else { kicker(t, 29.3, 'ARQUEÓLOGOS', 250, C.white); pop(t, 30.3, 'EXCAVANDO', W / 2, 340, { size: 76, stroke: 12 }); pop(t, 31.0, 'DESDE 2017', W / 2, 440, { size: 96, color: C.cyan, stroke: 14 }); }
  return world;
} });
// 4 ── In the centre: wooden chambers, log coffins, sacrificed horses… and 1,400+ wild cannabis seeds
SC.push({ a: 32.3, b: 42.8, f(t) {
  chmShot(t, { k: prog(t, 38.4, 41.6) });
  if (t < 38.1) { kicker(t, 32.5, 'EN EL CENTRO', 250, C.white); chip(W / 2, 350, 'CÁMARAS DE MADERA', C.amber, prog(t, 33.7, 34.0), 46, C.white); chip(W / 2, 455, 'ATAÚDES DE TRONCOS', C.white, prog(t, 35.0, 35.3), 46, C.white);
    const a = prog(t, 36.6, 37.0); chip(W / 2, 1300, 'CABALLOS SACRIFICADOS', REDC, a, 44, C.white); [-300, 0, 300].forEach((dx, i) => horse(W / 2 + dx - 20, 1160, 0.75, rgba(C.white, 0.85), a * prog(t, 36.7 + i * 0.12, 37.0 + i * 0.12), 0.6)); }
  else { kicker(t, 38.3, 'ENTRE LOS ENTERRAMIENTOS', 250, C.white); const n = Math.round(1400 * eOut(prog(t, 39.3, 40.6))); if (t > 39.3) text('+' + n.toLocaleString('es-ES').replace(/^(\d)(\d{3})$/, '$1.$2'), W / 2, 380, { size: 150, color: GOLD, stroke: 16, a: prog(t, 39.3, 39.6) });
    pop(t, 40.6, 'SEMILLAS', W / 2, 500, { size: 78, stroke: 12 }); chip(W / 2, 1300, 'DE CANNABIS SILVESTRE', C.amber, prog(t, 41.5, 41.8), 44, C.white); }
  return world;
} });
// 5 ── Seeds alone don't prove consumption → analysed human hair → cannabinol (what THC turns into over time)
SC.push({ a: 42.8, b: 54.6, f(t) {
  if (t < 46.2) { hideAll(); seeds.visible = true; chm.visible = true; chm.scale.setScalar(3); chm.position.y = -0.1; warm.intensity = 1.0; setSeeds(t, { r: 1.5, k: 1, y: 0.1, pile: 1.2, s: 1.6 }); orbitCam(t * 0.12, 0.7, 7.5, V(0, -0.3, 0), 40);
    pop(t, 43.0, 'UNAS SEMILLAS', W / 2, 320, { size: 76, stroke: 12 }); stamp(t, 44.3, 'NO DEMUESTRAN EL CONSUMO', W / 2, 1290, REDC, -0.03, 50, 999, C.white); }
  else { const sx = lerp(-5, 5, prog(t, 47.0, 50.0)); hairShot(t, { sx: t < 50.0 && t > 47.0 ? sx : null, found: t > 47.0 ? 1 : 0 });
    if (t < 50.0) { kicker(t, 46.4, 'ASÍ QUE ANALIZARON', 250, C.white); pop(t, 47.3, 'CABELLO HUMANO', W / 2, 345, { size: 80, color: C.cyan, stroke: 12 }); chip(W / 2, 1300, 'CONSERVADO EN LA TUMBA', C.white, prog(t, 48.0, 48.3), 44, C.white); }
    else { kicker(t, 49.6, 'Y APARECIÓ', 250, C.white); pop(t, 50.2, 'CANNABINOL', W / 2, 345, { size: 104, color: GOLD, stroke: 14, glow: C.amber });
      const a = prog(t, 52.2, 52.6); panel(W / 2, 1240, 760, 150, a * 0.95, C.amber); text('THC', 280, 1242, { size: 64, color: C.white, a }); text('CBN', 800, 1242, { size: 64, color: GOLD, a: prog(t, 53.4, 53.7) });
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.amber; ctx.lineWidth = 8; ctx.lineCap = 'round'; const k = eOut(prog(t, 52.6, 53.6)); ctx.beginPath(); ctx.moveTo(380, 1262); ctx.lineTo(380 + 300 * k, 1262); ctx.stroke(); if (k > 0.95) { ctx.beginPath(); ctx.moveTo(660, 1242); ctx.lineTo(684, 1262); ctx.lineTo(660, 1282); ctx.stroke(); } ctx.restore(); text('CON EL TIEMPO', 530, 1222, { size: 26, font: 'MontXB', color: C.white, ls: 2, a: prog(t, 53.6, 53.9) }); } }
  return world;
} });
// 6 ── Until now the oldest proof came from a cemetery in China, ~2,500 years ago. This is three centuries earlier.
SC.push({ a: 54.6, b: 63.0, f(t) {
  kurShot(t, { glow: 0.4 }); dimBG(0.72);
  kicker(t, 54.8, 'LA PRUEBA MÁS ANTIGUA', 280, C.white);
  const X = 190; ctx.save(); ctx.strokeStyle = rgba(C.white, 0.3); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X, 1060); ctx.lineTo(X, 1060 - 480 * eOut(prog(t, 56.5, 61.5))); ctx.stroke(); ctx.restore();
  const row = (y, yr, s1, s2, col, t0) => { const a = prog(t, t0, t0 + 0.3); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(X, y, 22, 0, TAU); ctx.fill(); ctx.restore(); text(yr, X + 60, y - 30, { size: 80, color: col, align: 'left', a, stroke: 10 }); text(s1, X + 62, y + 40, { size: 38, font: 'MontBlack', color: C.white, align: 'left', a, stroke: 8 }); text(s2, X + 62, y + 86, { size: 28, font: 'InterSB', color: rgba(C.white, 0.75), align: 'left', a }); };
  row(1060, '~500 a. C.', 'CEMENTERIO EN CHINA', 'hace unos 2.500 años', C.white, 57.2); row(600, '~800 a. C.', 'TUNNUG 1 · SIBERIA', 'hace unos 2.800 años', GOLD, 60.6);
  stamp(t, 61.7, '3 SIGLOS ANTES', 760, 830, C.cyan, -0.06, 60, 999, C.night);
  return world;
} });
// 7 ── What for? Unknown. Authors rule out recreational use, talk of funerary rituals; calming sacrifice victims = speculation
SC.push({ a: 63.0, b: 77.2, f(t) {
  chmShot(t, { k: 1 }); dimBG(0.74);
  pop(t, 63.2, '¿PARA QUÉ LO USABAN?', W / 2, 310, { size: 72, color: GOLD, stroke: 12 }); chip(W / 2, 420, 'NO SE SABE', C.white, prog(t, 64.4, 64.7), 48, C.white);
  const card = (y, s1, s2, t0, mark, col) => { const a = prog(t, t0, t0 + 0.3); if (a <= 0) return; panel(W / 2, y, 900, 170, a * 0.95, col); text(s1, 130, y - 22, { size: 44, color: C.white, align: 'left', a }); text(s2, 132, y + 36, { size: 28, font: 'InterSB', color: rgba(C.white, 0.75), align: 'left', a }); if (mark === 'x') cross(900, y, 60, prog(t, t0 + 0.4, t0 + 0.7)); else if (mark === 'q') qmark(900, y + 4, 90, prog(t, t0 + 0.4, t0 + 0.7)); else tick(900, y, 64, prog(t, t0 + 0.4, t0 + 0.7), C.cyan); };
  card(640, 'USO RECREATIVO', 'los autores lo descartan', 66.0, 'x', REDC); card(850, 'RITUALES FUNERARIOS', 'es su interpretación', 68.2, 'v', C.cyan); card(1060, '¿CALMAR A LAS VÍCTIMAS', 'de sacrificios humanos?', 70.8, 'q', C.amber);
  stamp(t, 76.3, 'ESPECULACIÓN', W / 2, 1250, C.amber, -0.05, 84, 999, C.night);
  return world;
} });
// 8 ── Criticism: an outside expert thinks the hair analysis is the weakest point. Smoked or eaten? Unknown.
SC.push({ a: 77.2, b: 85.9, f(t) {
  hairShot(t, { found: 0.6 }); dimBG(0.45);
  pop(t, 77.4, 'Y HAY CRÍTICAS', W / 2, 320, { size: 84, color: REDC, stroke: 12 });
  if (t < 82.9) { chip(W / 2, 440, 'UN EXPERTO AJENO AL ESTUDIO', C.white, prog(t, 78.6, 78.9), 40, C.white); pop(t, 80.6, 'EL ANÁLISIS DEL PELO', W / 2, 1210, { size: 60, stroke: 10 }); pop(t, 81.8, 'SU PUNTO MÁS DÉBIL', W / 2, 1295, { size: 66, color: GOLD, stroke: 12 }); }
  else { chip(W / 2 - 230, 1280, '¿FUMADO?', C.cyan, prog(t, 84.3, 84.55), 54, C.white); chip(W / 2 + 230, 1280, '¿COMIDO?', C.amber, prog(t, 85.1, 85.35), 54, C.white); chip(W / 2, 440, 'TAMPOCO SE SABE', C.white, prog(t, 83.0, 83.3), 44, C.white); }
  return world;
} });
// 9 ── Three centuries later, Herodotus wrote that Scythians inhaled hemp smoke. He was long doubted.
SC.push({ a: 85.9, b: 95.8, f(t) {
  hideAll(); brz.visible = true; warm.intensity = 2.2; warm.position.set(0, 0.6, 0.5); setBrazier(t, prog(t, 85.9, 87)); orbitCam(t * 0.1, 0.32, 13, V(0, -0.1, 0), 40);
  if (t < 88.4) { pop(t, 86.2, 'LO CURIOSO', W / 2, 300, { size: 64, stroke: 10 }); pop(t, 87.1, '3 SIGLOS DESPUÉS…', W / 2, 395, { size: 76, color: C.cyan, stroke: 12 }); }
  else { pop(t, 89.6, 'HERÓDOTO', W / 2, 320, { size: 124, color: GOLD, stroke: 16 }); chip(W / 2, 445, 'HISTORIADOR GRIEGO · SIGLO V a. C.', C.white, prog(t, 88.7, 89.0), 36, C.white);
    if (t < 93.5) { chip(W / 2, 1230, 'ESCRIBIÓ QUE LOS ESCITAS', C.white, prog(t, 90.9, 91.2), 40, C.white); chip(W / 2, 1320, 'INHALABAN HUMO DE CÁÑAMO', C.amber, prog(t, 91.6, 91.9), 42, C.white); } else stamp(t, 94.5, 'SE DUDÓ DE ÉL', W / 2, 1280, REDC, -0.04, 80, 999, C.white); }
  return world;
} });
// 10 ── Question + logo
SC.push({ a: 95.8, b: 999, f(t) {
  kurShot(t, { glow: 0.5, D: 44 }); dimBG(0.4);
  if (t < 102.0) { kicker(t, 96.0, 'TE PREGUNTO', 250, C.amber); pop(t, 97.2, '¿CUÁNTAS HISTORIAS', W / 2, 345, { size: 78, stroke: 12 }); pop(t, 97.9, 'ANTIGUAS', W / 2, 440, { size: 90, color: GOLD, stroke: 12 }); pop(t, 100.4, 'ACABARÁN SIENDO', W / 2, 1220, { size: 70, stroke: 12 }); pop(t, 101.0, 'CIERTAS?', W / 2, 1310, { size: 96, color: C.cyan, stroke: 14 }); ctaPill(t, 101.2, 560); }
  const a = eOut(prog(t, 102.0, 102.45)), q = eOut(prog(t, 102.3, 102.8));
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

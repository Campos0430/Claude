// ---------- Book ----------
const coverIcon = (x, px, py, w, h) => { const it = C.virus(.04); x.drawImage(it.c, px, py + h * .2, w, w); };
const book = makeBook(coverCanvases(coverIcon)); scene.add(book.root);

// ---------- Page art ----------
const PW = 2048, PH = Math.round(2048 * BD / BW);
function page(fn) { const c = cv(PW, PH), x = c.getContext('2d'); fn(x); x.save(); x.globalAlpha = .7; x.fillStyle = x.createPattern(GRAIN, 'repeat'); x.fillRect(0, 0, PW, PH); x.restore(); return texOf(c); }
const grad = (x, st) => { const g = x.createLinearGradient(0, 0, 0, PH); st.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, PW, PH); };
function dots(x, seed, n, cols, r0 = 5, r1 = 11) { const R = mulberry(seed); for (let i = 0; i < n; i++) { x.beginPath(); x.arc(R() * PW, R() * PH, r0 + R() * (r1 - r0), 0, TAU); x.fillStyle = cols[(R() * cols.length) | 0]; x.fill(); } }
function stripes(x, n = 9, a = .06) { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * .5})`; x.fillRect(0, PH * i / n, PW, PH / n); } }
function leaves(x, seed, cols, n = 40) { const R = mulberry(seed); for (let i = 0; i < n; i++) { const px = R() * PW, py = PH * (.45 + R() * .6), s = 70 + R() * 110, a = R() * TAU; x.save(); x.translate(px, py); x.rotate(a); x.beginPath(); x.ellipse(0, 0, s, s * .38, 0, 0, TAU); x.fillStyle = cols[(R() * cols.length) | 0]; x.fill(); x.strokeStyle = 'rgba(30,60,30,.35)'; x.lineWidth = 5; x.beginPath(); x.moveTo(-s, 0); x.lineTo(s, 0); x.stroke(); x.restore(); } }
function helixBg(x, seed, col) { const R = mulberry(seed); x.strokeStyle = col; x.lineWidth = 10; x.lineCap = 'round'; for (let k = 0; k < 6; k++) { const ox = R() * PW, oy = R() * PH, s = .6 + R() * .6; x.save(); x.translate(ox, oy); x.rotate(R() * 3); x.scale(s, s); for (const ph of [0, Math.PI]) { x.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; i ? x.lineTo(u * 500 - 250, Math.sin(u * TAU * 1.5 + ph) * 50) : x.moveTo(-250, Math.sin(ph) * 50); } x.stroke(); } for (let i = 0; i < 12; i++) { const u = i / 12, px = u * 500 - 250; x.beginPath(); x.moveTo(px, Math.sin(u * TAU * 1.5) * 50); x.lineTo(px, Math.sin(u * TAU * 1.5 + Math.PI) * 50); x.stroke(); } x.restore(); } }
const TEX = {
  sky0: page(x => { grad(x, [[0, '#2f8f6a'], [.6, '#7fcf9a'], [1, '#d8f2c8']]); leaves(x, 3, ['rgba(40,120,70,.55)', 'rgba(90,170,90,.5)', 'rgba(30,100,60,.5)'], 46); dots(x, 4, 60, ['rgba(255,240,180,.7)'], 4, 9); }),
  gr0: page(x => { grad(x, [[0, '#6fb85a'], [1, '#93cf6e']]); stripes(x, 10); dots(x, 5, 150, ['#ffffff', '#ffe066', '#ff9ec1']); }),
  sky1: page(x => { grad(x, [[0, '#3c2a6e'], [.7, '#6b4fb0'], [1, '#a98ee8']]); helixBg(x, 7, 'rgba(255,255,255,.12)'); dots(x, 8, 120, ['rgba(255,200,240,.6)', 'rgba(200,240,255,.5)'], 3, 8); }),
  gr1: page(x => { grad(x, [[0, '#b9a2ec'], [1, '#d6c8f6']]); stripes(x, 12, .05); dots(x, 9, 90, ['rgba(255,122,168,.6)', 'rgba(255,255,255,.7)'], 6, 12); }),
  sky2: page(x => { grad(x, [[0, '#f2a65a'], [.6, '#ffd08a'], [1, '#fff0c8']]); dots(x, 12, 90, ['rgba(255,255,255,.6)'], 6, 14); }),
  gr2: page(x => { grad(x, [[0, '#e9c27a'], [1, '#f3d9a0']]); stripes(x, 10, .05); dots(x, 13, 120, ['#fff3c0', '#ffffff', '#ffb3c1']); }),
  sky3: page(x => { grad(x, [[0, '#1f5566'], [.7, '#3a8fa8'], [1, '#9fd8e6']]); helixBg(x, 17, 'rgba(255,255,255,.14)'); }),
  gr3: page(x => { grad(x, [[0, '#8fd0de'], [1, '#bfe6ee']]); stripes(x, 12, .05); dots(x, 19, 90, ['rgba(255,207,63,.6)', 'rgba(255,255,255,.7)'], 6, 12); }),
  sky4: page(x => { grad(x, [[0, '#f7b6c8'], [1, '#fde0e7']]); dots(x, 21, 70, ['rgba(255,150,175,.45)', 'rgba(255,207,63,.45)'], 20, 60); }),
  gr4: page(x => { grad(x, [[0, '#f9c3cf'], [1, '#fbd6de']]); stripes(x, 10, .05); dots(x, 23, 90, ['rgba(255,255,255,.7)', 'rgba(255,207,63,.5)'], 6, 12); }),
};
TEX.sky5 = TEX.sky0; TEX.gr5 = TEX.gr0;
const SPREAD = [0, 1, 2, 3, 4, 5].map(i => ({ sky: TEX['sky' + i], ground: TEX['gr' + i] }));
const TURNS = [[7.2, 8.3], [15.25, 16.3], [20.65, 21.7], [36.45, 37.5], [45.05, 46.1]];
const RISE = [-5, 8.0, 16.0, 21.4, 37.2, 45.8], FOLD = [7.25, 15.3, 20.7, 36.5, 45.1, 999];

// ---------- Pop-up pieces ----------
const L = [];
function popper(spread, parent, item, x, y, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); const m = cutMesh(item, o); if (o.ry) m.rotation.y = o.ry; g.add(m); parent.add(g);
  const r = { g, m, spread, t0: o.t0, tf: o.tf, d: o.d ?? (.3 - z) * 1.1, dir: o.dir ?? (z > .15 ? -1 : 1), sway: o.sway || 0, ph: x * 40 }; L.push(r); return r;
}
function riseOf(r, t) { const t0 = r.t0 ?? (RISE[r.spread] + r.d), tf = r.tf ?? (FOLD[r.spread] + (.3 - r.g.position.z) * .5); return Math.min(back(seg(t, t0, t0 + .5), 1.7), 1 - ss(seg(t, tf, tf + .4))); }
const S = book.stage, K = book.sky;
// spread 0 and 5: jungle edge, chimp (left) and human (right)
function tableau(sp, t0) {
  const o = t0 == null ? {} : { t0 };
  popper(sp, S, A.hill(.26, .07, '#8fd07a', '#6fb85c', 11 + sp, { bumps: 2 }), -.1, 0, .012, o);
  popper(sp, S, A.hill(.26, .08, '#86c96f', '#62a852', 12 + sp, { bumps: 3 }), .1, 0, .016, o);
  popper(sp, S, A.lolliTree(.085, '#3f9e4a', '#2e7a37', 21 + sp), -.11, 0, .05, { sway: .03, ...o });
  popper(sp, S, A.lolliTree(.07, '#4fae55', '#3a8a3a', 22 + sp), .11, 0, .055, { sway: .03, ...o });
  const ch = popper(sp, S, C.chimp(.085), -.048, 0, .14, { dir: -1, ...(t0 == null ? {} : { t0: t0 + .15 }) });
  const hu = popper(sp, S, C.human(.085), .048, 0, .14, { dir: -1, ...(t0 == null ? {} : { t0: t0 + .25 }) });
  const R0 = mulberry(90 + sp);
  for (let i = 0; i < 7; i++) popper(sp, S, A.flower(.015 + R0() * .007, ['#ff7aa8', '#ffd23f', '#ffffff', '#b58cff'][i % 4], i + sp * 10), -.12 + i * .04 + (R0() - .5) * .01, 0, .25 + R0() * .03, { sway: .08, ...(t0 == null ? {} : { t0: t0 + .35 }) });
  return { ch, hu };
}
const T0 = tableau(0, null), T5 = tableau(5, 50.35);
// hanging pieces on the backdrop (strings)
function hanger(item, x, y, z, len = .3) { const g = new THREE.Group(); const m = cutMesh(item); g.add(m); const th = thread(len); th.position.set(0, item.h * (1 - item.ay), -.0004); g.add(th); g.position.set(x, y, z); K.add(g); return g; }
const BULB_ON = C.geneBulb(.04, true), BULB_OFF = C.geneBulb(.04, false);
function bulbPair(x, y) { const on = hanger(BULB_ON, x, y, .05), off = hanger(BULB_OFF, x, y, .05); return { on, off }; }
const bChimp = bulbPair(-.05, .175), bHuman = bulbPair(.05, .175);
const vHang = hanger(C.virus(.018), -.03, .3, .062, .4);
// spread 1: the retrovirus + a helix
const bigVirus = popper(1, S, C.virus(.022, 5), -.04, .03, .15, { t0: 8.35, dir: -1 });
// helix (rungs on a spindle); a block of rungs can carry the virus colour
const helix = new THREE.Group(); S.add(helix);
const NR = 24, HY0 = .03, HDY = .0074, HR = .024, INS = [10, 11, 12, 13, 14];
const RC = [['#ff6a5a', '#6ad0ff'], ['#7be08a', '#ffcf3f'], ['#3fa1de', '#ff9ec1']];
const rungs = [];
for (let i = 0; i < NR; i++) { const c = RC[i % 3]; const n = cutMesh(B.rung(HR * 2, c[0], c[1]), { backCol: '#f3d9b0' }), v = cutMesh(B.rung(HR * 2, '#9b6ee0', '#6a3fa8'), { backCol: '#c9b0f0' }); for (const q of [n, v]) { const d = q.userData; d.front.material = d.front.material.clone(); d.front.material.side = THREE.DoubleSide; d.back.visible = false; }
  const g = new THREE.Group(); g.add(n, v); v.visible = false; g.position.y = HY0 + i * HDY; g.rotation.y = i * .42; helix.add(g); rungs.push({ g, n, v }); }
const bbMat = new THREE.MeshStandardMaterial({ color: '#f4efe2', roughness: .9 }), bbMat2 = new THREE.MeshStandardMaterial({ color: '#e7d7b8', roughness: .9 });
for (const [ph, m] of [[0, bbMat], [Math.PI, bbMat2]]) { const pts = []; for (let i = -1; i <= NR; i++) { const a = i * .42 + ph; pts.push(new THREE.Vector3(Math.cos(a) * HR * 1.02, HY0 + i * HDY, -Math.sin(a) * HR * 1.02)); }
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, .0022, 8), m); tube.castShadow = tube.receiveShadow = true; helix.add(tube); }
const helixShadow = blobShadow(.04, .35); S.add(helixShadow);
// spread 2: counts
const T2c = popper(2, S, C.chimp(.08), -.048, 0, .13, { dir: -1 });
const T2h = popper(2, S, C.human(.08), .048, 0, .13, { dir: -1 });
const miniV = []; { const R = mulberry(5); for (let i = 0; i < 22; i++) { const g = hanger(C.virus(.0065, 10 + i), -.05 + (R() - .5) * .085, .13 + R() * .07, .03 + R() * .03, .3); g.userData.y0 = g.position.y; g.userData.t0 = 16.85 + i * .045; miniV.push(g); } }
// spread 3: one gene on the helix, its bulb on a stick, scissors
const g3Bulb = { on: hanger(BULB_ON, .05, .17, .07), off: hanger(BULB_OFF, .05, .17, .07) };
popper(3, S, C.chimp(.05), .05, 0, .17, { t0: 28.75, dir: -1 });
const sciss = new THREE.Group(); { const m = cutMesh(C.scissors(.07)); sciss.add(m); S.add(sciss); }
const dropV = new THREE.Group(); { const m = cutMesh(C.virus(.012, 9)); dropV.add(m); S.add(dropV); }
// spread 4: organoids, neurons, puzzle piece
const ORG = []; [[-.05, .1], [.0, .085], [.05, .105], [-.03, .16], [.035, .165]].forEach(([x, z], i) => ORG.push(popper(4, S, C.organoid(.022 + (i % 2) * .004, 40 + i), x, 0, z, { dir: -1 })));
const NEU = []; { const R = mulberry(77); for (let i = 0; i < 7; i++) NEU.push(popper(4, S, C.neuron(.01, 60 + i, i % 2 ? '#ffcf3f' : '#ff9e5a'), -.05 + i * .0167, .03 + R() * .05, .2 + (i % 2) * .02, { t0: 40.85 + i * .09, tf: 45.1 })); }
const piece = popper(4, S, C.puzzle(.05), 0, .02, .235, { t0: 44.5, tf: 45.15 });
// spread 5: 8 % pie first, then the opening tableau again
const pieRest = popper(5, S, C.pie(.04, 'rest'), 0, .05, .15, { t0: 45.85, tf: 50.0, dir: -1 });
const pieWedge = popper(5, S, C.pie(.04, 'wedge'), 0, .05, .155, { t0: 46.5, tf: 50.0, dir: -1 });

// ---------- Lights ----------
const sun = new THREE.DirectionalLight('#fff3e0', 2.2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0001; sun.shadow.normalBias = .0004; sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, { left: -.3, right: .3, top: .3, bottom: -.3, near: .1, far: 3 }); sun.position.set(-.3, .6, .75); sun.target.position.set(0, .05, .12); scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#cfe6ff', '#caa27a', .45); scene.add(hemi);
const lampL = new THREE.PointLight('#ffcf94', .6, 1.2, 2); lampL.position.set(-.28, .36, .44); scene.add(lampL);
const bulbGlow = new THREE.PointLight('#ffd27a', 0, .25, 2); scene.add(bulbGlow);

// ---------- Camera: keys [px,py,pz, tx,ty,tz, fov, aper]; a new list = a hard cut ----------
const OPEN = [0, .16, .6, 0, .1, .13, 34, 2];
const SH = [
  [-1, 7.2, [[0, OPEN], [4.0, [-.02, .155, .57, -.02, .1, .135, 34, 2.1]], [7.2, [.02, .155, .56, .02, .1, .14, 34, 2.1]]]],
  [7.2, 8.4, [[7.2, [0, .3, .62, 0, .06, .14, 34, 1.4]], [8.4, [0, .17, .58, 0, .09, .13, 34, 1.8]]]],
  [8.4, 15.25, [[8.4, [-.01, .15, .64, 0, .1, .15, 34, 1.9]], [11.5, [.01, .15, .62, .0, .1, .15, 34, 2]], [15.25, [.02, .15, .58, .01, .1, .15, 34, 2.1]]]],
  [15.25, 16.4, [[15.25, [0, .3, .62, 0, .06, .14, 34, 1.4]], [16.4, [0, .17, .6, 0, .09, .13, 34, 1.8]]]],
  [16.4, 20.65, [[16.4, [0, .16, .6, 0, .085, .14, 34, 1.9]], [20.65, [0, .14, .54, 0, .08, .15, 34, 2]]]],
  [20.65, 21.8, [[20.65, [0, .3, .62, 0, .06, .14, 34, 1.4]], [21.8, [0, .16, .58, 0, .11, .13, 34, 1.8]]]],
  [21.8, 36.45, [[21.8, [-.01, .15, .62, .01, .11, .13, 34, 1.8]], [26, [.01, .15, .6, .01, .11, .13, 34, 2]], [31.5, [-.01, .14, .57, .01, .105, .13, 34, 2.1]], [36.45, [.01, .14, .56, .01, .105, .13, 34, 2.1]]]],
  [36.45, 37.6, [[36.45, [0, .3, .62, 0, .06, .14, 34, 1.4]], [37.6, [0, .2, .6, 0, .05, .15, 34, 1.8]]]],
  [37.6, 45.05, [[37.6, [0, .2, .6, 0, .05, .15, 34, 1.8]], [41, [.01, .17, .56, 0, .045, .16, 34, 2]], [45.05, [0, .15, .52, 0, .05, .18, 34, 2.2]]]],
  [45.05, 46.2, [[45.05, [0, .32, .6, 0, .05, .14, 34, 1.4]], [46.2, [0, .26, .52, 0, .1, .15, 34, 1.6]]]],
  [46.2, 50.2, [[46.2, [0, .26, .52, 0, .1, .15, 34, 1.6]], [50.2, [0, .25, .48, 0, .1, .155, 34, 1.6]]]],
  [50.2, 99, [[50.2, [0, .26, .62, 0, .07, .14, 34, 1.6]], [52.5, [0, .19, .6, 0, .1, .13, 34, 1.9]], [55.8, OPEN]]],
].map(([a, b, keys]) => ({ a, b, f: track(keys) }));
const tgtV = new THREE.Vector3();
function camAt(t) { const s = SH.find(s => t >= s.a && t < s.b) || SH[SH.length - 1]; const v = s.f(t); cam.position.set(v[0], v[1], v[2]); tgtV.set(v[3], v[4], v[5]); cam.fov = v[6];
  cam.up.set(0, 1, 0); cam.lookAt(tgtV); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return { focus: cam.position.distanceTo(tgtV), aper: v[7] }; }
function toScreen(obj, off = [0, 0, 0]) { const v = new THREE.Vector3(...off); obj.localToWorld(v); v.project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }

// ---------- HUD (2D) ----------
const CR = '#fffaf0';
function outlined(x, s, px, py, font, fill = CR, lw = 10) { x.font = font; x.lineJoin = 'round'; x.lineWidth = lw; x.strokeStyle = 'rgba(40,26,18,.85)'; x.strokeText(s, px, py); x.fillStyle = fill; x.fillText(s, px, py); }
function drawSubs(x, t) {
  for (let i = 0; i < SUBS.length; i++) { const c = SUBS[i], nx = SUBS[i + 1]; const t1 = Math.max(c.t1 + .3, c.t0 + 1.0); if (t < c.t0 - .12 || t > t1) continue; if (nx && t >= nx.t0 - .12) continue;
    const a = i === 0 ? 1 : seg(t, c.t0 - .12, c.t0 + .08) * (1 - seg(t, t1 - .15, t1)); x.save(); x.globalAlpha = a; x.wordSpacing = '6px'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 16;
    let fs = 54; x.font = `600 ${fs}px Fredoka`; while (x.measureText(c.text).width > 980 && fs > 34) { fs -= 2; x.font = `600 ${fs}px Fredoka`; }
    outlined(x, c.text, W / 2, 1700, `600 ${fs}px Fredoka`, CR, 10); x.restore(); }
}
// hanging cardboard signs: [t0, t1, ribbon, title, sub]  (t0 < 0 = already hanging on frame 1)
const SIGNS = [[-1, 4.75, 'UN VIRUS LE APAGÓ', 'UN GEN DEL CEREBRO', 'al chimpancé'], [5.0, 7.0, 'EN NOSOTROS', 'SIGUE ENCENDIDO', ''],
  [8.5, 10.3, 'SE LLAMA', 'PTERV1', ''], [10.5, 13.6, 'ES UN', 'RETROVIRUS', 'mete su ADN en el de su huésped'],
  [15.9, 18.9, 'EL CHIMPANCÉ TIENE', '150 COPIAS', 'de este virus en su ADN'], [21.3, 23.5, 'UN EQUIPO DE LA', 'UNIVERSIDAD DE LUND', 'Suecia'],
  [25.4, 28.4, 'EN EL CEREBRO HUMANO', 'SE ACTIVA', 'antes de nacer'], [32.0, 34.4, 'LO RECORTAN CON', 'CRISPR', 'en células de chimpancé'],
  [37.6, 39.6, 'EN MINICEREBROS', 'HUMANOS', 'organoides de laboratorio'], [39.8, 42.7, 'SI SE APAGA, CAMBIAN', 'GENES CLAVE', 'para que las neuronas crezcan y se conecten'],
  [43.0, 44.95, 'OJO', 'NO LO EXPLICA TODO', ''], [54.6, 99, 'UN VIRUS LE APAGÓ', 'UN GEN DEL CEREBRO', 'al chimpancé']];
function drawSigns(x, t) {
  for (const [t0, t1, a, b, sub] of SIGNS) { if (t < t0 || t > t1 + .6) continue;
    const kin = t0 < 0 ? 1 : seg(t, t0, t0 + .7), kout = seg(t, t1, t1 + .5), drop = (1 - back(kin, 1.4)) * -360 - ss(kout) * 560, sw = Math.sin((t - t0) * 3.2) * .03 * (t0 < 0 ? .7 : (1 - kin * .6)) * (1 - kout);
    x.save(); x.translate(W / 2, 300 + drop); x.rotate(sw);
    let fs = 96; x.font = `${fs}px "Lilita One"`; while (x.measureText(b).width > 860 && fs > 50) { fs -= 4; x.font = `${fs}px "Lilita One"`; }
    const w = Math.max(560, Math.min(980, x.measureText(b).width + 120)), hh = sub ? 250 : 200;
    x.strokeStyle = '#6b5a4a'; x.lineWidth = 3; x.beginPath(); x.moveTo(-w * .38, -40); x.lineTo(-w * .38, -600); x.moveTo(w * .38, -40); x.lineTo(w * .38, -600); x.stroke();
    x.fillStyle = 'rgba(40,25,15,.25)'; x.beginPath(); x.roundRect(-w / 2 + 10, -26, w, hh, 22); x.fill();
    x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect(-w / 2 - 10, -52, w + 20, hh + 24, 28); x.fill();
    x.fillStyle = '#f4e6c8'; x.beginPath(); x.roundRect(-w / 2, -40, w, hh, 22); x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
    x.font = '40px "Lilita One"'; const rw = Math.max(300, x.measureText(a).width + 90);
    x.fillStyle = '#7a4fc4'; x.beginPath(); x.moveTo(-rw / 2, -72); x.lineTo(rw / 2, -72); x.lineTo(rw / 2 - 20, -34); x.lineTo(rw / 2, 4); x.lineTo(-rw / 2, 4); x.lineTo(-rw / 2 + 20, -34); x.closePath(); x.fill(); x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff4d6'; x.fillText(a, 0, -32);
    x.font = `${fs}px "Lilita One"`; x.lineWidth = 12; x.strokeStyle = INK; x.lineJoin = 'round'; x.strokeText(b, 0, 62); x.fillStyle = '#ffcf3f'; x.fillText(b, 0, 62);
    if (sub) { let s2 = 36; x.font = `600 ${s2}px Fredoka`; while (x.measureText(sub).width > w - 50 && s2 > 24) { s2 -= 2; x.font = `600 ${s2}px Fredoka`; } x.fillStyle = '#6b4a36'; x.fillText(sub, 0, 150); }
    x.restore(); }
}
// action words: [t0, text, [sx, sy], colours]
const ACT = [[2.9, '¡APAGADO!', [330, 1180], ['#c9c9cc', '#6b6b70']], [6.4, '¡ENCENDIDO!', [700, 1180], ['#ffe066', '#ff9f1c']], [14.55, '¡SE HEREDA!', [540, 1250], ['#d6b8ff', '#7a4fc4']],
  [20.05, '¡NINGUNA!', [700, 1080], ['#9bf0a5', '#2f9e44']], [24.45, '¡DENTRO!', [430, 1250], ['#d6b8ff', '#7a4fc4']], [30.95, '¡EN SILENCIO!', [540, 1250], ['#c9c9cc', '#6b6b70']], [35.85, '¡SE ENCIENDE!', [540, 1250], ['#ffe066', '#ff9f1c']],
  [44.55, '¡UNA PIEZA!', [540, 1250], ['#8fd0ff', '#2a78b3']]];
function drawAct(x, t) {
  for (const [t0, text, p, col] of ACT) { if (t < t0 || t > t0 + 1.6) continue;
    const k = back(seg(t, t0, t0 + .18), 2.5), fo = 1 - seg(t, t0 + 1.25, t0 + 1.6);
    x.save(); x.translate(p[0], p[1] - seg(t, t0, t0 + 1.6) * 40); x.rotate(-.08); x.scale(k, k); x.globalAlpha = fo;
    const R = mulberry(Math.round(t0 * 10)); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + R() * .3, r0 = 150, r1 = 230 + R() * 70 * eo(seg(t, t0, t0 + .4)); x.strokeStyle = i % 2 ? '#ffe35a' : '#ffffff'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * .5); x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * .5); x.stroke(); }
    let fs = 110; x.font = `italic ${fs}px "Lilita One"`; while (x.measureText(text).width > 620) { fs -= 4; x.font = `italic ${fs}px "Lilita One"`; }
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 30; x.strokeStyle = '#fffaf0'; x.strokeText(text, 0, 0); x.lineWidth = 12; x.strokeStyle = INK; x.strokeText(text, 0, 0);
    const g = x.createLinearGradient(0, -50, 0, 50); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); x.fillStyle = g; x.fillText(text, 0, 0); x.restore(); }
}
function card(x, cx, cy, k, fo, big, small, col) {
  x.save(); x.globalAlpha = fo; x.translate(cx, cy); x.scale(k, k); x.rotate(-.03);
  x.fillStyle = 'rgba(40,25,15,.25)'; x.beginPath(); x.roundRect(-190, -110, 400, 250, 30); x.fill(); x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect(-210, -140, 420, 260, 34); x.fill();
  x.fillStyle = '#f4e6c8'; x.beginPath(); x.roundRect(-195, -125, 390, 230, 26); x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '150px "Lilita One"'; x.lineWidth = 14; x.strokeStyle = INK; x.lineJoin = 'round'; x.strokeText(big, 0, -30); x.fillStyle = col; x.fillText(big, 0, -30);
  x.font = '600 36px Fredoka'; x.fillStyle = '#6b4a36'; x.fillText(small, 0, 72); x.restore();
}
function drawCounters(x, t) {
  if (t > 16.7 && t < 20.9) { const k = back(seg(t, 16.75, 17.05), 2), fo = 1 - seg(t, 20.5, 20.9), v = Math.round(150 * eo(seg(t, 16.84, 17.9)));
    card(x, 290, 1330, k, fo, String(v), 'copias', '#9b6ee0'); }
  if (t > 19.3 && t < 20.9) { const k = back(seg(t, 19.35, 19.65), 2), fo = 1 - seg(t, 20.5, 20.9); card(x, 790, 1330, k, fo, '0', 'copias', '#3cb85a'); }
}
// question card (shown while the question is spoken)
function drawQuestion(x, t) {
  if (t < 45.4 || t > 50.6) return; const k = back(seg(t, 45.45, 45.8), 1.8), fo = 1 - seg(t, 50.2, 50.6);
  x.save(); x.globalAlpha = fo; x.translate(W / 2, 400); x.scale(k, k); x.rotate(.02);
  const w = 940, h = 330; x.fillStyle = 'rgba(40,25,15,.25)'; x.beginPath(); x.roundRect(-w / 2 + 14, -h / 2 + 18, w, h, 40); x.fill();
  x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 46); x.fill(); x.fillStyle = '#7a4fc4'; x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 36); x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.font = '600 50px Fredoka'; x.fillStyle = '#fff4d6'; x.fillText('¿Sabías que cerca del', 0, -100);
  x.font = '150px "Lilita One"'; x.lineWidth = 16; x.strokeStyle = INK; x.strokeText('8 %', 0, 5); x.fillStyle = '#ffcf3f'; x.fillText('8 %', 0, 5);
  x.font = '600 50px Fredoka'; x.fillStyle = '#fff4d6'; x.fillText('de tu ADN viene de virus?', 0, 110); x.restore();
}
function arrow(x, a, b, prog, col = '#9b6ee0') {
  if (prog <= 0) return; const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 160; x.save(); x.lineCap = 'round'; x.setLineDash([22, 18]);
  const P = []; for (let i = 0; i <= 30 * prog; i++) { const s = i / 30, u = 1 - s; P.push([u * u * a[0] + 2 * u * s * mx + s * s * b[0], u * u * a[1] + 2 * u * s * my + s * s * b[1]]); }
  for (const [lw, c] of [[16, INK], [9, col]]) { x.lineWidth = lw; x.strokeStyle = c; x.beginPath(); P.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }
  x.restore();
}
function drawNeuronLinks(x, t) {
  if (t < 41.25 || t > 45.2) return; const fo = 1 - seg(t, 44.9, 45.2);
  const P = NEU.map(r => toScreen(r.g, [0, .018, 0]));
  x.save(); x.globalAlpha = fo; x.lineCap = 'round';
  for (let i = 0; i < P.length - 1; i++) { const k = eo(seg(t, 41.3 + i * .12, 41.75 + i * .12)); if (k <= 0) continue; const a = P[i], b = P[i + 1], e = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    for (const [lw, c] of [[14, INK], [7, '#ffcf3f']]) { x.lineWidth = lw; x.strokeStyle = c; x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo((a[0] + e[0]) / 2, (a[1] + e[1]) / 2 - 40 * k, e[0], e[1]); x.stroke(); } }
  x.restore();
}

// ---------- per frame ----------
const ON = [[-99, 2.88, 'off'], [2.88, 99, 'on']];   // chimp bulb: on → off at "apagó"
function update(t) {
  book.setOpen(Math.PI / 2);
  let sp = 0; for (let i = 0; i < TURNS.length; i++) if (t >= TURNS[i][0]) sp = i + 1;
  let turning = -1; for (let i = 0; i < TURNS.length; i++) if (t >= TURNS[i][0] && t < TURNS[i][1]) turning = i;
  book.groundMat.map = SPREAD[sp].ground; book.groundMat.needsUpdate = true;
  book.backMat.map = SPREAD[turning >= 0 ? turning : sp].sky; book.backMat.needsUpdate = true;
  if (turning >= 0) { book.leafFront.material.map = book.leafFront.material.emissiveMap = SPREAD[turning].ground; book.leafBack.material.map = book.leafBack.material.emissiveMap = SPREAD[turning + 1].sky;
    book.leafFront.material.needsUpdate = book.leafBack.material.needsUpdate = true; book.setLeaf(eio(seg(t, TURNS[turning][0], TURNS[turning][1]))); } else book.setLeaf(0);
  for (const r of L) { const k = riseOf(r, t); r.g.visible = k > .002; if (!r.g.visible) continue; r.g.rotation.x = r.dir * (Math.PI / 2) * (1 - k); if (r.sway) r.m.rotation.z = Math.sin(t * 1.6 + r.ph) * r.sway * k; }
  for (const r of [T0.ch, T0.hu, T5.ch, T5.hu, T2c, T2h]) r.m.rotation.z = Math.sin(t * 1.3 + r.ph) * .012;
  // --- hanging bulbs + virus (spread 0, and again in spread 5) ---
  const inA = t < 7.3, inB = t > 50.3;
  const bulbVis = (b, shown, lit, y0, ph) => { const sw = Math.sin(t * 2.1 + ph) * .05; for (const [g, v] of [[b.on, lit], [b.off, !lit]]) { g.visible = shown && v; g.rotation.z = sw; g.position.y = y0; } };
  const dropIn = inB ? spring(t - 50.5, 7, .35) : 1, upOut = inA ? ss(seg(t, 7.0, 7.4)) : 0;
  const yB = .118 + (1 - dropIn) * .16 + upOut * .2;
  // chimp bulb lit until 2.88 (frame 1 shows it still on, the virus coming down); at the end it is lit again so the loop reads
  const chimpLit = inA ? t < 2.88 : true;
  bulbVis(bChimp, inA || inB, chimpLit, yB, 0); bulbVis(bHuman, inA || inB, true, yB, 1.3);
  // human bulb pulse at "encendido"
  const pulse = 1 + .12 * Math.exp(-Math.max(0, t - 6.3) * 4) * (t > 6.3 ? Math.sin((t - 6.3) * 18) : 0); bHuman.on.scale.setScalar(pulse);
  // virus on a string: comes down toward the chimp bulb on frame 1, rides back up at the end
  vHang.visible = inA || inB;
  let vy, vx;
  if (inA) { const k = eio(seg(t, -.6, 2.85)); vx = lerp(-.005, -.03, k); vy = lerp(.2, .152, k) + upOut * .25; }
  else { const k = eio(seg(t, 52.8, 55.8 + .6 * (2.85 / 3.45))); vx = lerp(-.06, -.02, 1 - k * 0) ; vy = lerp(.45, .2, eio(seg(t, 52.6, 55.8))); vx = -.005; }
  vHang.position.set(vx, vy, .062); vHang.rotation.z = Math.sin(t * 2.6) * .12 * (inA ? (1 - seg(t, 2.6, 3.0) * .6) : 1);
  bulbGlow.intensity = 0;
  miniV.forEach((g, i) => { const t0 = g.userData.t0, k = t >= t0 ? spring(t - t0, 7, .35) : 0, u = ss(seg(t, 20.6, 21.0)); g.visible = t >= t0 && t < 21.0; g.position.y = g.userData.y0 + (1 - k) * .14 + u * .2; g.rotation.z = Math.sin(t * 3 + i) * .08; });
  // --- helix: spread 1 (right) and spread 3 (centre) ---
  const h1 = t > 8.4 && t < 15.7, h3 = t > 21.8 && t < 36.9;
  const hk = h1 ? Math.min(back(seg(t, 8.5, 9.0), 1.6), 1 - ss(seg(t, 15.3, 15.7))) : h3 ? Math.min(back(seg(t, 21.9, 22.4), 1.6), 1 - ss(seg(t, 36.5, 36.9))) : 0;
  const hv = hk > .001; helix.visible = hv; helixShadow.visible = hv;
  const hx = h1 ? .03 : -.02, hz = h1 ? .12 : .13; helix.position.set(hx, 0, hz); helixShadow.position.set(hx, .0005, hz);
  helix.rotation.y = t * .35; helix.scale.setScalar(Math.max(1e-4, hk));
  rungs.forEach((r, i) => { const ii = INS.indexOf(i); let ins = false, fly = 0;
    if (h1 && ii >= 0) ins = t > 11.85 + ii * .14;
    if (h3 && ii >= 0) { ins = t > 24.5 + ii * .06; fly = seg(t, 32.75 + ii * .12, 33.35 + ii * .12); }
    const k = back(seg(t, (h1 ? 8.55 : 21.95) + i * .025, (h1 ? 8.85 : 22.25) + i * .025), 1.6);
    r.g.scale.setScalar(Math.max(1e-4, k * (1 - ss(fly)) + (ins && fly > 0 ? 0 : 0)));
    r.v.visible = ins; r.n.visible = !ins || fly > .5;
    if (ins && fly > 0 && fly < 1) { r.v.visible = true; r.n.visible = false; r.g.scale.setScalar(Math.max(1e-4, k)); r.g.position.x = ss(fly) * .12 * (ii % 2 ? 1 : -1); r.g.position.y = HY0 + i * HDY + eo(fly) * .06; r.g.rotation.z = fly * 3; }
    else if (fly >= 1) { r.v.visible = false; r.n.visible = true; r.g.position.set(0, HY0 + i * HDY, 0); r.g.rotation.z = 0; r.g.scale.setScalar(Math.max(1e-4, back(seg(t, 34.4 + ii * .08, 34.7 + ii * .08), 1.6))); }
    else { r.g.position.set(0, HY0 + i * HDY, 0); r.g.rotation.z = 0; } });
  // spread 3: virus copy drops into the helix at "cayó", bulb flips off then on again
  dropV.visible = t > 23.6 && t < 24.6; { const k = ei(seg(t, 23.6, 24.5)); dropV.position.set(-.02 + (1 - k) * .03, .2 - k * .09, .13 + .03); dropV.rotation.z = t * 4; }
  const lit3 = t < 24.5 || t > 35.1, in3 = t > 21.9 && t < 36.6, k3 = in3 ? spring(t - 21.95, 7, .35) * (1 - ss(seg(t, 36.2, 36.6))) : 0;
  for (const [g, v] of [[g3Bulb.on, lit3], [g3Bulb.off, !lit3]]) { g.visible = in3 && v; g.position.y = .17 + (1 - k3) * .16; g.rotation.z = Math.sin(t * 2 + .7) * .05; }
  g3Bulb.on.scale.setScalar(lit3 && t > 35.1 ? 1 + .15 * Math.exp(-(t - 35.1) * 4) * Math.sin((t - 35.1) * 18) : 1);
  // scissors fly in, snip, fly out
  sciss.visible = t > 32.1 && t < 34.3; { const kin = eo(seg(t, 32.1, 32.7)), kout = ei(seg(t, 33.7, 34.3)), snip = Math.abs(Math.sin((t - 32.7) * 14)) * (t > 32.7 && t < 33.6 ? 1 : 0);
    sciss.position.set(-.02 + .07 - kin * .07 + kout * .2, HY0 + 12 * HDY + .005, .13 + .035); sciss.rotation.set(0, 0, Math.PI + snip * .15); sciss.scale.setScalar(1); }
  // organoids breathe a little; neurons pop in their own popper timing
  ORG.forEach((r, i) => { r.m.scale.setScalar(1 + .03 * Math.sin(t * 2 + i)); });
  // spread 5: wedge slides out of the pie at "8 %"
  pieWedge.m.position.set(.012 * eo(seg(t, 46.4, 47.0)), .006 * eo(seg(t, 46.4, 47.0)), 0);
  if (t > 46.4 && t < 50.3) pieWedge.m.position.y += .004 * Math.sin((t - 46.4) * 3);
}
function renderFrame(t) {
  update(t);
  const Cm = camAt(t); post.dof.focus = Cm.focus; post.dof.aper = Cm.aper; post.dof.maxCoc = 10;
  post.vig.uniforms.warm.value = .12; post.bloom.strength = .08;
  scene.updateMatrixWorld(true); post.composer.render();
  OX.clearRect(0, 0, W, H);
  if (t > 11.7 && t < 13.6) { const fo = 1 - seg(t, 13.2, 13.6); OX.save(); OX.globalAlpha = fo; arrow(OX, toScreen(bigVirus.g, [0, .045, 0]), toScreen(helix, [0, HY0 + 12 * HDY, 0]), eo(seg(t, 11.72, 12.3))); OX.restore(); }
  drawNeuronLinks(OX, t);
  drawSigns(OX, t); drawCounters(OX, t); drawQuestion(OX, t); drawAct(OX, t);
  drawSubs(OX, t);
}
window.renderFrame = renderFrame; window.DUR = DUR;
renderFrame(0); window.READY = true;
// cover (portada): the opening tableau, the chimp's bulb dark and the human's lit, the virus beside it; two stickers on top
window.renderCover = () => {
  update(4.0); for (const r of L) if (r.sway === .08) r.g.visible = false;
  cam.position.set(0, .155, .5); tgtV.set(0, .118, .14); cam.fov = 34; cam.up.set(0, 1, 0); cam.lookAt(tgtV); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  post.dof.focus = cam.position.distanceTo(tgtV); post.dof.aper = 2; post.bloom.strength = .08; scene.updateMatrixWorld(true); post.composer.render();
  OX.clearRect(0, 0, W, H);
  const st = (txt, y, rot, bg, size, fg = '#fffaf0') => { OX.save(); OX.translate(W / 2, y); OX.rotate(rot); OX.font = `${size}px "Lilita One"`; const w = OX.measureText(txt).width + 90, h = size * 1.3;
    OX.fillStyle = 'rgba(40,25,15,.3)'; OX.beginPath(); OX.roundRect(-w / 2 + 12, -h / 2 + 16, w, h, 30); OX.fill(); OX.fillStyle = '#fffaf0'; OX.beginPath(); OX.roundRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 36); OX.fill();
    OX.fillStyle = bg; OX.beginPath(); OX.roundRect(-w / 2, -h / 2, w, h, 26); OX.fill(); OX.lineWidth = 8; OX.strokeStyle = INK; OX.stroke();
    OX.textAlign = 'center'; OX.textBaseline = 'middle'; OX.lineJoin = 'round'; OX.lineWidth = 16; OX.strokeStyle = INK; OX.strokeText(txt, 0, size * .06); OX.fillStyle = fg; OX.fillText(txt, 0, size * .06); OX.restore(); };
  st('UN VIRUS', 270, -.04, '#7a4fc4', 150); st('LO APAGÓ', 470, .035, '#ffb52e', 150);
  // scale tag: 150 copies vs 0
  const tag = (txt, sub, cx, cy, col, rot) => { OX.save(); OX.translate(cx, cy); OX.rotate(rot); OX.fillStyle = '#fffaf0'; OX.beginPath(); OX.roundRect(-185, -95, 370, 190, 28); OX.fill(); OX.fillStyle = '#f4e6c8'; OX.beginPath(); OX.roundRect(-173, -83, 346, 166, 22); OX.fill(); OX.lineWidth = 6; OX.strokeStyle = INK; OX.stroke();
    OX.textAlign = 'center'; OX.textBaseline = 'middle'; OX.font = '100px "Lilita One"'; OX.lineWidth = 12; OX.strokeText(txt, 0, -15); OX.fillStyle = col; OX.fillText(txt, 0, -15); OX.font = '600 30px Fredoka'; OX.fillStyle = '#6b4a36'; OX.fillText(sub, 0, 55); OX.restore(); };
  tag('150', 'copias en el chimpancé', 260, 1730, '#9b6ee0', -.05); tag('0', 'copias en ti', 820, 1730, '#3cb85a', .05);
};

// "Jonathan, 194 años" — Paper Pop-up Book (1080×1920, 30 fps, 90.8 s). Audio is fixed; picture keyed to its cue map.
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, lerp, seg, ss, eio, eo, back, spring, TAU, mulberry, track } from './lib.js';
import * as A from './art.js';
import * as B from './art2.js';
import { cv, GRAIN, INK } from './paper.js';
import { makeBook, coverCanvases, texOf, BW, BD } from './book.js';
import { cutMesh, thread, blobShadow } from './cutmesh.js';
import { makePost } from './post.js';

const W = 1080, H = 1920, DUR = 90.8;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);
const OX = document.getElementById('ov').getContext('2d');
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(34, W / H, .004, 30);
const post = makePost(renderer, scene, cam, W, H);

await Promise.all(['500 40px Fredoka', '600 40px Fredoka', '700 40px Fredoka', '40px "Lilita One"'].map(f => document.fonts.load(f, 'Aaéñ¿')));
const SUBS = await (await fetch('subs.json')).json();
const hdr = await new RGBELoader().loadAsync('assets/lythwood_lounge_2k.hdr'); hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = hdr; scene.background = hdr; scene.backgroundBlurriness = .25;
scene.environmentIntensity = .35; scene.backgroundIntensity = .7; scene.backgroundRotation.set(0, 2.3, 0); scene.environmentRotation.set(0, 2.3, 0);
const tl = new THREE.TextureLoader();
const wt = n => { const t = tl.load(`assets/walnut_${n}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1.4); t.anisotropy = 8; return t; };
const wdiff = wt('diff'); wdiff.colorSpace = THREE.SRGBColorSpace;
const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, .04, 1.7), new THREE.MeshStandardMaterial({ map: wdiff, normalMap: wt('nor'), roughnessMap: wt('rough'), color: '#c9a88a', envMapIntensity: .8 }));
desk.position.set(0, -.02, .25); desk.receiveShadow = true; scene.add(desk);
const gl = new GLTFLoader();
async function prop(name, x, z, s, ry) { const m = (await gl.loadAsync(`assets/${name}/${name}.gltf`)).scene; m.position.set(x, 0, z); m.scale.setScalar(s); m.rotation.y = ry; m.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); scene.add(m); return m; }
const lamp = await prop('desk_lamp_arm_01', -.62, .62, .55, -.76);
lamp.traverse(o => { if (o.isMesh && o.material.name.includes('light')) { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#ffd9a0'); o.material.emissiveIntensity = 6; } });
const tea = await prop('tea_set_01', 0, 0, 1, 0);
{ const keep = { tea_set_01_teapot_01: [.42, .1, .5], tea_set_01_teapot_01_lid: [.42, .1, .5], tea_set_01_cup_small_01: [.33, .48, 2.2], tea_set_01_saucer_circular_04: [.33, .48, 0] };
  const dead = []; tea.traverse(o => { if (!o.name.startsWith('tea_set_01_')) return; const k = keep[o.name]; if (!k) dead.push(o); else { o.position.x = k[0]; o.position.z = k[1]; o.rotation.y = k[2]; } }); dead.forEach(o => o.parent && o.parent.remove(o)); }

// ---------- Book ----------
const coverIcon = (x, px, py, w, h) => { const it = B.tortoise(.12); x.drawImage(it.c, px - w * .05, py + h * .25, w * 1.1, w * 1.1 * it.c.height / it.c.width); };
const book = makeBook(coverCanvases(coverIcon)); scene.add(book.root);

// ---------- Page art ----------
const PW = 2048, PH = Math.round(2048 * BD / BW);
function page(fn) { const c = cv(PW, PH), x = c.getContext('2d'); fn(x); x.save(); x.globalAlpha = .7; x.fillStyle = x.createPattern(GRAIN, 'repeat'); x.fillRect(0, 0, PW, PH); x.restore(); return texOf(c); }
const grad = (x, st) => { const g = x.createLinearGradient(0, 0, 0, PH); st.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, PW, PH); };
function clouds(x, seed, col = 'rgba(255,255,255,.6)', n = 7, y0 = .08, y1 = .5) { const R = mulberry(seed); for (let i = 0; i < n; i++) { const cx = R() * PW, cy = PH * (y0 + R() * (y1 - y0)), w = 180 + R() * 260; x.fillStyle = col; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(cx + (k - 2) * w * .22, cy - Math.sin(k / 4 * Math.PI) * w * .12, w * .2, w * .13, 0, 0, TAU); x.fill(); } } }
function dots(x, seed, n, cols, r0 = 5, r1 = 11) { const R = mulberry(seed); for (let i = 0; i < n; i++) { x.beginPath(); x.arc(R() * PW, R() * PH, r0 + R() * (r1 - r0), 0, TAU); x.fillStyle = cols[(R() * cols.length) | 0]; x.fill(); } }
function stripes(x, n = 9, a = .06) { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * .5})`; x.fillRect(0, PH * i / n, PW, PH / n); } }
function cellsBg(x, seed, col, nuc, n = 40, rmin = 60, rmax = 140) { const R = mulberry(seed); for (let i = 0; i < n; i++) { const cx = R() * PW, cy = R() * PH, r = rmin + R() * (rmax - rmin); x.beginPath(); x.ellipse(cx, cy, r, r * (.8 + R() * .3), R() * 3, 0, TAU); x.fillStyle = col; x.fill(); x.lineWidth = 6; x.strokeStyle = 'rgba(58,42,36,.35)'; x.stroke(); x.beginPath(); x.arc(cx + r * .1, cy, r * .3, 0, TAU); x.fillStyle = nuc; x.fill(); } }
// map: lon −12..60, lat 13..−37 → page px (north at the spine); coastlines only, no borders
const LON0 = -12, LON1 = 60, LAT0 = 13, LAT1 = -37;
const mx = lon => (lon - LON0) / (LON1 - LON0) * PW, my = lat => (LAT0 - lat) / (LAT0 - LAT1) * PH;
const sx = lon => ((lon - LON0) / (LON1 - LON0) - .5) * BW, sz = lat => (LAT0 - lat) / (LAT0 - LAT1) * BD;
const AFR = [[-17.5, 14.7], [-16.8, 12.5], [-15, 11], [-13.3, 9.5], [-11.5, 6.9], [-7.5, 4.4], [-4, 5.2], [-1, 5], [2, 6.3], [4.5, 6.3], [6, 4.3], [8.5, 4.5], [9.5, 3], [9.6, 1], [9.3, -1], [11, -3.8], [12.2, -6], [13.2, -8.8], [13.5, -12], [12, -15.5], [11.8, -18], [13.4, -20.9], [14.5, -22.9], [15.2, -27], [16.5, -28.6], [18, -31.5], [18.4, -34], [20, -34.8], [22.5, -34], [25.6, -34], [27.5, -33], [30, -31], [32.4, -28.6], [32.9, -26], [35.5, -24], [35.5, -21], [34.8, -19.8], [36.8, -18], [40.5, -15], [40.6, -11], [39.3, -8], [39.2, -4.7], [41, -2], [42.6, -.5], [44, 1.8], [46, 2.8], [48, 5], [49.5, 8], [51.2, 11.8], [48, 11.2], [44.5, 10.4], [43.3, 11.9], [43, 16], [-17, 16]];
const MAD = [[49.3, -12], [50.4, -15.5], [49.5, -17], [48.7, -20.5], [47.5, -24.5], [45.2, -25.5], [44, -24.8], [43.3, -22], [44.4, -19.5], [44, -16.8], [46.3, -15.7], [47.8, -14]];
const ARB = [[43.6, 12.7], [45, 12.9], [48.5, 14], [52, 15.6], [54, 16.6], [43, 16.6]];
const HEL = [-5.7, -15.95], SEY = [55.5, -4.6];
const ROUTE = [SEY, [54, -10], [51.5, -21], [46, -29], [35, -36.2], [22, -37.2], [12, -33], [3, -25], HEL];
function routePt(u) { const n = ROUTE.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i; const a = ROUTE[i], b = ROUTE[i + 1], c = ROUTE[Math.max(0, i - 1)], d = ROUTE[Math.min(n, i + 2)];
  const cr = (p0, p1, p2, p3, t) => .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  return [cr(c[0], a[0], b[0], d[0], k), cr(c[1], a[1], b[1], d[1], k)]; }
function land(x, pts) { x.beginPath(); pts.forEach(([lo, la], i) => i ? x.lineTo(mx(lo), my(la)) : x.moveTo(mx(lo), my(la))); x.closePath(); x.fillStyle = '#e9cf8f'; x.fill(); x.save(); x.clip(); x.lineWidth = 60; x.strokeStyle = '#d4b06a'; x.stroke(); x.restore(); x.lineWidth = 9; x.strokeStyle = INK; x.lineJoin = 'round'; x.stroke(); }
const TEX = {
  sky0: page(x => { grad(x, [[0, '#6fc0ee'], [.7, '#c3eaf8'], [1, '#e6f7ee']]); clouds(x, 3); }),
  gr0: page(x => { grad(x, [[0, '#7fc35c'], [1, '#a2d77c']]); stripes(x, 10); dots(x, 5, 170, ['#ffffff', '#ffe066', '#ff9ec1']); }),
  sky1: page(x => { grad(x, [[0, '#2f78b8'], [.75, '#7fc0e8'], [1, '#bfe4f3']]); clouds(x, 11, 'rgba(255,255,255,.55)', 6, .1, .45);
    x.save(); x.translate(PW * .82, PH * .3); x.strokeStyle = 'rgba(255,248,230,.75)'; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 120, 0, TAU); x.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 90 : 170; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke(); } x.font = '700 70px Fredoka'; x.fillStyle = 'rgba(255,248,230,.85)'; x.textAlign = 'center'; x.fillText('N', 0, -190); x.restore(); }),
  gr1: page(x => { grad(x, [[0, '#4d9fd8'], [1, '#3a86c4']]);
    const R = mulberry(31); x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 6; x.lineCap = 'round'; for (let i = 0; i < 110; i++) { const px = R() * PW, py = R() * PH; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 30, py - 16, px + 60, py); x.stroke(); }
    land(x, AFR); land(x, MAD); land(x, ARB);
    x.save(); x.setLineDash([26, 20]); x.lineWidth = 9; x.strokeStyle = '#fff6dc'; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i <= 80; i++) { const p = routePt(i / 80); i ? x.lineTo(mx(p[0]), my(p[1])) : x.moveTo(mx(p[0]), my(p[1])); } x.stroke(); x.restore();
    x.textAlign = 'center'; x.font = '700 86px Fredoka'; x.fillStyle = 'rgba(120,80,40,.75)'; x.fillText('ÁFRICA', mx(22), my(2));
    x.font = '700 50px Fredoka'; x.fillStyle = '#fffaf0'; x.lineWidth = 10; x.strokeStyle = 'rgba(40,30,25,.7)'; x.lineJoin = 'round';
    for (const [t, lo, la] of [['SANTA ELENA', HEL[0], HEL[1] - 3.2], ['SEYCHELLES', SEY[0] - 1, SEY[1] + 3.6], ['OCÉANO ATLÁNTICO', 0, -30], ['OCÉANO ÍNDICO', 52, -33]]) { x.strokeText(t, mx(lo), my(la)); x.fillText(t, mx(lo), my(la)); } }),
  sky2: page(x => { grad(x, [[0, '#f08a5d'], [.55, '#ffc27a'], [1, '#ffe6b0']]); const g = x.createRadialGradient(PW * .7, PH * .62, 0, PW * .7, PH * .62, 520); g.addColorStop(0, 'rgba(255,245,200,.95)'); g.addColorStop(1, 'rgba(255,245,200,0)'); x.fillStyle = g; x.fillRect(0, 0, PW, PH); x.beginPath(); x.arc(PW * .7, PH * .62, 120, 0, TAU); x.fillStyle = '#fff1b8'; x.fill(); clouds(x, 21, 'rgba(255,220,200,.6)', 5, .1, .4); }),
  gr2: page(x => { grad(x, [[0, '#9cbf55'], [1, '#c2d77a']]); stripes(x, 10); dots(x, 25, 120, ['#fff3c0', '#ffd27a', '#ffffff']); }),
  sky3: page(x => { grad(x, [[0, '#f7b6c8'], [1, '#fde0e7']]); cellsBg(x, 41, 'rgba(255,150,175,.5)', 'rgba(160,100,200,.45)', 30, 90, 200); }),
  gr3: page(x => { grad(x, [[0, '#f9c3cf'], [1, '#fbd6de']]); cellsBg(x, 43, 'rgba(255,165,185,.55)', 'rgba(160,100,200,.4)', 55, 60, 130); }),
  sky4: page(x => { grad(x, [[0, '#3c3a8c'], [.7, '#6b62c0'], [1, '#9d8fe0']]); dots(x, 51, 160, ['rgba(255,240,200,.7)', 'rgba(180,220,255,.6)'], 3, 8); }),
  gr4: page(x => { grad(x, [[0, '#b9aee8'], [1, '#d5ccf3']]); stripes(x, 12, .05); dots(x, 53, 90, ['rgba(255,207,63,.6)', 'rgba(255,255,255,.7)'], 6, 12); }),
  sky5: page(x => { grad(x, [[0, '#5a6fb8'], [.5, '#e79a7a'], [1, '#ffd3a0']]); clouds(x, 61, 'rgba(255,210,200,.55)', 6, .1, .45); }),
  gr5: page(x => { grad(x, [[0, '#6aa94e'], [1, '#93c46c']]); stripes(x, 10); dots(x, 65, 150, ['#ffffff', '#ffe066', '#ff9ec1']); }),
};
const SPREAD = [['sky0', 'gr0'], ['sky1', 'gr1'], ['sky2', 'gr2'], ['sky3', 'gr3'], ['sky4', 'gr4'], ['sky5', 'gr5']].map(([s, g]) => ({ sky: TEX[s], ground: TEX[g] }));
const TURNS = [[15.55, 16.95], [24.1, 25.4], [28.3, 29.6], [38.85, 40.0], [66.9, 68.2]];
const RISE = [.35, 16.6, 25.05, 29.3, 39.65, 67.9], FOLD = [15.6, 24.15, 28.35, 38.9, 66.95, 86.0];

// ---------- Pop-up pieces ----------
const L = [];
function popper(spread, parent, item, x, y, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); const m = cutMesh(item, o); if (o.ry) m.rotation.y = o.ry; g.add(m); parent.add(g);
  const r = { g, m, spread, t0: o.t0, tf: o.tf, d: o.d ?? (.3 - z) * 1.1, dir: o.dir ?? (z > .15 ? -1 : 1), sway: o.sway || 0, ph: x * 40 }; L.push(r); return r;
}
function riseOf(r, t) { const t0 = r.t0 ?? (RISE[r.spread] + r.d), tf = r.tf ?? (FOLD[r.spread] + (.3 - r.g.position.z) * .5); return Math.min(back(seg(t, t0, t0 + .5), 1.7), 1 - ss(seg(t, tf, tf + .4))); }
const S = book.stage, K = book.sky;
// spread 0: meadow
popper(0, S, A.hill(.26, .07, '#b5e39a', '#93cc78', 11, { bumps: 2 }), -.1, 0, .012);
popper(0, S, A.hill(.26, .085, '#a9dd8c', '#88c46c', 12, { bumps: 3 }), .1, 0, .016);
popper(0, S, A.lolliTree(.075, '#5cbf4a', '#3f9934', 21), -.085, 0, .055, { sway: .03 });
popper(0, S, A.lolliTree(.06, '#6fcc55', '#4ea93e', 22), .09, 0, .06, { sway: .03 });
const tort0 = popper(0, S, B.tortoise(.125), 0, 0, .14, { t0: .85, dir: -1 });
const R0 = mulberry(90);
for (let i = 0; i < 8; i++) popper(0, S, A.flower(.016 + R0() * .008, ['#ff7aa8', '#ffd23f', '#ffffff', '#b58cff'][i % 4], i), -.13 + i * .037 + (R0() - .5) * .01, 0, .245 + R0() * .03, { sway: .08 });
popper(0, S, B.egg(.032), -.075, 0, .215, { t0: 12.9 });
popper(0, S, A.sign(.05, '1832', '700 150px Fredoka'), -.03, 0, .225, { t0: 13.95 });
popper(0, S, A.sign(.06, '194 AÑOS', '700 120px Fredoka'), .085, 0, .215, { t0: 7.45, tf: 9.7 });
// hanging phone & bulb (on strings in front of the backdrop) with red crosses
function hanger(item, x, y, z) { const g = new THREE.Group(); const m = cutMesh(item); g.add(m); const th = thread(.3); th.position.set(0, item.h * (1 - item.ay), -.0004); g.add(th); g.position.set(x, y, z); K.add(g); return g; }
const phoneH = hanger(B.phone(.042), -.05, .13, .04), bulbH = hanger(B.bulb(.046), .05, .125, .04);
const x1 = hanger(B.redX(.046), -.05, .15, .046), x2 = hanger(B.redX(.046), .05, .15, .046);
// spread 1: map
const boat = new THREE.Group(); { const sail = cutMesh(A.boat(.065, 'sail')), hull = cutMesh(A.boat(.065, 'hull')), tt = cutMesh(B.tortoise(.034)); sail.position.set(-.008, 0, -.003); tt.position.set(.006, .009, -.0005); hull.position.z = .002; boat.add(sail, tt, hull); S.add(boat); }
popper(1, S, A.island(.045), sx(HEL[0]), 0, sz(HEL[1]), { t0: 19.7, dir: -1 });
popper(1, S, A.island(.035), sx(SEY[0]), 0, sz(SEY[1]), { t0: 16.9, dir: -1 });
popper(1, S, A.sign(.07, '1882', '700 150px Fredoka'), -.02, 0, .04, { t0: 16.75 });
const govTort = popper(1, S, B.tortoise(.055), sx(HEL[0]) + .04, 0, sz(HEL[1]) + .02, { t0: 23.7, dir: -1 });
// spread 2: today
popper(2, S, A.hill(.3, .06, '#c8d98a', '#a9bf6a', 15, { bumps: 2 }), 0, 0, .015);
popper(2, S, A.lolliTree(.07, '#7fae45', '#5e8a33', 23), -.1, 0, .05, { sway: .03 });
popper(2, S, A.lolliTree(.055, '#8fbe50', '#6a9a3a', 24), .1, 0, .055, { sway: .03 });
popper(2, S, B.tortoise(.14), 0, 0, .15, { t0: 25.25, dir: -1 });
for (let i = 0; i < 6; i++) popper(2, S, A.flower(.018, ['#ffd23f', '#ffffff', '#ff9e5a'][i % 3], 30 + i), -.12 + i * .048, 0, .25, { sway: .08 });
// spread 3: inside (cells, swab, bacteria)
const R3 = mulberry(70);
for (let i = 0; i < 6; i++) { const z = .03 + (i % 3) * .035; popper(3, S, B.cellCard(.06 + R3() * .02, 70 + i), -.16 + i * .065, 0, z, { sway: .01 }); }
popper(3, S, B.syringe(.07), -.04, .035, .17, { t0: 32.3, tf: 34.0 });
popper(3, S, B.redX(.05), -.04, .035, .175, { t0: 32.9, tf: 34.0 });
popper(3, S, B.swab(.085), .03, 0, .16, { t0: 34.1, tf: 37.4 });
for (let i = 0; i < 5; i++) popper(3, S, B.bacterium(.038, 80 + i), -.09 + i * .045, .012 + (i % 2) * .02, .19 + (i % 2) * .02, { t0: 37.7 + i * .12 });
// spread 4: DNA helix (rungs on a turning spindle), chromosome, marks, mitochondrion
const helix = new THREE.Group(); helix.position.set(0, 0, .13); S.add(helix);
const NR = 26, HY0 = .03, HDY = .0074, HR = .024, VAR = [2, 5, 6, 9, 13, 16, 17, 21, 24];
const RC = [['#ff6a5a', '#6ad0ff'], ['#7be08a', '#ffcf3f'], ['#b58cff', '#ff9ec1']];
const rungs = [];
for (let i = 0; i < NR; i++) { const c = RC[i % 3]; const n = cutMesh(B.rung(HR * 2, c[0], c[1]), { backCol: '#f3d9b0' }), v = cutMesh(B.rung(HR * 2, '#ffb52e', '#ff8a1e'), { backCol: '#ffc870' }); const g = new THREE.Group(); g.add(n, v); v.visible = false; g.position.y = HY0 + i * HDY; g.rotation.y = i * .42; helix.add(g); rungs.push({ g, n, v }); }
const bbMat = new THREE.MeshStandardMaterial({ color: '#f4efe2', roughness: .9 }), bbMat2 = new THREE.MeshStandardMaterial({ color: '#e7d7b8', roughness: .9 });
for (const [ph, m] of [[0, bbMat], [Math.PI, bbMat2]]) { const pts = []; for (let i = -1; i <= NR; i++) { const a = i * .42 + ph; pts.push(new THREE.Vector3(Math.cos(a) * HR * 1.02, HY0 + i * HDY, -Math.sin(a) * HR * 1.02)); }
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, .0022, 8), m); tube.castShadow = tube.receiveShadow = true; helix.add(tube); }
const helixShadow = blobShadow(.04, .35); helixShadow.position.set(0, .0005, .13); S.add(helixShadow);
popper(4, S, B.chromosome(.065), .06, 0, .2, { t0: 47.0, tf: 52.4 });
const NM = 22, marks = [];
for (let i = 0; i < NM; i++) { const g = new THREE.Group(); const m = cutMesh(B.mark(.0042, i % 3 ? '#ffb52e' : '#ffcf3f')); g.add(m); const th = thread(.25); th.position.set(0, .0042, -.0004); g.add(th); helix.add(g); marks.push(g); }
popper(4, S, B.mito(.13), 0, .045, .16, { t0: 59.65 });
for (let i = 0; i < 9; i++) popper(4, S, B.mark(.0042), -.05 + i * .0125, .081, .1625, { t0: 60.3 + i * .05 });
popper(4, S, B.tick(.035), .055, .1, .165, { t0: 65.8 });
// spread 5: meadow at dusk + caveat
popper(5, S, A.hill(.26, .075, '#9ccf86', '#7fb46b', 41, { bumps: 2 }), -.1, 0, .012);
popper(5, S, A.hill(.26, .08, '#92c87a', '#75ad60', 42, { bumps: 3 }), .1, 0, .016);
popper(5, S, A.lolliTree(.07, '#4fae45', '#3a8a3a', 43), .1, 0, .05, { sway: .03 });
const tort5 = popper(5, S, B.tortoise(.125), .01, 0, .14, { dir: -1 });
const magn = popper(5, S, B.magnifier(.016), -.07, 0, .215, { t0: 73.1 });
for (let i = 0; i < 7; i++) popper(5, S, A.flower(.017, ['#ff7aa8', '#ffd23f', '#ffffff'][i % 3], 50 + i), -.12 + i * .04, 0, .26, { sway: .08 });

// ---------- Lights ----------
const sun = new THREE.DirectionalLight('#fff3e0', 2.2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0001; sun.shadow.normalBias = .0004; sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, { left: -.3, right: .3, top: .3, bottom: -.3, near: .1, far: 3 }); sun.position.set(-.3, .6, .75); sun.target.position.set(0, .05, .12); scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#cfe6ff', '#caa27a', .45); scene.add(hemi);
const lampL = new THREE.PointLight('#ffcf94', .6, 1.2, 2); lampL.position.set(-.28, .36, .44); scene.add(lampL);

// ---------- Camera: keys [px,py,pz, tx,ty,tz, fov, aper]; a new list = a hard cut ----------
const SH = [
  [0, 9.6, [[0, [0, .2, .78, 0, .1, .1, 34, 1.6]], [1.4, [0, .15, .6, 0, .1, .12, 34, 2]], [9.6, [.02, .13, .55, 0, .085, .13, 34, 2]]]],
  [9.6, 15.5, [[9.6, [.07, .1, .6, .02, .055, .15, 34, 2]], [12.6, [.04, .09, .58, -.01, .05, .16, 34, 2]], [15.5, [.0, .09, .6, -.02, .045, .17, 34, 1.9]]]],
  [15.5, 17.4, [[15.5, [0, .3, .65, 0, .04, .14, 34, 1.4]], [17.4, [0, 1.12, .66, 0, 0, .16, 36, .6]]]],
  [17.4, 24.1, [[17.4, [0, 1.12, .66, 0, 0, .16, 36, .6]], [24.1, [0, 1.08, .63, 0, 0, .16, 36, .6]]]],
  [24.1, 25.4, [[24.1, [0, .5, .6, 0, .03, .14, 34, 1.2]], [25.4, [0, .2, .55, 0, .06, .14, 34, 1.6]]]],
  [25.4, 28.3, [[25.4, [-.03, .06, .6, .025, .06, .13, 36, 2]], [28.3, [-.01, .055, .56, .025, .065, .13, 36, 2]]]],
  [28.3, 29.6, [[28.3, [0, .32, .6, 0, .05, .14, 34, 1.4]], [29.6, [0, .16, .6, 0, .06, .12, 34, 1.8]]]],
  [29.6, 39.0, [[29.6, [0, .16, .6, 0, .06, .12, 34, 1.8]], [36, [.02, .1, .46, 0, .05, .16, 34, 2.2]], [39.0, [.03, .09, .43, 0, .05, .16, 34, 2.2]]]],
  [39.0, 40.1, [[39.0, [0, .3, .62, 0, .08, .13, 34, 1.4]], [40.1, [0, .13, .5, 0, .12, .13, 34, 1.8]]]],
  [40.1, 49.9, [[40.1, [0, .14, .6, 0, .125, .13, 34, 1.8]], [46.6, [.04, .12, .58, .02, .11, .14, 34, 1.8]], [49.9, [.05, .12, .57, .03, .11, .15, 34, 1.8]]]],
  [49.9, 59.4, [[49.9, [-.05, .13, .58, 0, .125, .13, 34, 1.8]], [59.4, [.03, .13, .56, 0, .125, .13, 34, 1.8]]]],
  [59.4, 67.0, [[59.4, [0, .11, .6, 0, .08, .14, 34, 1.8]], [63.5, [0, .1, .55, 0, .08, .16, 34, 2]], [67.0, [0, .1, .53, 0, .08, .16, 34, 2]]]],
  [67.0, 68.4, [[67.0, [0, .3, .62, 0, .05, .14, 34, 1.4]], [68.4, [0, .15, .58, 0, .07, .13, 34, 1.8]]]],
  [68.4, 79.1, [[68.4, [0, .15, .58, 0, .07, .13, 34, 1.8]], [73, [-.04, .1, .5, -.04, .06, .17, 34, 2.2]], [79.1, [-.05, .09, .47, -.05, .06, .18, 34, 2.2]]]],
  [79.1, 84.1, [[79.1, [0, .14, .62, 0, .07, .14, 34, 1.6]], [84.1, [0, .52, .62, 0, .03, .15, 34, 1.1]]]],
  [84.1, 99, [[84.1, [0, .52, .62, 0, .03, .15, 34, 1.1]], [86.4, [0, .7, .55, 0, .02, .16, 34, .9]], [87.6, [0, 1.6, .2, 0, 0, .15, 34, .5]], [90.8, [0, 1.52, .19, 0, 0, .15, 34, .5]]]],
].map(([a, b, keys]) => ({ a, b, f: track(keys) }));
const tgtV = new THREE.Vector3();
function camAt(t) { const s = SH.find(s => t >= s.a && t < s.b) || SH[SH.length - 1]; const v = s.f(t); cam.position.set(v[0], v[1], v[2]); tgtV.set(v[3], v[4], v[5]); cam.fov = v[6];
  cam.up.set(0, 1, 0); cam.lookAt(tgtV); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return { focus: cam.position.distanceTo(tgtV), aper: v[7] }; }
function toScreen(obj, off = [0, 0, 0]) { const v = new THREE.Vector3(...off); obj.localToWorld(v); v.project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }

// ---------- HUD (2D) ----------
const CR = '#fffaf0';
function outlined(x, s, px, py, font, fill = CR, lw = 10) { x.font = font; x.lineJoin = 'round'; x.lineWidth = lw; x.strokeStyle = 'rgba(40,26,18,.85)'; x.strokeText(s, px, py); x.fillStyle = fill; x.fillText(s, px, py); }
function drawSubs(x, t) {
  for (let i = 0; i < SUBS.length; i++) { const c = SUBS[i], nx = SUBS[i + 1]; const t1 = Math.max(c.t1 + .3, c.t0 + 1.4); if (t < c.t0 - .12 || t > t1) continue; if (nx && t >= nx.t0 - .12) continue;
    const a = seg(t, c.t0 - .12, c.t0 + .08) * (1 - seg(t, t1 - .15, t1)); x.save(); x.globalAlpha = a; x.wordSpacing = '6px'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 16;
    let fs = 50; x.font = `600 ${fs}px Fredoka`; while (x.measureText(c.text).width > 980 && fs > 34) { fs -= 2; x.font = `600 ${fs}px Fredoka`; }
    outlined(x, c.text, W / 2, 1735, `600 ${fs}px Fredoka`, CR, 10); x.restore(); }
}
// hanging cardboard signs: [t0, t1, ribbon, title, sub]
const SIGNS = [[5.95, 9.45, 'LA VIDA DE', 'JONATHAN', ''], [10.4, 15.3, 'TORTUGA GIGANTE', 'DE ALDABRA', ''], [17.2, 21.4, 'EN 1882 LLEGA A', 'SANTA ELENA', 'desde las Seychelles'], [25.3, 28.2, 'HOY ES', 'EL MÁS VIEJO', 'animal terrestre vivo conocido'],
  [29.4, 33.0, 'UN EQUIPO INTERNACIONAL', 'LEE SU ADN', ''], [44.4, 46.9, 'GENES DE', 'REPARACIÓN', 'del ADN'], [47.2, 49.8, 'LOS EXTREMOS', 'TELÓMEROS', 'de los cromosomas'],
  [52.6, 55.5, 'CON LA EDAD', 'MARCAS QUÍMICAS', 'encienden y apagan genes'], [60.4, 63.4, 'SALVO EN LAS', 'MITOCONDRIAS', 'las centrales de energía'],
  [67.2, 72.8, 'OJO', 'UN SOLO ANIMAL', 'no demuestra la causa'], [79.6, 84.0, 'SEGÚN SUS AUTORES', 'PRIMER ESTUDIO', 'del epigenoma de una tortuga gigante'], [84.4, 86.5, 'TE PREGUNTO', '¿VIVIRÍAS 200 AÑOS?', '']];
function drawSigns(x, t) {
  for (const [t0, t1, a, b, sub] of SIGNS) { if (t < t0 || t > t1 + .6) continue;
    const kin = seg(t, t0, t0 + .7), kout = seg(t, t1, t1 + .5), drop = (1 - back(kin, 1.4)) * -360 - ss(kout) * 560, sw = Math.sin((t - t0) * 3.2) * .03 * (1 - kin * .6) * (1 - kout);
    x.save(); x.translate(W / 2, 300 + drop); x.rotate(sw);
    let fs = 96; x.font = `${fs}px "Lilita One"`; while (x.measureText(b).width > 860 && fs > 50) { fs -= 4; x.font = `${fs}px "Lilita One"`; }
    const w = Math.max(560, Math.min(980, x.measureText(b).width + 120)), hh = sub ? 250 : 200;
    x.strokeStyle = '#6b5a4a'; x.lineWidth = 3; x.beginPath(); x.moveTo(-w * .38, -40); x.lineTo(-w * .38, -600); x.moveTo(w * .38, -40); x.lineTo(w * .38, -600); x.stroke();
    x.fillStyle = 'rgba(40,25,15,.25)'; x.beginPath(); x.roundRect(-w / 2 + 10, -26, w, hh, 22); x.fill();
    x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect(-w / 2 - 10, -52, w + 20, hh + 24, 28); x.fill();
    x.fillStyle = '#f4e6c8'; x.beginPath(); x.roundRect(-w / 2, -40, w, hh, 22); x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
    x.font = '40px "Lilita One"'; const rw = Math.max(300, x.measureText(a).width + 90);
    x.fillStyle = '#d8423a'; x.beginPath(); x.moveTo(-rw / 2, -72); x.lineTo(rw / 2, -72); x.lineTo(rw / 2 - 20, -34); x.lineTo(rw / 2, 4); x.lineTo(-rw / 2, 4); x.lineTo(-rw / 2 + 20, -34); x.closePath(); x.fill(); x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff4d6'; x.fillText(a, 0, -32);
    x.font = `${fs}px "Lilita One"`; x.lineWidth = 12; x.strokeStyle = INK; x.lineJoin = 'round'; x.strokeText(b, 0, 62); x.fillStyle = '#ffcf3f'; x.fillText(b, 0, 62);
    if (sub) { let s2 = 36; x.font = `600 ${s2}px Fredoka`; while (x.measureText(sub).width > w - 50 && s2 > 24) { s2 -= 2; x.font = `600 ${s2}px Fredoka`; } x.fillStyle = '#6b4a36'; x.fillText(sub, 0, 150); }
    x.restore(); }
}
// action words: [t0, text, [sx, sy], colours]
const ACT = [[4.65, '¡Y SIGUE VIVO!', [540, 1180], ['#7fe07a', '#2f9e44']], [23.65, '¡YA ERA ADULTO!', [540, 1240], ['#ffe066', '#ff9f1c']], [27.55, '¡RÉCORD!', [540, 1240], ['#ffe066', '#ff9f1c']],
  [36.75, '¡FALLÓ!', [540, 1180], ['#ff8a7a', '#d8423a']], [55.65, '¡SE DESORDENAN!', [540, 1260], ['#ffb3c1', '#d8423a']], [64.75, '¡ORDENADAS!', [540, 1260], ['#9bf0a5', '#2f9e44']]];
function drawAct(x, t) {
  for (const [t0, text, p, col] of ACT) { if (t < t0 || t > t0 + 1.6) continue;
    const k = back(seg(t, t0, t0 + .18), 2.5), fo = 1 - seg(t, t0 + 1.25, t0 + 1.6);
    x.save(); x.translate(p[0], p[1] - seg(t, t0, t0 + 1.6) * 40); x.rotate(-.08); x.scale(k, k); x.globalAlpha = fo;
    const R = mulberry(Math.round(t0 * 10)); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + R() * .3, r0 = 150, r1 = 230 + R() * 70 * eo(seg(t, t0, t0 + .4)); x.strokeStyle = i % 2 ? '#ffe35a' : '#ffffff'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * .5); x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 * .5); x.stroke(); }
    let fs = 110; x.font = `italic ${fs}px "Lilita One"`; while (x.measureText(text).width > 920) { fs -= 4; x.font = `italic ${fs}px "Lilita One"`; }
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 30; x.strokeStyle = '#fffaf0'; x.strokeText(text, 0, 0); x.lineWidth = 12; x.strokeStyle = INK; x.strokeText(text, 0, 0);
    const g = x.createLinearGradient(0, -50, 0, 50); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); x.fillStyle = g; x.fillText(text, 0, 0); x.restore(); }
}
function bubble(x, t, t0, t1, text, an, maxW = 860) {
  if (t < t0 - .05 || t > t1 + .25 || !an) return; const kin = back(seg(t, t0, t0 + .22), 2.2), kout = 1 - ss(seg(t, t1, t1 + .2)), k = kin * kout; if (k <= 0) return;
  const n = Math.floor(clamp((t - t0 - .1) * 32, 0, text.length)); x.save(); x.font = '600 50px Fredoka';
  const words = text.split(' '), lines = []; let cur = ''; for (const w of words) { const s = cur ? cur + ' ' + w : w; if (x.measureText(s).width > maxW - 90 && cur) { lines.push(cur); cur = w; } else cur = s; } lines.push(cur);
  const bw = Math.min(maxW, Math.max(...lines.map(l => x.measureText(l).width)) + 90), bh = 50 + lines.length * 64;
  const bx = clamp(an[0] - bw * .3, 40, W - 40 - bw), by = clamp(an[1] - bh - 110, 420, 1500), tx = clamp(an[0], bx + 60, bx + bw - 60);
  x.translate(tx, by + bh); x.scale(k, k); x.translate(-tx, -(by + bh));
  x.fillStyle = 'rgba(40,25,15,.22)'; x.beginPath(); x.roundRect(bx + 8, by + 12, bw, bh, 44); x.fill();
  const tipY = Math.min(an[1] - 16, by + bh + 80);
  x.beginPath(); x.roundRect(bx, by, bw, bh, 44); x.moveTo(tx - 26, by + bh - 2); x.lineTo(lerp(tx, an[0], .7), tipY); x.lineTo(tx + 20, by + bh - 2); x.fillStyle = '#fffdf8'; x.fill();
  x.lineWidth = 6; x.strokeStyle = INK; x.lineJoin = 'round'; x.beginPath(); x.roundRect(bx, by, bw, bh, 44); x.stroke();
  x.beginPath(); x.moveTo(tx - 26, by + bh); x.lineTo(lerp(tx, an[0], .7), tipY); x.lineTo(tx + 20, by + bh); x.stroke(); x.fillStyle = '#fffdf8'; x.fillRect(tx - 22, by + bh - 8, 40, 9);
  x.fillStyle = '#241814'; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; let left = n;
  lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, left)); left -= l.length + 1; x.fillText(s, bx + 45, by + 76 + i * 64); }); x.restore();
}
function drawCounter(x, t) {
  if (t < 39.95 || t > 44.2) return; const k = back(seg(t, 39.95, 40.25), 2), fo = 1 - seg(t, 43.8, 44.2), v = Math.round(287 * eo(seg(t, 40.0, 41.6)));
  x.save(); x.globalAlpha = fo; x.translate(W / 2, 330); x.scale(k, k); x.rotate(-.03);
  x.fillStyle = 'rgba(40,25,15,.25)'; x.beginPath(); x.roundRect(-250, -120, 520, 270, 30); x.fill(); x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect(-270, -150, 540, 280, 34); x.fill();
  x.fillStyle = '#f4e6c8'; x.beginPath(); x.roundRect(-255, -135, 510, 250, 26); x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '170px "Lilita One"'; x.lineWidth = 14; x.strokeStyle = INK; x.lineJoin = 'round'; x.strokeText(String(v), 0, -30); x.fillStyle = '#ffb52e'; x.fillText(String(v), 0, -30);
  x.globalAlpha = fo * seg(t, 41.8, 42.1); x.font = '600 40px Fredoka'; x.fillStyle = '#6b4a36'; x.fillText('variantes propias', 0, 82); x.restore();
}

// ---------- per frame ----------
function update(t) {
  const open = lerp(.5, 1, eio(seg(t, 0, .9))) * (1 - eio(seg(t, 86.55, 87.55)));
  book.setOpen(Math.PI / 2 * open);
  let sp = 0; for (let i = 0; i < TURNS.length; i++) if (t >= TURNS[i][0]) sp = i + 1;
  let turning = -1; for (let i = 0; i < TURNS.length; i++) if (t >= TURNS[i][0] && t < TURNS[i][1]) turning = i;
  book.groundMat.map = SPREAD[sp].ground; book.groundMat.needsUpdate = true;
  book.backMat.map = SPREAD[turning >= 0 ? turning : sp].sky; book.backMat.needsUpdate = true;
  if (turning >= 0) { book.leafFront.material.map = book.leafFront.material.emissiveMap = SPREAD[turning].ground; book.leafBack.material.map = book.leafBack.material.emissiveMap = SPREAD[turning + 1].sky;
    book.leafFront.material.needsUpdate = book.leafBack.material.needsUpdate = true; book.setLeaf(eio(seg(t, TURNS[turning][0], TURNS[turning][1]))); } else book.setLeaf(0);
  for (const r of L) { const k = riseOf(r, t); r.g.visible = k > .002; if (!r.g.visible) continue; r.g.rotation.x = r.dir * (Math.PI / 2) * (1 - k); if (r.sway) r.m.rotation.z = Math.sin(t * 1.6 + r.ph) * r.sway * k; }
  for (const r of [tort0, tort5]) r.m.rotation.z = Math.sin(t * 1.3) * .012;
  const hang = (g, t0, t1, y) => { const k = t >= t0 ? spring(t - t0, 7, .35) : 0, u = ss(seg(t, t1, t1 + .6)); g.visible = t >= t0 && u < 1; g.position.y = y + (1 - k) * .16 + u * .2; g.rotation.z = Math.sin((t - t0) * 4) * .06 * Math.exp(-Math.max(0, t - t0) * 1.5); };
  hang(phoneH, 2.5, 5.4, .13); hang(bulbH, 3.4, 5.5, .125); hang(x1, 2.95, 5.4, .135); hang(x2, 3.85, 5.5, .13);
  const bu = eio(seg(t, 18.0, 21.4)), bp = routePt(bu), bpn = routePt(Math.min(1, bu + .02)), dirx = bu >= .99 ? -1 : Math.sign(bpn[0] - bp[0]) || -1;
  boat.visible = t > 17.0 && t < 24.4; boat.position.set(sx(bp[0]), Math.abs(Math.sin(t * 5)) * .0015, sz(bp[1]) + .006);
  const bs = back(seg(t, 17.0, 17.5), 1.7) * (1 - ss(seg(t, 24.0, 24.4))) + 1e-4; boat.scale.set(bs * dirx, bs, bs); boat.rotation.z = Math.sin(t * 3) * .05;
  const hk = 1 - ss(seg(t, 59.3, 59.8)), hv = t > 39.6 && hk > .001; helix.visible = hv; helixShadow.visible = hv;
  helix.rotation.y = t * .35; helix.scale.setScalar(Math.max(1e-4, hk));
  rungs.forEach((r, i) => { const k = back(seg(t, 39.65 + i * .03, 39.95 + i * .03), 1.6); r.g.scale.setScalar(Math.max(1e-4, k)); const vi = VAR.indexOf(i), on = vi >= 0 && t > 40.05 + vi * .18; r.v.visible = on; r.n.visible = !on; });
  marks.forEach((g, i) => { const t0 = 52.7 + i * .03, a = i * .84 + (i % 2) * Math.PI, y = HY0 + .01 + (i / NM) * (NR - 2) * HDY;
    const dis = t > 55.6 ? spring(t - 55.6 - (i % 5) * .05, 6, .3) : 0, R = mulberry(i * 7 + 3), dx = (R() - .5) * .07 * dis, dy = (R() - .5) * .05 * dis, dz = (R() - .5) * .07 * dis;
    g.visible = t > t0; const k = t > t0 ? spring(t - t0, 8, .4) : 0; g.position.set(Math.cos(a) * HR * 1.5 + dx, y + (1 - k) * .08 + dy, -Math.sin(a) * HR * 1.5 + dz); g.rotation.y = -helix.rotation.y; });
}
function renderFrame(t) {
  update(t);
  const C = camAt(t); post.dof.focus = C.focus; post.dof.aper = C.aper; post.dof.maxCoc = 10;
  post.vig.uniforms.warm.value = .12; post.bloom.strength = .08;
  scene.updateMatrixWorld(true); post.composer.render();
  OX.clearRect(0, 0, W, H);
  drawSigns(OX, t); drawCounter(OX, t); drawAct(OX, t);
  bubble(OX, t, 21.8, 23.5, 'Un regalo para el gobernador', toScreen(govTort.g, [0, .01, 0]));
  bubble(OX, t, 75.6, 78.9, '«Quizá Jonathan es muy bueno siendo viejo»', toScreen(magn.g, [0, .05, 0]));
  if (t < 87.3) drawSubs(OX, t);
}
window.renderFrame = renderFrame; window.DUR = DUR;
renderFrame(0); window.READY = true;
// cover (portada): the meadow spread with the tortoise, two cardboard stickers on top
window.renderCover = () => {
  update(12.0); for (const r of L) if (r.sway === .08) r.g.visible = false; cam.position.set(.03, .09, .47); tgtV.set(.015, .056, .14); cam.fov = 34; cam.up.set(0, 1, 0); cam.lookAt(tgtV); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  post.dof.focus = cam.position.distanceTo(tgtV); post.dof.aper = 2; post.bloom.strength = .08; scene.updateMatrixWorld(true); post.composer.render();
  OX.clearRect(0, 0, W, H);
  const st = (txt, y, rot, bg, size) => { OX.save(); OX.translate(W / 2, y); OX.rotate(rot); OX.font = `${size}px "Lilita One"`; const w = OX.measureText(txt).width + 90, h = size * 1.3;
    OX.fillStyle = 'rgba(40,25,15,.3)'; OX.beginPath(); OX.roundRect(-w / 2 + 12, -h / 2 + 16, w, h, 30); OX.fill(); OX.fillStyle = '#fffaf0'; OX.beginPath(); OX.roundRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 36); OX.fill();
    OX.fillStyle = bg; OX.beginPath(); OX.roundRect(-w / 2, -h / 2, w, h, 26); OX.fill(); OX.lineWidth = 8; OX.strokeStyle = INK; OX.stroke();
    OX.textAlign = 'center'; OX.textBaseline = 'middle'; OX.lineJoin = 'round'; OX.lineWidth = 16; OX.strokeStyle = INK; OX.strokeText(txt, 0, size * .06); OX.fillStyle = '#fffaf0'; OX.fillText(txt, 0, size * .06); OX.restore(); };
  st('194 AÑOS', 300, -.04, '#d8423a', 170); st('Y VIVA', 520, .035, '#ffb52e', 160);
};

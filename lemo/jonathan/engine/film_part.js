// ================================================================ Jonathan — the film (world, views, overlays, render)
// Audio is fixed (/home/claude/short41/mix.wav); every time below lands on its cue map.
const TL = {
  cuts: [9.6, 16.1, 24.8, 28.6, 39.2, 49.9, 63.5, 67.1, 79.1, 84.1],
  end: 90.8, logo: 87.15,
};
// ids: 0 sky · 1 hills · 2 ground · 3 grass · 4 topsoil · 5 subsoil · 6 bedrock · 7 shell · 8 skin · 9 trunks · 10 foliage
//      11 egg · 12 ocean · 13 land · 15 cells · 16 nuclei · 17 swab · 18 bacteria · 19 DNA backbone · 20 rungs · 21 variant rungs
//      22 methyl marks · 23 chromosome · 24 telomere caps · 25 mito membrane · 26 mito inside · 27 mito marks · 28 backdrop · 29 stones
const COL = {
  grass: [0.55, 0.67, 0.27], grass2: [0.37, 0.54, 0.23], hills: [0.48, 0.62, 0.40], top: [0.40, 0.25, 0.16], sub: [0.74, 0.46, 0.23], bed: [0.56, 0.60, 0.66],
  shell: [0.47, 0.36, 0.22], skin: [0.42, 0.39, 0.33], trunk: [0.42, 0.33, 0.25], leaf: [0.37, 0.54, 0.23], egg: [0.93, 0.90, 0.80],
  ocean: [0.64, 0.79, 0.86], land: [0.80, 0.70, 0.50], cell: [0.93, 0.78, 0.72], nuc: [0.70, 0.52, 0.58], swab: [0.96, 0.95, 0.90],
  red: [0.80, 0.33, 0.27], bb: [0.62, 0.66, 0.74], r1: [0.84, 0.76, 0.62], r2: [0.66, 0.72, 0.56], amber: [0.93, 0.62, 0.20], mark: [0.24, 0.18, 0.15],
  chrom: [0.66, 0.60, 0.74], cobalt: [0.33, 0.55, 0.78], mitoIn: [0.93, 0.85, 0.72], back: [0.97, 0.93, 0.86], stone: [0.62, 0.60, 0.58],
};
function addB(b, id, kind, opts = {}) { const m = mat({ id, kind, color: [1, 1, 1], ...opts }); const o = add(b.geo(), m); o.userData.id = id; return o; }
const rngW = mulberry(7);

// ---------------------------------------------------------------- the plate: Saint Helena slope, cut face, Jonathan
const PLATE = {};
{
  // ground surface (slight undulation), ends at the cut face z = 0
  const g = new THREE.PlaneGeometry(60, 70, 120, 70); g.rotateX(-Math.PI / 2); g.translate(0, 0, -35);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, z < -1 ? 0.25 * fbm1(x * 0.08 + z * 0.05, 3) * Math.min(1, -z / 10) + Math.max(0, -z - 12) * 0.06 : 0); }
  g.computeVertexNormals();
  const b = new Builder(); append(b, g, new THREE.Matrix4(), (q) => COL.grass.map(v => v * (0.9 + 0.2 * h2(q.x * 0.3, q.z * 0.3))), V(1, 0, 0));
  addB(b, 2, 4, { angle: 0.25 });
  // far hills
  const bh = new Builder();
  [[-18, -40, 14, 7], [4, -48, 18, 9], [22, -42, 12, 6], [-6, -60, 22, 12]].forEach(([x, z, r, h]) => {
    const s = new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2); append(bh, s, new THREE.Matrix4().compose(V(x, -0.2, z), new THREE.Quaternion(), V(r, h, r * 0.6)), () => COL.hills, V(1, 0, 0));
  });
  addB(bh, 1, 4, { angle: 0.5, outline: 0.6 });
  // cut face: three horizons + bedrock, the front of the block at z = 0
  const bands = [[0, -0.45, 4, COL.top], [-0.45, -1.7, 5, COL.sub], [-1.7, -4.5, 6, COL.bed]];
  bands.forEach(([y0, y1, id, c], k) => {
    const bb = new Builder(); const NX = 160, x0 = -16, x1 = 16;
    const yt = x => k === 0 ? y0 : y0 + 0.12 * fbm1(x * 0.6, 20 + k);
    const yb = x => k === 2 ? y1 : y1 + 0.12 * fbm1(x * 0.6, 21 + k);
    for (let i = 0; i <= NX; i++) { const x = x0 + (x1 - x0) * i / NX; bb.v(V(x, yt(x), 0), V(0, 0, 1), c, V(1, 0, 0)); bb.v(V(x, yb(x), 0), V(0, 0, 1), c, V(1, 0, 0)); }
    for (let i = 0; i < NX; i++) { const a = i * 2; bb.i.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    addB(bb, id, 1, { angle: k === 2 ? 1.2 : 0.75 });
  });
  // stones half in the cut face
  const bs = new Builder(); const R = mulberry(31);
  for (let i = 0; i < 34; i++) { const x = -9 + R() * 18, y = -0.5 - R() * 3.6, r = 0.06 + R() * 0.16; const s = new THREE.IcosahedronGeometry(1, 2); append(bs, s, new THREE.Matrix4().compose(V(x, y, 0.0), new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 3, R() * 3, 0)), V(r * 1.3, r, r * 0.5)), () => COL.stone.map(v => v * (0.85 + 0.3 * R())), V(1, 0, 0)); }
  addB(bs, 29, 5, { dir: 2 });
  // grass blades near the edge (lean in the wind on twos)
  const bg = new Builder(); const RG = mulberry(11);
  for (let i = 0; i < 2600; i++) {
    const x = -7 + RG() * 14, z = -0.05 - Math.pow(RG(), 1.6) * 9; if (Math.abs(x) < 1.2 && z > -2.6 && z < -0.5) continue;
    const h = 0.08 + RG() * 0.22, w = 0.012 + RG() * 0.01, a = RG() * 6.28, lean = (RG() - 0.5) * 0.4;
    const c = RG() < 0.5 ? COL.grass : COL.grass2; const base = bg.vc; const dx = Math.cos(a) * w, dz = Math.sin(a) * w;
    bg.v(V(x - dx, 0, z - dz), V(0, 0, 1), c, V(0, 1, 0)); bg.v(V(x + dx, 0, z + dz), V(0, 0, 1), c, V(0, 1, 0)); bg.v(V(x + lean * h, h, z), V(0, 0, 1), c, V(0, 1, 0));
    bg.i.push(base, base + 1, base + 2);
  }
  const grass = addB(bg, 3, 0, { dir: 1, side: THREE.DoubleSide, wind: 1, outline: 0.5 });
  // a few gumwood-like trees on the slope behind
  const bt = new Builder(), bf = new Builder(); const RT = mulberry(5);
  [[-4.2, -9, 1.0], [5.2, -12, 1.2], [-8, -16, 1.3], [9, -20, 1.4], [2, -26, 1.6]].forEach(([x, z, s]) => {
    const pts = [V(x, 0, z), V(x + 0.1 * s, 1.2 * s, z), V(x - 0.15 * s, 2.0 * s, z), V(x + 0.05 * s, 2.6 * s, z)];
    tube(bt, pts, [0.16 * s, 0.12 * s, 0.09 * s, 0.06 * s], 8, () => COL.trunk);
    for (let k = 0; k < 6; k++) { const sp = new THREE.IcosahedronGeometry(1, 2); append(bf, sp, new THREE.Matrix4().compose(V(x + (RT() - 0.5) * 1.6 * s, (2.5 + RT() * 0.8) * s, z + (RT() - 0.5) * 0.8), new THREE.Quaternion(), V(0.75 * s, 0.5 * s, 0.6 * s)), () => COL.leaf, V(1, 0, 0)); }
  });
  addB(bt, 9, 2, { dir: 1 }); addB(bf, 10, 3, { dir: 2 });
  PLATE.grass = grass;
}
// ---------------------------------------------------------------- Jonathan (side view, facing +x); head on its own group so it can lift
function buildTortoise(rev0, sweep) {
  const G = new THREE.Group();
  const rv = (p) => rev0 + sweep * clamp((p.x + 1.0) / 2.4, 0, 1);
  const shellB = new Builder();
  const sg = new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) { const y = sp.getY(i), x = sp.getX(i); sp.setY(i, y * (1 + 0.12 * x * x) - 0.08 * Math.max(0, x) * y); }
  sg.computeVertexNormals();
  const shM = new THREE.Matrix4().compose(V(0, 0.42, 0), new THREE.Quaternion(), V(0.74, 0.6, 0.55));
  { const g = sg.toNonIndexed(), pa = g.attributes.position, na = g.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(shM), base = shellB.vc;
    for (let i = 0; i < pa.count; i++) { const p = V(pa.getX(i), pa.getY(i), pa.getZ(i)).applyMatrix4(shM), n = V(na.getX(i), na.getY(i), na.getZ(i)).applyMatrix3(nm).normalize(); shellB.v(p, n, COL.shell, V(1, 0, 0), 1, rv(p)); shellB.i.push(base + i); } }
  // marginal rim
  const rim = []; const rr = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; rim.push(V(Math.cos(a) * 0.76, 0.43 + 0.03 * Math.cos(a), Math.sin(a) * 0.57)); rr.push(0.045); }
  tube(shellB, rim, rr, 8, () => COL.shell.map(v => v * 0.8), null, null, (i) => rv(rim[i]));
  addB(shellB, 7, 7, { dir: 2, angle: 0.6 });
  const skinB = new Builder();
  // plastron
  { const s = new THREE.SphereGeometry(1, 32, 12); const m = new THREE.Matrix4().compose(V(0, 0.4, 0), new THREE.Quaternion(), V(0.7, 0.1, 0.52)); const g = s.toNonIndexed(), pa = g.attributes.position, na = g.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(m), base = skinB.vc;
    for (let i = 0; i < pa.count; i++) { const p = V(pa.getX(i), pa.getY(i), pa.getZ(i)).applyMatrix4(m), n = V(na.getX(i), na.getY(i), na.getZ(i)).applyMatrix3(nm).normalize(); skinB.v(p, n, COL.shell.map(v => v * 0.85), V(1, 0, 0), 1, rv(p)); skinB.i.push(base + i); } }
  // legs: elephantine columns with feet
  [[0.46, 0.34], [-0.46, 0.34], [0.46, -0.34], [-0.46, -0.34]].forEach(([x, z]) => {
    const pts = [V(x, 0.42, z * 0.85), V(x + 0.04 * Math.sign(x), 0.22, z), V(x + 0.06 * Math.sign(x), 0.03, z * 1.05)];
    tube(skinB, pts, [0.13, 0.12, 0.13], 12, () => COL.skin, (i, a) => 1 + 0.08 * Math.sin(a * 5 + i), null, () => rv(pts[0]));
  });
  // tail
  tube(skinB, [V(-0.72, 0.36, 0), V(-0.84, 0.3, 0), V(-0.9, 0.26, 0)], [0.05, 0.035, 0.01], 8, () => COL.skin, null, null, () => rv(V(-0.8, 0, 0)));
  addB(skinB, 8, 8, { dir: 1 });
  G.add(...scene.children.splice(scene.children.length - 2, 2));
  // neck + head pivot at the shell front
  const head = new THREE.Group(); head.position.set(0.66, 0.46, 0); G.add(head);
  const hb = new Builder();
  const npts = [V(0, 0, 0), V(0.16, 0.06, 0), V(0.3, 0.16, 0), V(0.4, 0.2, 0)];
  tube(hb, npts, [0.12, 0.1, 0.09, 0.085], 14, () => COL.skin, (i, a) => 1 + 0.06 * Math.sin(a * 7 + i * 2), null, (i) => rv(V(0.8 + i * 0.1, 0, 0)));
  { const s = new THREE.SphereGeometry(1, 32, 20); const m = new THREE.Matrix4().compose(V(0.48, 0.22, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.15)), V(0.17, 0.11, 0.105)); const g = s.toNonIndexed(), pa = g.attributes.position, na = g.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(m), base = hb.vc;
    for (let i = 0; i < pa.count; i++) { const p = V(pa.getX(i), pa.getY(i), pa.getZ(i)).applyMatrix4(m), n = V(na.getX(i), na.getY(i), na.getZ(i)).applyMatrix3(nm).normalize(); hb.v(p, n, COL.skin, V(1, 0, 0), 1, rv(V(1.2, 0, 0))); hb.i.push(base + i); } }
  addB(hb, 8, 8, { dir: 1 });
  const eb = new Builder(); { const s = new THREE.SphereGeometry(0.018, 10, 8); append(eb, s, new THREE.Matrix4().makeTranslation(0.56, 0.26, 0.085), () => [0.1, 0.08, 0.07], V(1, 0, 0)); }
  addB(eb, 22, 0, {});
  head.add(...scene.children.splice(scene.children.length - 2, 2));
  scene.add(G); G.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  return { G, head };
}
const JON = buildTortoise(0.05, 1.5); JON.G.position.set(-0.45, 0, -1.4); JON.G.scale.setScalar(1.15); JON.G.rotation.y = -0.45;
// the egg (magnifier inset in S2): a patch of ground at x = 100
const EGG = {};
{
  const g = new THREE.PlaneGeometry(6, 6, 30, 30); g.rotateX(-Math.PI / 2); const b = new Builder(); append(b, g, new THREE.Matrix4().makeTranslation(100, 0, -1), () => COL.grass2, V(1, 0, 0)); addB(b, 2, 4, { angle: 0.25 });
  const be = new Builder(); const s = new THREE.SphereGeometry(1, 40, 28); const sp = s.attributes.position; for (let i = 0; i < sp.count; i++) { const y = sp.getY(i); sp.setX(i, sp.getX(i) * (1 - 0.12 * y)); sp.setZ(i, sp.getZ(i) * (1 - 0.12 * y)); } s.computeVertexNormals();
  append(be, s, new THREE.Matrix4().compose(V(100, 0.21, -1), new THREE.Quaternion(), V(0.2, 0.24, 0.2)), () => COL.egg, V(0, 1, 0)); addB(be, 11, 0, { dir: 2 });
  const bg = new Builder(); const RG = mulberry(19);
  for (let i = 0; i < 500; i++) { const x = 97 + RG() * 6, z = -RG() * 4; if (Math.hypot(x - 100, z + 1) < 0.35) continue; const h = 0.06 + RG() * 0.12, w = 0.008; const base = bg.vc; const c = RG() < 0.5 ? COL.grass : COL.grass2; bg.v(V(x - w, 0, z), V(0, 0, 1), c, V(0, 1, 0)); bg.v(V(x + w, 0, z), V(0, 0, 1), c, V(0, 1, 0)); bg.v(V(x + (RG() - 0.5) * 0.05, h, z), V(0, 0, 1), c, V(0, 1, 0)); bg.i.push(base, base + 1, base + 2); }
  addB(bg, 3, 0, { dir: 1, side: THREE.DoubleSide, wind: 1, outline: 0.5 });
  EGG.p = V(100, 0.21, -1);
}
// ---------------------------------------------------------------- the map wall at y = 200 (lon/lat → x/y, 0.1 unit a degree): coastlines only
const MAP = { o: V(-2.2, 200, 0), s: 0.1 };
const LL = (lon, lat, z = 0.16) => V(MAP.o.x + lon * MAP.s, MAP.o.y + lat * MAP.s, z);
{
  const AFR = [[-17.1, 14.7], [-16.7, 12.4], [-15, 10.9], [-13.2, 8.5], [-11, 6.7], [-7.5, 4.4], [-4, 5.2], [1, 6], [4.4, 6.4], [8.5, 4.6], [9.6, 2.5], [9.4, -1], [11.8, -5], [12.3, -8.5], [13.8, -12], [11.8, -16.5], [14.4, -22.5], [16.5, -28.6], [18.4, -33.9], [20, -34.8], [25.6, -34], [30.5, -31], [32.6, -26.5], [35.5, -24], [35.3, -19.9], [40.5, -15], [40.4, -10.3], [39.3, -7], [39.5, -4.5], [41.6, -1.7], [44, 1.8], [48, 5], [51.2, 11.8], [48.5, 11.2], [43.4, 11.6], [42.6, 14.5], [39.5, 15.5], [37.2, 21], [35.6, 23.9], [33.6, 27.8], [32.3, 31.2], [29.5, 30.9], [25, 31.8], [20, 30.9], [19.8, 32.6], [15.2, 32.3], [10.3, 33.8], [10.6, 37], [7.8, 36.9], [3.2, 36.8], [-1.8, 35.2], [-5.9, 35.8], [-9.8, 32], [-9.7, 29.9], [-13, 27.6], [-14.9, 23], [-17, 21.3], [-16.5, 19.5], [-16.3, 16.5]];
  const MAD = [[49.3, -12], [50.4, -15.3], [50.2, -17.6], [48.7, -20.4], [47.1, -24.8], [45.2, -25.6], [43.6, -23.5], [43.3, -21.7], [44.4, -19.5], [44, -17], [46.3, -15.7], [47.9, -14.4]];
  const AR = [[43.4, 12.7], [45, 12.9], [48.7, 14], [52.2, 15.6], [55.4, 17.6], [57.8, 19], [59.8, 22.4], [56.5, 24.5], [56, 26.5], [52, 24], [50.5, 26.5], [48.5, 28.5], [48, 30], [43, 30], [36, 29.5], [34.9, 29.4], [38.5, 22], [40.8, 18.5], [42.7, 15.6]];
  const land = new Builder();
  for (const poly of [AFR, MAD, AR]) {
    const sh = new THREE.Shape(poly.map(([a, b]) => new THREE.Vector2(a * MAP.s, b * MAP.s)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 4 });
    append(land, g, new THREE.Matrix4().makeTranslation(MAP.o.x, MAP.o.y, 0), (p) => COL.land.map((v, i) => v * (0.88 + 0.24 * h2(p.x * 2.3, p.y * 2.3)) * (i === 1 ? 1 : 1)), V(1, 1, 0));
  }
  for (const [lon, lat, r] of [[-5.7, -15.95, 0.05], [55.5, -4.6, 0.035], [55.7, -4.3, 0.02], [55.3, -4.9, 0.02]]) { const g = new THREE.CylinderGeometry(r, r * 1.2, 0.16, 12); g.rotateX(Math.PI / 2); append(land, g, new THREE.Matrix4().makeTranslation(LL(lon, lat).x, LL(lon, lat).y, 0.08), () => COL.land, V(1, 0, 0)); }
  addB(land, 13, 4, { angle: 0.9 });
  const sea = new Builder(); const g = new THREE.PlaneGeometry(14, 14, 40, 40); append(sea, g, new THREE.Matrix4().makeTranslation(MAP.o.x + 2.0, MAP.o.y - 0.3, 0), () => COL.ocean, V(1, 0, 0)); addB(sea, 12, 0, { angle: 0.2, outline: 0 });
}
// ---------------------------------------------------------------- the micro world at y = -300: cheek cells, swab, bacteria
const MIC = { o: V(0, -300, 0) };
{
  const bk = new Builder(); const g = new THREE.PlaneGeometry(40, 60); append(bk, g, new THREE.Matrix4().makeTranslation(0, -300, -1.2), () => COL.back, V(1, 0, 0)); addB(bk, 28, 0, { angle: 0.4, outline: 0 });
  const bc = new Builder(), bn = new Builder(); const R = mulberry(41);
  for (let j = -6; j <= 6; j++) for (let i = -4; i <= 4; i++) {
    const x = i * 1.25 + (j % 2) * 0.62 + (R() - 0.5) * 0.3, y = -300 + j * 1.05 + (R() - 0.5) * 0.25;
    const s = new THREE.CylinderGeometry(1, 1, 1, 7, 1); s.rotateX(Math.PI / 2);
    const sp = s.attributes.position; for (let k = 0; k < sp.count; k++) { const a = Math.atan2(sp.getY(k), sp.getX(k)); const f = 1 + 0.12 * Math.sin(a * 3 + i + j); sp.setX(k, sp.getX(k) * f); sp.setY(k, sp.getY(k) * f); } s.computeVertexNormals();
    append(bc, s, new THREE.Matrix4().compose(V(x, y, -0.4), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, R() * 3)), V(0.62, 0.55, 0.12)), () => COL.cell.map(v => v * (0.94 + 0.1 * R())), V(1, 0, 0));
    const n = new THREE.SphereGeometry(1, 20, 14); append(bn, n, new THREE.Matrix4().compose(V(x + (R() - 0.5) * 0.2, y + (R() - 0.5) * 0.2, -0.3), new THREE.Quaternion(), V(0.15, 0.13, 0.08)), () => COL.nuc, V(1, 0, 0));
  }
  addB(bc, 15, 0, { dir: 2, angle: 0.5 }); addB(bn, 16, 0, { dir: 2 });
  // swab: stick + cotton head (moves across the cells 33.9–35.5)
  const sw = new Builder();
  tube(sw, [V(0, 0, 0), V(0, 4, 0)], [0.05, 0.05], 10, () => COL.swab);
  { const s = new THREE.SphereGeometry(1, 24, 16); append(sw, s, new THREE.Matrix4().compose(V(0, -0.15, 0), new THREE.Quaternion(), V(0.16, 0.3, 0.16)), () => COL.swab, V(0, 1, 0)); }
  MIC.swab = addB(sw, 17, 0, { dir: 1 });
  // bacteria (red accent): drawn in from 37.8
  const ba = new Builder(); const RB = mulberry(77);
  for (let k = 0; k < 16; k++) { const c = new THREE.CapsuleGeometry(0.07, 0.26, 6, 12); const x = (RB() - 0.5) * 4.4, y = -300 + (RB() - 0.3) * 6.0; const rv = 37.8 + k * 0.07;
    const g2 = c.toNonIndexed(), m = new THREE.Matrix4().compose(V(x, y, -0.1), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, RB() * 6.28)), V(1, 1, 1)), pa = g2.attributes.position, na = g2.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(m), base = ba.vc;
    for (let i = 0; i < pa.count; i++) { const p = V(pa.getX(i), pa.getY(i), pa.getZ(i)).applyMatrix4(m), n = V(na.getX(i), na.getY(i), na.getZ(i)).applyMatrix3(nm).normalize(); ba.v(p, n, COL.red, V(1, 0, 0), 1, rv); ba.i.push(base + i); } }
  addB(ba, 18, 0, { dir: 2, disc: 1 });
}
// ---------------------------------------------------------------- the helix at y = -600 (vertical), the chromosome at x = 30, the mitochondrion at x = 60
const HX = { o: V(0, -600, 0), R: 0.9, L: 14, turns: 3.3, N: 46 };
const hxP = (u, ph) => V(HX.o.x + Math.cos(u * HX.turns * Math.PI * 2 + ph) * HX.R, HX.o.y + (u - 0.5) * HX.L, HX.o.z + Math.sin(u * HX.turns * Math.PI * 2 + ph) * HX.R);
{
  const bk = new Builder(); for (const x of [0, 30, 60]) append(bk, new THREE.PlaneGeometry(30, 40), new THREE.Matrix4().makeTranslation(x, -600, -3), () => COL.back, V(1, 0, 0)); addB(bk, 28, 0, { angle: 0.4, outline: 0 });
  const bb = new Builder();
  for (const ph of [0, Math.PI]) { const P = [], R = []; for (let i = 0; i <= 240; i++) { P.push(hxP(i / 240, ph)); R.push(0.11); } tube(bb, P, R, 10, () => COL.bb); }
  addB(bb, 19, 0, { dir: 1 });
  const r1 = new Builder(), r2 = new Builder(); HX.var = [];
  const RV = mulberry(9);
  for (let i = 0; i < HX.N; i++) {
    const u = (i + 0.5) / HX.N, a = hxP(u, 0), c = hxP(u, Math.PI); const isVar = RV() < 0.33;
    const m = a.clone().lerp(c, 0.5);
    if (isVar) { HX.var.push(i); tube(r2, [a.clone().lerp(c, 0.06), m, c.clone().lerp(a, 0.06)], [0.085, 0.085, 0.085], 8, () => COL.amber, null, null, () => 40.0 + HX.var.length * 0.11); }
    else { tube(r1, [a.clone().lerp(c, 0.06), m], [0.06, 0.06], 8, () => COL.r1); tube(r1, [m, c.clone().lerp(a, 0.06)], [0.06, 0.06], 8, () => COL.r2); }
  }
  addB(r1, 20, 0, { dir: 1 }); addB(r2, 21, 0, { dir: 1, disc: 1 });
  // methyl marks: small graphite beads on the backbones (positions set per frame: ordered → scattered)
  HX.marks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 12, 8), mat({ id: 22, kind: 0, color: COL.mark, dir: 2 }), 64); HX.marks.frustumCulled = false;
  { const geo = HX.marks.geometry; const n = geo.attributes.position.count; const ones = (k, v) => new THREE.Float32BufferAttribute(new Array(n * k).fill(v), k);
    geo.setAttribute('acol', ones(3, 1)); geo.setAttribute('atan', new THREE.Float32BufferAttribute(new Array(n).fill([1, 0, 0]).flat(), 3)); geo.setAttribute('aao', ones(1, 1)); geo.setAttribute('arev', ones(1, -100)); }
  scene.add(HX.marks);
  // chromosome X with amber telomere caps
  const ch = new Builder(), cp = new Builder(); const C0 = V(30, -600, 0);
  for (const s of [-1, 1]) {
    const P = [], R = []; for (let i = 0; i <= 40; i++) { const u = i / 40 - 0.5; P.push(V(C0.x + u * 2.2 * s + 0.15 * Math.sin(u * 3), C0.y + u * 5.2, C0.z)); R.push(0.42 * (1 - 0.35 * Math.exp(-u * u / 0.012)) * (1 - 0.15 * Math.abs(u))); }
    tube(ch, P, R, 20, () => COL.chrom, (i, a) => 1 + 0.05 * Math.sin(i * 1.3 + a * 4));
    for (const e of [P[0], P[40]]) { const g = new THREE.SphereGeometry(0.4, 20, 14); append(cp, g, new THREE.Matrix4().compose(e, new THREE.Quaternion(), V(1, 0.6, 1)), () => COL.amber, V(1, 0, 0)); }
  }
  HX.chromC = C0; HX.caps = [[-1.1, -2.6], [1.1, 2.6], [1.1, -2.6], [-1.1, 2.6]].map(([x, y]) => V(C0.x + x, C0.y + y, 0));
  addB(ch, 23, 0, { dir: 1 }); const capB = new Builder(); for (const c of HX.caps) { const g = new THREE.SphereGeometry(0.42, 20, 14); const g2 = g.toNonIndexed(), pa = g2.attributes.position, na = g2.attributes.normal, base = capB.vc; for (let i = 0; i < pa.count; i++) { capB.v(V(pa.getX(i) + c.x, pa.getY(i) * 0.6 + c.y, pa.getZ(i)), V(na.getX(i), na.getY(i), na.getZ(i)), COL.amber, V(1, 0, 0), 1, 47.3); capB.i.push(base + i); } }
  addB(capB, 24, 0, { dir: 2, disc: 1 });
  // mitochondrion cut open: the back half of the capsule (membrane), its flat cut face, folded cristae, ordered marks
  const M0 = V(60, -600, 0); HX.mitoC = M0;
  const mb = new Builder(), mi = new Builder();
  { const P = [], R = []; for (let i = 0; i <= 60; i++) { const u = i / 60; P.push(V(M0.x, M0.y - 3 + u * 6, M0.z)); R.push(1.45 * Math.sqrt(Math.max(0.0, 1 - Math.pow(2 * u - 1, 6)))); }
    // only the back half (angles facing away from the camera) + the rim
    const n = P.length, sides = 28, base = mb.vc;
    for (let i = 0; i < n; i++) for (let k = 0; k <= sides; k++) { const a = Math.PI + k / sides * Math.PI; const d = V(Math.cos(a), 0, Math.sin(a)); mb.v(P[i].clone().add(d.clone().multiplyScalar(R[i])), d.clone().multiplyScalar(-1), COL.cobalt, V(0, 1, 0)); }
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < sides; k++) { const a = base + i * (sides + 1) + k, b2 = a + 1, c = a + sides + 1, d = c + 1; mb.i.push(a, b2, c, b2, d, c); }
    const rimP = [], rimR = []; for (let i = 0; i <= 60; i++) rimP.push(V(M0.x - R[i], P[i].y, 0)); for (let i = 60; i >= 0; i--) rimP.push(V(M0.x + R[i], P[i].y, 0)); rimP.push(rimP[0].clone()); rimP.forEach(() => rimR.push(0.09)); tube(mb, rimP, rimR, 8, () => COL.cobalt);
  }
  addB(mb, 25, 0, { dir: 1, side: THREE.DoubleSide });
  { // inner membrane back plane + cristae folds
    const g = new THREE.PlaneGeometry(2.4, 5.4, 10, 20); append(mi, g, new THREE.Matrix4().makeTranslation(M0.x, M0.y, -0.9), () => COL.mitoIn, V(0, 1, 0));
    HX.cristae = [];
    for (let k = 0; k < 7; k++) { const y = M0.y - 2.4 + k * 0.8; const P = [], R = []; for (let i = 0; i <= 20; i++) { const u = i / 20; const x = M0.x - 1.15 + u * (1.4 + 0.2 * (k % 2)) * (k % 2 ? -1 : 1) + (k % 2 ? 2.3 : 0); P.push(V(x, y + 0.12 * Math.sin(u * 9), -0.5)); R.push(0.11); } tube(mi, P, R, 10, () => COL.mitoIn.map(v => v * 0.8)); HX.cristae.push(P); }
  }
  addB(mi, 26, 0, { dir: 1 });
  HX.mmarks = []; HX.cristae.forEach((P, k) => { for (let i = 2; i < P.length - 1; i += 3) HX.mmarks.push(P[i].clone().add(V(0, 0.17, 0.12))); });
  const mm = new Builder(); for (const p of HX.mmarks) { const g = new THREE.SphereGeometry(0.075, 10, 8); append(mm, g, new THREE.Matrix4().makeTranslation(p.x, p.y, p.z), () => COL.mark, V(1, 0, 0)); }
  addB(mm, 27, 0, { dir: 2 });
}
// marks: ordered beads along both backbones, or scattered away (dis 0..1), per frame
const MK = []; { const R = mulberry(23); for (let k = 0; k < 64; k++) MK.push({ u: (k + 0.5) / 64, ph: k % 2 ? Math.PI : 0, j: V(R() - 0.5, R() - 0.5, R() - 0.5), gone: R() }); }
function setMarks(dis, vis = 1) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  MK.forEach((k, i) => { const p = hxP(k.u, k.ph); const out = V(p.x - HX.o.x, 0, p.z - HX.o.z).normalize().multiplyScalar(0.16); p.add(out).add(k.j.clone().multiplyScalar(2.6 * dis)); const s = vis * (dis > 0.3 && k.gone < dis * 0.35 ? 0 : 1); m.compose(p, q, V(s, s, s)); HX.marks.setMatrixAt(i, m); });
  HX.marks.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------- cameras & views
const camera = new THREE.PerspectiveCamera(46, W / H, 0.02, 400);
const refCam = new THREE.PerspectiveCamera(46, W / H, 0.02, 400);
const QPLATE = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.05, 0, 0, 'YXZ'));
const QFLAT = new THREE.Quaternion();
const ease5 = k => k * k * k * (k * (k * 6 - 15) + 10);
const keys = (K, t) => {
  if (t <= K[0][0]) return V(K[0][1], K[0][2], K[0][3]);
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const a = K[i - 1], b = K[i]; const u = ease5(clamp((t - a[0]) / (b[0] - a[0]), 0, 1)); return V(lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)); }
  const L = K[K.length - 1]; return V(L[1], L[2], L[3]);
};
const PLATE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 29, 22];
const MICRO_IDS = [15, 16, 17, 18, 28];
const HELIX_IDS = [19, 20, 21, 22, 28];
const CHROM_IDS = [23, 24, 28];
const MITO_IDS = [25, 26, 27, 28];
const ALL = Array.from({ length: 32 }, (_, i) => i);
const only = ids => ALL.filter(i => !ids.includes(i));
// shot cameras
const K1 = [[0, -0.05, 1.35, 3.7], [9.6, -0.2, 1.3, 3.35]];
const K2 = [[9.6, 0.55, 1.15, 2.3], [16.1, 0.7, 1.1, 1.9]];
const K3 = [[16.1, MAP.o.x + 2.6, MAP.o.y - 0.7, 16.0], [24.8, MAP.o.x + 2.3, MAP.o.y - 0.9, 15.2]];
const K4 = [[24.8, 0.45, 0.75, 2.0], [28.6, 0.5, 0.9, 1.7]];
const K9 = [[67.1, 0.3, 1.3, 3.4], [79.1, 0.0, 1.45, 4.3]];
const K10 = [[79.1, 0.0, 1.45, 4.3], [84.1, 0.0, 1.9, 5.6]];
const K11 = [[84.1, 0.0, 1.9, 5.6], [90.8, 0.0, 3.8, 6.4]];
const VP = (pos, ref, ids, extra = {}) => ({ pos, ref, q: QPLATE, hide: only(ids), focus: {}, ...extra });
const VF = (pos, ref, ids, extra = {}) => ({ pos, ref, q: QFLAT, hide: only(ids), focus: {}, ...extra });
function camAt(target, cx, cy, D, q) { const ty = Math.tan(23 * Math.PI / 180), tx = ty * W / H; const nx = (cx / W) * 2 - 1, ny = 1 - (cy / H) * 2; const d = V(nx * tx * D, ny * ty * D, -D).applyQuaternion(q); return target.clone().sub(d); }
const redrawAt = (t0, k = 0.0009) => ({ t: t0, cx: W / 2, cy: H * 0.45, k });
const headCheek = () => JON.head.localToWorld(V(0.5, 0.18, 0.09));
function views(t) {
  const c = TL.cuts;
  if (t < c[0]) return { main: VP(keys(K1, t), V(0.15, 1.3, 3.4), PLATE_IDS) };
  if (t < c[1]) {
    const main = VP(keys(K2, t), V(0.6, 1.1, 2.1), PLATE_IDS, { redraw: redrawAt(c[0] - 0.05, 0.0006) });
    if (t < 12.7) return { main };
    // magnifier inset on the grass, lower right: the egg
    setCamera(main);
    const cx = 760, cy = 1180, ring = ease5(clamp((t - 12.7) / 0.4, 0, 1)), r = lerp(20, 250, ease5(clamp((t - 13.05) / 0.7, 0, 1)));
    const inset = VP(camAt(EGG.p, cx, cy, 3.6, QPLATE), V(100, 0.4, 0.3), [2, 3, 11], { redraw: { t: 13.05, cx, cy, k: 0.002 } });
    return { main, inset: t > 13.05 ? inset : null, iris: { cx, cy, r, inner: t > 13.05, ring, ringA: 1 } };
  }
  if (t < c[2]) return { main: VF(keys(K3, t), V(MAP.o.x + 1.6, MAP.o.y - 1.1, 14), [12, 13], { redraw: redrawAt(c[1] + 0.05, 0.0008) }) };
  if (t < c[3]) return { main: VP(keys(K4, t), V(0.45, 0.85, 1.8), PLATE_IDS, { redraw: redrawAt(c[2] - 0.05, 0.0007) }) };
  if (t < c[4]) {
    // magnifier from the cheek into the cells
    const close = VF(V(MIC.o.x + 0.2, MIC.o.y - 0.4, 5.2 - 0.6 * clamp((t - 29.6) / 9.6, 0, 1)), V(0, -300, 5.0), MICRO_IDS);
    if (t < 29.7) {
      const main = VP(keys(K4, t), V(0.45, 0.85, 1.8), PLATE_IDS); setCamera(main); const p = proj(headCheek());
      const k = ease5(clamp((t - 28.85) / 0.85, 0, 1)), r = lerp(60, 2300, k * k);
      close.redraw = { t: 28.85, cx: p[0], cy: p[1], k: 0.0008 };
      return { main, inset: t > 28.85 ? close : null, iris: { cx: p[0], cy: p[1], r, inner: t > 28.85, ring: ease5(clamp((t - 28.6) / 0.3, 0, 1)), ringA: 1 - ss((k - 0.5) / 0.4) } };
    }
    close.redraw = { t: 28.85, cx: W / 2, cy: H * 0.4, k: 0.0008 };
    return { main: close };
  }
  if (t < 47.0) {
    // a magnifier on one nucleus opens to the helix
    const helix = VF(V(HX.o.x, HX.o.y + lerp(0.6, -0.4, clamp((t - c[4]) / 8, 0, 1)), 12.5), V(0, -600, 12.5), HELIX_IDS, { redraw: { t: 39.25, cx: W / 2, cy: H * 0.45, k: 0.0009 } });
    if (t < 40.0) {
      const prev = VF(V(MIC.o.x + 0.2, MIC.o.y - 0.4, 4.6), V(0, -300, 5.0), MICRO_IDS); setCamera(prev); const p = proj(V(0.0, -300.0, -0.3));
      const k = ease5(clamp((t - c[4]) / 0.8, 0, 1)), r = lerp(40, 2300, k * k);
      return { main: prev, inset: helix, iris: { cx: p[0], cy: p[1], r, inner: true, ring: 1, ringA: 1 - ss((k - 0.5) / 0.4) } };
    }
    return { main: helix };
  }
  if (t < c[5]) return { main: VF(V(HX.chromC.x, HX.chromC.y - 0.3, lerp(13.5, 12.5, clamp((t - 47) / 3, 0, 1))), V(30, -600.3, 13), CHROM_IDS, { redraw: { t: 47.0, cx: W / 2, cy: H * 0.45, k: 0.0008 } }) };
  if (t < c[6]) {
    const helix = VF(V(HX.o.x, HX.o.y + lerp(1.5, 0.0, clamp((t - c[5]) / 10, 0, 1)), lerp(11.5, 13.5, clamp((t - c[5]) / 10, 0, 1))), V(0, -599.5, 12), HELIX_IDS, { redraw: { t: c[5] + 0.03, cx: W / 2, cy: H * 0.45, k: 0.0009 } });
    if (t < 59.4) return { main: helix };
    const mito = VF(V(HX.mitoC.x, HX.mitoC.y - 0.5, lerp(13, 11.5, clamp((t - 60.2) / 3.3, 0, 1))), V(60, -600.5, 12), MITO_IDS, { redraw: { t: 59.7, cx: W / 2, cy: H * 0.42, k: 0.0009 } });
    if (t < 60.4) { setCamera(helix); const p = proj(hxP(0.45, 0)); const k = ease5(clamp((t - 59.55) / 0.85, 0, 1)), r = lerp(50, 2300, k * k);
      return { main: helix, inset: t > 59.55 ? mito : null, iris: { cx: p[0], cy: p[1], r, inner: t > 59.55, ring: ease5(clamp((t - 59.4) / 0.25, 0, 1)), ringA: 1 - ss((k - 0.5) / 0.4) } }; }
    return { main: mito };
  }
  if (t < c[7]) return { main: VF(V(HX.mitoC.x + 0.1, HX.mitoC.y - 0.6, lerp(10.5, 9.0, clamp((t - c[6]) / 3.6, 0, 1))), V(60, -600.5, 10), MITO_IDS, { focus: {} }) };
  if (t < c[8]) {
    const wide = VP(keys(K9, t), V(0.15, 1.4, 3.8), PLATE_IDS);
    if (t < 68.3) { // the magnifier closes onto Jonathan's cheek
      setCamera(wide); const p = proj(headCheek());
      const k = ease5(clamp((t - c[7]) / 0.9, 0, 1)), r = lerp(2300, 50, Math.sqrt(k));
      const inner = t < c[7] + 0.9;
      const mito = VF(V(HX.mitoC.x + 0.1, HX.mitoC.y - 0.6, 9.0), V(60, -600.5, 10), MITO_IDS);
      return { main: wide, inset: inner ? mito : null, iris: { cx: p[0], cy: p[1], r, inner, ring: 1, ringA: inner ? ss((k - 0.3) / 0.4) : 1 - clamp((t - c[7] - 0.9) / 0.3, 0, 1) } };
    }
    return { main: wide };
  }
  if (t < c[9]) {
    const wide = VP(keys(K10, t), V(0.0, 1.7, 5.0), PLATE_IDS);
    if (t < 79.5) return { main: wide };
    setCamera(wide); const cx = 760, cy = 760, ring = ease5(clamp((t - 79.5) / 0.4, 0, 1)), r = lerp(20, 230, ease5(clamp((t - 79.9) / 0.6, 0, 1)));
    const helix = VF(camAt(HX.o.clone(), cx, cy, 14.0, QFLAT), V(0, -600, 7), HELIX_IDS, { redraw: { t: 79.9, cx, cy, k: 0.002 } });
    return { main: wide, inset: t > 79.9 ? helix : null, iris: { cx, cy, r, inner: t > 79.9, ring, ringA: 1 - clamp((t - 83.6) / 0.4, 0, 1) } };
  }
  return { main: VP(keys(K11, t), V(0.0, 2.8, 6.0), PLATE_IDS) };
}
function setCamera(v) {
  camera.position.copy(v.pos); camera.quaternion.copy(v.q || QPLATE); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
  refCam.position.copy(v.ref); refCam.quaternion.copy(v.q || QPLATE); refCam.updateMatrixWorld(); refCam.updateProjectionMatrix();
  SHARED.uRefVP.value.multiplyMatrices(refCam.projectionMatrix, refCam.matrixWorldInverse);
}
const proj = (v, cam = camera) => { const p = v.clone().project(cam); return [(p.x * 0.5 + 0.5) * W, (0.5 - p.y * 0.5) * H]; };

// ---------------------------------------------------------------- overlays: paper (tags, slips), graphite (writing), coloured pencil
const tagC = document.createElement('canvas'), inkC = document.createElement('canvas'), colC = document.createElement('canvas'), OC = document.createElement('canvas');
for (const c of [tagC, inkC, colC, OC]) { c.width = W; c.height = H; }
const tg = tagC.getContext('2d'), ik = inkC.getContext('2d'), cl = colC.getContext('2d'), octx = OC.getContext('2d');
const tagT = new THREE.CanvasTexture(tagC), inkT = new THREE.CanvasTexture(inkC), colT = new THREE.CanvasTexture(colC);
const FONT = 'KL';
let BOIL = 0;
const hsh = (a, b = 0, c = 0) => h2(a * 1.731 + c * 0.377, b * 2.113 + c * 1.913);
const plen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
const seg = (t, a, d) => clamp((t - a) / d, 0, 1);
// handwriting: each letter is written in turn (a ragged pencil front crosses it), small per-letter jitter
function textLayout(s, size, seed) {
  ik.save(); ik.font = `${size}px ${FONT}`; const ch = [...s], ws = ch.map(c => ik.measureText(c).width); ik.restore();
  const R = mulberry(seed), rr = () => R() * 2 - 1; let cx = 0; const chars = [];
  ch.forEach((c, i) => { chars.push({ c, ox: cx, w: ws[i], dy: rr() * size * 0.025, r: rr() * 0.035 }); cx += ws[i]; });
  return { s, size, chars, tot: cx };
}
function textDraw(c2, T, x, y, prog, alpha = 1, col = '#000') {
  if (prog <= 0) return; const n = T.chars.length, upto = prog * n;
  c2.save(); c2.translate(x, y); c2.globalAlpha = alpha; c2.font = `${T.size}px ${FONT}`; c2.fillStyle = col; c2.textBaseline = 'alphabetic';
  T.chars.forEach((C, i) => {
    if (i >= upto) return; const part = clamp(upto - i, 0, 1);
    c2.save(); c2.translate(C.ox, C.dy); c2.rotate(C.r);
    if (part < 1) { c2.beginPath(); c2.rect(-4, -T.size * 1.2, (C.w + 8) * part, T.size * 1.6); c2.clip(); }
    c2.fillText(C.c, 0, 0); c2.restore();
  });
  c2.restore();
}
function pline(c, pts, prog, w, seed, alpha = 1, col = '#000', dash = null) {
  if (prog <= 0 || pts.length < 2) return;
  const L = plen(pts);
  for (let pass = 0; pass < 2; pass++) {
    c.save(); c.globalAlpha = alpha * (pass ? 0.8 : 1); c.strokeStyle = col; c.lineWidth = w * (pass ? 0.65 : 1); c.lineCap = 'round'; c.lineJoin = 'round';
    if (dash) c.setLineDash(dash);
    c.beginPath(); let rem = prog * L;
    for (let i = 0; i < pts.length; i++) {
      const jx = (hsh(seed, i, pass) - 0.5) * 1.3 + (hsh(seed + 7, i, BOIL + 3 * pass) - 0.5) * 0.7;
      const jy = (hsh(seed + 3, i, pass) - 0.5) * 1.3 + (hsh(seed + 11, i, BOIL + 3 * pass) - 0.5) * 0.7;
      let [x, y] = pts[i];
      if (i) { const d = Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]); if (d > rem) { const u = rem / d; x = pts[i - 1][0] + (x - pts[i - 1][0]) * u; y = pts[i - 1][1] + (y - pts[i - 1][1]) * u; c.lineTo(x + jx, y + jy); break; } rem -= d; c.lineTo(x + jx, y + jy); }
      else c.moveTo(x + jx, y + jy);
    }
    c.stroke(); c.restore();
  }
}
const curve = (x0, y0, x1, y1, bend, n = 24) => { const pts = [], mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend; for (let i = 0; i <= n; i++) { const s = i / n, a = (1 - s) * (1 - s), b = 2 * s * (1 - s), c = s * s; pts.push([a * x0 + b * mx + c * x1, a * y0 + b * my + c * y1]); } return pts; };
const circ = (cx, cy, rx, ry, a0 = -Math.PI / 2, n = 48) => { const P = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
const LAB = [], TXT = [];
// a paper tag, one per shot: pencilled edge, capitals written in turn
function addTag({ id, s, at, t0, t1, size = 40, seed, col = '#000' }) {
  const T = textLayout(s, size, seed); const pad = 22, w = T.tot + pad * 2, h = size + 30, rot = (hsh(seed, 1) - 0.5) * 0.05;
  const tLine = t0 + 0.05, tTx = t0 + 0.15, dTx = 0.2 + s.length * 0.035;
  LAB.push({ id, draw(t) {
    if (t < t0 || t > t1) return null;
    const [ax, ay] = at(t); const x = clamp(ax - w / 2, 40, W - 40 - w), y = ay;
    const pop = seg(t, t0, 0.14) * (1 - seg(t, t1 - 0.25, 0.25)), sc = 0.9 + 0.1 * ease5(seg(t, t0, 0.14));
    for (const c of [tg, ik]) { c.save(); c.translate(x + w / 2, y); c.rotate(rot); c.scale(sc, sc); c.translate(-w / 2, 0); }
    tg.globalAlpha = pop; tg.fillStyle = '#fff'; tg.beginPath(); tg.roundRect(0, -h / 2, w, h, 6); tg.fill(); tg.globalAlpha = 1;
    pline(ik, [[0, -h / 2], [w, -h / 2 + 1], [w + 1, h / 2], [0, h / 2 - 1], [0, -h / 2]], seg(t, tLine, 0.28), 1.6, seed + 5, 0.7 * pop);
    textDraw(ik, T, pad, size * 0.36, seg(t, tTx, dTx), pop, col);
    ik.restore(); tg.restore();
    return { x0: x, y0: y - h / 2, x1: x + w, y1: y + h / 2, text: s };
  } });
}
function addLeader({ from, to, t0, t1, d = 0.3, bend = 0.25, seed }) {
  LAB.push({ draw(t) {
    if (t < t0 || t > t1) return null; const a = 1 - seg(t, t1 - 0.25, 0.25); const [x0, y0] = from(t), [x1, y1] = to(t);
    const pts = curve(x0, y0, x1, y1, bend), k = seg(t, t0, d);
    tg.save(); tg.globalAlpha = 0.55 * a; pline(tg, pts, k, 9, seed + 1); tg.restore(); pline(ik, pts, k, 2.8, seed, 0.9 * a);
    if (k >= 1) { const [ax, ay] = pts[pts.length - 4], an = Math.atan2(y1 - ay, x1 - ax), hl = seg(t, t0 + d, 0.08); pline(ik, [[x1 - Math.cos(an - 0.5) * 18, y1 - Math.sin(an - 0.5) * 18], [x1, y1], [x1 - Math.cos(an + 0.5) * 18, y1 - Math.sin(an + 0.5) * 18]], hl, 2.6, seed + 9, 0.9 * a); }
    return null;
  } });
}
// handwriting in the sky (titles, dates, the quote): written, held, then erased by fading
function addWrite({ id, s, x, y, t0, t1, size = 90, seed, d, under = false, col = '#000', align = 'left', alpha = 1, onCol = false }) {
  const T = textLayout(s, size, seed); const dd = d || 0.25 + s.length * 0.06;
  LAB.push({ id, draw(t) {
    if (t < t0 || t > t1) return null; const a = alpha * (1 - seg(t, t1 - 0.3, 0.3)); const xx = align === 'center' ? x - T.tot / 2 : align === 'right' ? x - T.tot : x;
    textDraw(onCol ? cl : ik, T, xx, y, seg(t, t0, dd), a, col);
    if (under) { ik.save(); ik.globalAlpha = 0.7 * a; pline(ik, curve(xx + 2, y + size * 0.28, xx + T.tot * 0.98, y + size * 0.24, -0.02), seg(t, t0 + dd, 0.35), 2.4, seed + 3); ik.restore(); }
    return { x0: xx, y0: y - size, x1: xx + T.tot, y1: y + size * 0.3, text: s };
  } });
}
// a sketch drawn in pencil lines (polylines in screen px), optionally crossed out
function addSketch({ paths, t0, t1, d = 0.5, seed, cross = null, w = 3 }) {
  LAB.push({ draw(t) {
    if (t < t0 || t > t1) return null; const a = 1 - seg(t, t1 - 0.3, 0.3); const total = paths.reduce((s, p) => s + plen(p), 0); let acc = 0; const k = seg(t, t0, d) * total;
    paths.forEach((p, i) => { const L = plen(p); pline(ik, p, clamp((k - acc) / L, 0, 1), w, seed + i * 13, 0.9 * a); acc += L; });
    if (cross) { const [x0, y0, x1, y1, tc] = cross; pline(cl, [[x0, y0], [x1, y1]], seg(t, tc, 0.18), 9, seed + 99, 0.85 * a, 'rgb(200,70,55)'); pline(cl, [[x1, y0], [x0, y1]], seg(t, tc + 0.12, 0.18), 9, seed + 98, 0.85 * a, 'rgb(200,70,55)'); }
    return null;
  } });
}
let SUBS = [];
function drawSubs(t) {
  for (const s of SUBS) {
    if (t < s.t0 || t > s.t1 + 0.2) continue;
    const a = seg(t, s.t0, 0.16) * (1 - seg(t, s.t1, 0.2)), wipe = ease5(seg(t, s.t0 + 0.04, 0.26));
    const x = 56, yb = H - 150;
    ik.save(); ik.font = `46px ${FONT}`; const wz = ik.measureText(s.text).width; ik.restore();
    const w = wz + 52, h = 86, y = yb - h;
    tg.save(); tg.globalAlpha = 0.93 * a; tg.fillStyle = '#fff'; tg.beginPath(); tg.moveTo(x, y + 4); tg.lineTo(x + w, y); tg.lineTo(x + w - 3, y + h); tg.lineTo(x + 3, y + h - 3); tg.closePath(); tg.fill(); tg.restore();
    pline(ik, [[x + 3, y + h - 3], [x + w - 3, y + h]], 1, 1.4, 900 + Math.round(s.t0 * 10), 0.5 * a);
    ik.save(); ik.beginPath(); ik.rect(x, y - 20, 26 + (w + 10) * wipe, h + 40); ik.clip();
    ik.globalAlpha = a; ik.fillStyle = '#000'; ik.textBaseline = 'alphabetic'; ik.font = `46px ${FONT}`; ik.fillText(s.text, x + 26, y + 57);
    ik.restore();
  }
}
// sketches for the hook: an old desk telephone and a light bulb, in the sky
const PHONE = (() => { const cx = 300, cy = 470, P = []; P.push([[cx - 95, cy + 70], [cx + 95, cy + 70], [cx + 70, cy - 5], [cx - 70, cy - 5], [cx - 95, cy + 70]]); P.push(circ(cx, cy + 32, 30, 26)); P.push([[cx - 115, cy - 30], [cx - 60, cy - 60], [cx + 60, cy - 60], [cx + 115, cy - 30]]); P.push(circ(cx - 105, cy - 34, 18, 12)); P.push(circ(cx + 105, cy - 34, 18, 12)); return P; })();
const BULB = (() => { const cx = 780, cy = 450, P = []; const g = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * 0.72 + i / 40 * Math.PI * 1.56; g.push([cx + Math.cos(a) * 70, cy - 20 + Math.sin(a) * 70]); } g.push([cx + 26, cy + 70]); g.push([cx - 26, cy + 70]); g.push(g[0]); P.push(g); P.push([[cx - 28, cy + 82], [cx + 28, cy + 82]]); P.push([[cx - 24, cy + 96], [cx + 24, cy + 96]]); P.push([[cx - 14, cy + 112], [cx + 14, cy + 112]]); P.push([[cx - 16, cy + 40], [cx - 10, cy - 10], [cx - 4, cy + 5], [cx + 4, cy - 10], [cx + 10, cy + 5], [cx + 16, cy + 40]]); return P; })();
const TORT2D = (cx, cy, s) => { const P = []; const sh = []; for (let i = 0; i <= 30; i++) { const a = Math.PI + i / 30 * Math.PI; sh.push([cx + Math.cos(a) * 44 * s, cy + Math.sin(a) * 30 * s]); } sh.push(sh[0]); P.push(sh); P.push([[cx + 40 * s, cy - 6 * s], [cx + 56 * s, cy - 18 * s], [cx + 68 * s, cy - 16 * s], [cx + 70 * s, cy - 8 * s], [cx + 50 * s, cy - 2 * s]]); P.push([[cx - 28 * s, cy], [cx - 28 * s, cy + 12 * s]]); P.push([[cx + 22 * s, cy], [cx + 22 * s, cy + 12 * s]]); return P; };
function buildLabels() {
  const vAt = t => setCamera(views(t).main);
  const P = (v, t) => { vAt(t); return proj(v); };
  // S1
  addSketch({ paths: PHONE, t0: 2.0, t1: 5.4, d: 0.7, seed: 501, cross: [190, 380, 410, 570, 3.0] });
  addSketch({ paths: BULB, t0: 3.2, t1: 5.4, d: 0.5, seed: 531, cross: [690, 360, 870, 580, 3.9] });
  addWrite({ id: 'title', s: 'Jonathan', x: W / 2, y: 470, t0: 6.0, t1: 9.45, size: 150, seed: 11, d: 0.9, under: true, align: 'center' });
  addWrite({ id: 'age', s: 'unos 194 años', x: W / 2, y: 600, t0: 7.5, t1: 9.45, size: 70, seed: 13, d: 0.8, align: 'center' });
  // S2
  addTag({ id: 'aldabra', s: 'TORTUGA GIGANTE DE ALDABRA', at: () => [W / 2, 430], t0: 10.6, t1: 12.6, size: 38, seed: 21 });
  addWrite({ id: 'y1832', s: 'hacia 1832', x: 760, y: 1500, t0: 14.15, t1: 16.0, size: 74, seed: 23, d: 0.7, align: 'center', under: true });
  // S3 map
  addWrite({ id: 'y1882', s: '1882', x: W / 2, y: 360, t0: 16.3, t1: 24.6, size: 130, seed: 31, d: 0.8, align: 'center', under: true });
  LAB.push({ draw(t) {
    if (t < 16.1 || t > 24.8) return null;
    const route = [[55.5, -4.6], [57.5, -14], [54, -27], [40, -36], [26, -38.5], [15, -36], [6, -28], [-1, -21], [-5.6, -16.2]].map(([a, b]) => P(LL(a, b, 0.3), t));
    const pts = []; for (let i = 0; i < route.length - 1; i++) for (let k = 0; k < 8; k++) { const u = k / 8; pts.push([lerp(route[i][0], route[i + 1][0], u), lerp(route[i][1], route[i + 1][1], u)]); } pts.push(route[route.length - 1]);
    pline(ik, pts, ease5(seg(t, 18.0, 1.9)), 3.2, 601, 0.9, '#000', [16, 12]);
    const S = P(LL(55.5, -4.6, 0.3), t), E = P(LL(-5.7, -15.95, 0.3), t);
    const ts = textLayout('Seychelles', 40, 41), te = textLayout('Santa Elena', 40, 43), ta = textLayout('ÁFRICA', 44, 47);
    textDraw(ik, ts, S[0] - ts.tot + 10, S[1] - 34, seg(t, 17.6, 0.6), 0.9); textDraw(ik, te, E[0] - 30, E[1] - 40, seg(t, 19.6, 0.6), 0.9);
    const A = P(LL(20, 8, 0.3), t); textDraw(ik, ta, A[0] - ta.tot / 2, A[1], seg(t, 16.6, 0.6), 0.45);
    if (t > 23.65) for (const p of TORT2D(E[0] + 30, E[1] + 150, 2.6 * ease5(seg(t, 23.65, 0.25)) + 0.01)) pline(ik, p, seg(t, 23.7, 0.6), 3, 611, 0.95);
    pline(ik, circ(E[0], E[1], 26, 22), seg(t, 19.9, 0.4), 2.6, 621, 0.9);
    return { x0: S[0] - ts.tot, y0: S[1] - 70, x1: S[0], y1: S[1], text: 'Seychelles Santa Elena' };
  } });
  addTag({ id: 'atl', s: 'EN MITAD DEL ATLÁNTICO', at: () => [W / 2, 1500], t0: 20.6, t1: 21.8, size: 38, seed: 51 });
  addTag({ id: 'gob', s: 'REGALO PARA EL GOBERNADOR', at: () => [W / 2, 1500], t0: 21.9, t1: 24.6, size: 38, seed: 53 });
  // S4
  addWrite({ id: 'rec1', s: 'el animal terrestre', x: W / 2, y: 330, t0: 25.4, t1: 28.5, size: 76, seed: 61, d: 0.9, align: 'center' });
  addWrite({ id: 'rec2', s: 'vivo más viejo', x: W / 2, y: 440, t0: 26.4, t1: 28.5, size: 96, seed: 63, d: 0.8, align: 'center', under: true });
  // S5 micro
  addTag({ id: 'sangre', s: 'NO LE PUEDEN SACAR SANGRE', at: () => [W / 2, 330], t0: 31.8, t1: 33.8, size: 38, seed: 71 });
  addTag({ id: 'mejilla', s: 'RASPADO DE LA MEJILLA', at: () => [W / 2, 330], t0: 33.9, t1: 35.9, size: 40, seed: 73 });
  addWrite({ id: 'fallo', s: 'falló', x: W / 2, y: 420, t0: 36.8, t1: 39.1, size: 150, seed: 75, d: 0.45, align: 'center', col: 'rgb(200,70,55)', onCol: true });
  addTag({ id: 'bact', s: 'SOLO BACTERIAS', at: () => [W / 2, 560], t0: 37.9, t1: 39.1, size: 40, seed: 77 });
  // S6 helix
  LAB.push({ id: 'n287', draw(t) {
    if (t < 40.0 || t > 44.9) return null; const a = 1 - seg(t, 44.6, 0.3); const v = Math.round(287 * ease5(seg(t, 40.0, 1.6)));
    const T = textLayout(String(v), 170, 81); ik.save(); ik.globalAlpha = a; ik.font = `170px ${FONT}`; ik.fillStyle = '#000'; ik.textBaseline = 'alphabetic'; ik.textAlign = 'center'; ik.fillText(String(v), W / 2, 380); ik.restore();
    return { x0: W / 2 - T.tot / 2, y0: 230, x1: W / 2 + T.tot / 2, y1: 400, text: String(v) };
  } });
  addTag({ id: 'prop', s: 'VARIANTES PROPIAS', at: () => [W / 2, 480], t0: 41.9, t1: 44.9, size: 40, seed: 83, col: 'rgb(120,70,10)' });
  addTag({ id: 'rep', s: 'REPARACIÓN DEL ADN', at: () => [W / 2, 330], t0: 45.3, t1: 47.0, size: 40, seed: 85 });
  addTag({ id: 'telo', s: 'TELÓMEROS', at: () => [W / 2, 330], t0: 47.4, t1: 49.8, size: 44, seed: 87 });
  addLeader({ from: () => [W / 2 + 120, 370], to: t => { const p = P(HX.caps[3], t); return [p[0] + 20, p[1] - 40]; }, t0: 47.9, t1: 49.8, seed: 89, bend: 0.2 });
  // S7
  addTag({ id: 'marcas', s: 'MARCAS QUE ENCIENDEN Y APAGAN GENES', at: () => [W / 2, 330], t0: 52.8, t1: 55.6, size: 34, seed: 91 });
  addTag({ id: 'des', s: 'CON LA EDAD SE DESORDENAN', at: () => [W / 2, 330], t0: 55.7, t1: 57.8, size: 38, seed: 93 });
  addTag({ id: 'casi', s: 'CASI TODO EL GENOMA', at: () => [W / 2, 330], t0: 57.9, t1: 59.4, size: 40, seed: 95 });
  addTag({ id: 'mito', s: 'MITOCONDRIAS', at: () => [W / 2, 330], t0: 60.5, t1: 63.4, size: 44, seed: 97, col: 'rgb(30,70,130)' });
  // S8
  addWrite({ id: 'ord', s: 'siguen ordenadas', x: W / 2, y: 380, t0: 64.6, t1: 67.0, size: 96, seed: 101, d: 0.9, align: 'center', under: true });
  LAB.push({ draw(t) { if (t < 65.8 || t > 67.0) return null; pline(cl, [[W / 2 - 90, 1310], [W / 2 - 20, 1380], [W / 2 + 120, 1200]], seg(t, 65.8, 0.35), 16, 111, 0.9, 'rgb(40,110,60)'); return null; } });
  // S9
  addTag({ id: 'ojo', s: 'OJO: UN SOLO ANIMAL', at: () => [W / 2, 330], t0: 67.3, t1: 69.4, size: 42, seed: 121 });
  addTag({ id: 'causa', s: 'NO DEMUESTRA QUE SEA LA CAUSA', at: () => [W / 2, 330], t0: 69.5, t1: 72.95, size: 36, seed: 123 });
  addTag({ id: 'exp', s: 'UN EXPERTO AJENO AL ESTUDIO', at: () => [W / 2, 330], t0: 73.1, t1: 75.6, size: 36, seed: 125 });
  addWrite({ id: 'q1', s: '«Quizá Jonathan es', x: W / 2, y: 330, t0: 75.7, t1: 79.0, size: 78, seed: 127, d: 1.0, align: 'center' });
  addWrite({ id: 'q2', s: 'muy bueno siendo viejo»', x: W / 2, y: 440, t0: 77.3, t1: 79.0, size: 78, seed: 129, d: 0.9, align: 'center', under: true });
  // S10
  addTag({ id: 'epi', s: 'PRIMER ESTUDIO DEL EPIGENOMA', at: () => [W / 2, 330], t0: 81.0, t1: 84.0, size: 36, seed: 131 });
  addTag({ id: 'epi2', s: 'DE UNA TORTUGA GIGANTE', at: () => [W / 2, 420], t0: 82.8, t1: 84.0, size: 36, seed: 133 });
  // S11
  addWrite({ id: 'q200a', s: '¿Vivirías', x: W / 2, y: 520, t0: 84.6, t1: 87.1, size: 110, seed: 141, d: 0.6, align: 'center' });
  addWrite({ id: 'q200b', s: '200 años?', x: W / 2, y: 660, t0: 85.3, t1: 87.1, size: 130, seed: 143, d: 0.6, align: 'center', under: true });
  addWrite({ id: 'end1', s: 'Lo que', x: W / 2, y: 560, t0: 87.15, t1: 999, size: 110, seed: 151, d: 0.5, align: 'center' });
  addWrite({ id: 'end2', s: 'ignoramos', x: W / 2, y: 720, t0: 87.6, t1: 999, size: 160, seed: 153, d: 0.8, align: 'center', under: true });
}
function drawRing(ir) {
  if (!ir || ir.ringA <= 0.01) return;
  const n = 140, pts = [], pts2 = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI * 0.6 + i / n * Math.PI * 2; pts.push([ir.cx + Math.cos(a) * ir.r, ir.cy + Math.sin(a) * ir.r]); pts2.push([ir.cx + Math.cos(a + 0.05) * (ir.r + 7), ir.cy + Math.sin(a + 0.05) * (ir.r + 7)]); }
  tg.save(); tg.globalAlpha = 0.5 * ir.ringA; pline(tg, pts, ir.ring, 12, 301); tg.restore();
  pline(ik, pts, ir.ring, 3.4, 311, 0.95 * ir.ringA); pline(ik, pts2, ir.ring, 1.7, 321, 0.55 * ir.ringA);
}
function drawOverlay(t, ir) {
  for (const c of [tg, ik, cl]) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); }
  TXT.length = 0;
  for (const el of LAB) { const r = el.draw(t); if (r) TXT.push({ id: el.id || 'x', ...r }); }
  drawRing(ir); drawSubs(t);
  tagT.needsUpdate = true; inkT.needsUpdate = true; colT.needsUpdate = true;
}
// ---------------------------------------------------------------- animation of moving things
function animate(t) {
  // Jonathan's head: rests low, lifts on "y sigue vivo" (4.7), small chewing bob, on twos
  const t2 = Math.floor(t * 12) / 12;
  const lift = ease5(seg(t, 4.55, 0.55)) * (1 - 0.3 * ease5(seg(t, 9.0, 1.0)));
  JON.head.rotation.z = -0.25 + 0.45 * lift + 0.03 * Math.sin(t2 * 1.7);
  JON.head.rotation.y = 0.15 * Math.sin(t2 * 0.4);
  // the swab scrapes the cheek cells 33.9–35.6
  const k = seg(t, 33.7, 2.0); MIC.swab.visible = t > 33.6 && t < 36.3;
  MIC.swab.position.set(lerp(-2.4, 2.2, ease5(k)), -300 + 0.25 + 0.05 * Math.sin(k * 30), 0.1); MIC.swab.rotation.z = -0.5;
  MIC.swab.position.y += 0; MIC.swab.position.x += 0;
  // the marks: ordered, then scattered on the whip (55.7), back in order for the coda
  const dis = t < 55.6 ? 0 : t < 79 ? ease5(seg(t, 55.6, 0.7)) : 0.15;
  setMarks(dis, t < 49.9 ? 0 : 1);
}

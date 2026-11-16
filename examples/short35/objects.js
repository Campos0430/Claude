// ===== objects for "Cannabis en una tumba de hace 2.800 años" (Tunnug 1) =====
brain.visible = false;
const CYA = 0x3FD0E8, AMB = 0xF5A623;
const hsh = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const gau = (k) => (hsh(k) + hsh(k + 0.37) + hsh(k + 0.71) - 1.5) / 1.5;
function glowSpr(col, sc, parent) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowSoft, color: col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, opacity: 0 })); s.scale.setScalar(sc); parent.add(s); return s; }
const SM = (c, r = 0.85, e = 0, ei = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, emissive: e, emissiveIntensity: ei });
// ---------- steppe + kurgan (stone burial mound, ~140 m) ----------
const kur = new THREE.Group(); world.add(kur);
{ const g = new THREE.Mesh(new THREE.CircleGeometry(120, 64), SM(0x1f2e1f, 1)); g.rotation.x = -Math.PI / 2; kur.add(g);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(7, 72, 20, 0, Math.PI * 2, 0, Math.PI / 2), SM(0x6a675f, 1)); dome.scale.y = 0.085; kur.add(dome);
  const N = 1500, rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.2, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }), N); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  for (let k = 0; k < N; k++) { const r = 7.1 * Math.sqrt(hsh(k)), a = hsh(k + 500) * Math.PI * 2; const y = 0.6 * Math.sqrt(Math.max(0, 1 - (r / 7.1) ** 2)); q.setFromEuler(new THREE.Euler(hsh(k + 1) * 6, hsh(k + 2) * 6, 0)); const s = 0.6 + hsh(k + 3) * 1.1; m.compose(V(Math.cos(a) * r, y + 0.03, Math.sin(a) * r), q, V(s, s * 0.6, s)); rocks.setMatrixAt(k, m); const v = 0.42 + hsh(k + 4) * 0.36; rocks.setColorAt(k, c.setRGB(v, v * 0.97, v * 0.9).convertSRGBToLinear()); } kur.add(rocks);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(8.1, 0.22, 8, 96), SM(0x0e1712, 1)); ring.rotation.x = Math.PI / 2; ring.scale.z = 0.3; ring.position.y = 0.02; kur.add(ring);
  // central excavation pit
  const pit = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.8), SM(0x241a12, 1)); pit.position.y = 0.62; kur.add(pit); }
{ const mm = SM(0x2a3a66, 1); mm.flatShading = true; for (let k = 0; k < 46; k++) { const a = k / 46 * Math.PI * 2 + hsh(k) * 0.1, h = 7 + hsh(k + 9) * 13; const c = new THREE.Mesh(new THREE.ConeGeometry(9 + hsh(k + 3) * 7, h, 5), mm); c.position.set(Math.cos(a) * 95, h / 2 - 0.5, Math.sin(a) * 95); c.rotation.y = hsh(k) * 3; kur.add(c); } }
const kurGlow = glowSpr(AMB, 9, kur); kurGlow.position.set(0, 0.9, 0);
// ---------- wooden burial chamber with log coffins ----------
const chm = new THREE.Group(); world.add(chm);
const WOOD = SM(0x6e4a2a, 0.9), WOOD2 = SM(0x8a6238, 0.9);
{ const fl = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.12, 4.4), SM(0x3b2a1a, 1)); fl.position.y = -0.06; chm.add(fl);
  for (let i = 0; i < 9; i++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.05, 4.2), i % 2 ? WOOD : WOOD2); pl.position.set((i - 4) * 0.58, 0.02, 0); chm.add(pl); }
  const lg = (len, x, y, z, ry) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, len, 14), (Math.round(y * 10) % 2) ? WOOD : WOOD2); l.rotation.z = Math.PI / 2; l.rotation.y = ry; l.position.set(x, y, z); chm.add(l); };
  for (let h = 0; h < 3; h++) { const y = 0.2 + h * 0.32; lg(5.7, 0, y, -2.15, 0); lg(5.7, 0, y, 2.15, 0); lg(4.6, -2.65, y + 0.16, 0, Math.PI / 2); lg(4.6, 2.65, y + 0.16, 0, Math.PI / 2); }
  [-0.95, 0.95].forEach((z, i) => { const cf = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 3.3, 20), SM(0x5a3b20, 0.95)); cf.rotation.z = Math.PI / 2; cf.position.set(i ? 0.3 : -0.3, 0.42, z); chm.add(cf); const lid = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.03, 0.05), SM(0x1a120a, 1)); lid.position.set(i ? 0.3 : -0.3, 0.6, z + 0.36); chm.add(lid); }); }
// ---------- seeds ----------
const SN = 520; const seedG = new THREE.SphereGeometry(0.075, 14, 10); seedG.scale(1, 0.7, 1.4);
const seeds = new THREE.InstancedMesh(seedG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }), SN); world.add(seeds); seeds.frustumCulled = false;
{ const c = new THREE.Color(); for (let k = 0; k < SN; k++) { const v = 0.75 + hsh(k + 9) * 0.5; seeds.setColorAt(k, c.setRGB(0.62 * v, 0.5 * v, 0.28 * v).convertSRGBToLinear()); } }
// spread: pile radius; k: 0..1 how many have dropped
function setSeeds(t, o = {}) { const R0 = o.r ?? 1.2, k = o.k ?? 1, y0 = o.y ?? 0.06; const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < SN; i++) { const r = R0 * Math.abs(gau(i)) * 1.2, a = hsh(i + 77) * Math.PI * 2; const d = clamp((k * 1.6 - hsh(i + 5) * 0.35 - (i / SN)) * 6); const pile = Math.max(0, 0.35 * (1 - r / R0)) * (o.pile ?? 1); const y = y0 + pile * hsh(i + 2) + (1 - d * d) * 4;
    q.setFromEuler(new THREE.Euler(hsh(i + 1) * 6 + (1 - d) * 5, hsh(i + 3) * 6, 0)); const s = d > 0 ? (o.s ?? 1) : 0; m.compose(V(Math.cos(a) * r + (o.x ?? 0), y, Math.sin(a) * r * (o.zs ?? 1) + (o.z ?? 0)), q, V(s, s, s)); seeds.setMatrixAt(i, m); } seeds.instanceMatrix.needsUpdate = true; }
// ---------- hair strands + scan ----------
const hair = new THREE.Group(); world.add(hair);
const HS = 70; const hairM = new THREE.MeshStandardMaterial({ color: 0x7a4420, roughness: 0.45, metalness: 0.1 });
const HCUR = [];
for (let k = 0; k < HS; k++) { const y0 = (k / (HS - 1) - 0.5) * 2.6, z0 = (hsh(k) - 0.5) * 0.8; const pts = []; for (let j = 0; j <= 8; j++) { const u = j / 8; pts.push(V(-5 + u * 10, y0 + 0.28 * Math.sin(u * 5 + k * 0.9) + 0.5 * (u - 0.5) * (hsh(k + 3) - 0.5), z0 + 0.2 * Math.sin(u * 4 + k))); } const cv = new THREE.CatmullRomCurve3(pts); HCUR.push(cv); hair.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 60, 0.022 + hsh(k + 8) * 0.016, 6), hairM)); }
const scanM = new THREE.MeshBasicMaterial({ color: CYA, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 4.2), scanM); hair.add(scan); const scanGlow = glowSpr(CYA, 5, hair);
const HN = 70; const hits = makePoints(HN, () => [0, 0, 0], () => 0.3, () => [1.0, 0.65, 0.15], true); hits.frustumCulled = false; hair.add(hits);
const HIT = Array.from({ length: HN }, (_, k) => ({ c: Math.floor(hsh(k + 20) * HS), u: 0.08 + hsh(k + 40) * 0.84 }));
// sx: scan x position (-5..5) or null ; found: 0..1 opacity of detected spots (only left of scan line if scanning)
function setHair(t, o = {}) { const sx = o.sx; scanM.opacity = sx == null ? 0 : 0.9; scan.position.set(sx ?? 0, 0, 0.6); scanGlow.position.set(sx ?? 0, 0, 0.6); scanGlow.material.opacity = sx == null ? 0 : 0.35; hits.material.uniforms.uOp.value = (o.found ?? 0) * (0.8 + 0.2 * Math.sin(t * 5));
  const P = hits.geometry.attributes.position; HIT.forEach((h, k) => { const p = HCUR[h.c].getPoint(h.u); const vis = sx == null || p.x < sx; P.setXYZ(k, p.x, vis ? p.y : 99, p.z + 0.08); }); P.needsUpdate = true; }
// ---------- brazier with smoke (Herodotus) ----------
const brz = new THREE.Group(); world.add(brz);
{ const bronze = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.45, metalness: 0.7, side: THREE.DoubleSide }); const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * 1.3, -Math.cos(a) * 0.75)); } pts.push(new THREE.Vector2(1.38, 0.04));
  brz.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 48), bronze)); for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; const l = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1.1, 10), bronze); l.position.set(Math.cos(a) * 0.8, -1.15, Math.sin(a) * 0.8); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); brz.add(l); }
  for (let k = 0; k < 16; k++) { const r = 0.85 * Math.sqrt(hsh(k + 60)), a = hsh(k + 61) * 6.28; const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + hsh(k + 62) * 0.12, 0), new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.9, flatShading: true, emissive: 0xff5a10, emissiveIntensity: 0.35 + hsh(k + 63) * 0.7 })); st.position.set(Math.cos(a) * r, -0.32 + 0.1 * hsh(k), Math.sin(a) * r); brz.add(st); } }
const brzGlow = glowSpr(0xff7a20, 4.5, brz); brzGlow.position.y = -0.1;
const SMK = 240; const smoke = makePoints(SMK, () => [0, 0, 0], i => 0.5 + hsh(i) * 0.9, () => [0.2, 0.2, 0.22], true); smoke.frustumCulled = false; brz.add(smoke);
function setBrazier(t, a = 1) { brzGlow.material.opacity = 0.3 + 0.06 * Math.sin(t * 7); smoke.material.uniforms.uOp.value = a; const P = smoke.geometry.attributes.position; for (let k = 0; k < SMK; k++) { const u = (hsh(k + 5) + t * (0.07 + 0.05 * hsh(k + 6))) % 1; const y = u * 7.5; const sp = 0.25 + u * 1.5; P.setXYZ(k, Math.sin(y * 0.9 + k) * sp * 0.6 + Math.sin(t * 0.6 + k) * 0.15, -0.1 + y, Math.cos(y * 0.7 + k * 1.7) * sp * 0.6); } P.needsUpdate = true; }
const warm = new THREE.PointLight(0xffa050, 0, 30); warm.position.set(0, 3, 2); world.add(warm);
function hideAll() { [brain, kur, chm, seeds, hair, brz].forEach(o => { o.visible = false; o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.setScalar(1); }); warm.intensity = 0; world.fog.density = 0.008; }

[kur, chm, seeds, hair, brz].forEach(g => g.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial && !o.material._lin) { o.material._lin = 1; o.material.color.convertSRGBToLinear(); o.material.emissive.convertSRGBToLinear(); } }));

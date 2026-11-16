// ===== objects for "El tercer tipo de magnetismo: altermagnetismo" =====
brain.visible = false;
const CYA = 0x3FD0E8, AMB = 0xF5A623;
const hsh = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function glowSpr(col, sc, parent) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowSoft, color: col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false, opacity: 0 })); s.scale.setScalar(sc); parent.add(s); return s; }
// ---------- spin lattice: atoms with compass arrows (+ rotated surroundings) ----------
const lat = new THREE.Group(); world.add(lat);
const LN = 4, LS = 1.7; const SITES = [];
const atomM = new THREE.MeshStandardMaterial({ color: 0x5f6f92, roughness: 0.4, metalness: 0.5 });
const CYD = 0x0088b8, AMD = 0xff8400; const arrA = new THREE.MeshStandardMaterial({ color: CYD, roughness: 0.45, emissive: CYD, emissiveIntensity: 0.55 });
const arrB = new THREE.MeshStandardMaterial({ color: CYD, roughness: 0.45, emissive: CYD, emissiveIntensity: 0.55 });
const envA = new THREE.MeshStandardMaterial({ color: 0xb9a6ff, roughness: 0.5, transparent: true, opacity: 0, depthWrite: false, emissive: 0x5a3fd0, emissiveIntensity: 0.5 });
{ const sg = new THREE.SphereGeometry(0.25, 40, 28), shaft = new THREE.CylinderGeometry(0.095, 0.095, 1.0, 20), headG = new THREE.ConeGeometry(0.24, 0.4, 24), eg = new THREE.SphereGeometry(0.68, 40, 28);
  for (let j = 0; j < LN; j++) for (let i = 0; i < LN; i++) { const B = (i + j) % 2; const g = new THREE.Group(); g.position.set((i - (LN - 1) / 2) * LS, (j - (LN - 1) / 2) * LS, 0); lat.add(g);
    g.add(new THREE.Mesh(sg, atomM)); const a = new THREE.Group(); const m = B ? arrB : arrA; const s = new THREE.Mesh(shaft, m); s.position.y = 0.0; a.add(s); const h = new THREE.Mesh(headG, m); h.position.y = 0.6; a.add(h); a.position.z = 0.0; g.add(a);
    const e = new THREE.Mesh(eg, envA); e.scale.set(1, 0.42, 0.3); e.position.z = -0.1; g.add(e); SITES.push({ B, g, a, e, i, j }); } }
// a: 0 ferro → 1 antiparallel ; env: opacity of surroundings ; rot: 0 same orientation → 1 rotated 90° on sublattice B
function setLat(t, o = {}) { const a = o.a ?? 0, env = o.env ?? 0, rot = o.rot ?? 0; arrB.color.set(CYD).lerp(new THREE.Color(AMD), a); arrB.emissive.copy(arrB.color); envA.opacity = env * 0.42;
  SITES.forEach((s, k) => { const wob = 0.07 * Math.sin(t * 2.2 + k * 1.3); s.a.rotation.z = (s.B ? Math.PI * a : 0) + wob; s.e.visible = env > 0.01; s.e.rotation.z = Math.PI / 4 + (s.B ? rot * Math.PI / 2 : 0); }); }
// electrons: spin-up (cyan) travel easily along x, spin-down (amber) along y
const EN = 90; const elU = makePoints(EN, () => [0, 0, 0], () => 0.2, () => [0.35, 0.9, 1.0], true), elD = makePoints(EN, () => [0, 0, 0], () => 0.2, () => [1.0, 0.7, 0.25], true); [elU, elD].forEach(e => { e.frustumCulled = false; lat.add(e); });
function setElec(t, op) { elU.material.uniforms.uOp.value = op; elD.material.uniforms.uOp.value = op; const PU = elU.geometry.attributes.position, PD = elD.geometry.attributes.position; const half = LN * LS / 2 + 0.4;
  for (let k = 0; k < EN; k++) { const row = (Math.floor(hsh(k) * (LN + 1)) - LN / 2) * LS, u = ((hsh(k + 40) + t * (0.22 + 0.2 * hsh(k + 80))) % 1) * 2 - 1, w = 0.1 * Math.sin(t * 5 + k);
    PU.setXYZ(k, u * half, row + w, 0.45); PD.setXYZ(k, row + w, -u * half, 0.45); } PU.needsUpdate = PD.needsUpdate = true; }
// ---------- horseshoe magnet ----------
const mag = new THREE.Group(); world.add(mag);
{ const red = new THREE.MeshStandardMaterial({ color: 0xb00d14, roughness: 0.4, metalness: 0.1 }), sil = new THREE.MeshStandardMaterial({ color: 0xd5dbe6, roughness: 0.25, metalness: 0.8 });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.36, 28, 64, Math.PI), red); mag.add(arc);
  [-1, 1].forEach(s => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1.3, 32), red); l.position.set(s * 1.1, -0.65, 0); mag.add(l); const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.365, 0.365, 0.6, 32), sil); tp.position.set(s * 1.1, -1.6, 0); mag.add(tp); }); }
// ---------- lab drawer with a crystal inside ----------
const drw = new THREE.Group(); world.add(drw);
const cabM = new THREE.MeshStandardMaterial({ color: 0x3b4a66, roughness: 0.6, metalness: 0.3 }), drM = new THREE.MeshStandardMaterial({ color: 0x53678c, roughness: 0.55, metalness: 0.3 });
{ const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.0, 2.6), cabM); body.position.z = -1.3; drw.add(body);
  [1.0, -1.0].forEach(y => { const f = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 0.08), drM); f.position.set(0, y, 0.04); drw.add(f); const h = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.12), new THREE.MeshStandardMaterial({ color: 0xd5dbe6, metalness: 0.8, roughness: 0.3 })); h.position.set(0, y, 0.14); drw.add(h); }); }
const drawer = new THREE.Group(); drw.add(drawer);
{ const b = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), drM); m.position.set(x, y, z); drawer.add(m); };
  b(3.2, 0.08, 2.2, 0, -0.4, -1.1); b(0.08, 0.8, 2.2, -1.56, 0, -1.1); b(0.08, 0.8, 2.2, 1.56, 0, -1.1); b(3.2, 0.8, 0.08, 0, 0, 0.0); b(3.2, 0.8, 0.08, 0, 0, -2.2);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.12), new THREE.MeshStandardMaterial({ color: 0xd5dbe6, metalness: 0.8, roughness: 0.3 })); h.position.set(0, 0, 0.1); drawer.add(h); }
const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshStandardMaterial({ color: 0xffd27a, roughness: 0.15, metalness: 0.3, emissive: AMB, emissiveIntensity: 0.9, flatShading: true })); gem.position.set(0, 0.15, -1.0); drawer.add(gem);
const gemGlow = glowSpr(AMB, 3.2, drawer); gemGlow.position.copy(gem.position);
function setDrawer(t, k) { drawer.position.z = 0.0 + 1.9 * k; gem.rotation.set(0.3, t * 1.2, 0); gem.position.y = 0.15 + 0.5 * k + 0.05 * Math.sin(t * 3); gemGlow.position.copy(gem.position); gemGlow.material.opacity = 0.75 * k; }
// ---------- X-ray experiment: helical (circularly polarised) beam + crystal ----------
const xr = new THREE.Group(); world.add(xr);
const xtal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x3f8fc0, roughness: 0.25, metalness: 0.4, emissive: 0x0c3a5c, emissiveIntensity: 0.5, flatShading: true })); xr.add(xtal);
const xGlowL = glowSpr(CYA, 4.5, xr), xGlowR = glowSpr(AMB, 4.5, xr);
const beam = new THREE.Group(); beam.rotation.z = -0.9; xr.add(beam);
const BN = 420, BL = 9; const bmL = makePoints(BN, () => [0, 0, 0], () => 0.65, () => [0.2, 0.6, 0.7], true), bmR = makePoints(BN, () => [0, 0, 0], () => 0.65, () => [0.7, 0.45, 0.12], true); [bmL, bmR].forEach(b => { b.frustumCulled = false; beam.add(b); });
const coreL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, BL - 0.8, 12), new THREE.MeshBasicMaterial({ color: CYA, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); coreL.rotation.z = Math.PI / 2; coreL.position.x = -(BL + 0.8) / 2; beam.add(coreL); const coreR = coreL.clone(); coreR.material = coreL.material.clone(); coreR.material.color.set(AMB); beam.add(coreR);
function setBeam(t, o = {}) { coreL.material.opacity = 0.5 * (o.l ?? 0); coreR.material.opacity = 0.5 * (o.r ?? 0); const l = o.l ?? 0, r = o.r ?? 0; xtal.rotation.set(0.5, t * 0.5, 0.2); bmL.material.uniforms.uOp.value = l; bmR.material.uniforms.uOp.value = r; xGlowL.material.opacity = l * (o.gl ?? 0.5); xGlowR.material.opacity = r * (o.gr ?? 0.5); xGlowL.scale.setScalar(2 + 5 * (o.gl ?? 0.5)); xGlowR.scale.setScalar(2 + 5 * (o.gr ?? 0.5));
  [[bmL, 1], [bmR, -1]].forEach(([b, hnd]) => { const P = b.geometry.attributes.position; for (let k = 0; k < BN; k++) { const u = (k / BN + t * 0.35) % 1; const x = -BL + u * (BL - 0.8); const ph = hnd * (x * 2.6 - t * 5) + (k % 2) * Math.PI; const R = 0.5; P.setXYZ(k, x, R * Math.cos(ph), R * Math.sin(ph)); } P.needsUpdate = true; }); }
function hideAll() { [brain, lat, mag, drw, xr].forEach(o => { o.visible = false; o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.setScalar(1); }); setElec(0, 0); world.fog.density = 0.012; }

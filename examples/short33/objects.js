// ===== objects for "El teorema del mono infinito" =====
brain.visible = false;
const hsh = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const M = (c, r = 0.8, e = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, emissive: e });
// ---------- monkey ----------
const mk = new THREE.Group(); world.add(mk);
const FUR = M(0x2c180c, 0.9), SKIN = M(0xb98a62, 0.7), DARK = M(0x050505, 0.3);
function sph(r, mat, x, y, z, sx = 1, sy = 1, sz = 1, parent = mk) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 72, 48), mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); parent.add(m); return m; }
sph(1, FUR, 0, 1.25, 0, 0.95, 1.1, 0.85); sph(0.62, SKIN, 0, 1.15, 0.42, 1, 1.15, 0.7);
const head = new THREE.Group(); head.position.set(0, 2.55, 0.1); mk.add(head);
sph(0.68, FUR, 0, 0, 0, 1, 1, 1, head); sph(0.5, SKIN, 0, -0.02, 0.4, 1, 0.95, 0.72, head); sph(0.36, SKIN, 0, -0.26, 0.62, 1.15, 0.8, 0.8, head);
[-1, 1].forEach(s => { sph(0.25, SKIN, s * 0.7, 0.08, 0, 0.45, 1, 1, head); sph(0.085, DARK, s * 0.2, 0.12, 0.74, 1, 1, 1, head); sph(0.03, M(0xffffff, 0.2, 0xffffff), s * 0.2 + 0.03, 0.15, 0.815, 1, 1, 1, head); sph(0.035, DARK, s * 0.07, -0.2, 0.95, 1, 1, 1, head); });
const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 8, 24, Math.PI), DARK); mouth.rotation.x = Math.PI; mouth.position.set(0, -0.32, 0.9); head.add(mouth);
// arms: pivot at shoulder, reach forward/down to the keyboard
const arms = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.85, 1.9, 0.15); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 1.55, 20), FUR); a.position.y = -0.775; g.add(a); const h = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), SKIN); h.position.y = -1.6; g.add(h); mk.add(g); return g; });
[-1, 1].forEach(s => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 1.1, 20), FUR); l.rotation.x = Math.PI / 2; l.position.set(s * 0.6, 0.35, 0.7); mk.add(l); sph(0.24, SKIN, s * 0.6, 0.35, 1.3, 1, 0.8, 1.2); });
// arm pose: tap (typing) or raised (holding the rock)
function setMonkey(t, o = {}) { const sp = o.speed ?? 1, up = o.up ?? 0; arms.forEach((g, i) => { const tap = 0.14 * Math.sin(t * 13 * sp + i * Math.PI); g.rotation.set(lerp(-0.95 + tap, -2.9, up), 0, (i ? -1 : 1) * lerp(-0.22, -0.25, up)); }); head.rotation.set(lerp(0.22 + 0.05 * Math.sin(t * 2.1), -0.15, up), 0.12 * Math.sin(t * 1.3), 0.06 * Math.sin(t * 1.7)); }
// ---------- desk + 30-key keyboard ----------
const desk = new THREE.Group(); world.add(desk);
{ const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.18, 1.7), M(0x3a2a20, 0.7)); top.position.set(0, 0.62, 1.75); desk.add(top);
  const kb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 1.0), M(0x1a2030, 0.5)); kb.position.set(0, 0.78, 1.75); desk.add(kb); }
const KN = 30; const keyG = new THREE.BoxGeometry(0.2, 0.09, 0.2); const keys = new THREE.InstancedMesh(keyG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), KN); desk.add(keys);
const KPOS = Array.from({ length: KN }, (_, k) => V((k % 10 - 4.5) * 0.245, 0.9, 1.75 + (Math.floor(k / 10) - 1) * 0.27));
const KV = Array.from({ length: KN }, (_, k) => V((hsh(k) - 0.5) * 6, 3 + hsh(k + 7) * 5, (hsh(k + 13) - 0.3) * 5));
const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), M(0x6a6f78, 0.95)); world.add(rock);
// smash: 0 = intact, >0 = seconds since impact
function setKeys(t, o = {}) { const sp = o.speed ?? 1, sm = o.smash ?? 0; const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(); const cur = Math.floor(t * 6.5 * sp);
  for (let k = 0; k < KN; k++) { const hit = sm <= 0 && Math.floor(hsh(cur) * KN) === k && (o.typing ?? 1); const p = KPOS[k].clone(); if (hit) p.y -= 0.045;
    if (sm > 0) { const v = KV[k]; p.x += v.x * sm; p.y += v.y * sm - 6 * sm * sm; p.z += v.z * sm; q.setFromEuler(new THREE.Euler(sm * 9 * hsh(k + 1), sm * 7, sm * 8 * hsh(k + 2))); if (p.y < 0.75) p.y = 0.75 + (hsh(k + 30) < 0.5 ? -5 : 0); } else q.identity();
    m.compose(p, q, V(1, 1, 1)); keys.setMatrixAt(k, m); keys.setColorAt(k, hit ? c.set(0x3FD0E8) : c.set(0xd8dce6)); }
  keys.instanceMatrix.needsUpdate = true; keys.instanceColor.needsUpdate = true; }
// ---------- the book ----------
const book = new THREE.Group(); world.add(book);
{ const cov = canvasTexture(cnv(512, 768, (x, w, h) => { x.fillStyle = '#7a1420'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8b84a'; x.lineWidth = 10; x.strokeRect(28, 28, w - 56, h - 56); x.lineWidth = 3; x.strokeRect(46, 46, w - 92, h - 92);
    x.fillStyle = '#e8b84a'; x.textAlign = 'center'; x.font = '900 62px Georgia'; x.fillText('DON', w / 2, 250); x.font = '900 74px Georgia'; x.fillText('QUIJOTE', w / 2, 340); x.font = '700 28px Georgia'; x.fillText('DE LA MANCHA', w / 2, 400); x.font = 'italic 30px Georgia'; x.fillText('Miguel de Cervantes', w / 2, 640);
    x.beginPath(); x.moveTo(w / 2 - 90, 460); x.lineTo(w / 2 + 90, 460); x.stroke(); }));
  const red = M(0x7a1420, 0.6), pages = M(0xefe6d0, 0.9); const b = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, 0.55), [pages, red, pages, pages, new THREE.MeshStandardMaterial({ map: cov, roughness: 0.6 }), red]); book.add(b); }
const kLight = new THREE.DirectionalLight(0xfff2e0, 0.5); kLight.position.set(3, 6, 8); world.add(kLight);
function hideAll() { [brain, mk, desk, rock, book].forEach(o => o.visible = false); mk.position.set(0, 0, 0); mk.rotation.set(0, 0, 0); mk.scale.setScalar(1); desk.position.set(0, 0, 0); book.position.set(0, 0, 0); book.rotation.set(0, 0, 0); world.fog.density = 0.02; }
function shake(t, t0) { const d = t - t0; if (d < 0 || d > 0.5) return; const k = (1 - d / 0.5) * 0.18; cam.position.x += Math.sin(t * 90) * k; cam.position.y += Math.cos(t * 70) * k; }

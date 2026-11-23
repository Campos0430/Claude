// ---------------------------------------------------------------- random & noise (JS)
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const h2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vn2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm1 = (x, s = 0) => { let r = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { r += a * (vn2(x * f, s + i * 7.3) - 0.5); f *= 2.1; a *= 0.5; } return r; };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- geometry builder
class Builder {
  constructor() { this.p = []; this.n = []; this.c = []; this.t = []; this.ao = []; this.r = []; this.i = []; this.rv = -100; }
  get vc() { return this.p.length / 3; }
  v(p, n, c, t, ao = 1, rv = this.rv) { this.p.push(p.x, p.y, p.z); this.n.push(n.x, n.y, n.z); this.c.push(c[0], c[1], c[2]); this.t.push(t.x, t.y, t.z); this.ao.push(ao); this.r.push(rv); }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('acol', new THREE.Float32BufferAttribute(this.c, 3));
    g.setAttribute('atan', new THREE.Float32BufferAttribute(this.t, 3));
    g.setAttribute('aao', new THREE.Float32BufferAttribute(this.ao, 1));
    g.setAttribute('arev', new THREE.Float32BufferAttribute(this.r, 1));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    return g;
  }
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

// tube with per-point radius; rfn(i, angle) optional radius multiplier; cfn(i, k) colour
function tube(b, pts, rad, sides, cfn, rfn, aofn, rvfn) {
  const n = pts.length; if (n < 2) return;
  const base = b.vc;
  let T = pts[1].clone().sub(pts[0]).normalize();
  let N = Math.abs(T.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
  N.sub(T.clone().multiplyScalar(N.dot(T))).normalize();
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
    T = c.clone().sub(a).normalize();
    N.sub(T.clone().multiplyScalar(N.dot(T))).normalize();
    const B = T.clone().cross(N);
    for (let k = 0; k < sides; k++) {
      const ang = k / sides * Math.PI * 2;
      const d = N.clone().multiplyScalar(Math.cos(ang)).add(B.clone().multiplyScalar(Math.sin(ang)));
      const r = rad[i] * (rfn ? rfn(i, ang, d) : 1);
      b.v(pts[i].clone().add(d.clone().multiplyScalar(r)), d, cfn(i, k, d), T, aofn ? aofn(i, d) : 1, rvfn ? rvfn(i) : b.rv);
    }
  }
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < sides; k++) {
    const k2 = (k + 1) % sides, a = base + i * sides + k, b1 = base + i * sides + k2, c = a + sides, d = b1 + sides;
    b.i.push(a, b1, c, b1, d, c);
  }
}
// append a three geometry with matrix + colour (fn of world pos & normal)
function append(b, geo, m, cfn, tan = UP, aofn) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pa = g.attributes.position, na = g.attributes.normal;
  const nm = new THREE.Matrix3().getNormalMatrix(m);
  const base = b.vc;
  for (let i = 0; i < pa.count; i++) {
    const p = V(pa.getX(i), pa.getY(i), pa.getZ(i)).applyMatrix4(m);
    const n = V(na.getX(i), na.getY(i), na.getZ(i)).applyMatrix3(nm).normalize();
    b.v(p, n, cfn(p, n), tan, aofn ? aofn(p, n) : 1);
    b.i.push(base + i);
  }
}
function chaikin(pts, rad, it = 1) {
  for (let r = 0; r < it; r++) {
    const P = [pts[0]], R = [rad[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      P.push(pts[i].clone().lerp(pts[i + 1], 0.25), pts[i].clone().lerp(pts[i + 1], 0.75));
      R.push(lerp(rad[i], rad[i + 1], 0.25), lerp(rad[i], rad[i + 1], 0.75));
    }
    P.push(pts[pts.length - 1]); R.push(rad[rad.length - 1]);
    pts = P; rad = R;
  }
  return [pts, rad];
}


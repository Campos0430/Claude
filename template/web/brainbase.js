// Objects for "Por qué una canción te pone la piel de gallina" (frisson)
function cnv(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; if (draw) draw(c.getContext('2d'), w, h); return c; }
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function canvasTexture(c) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 1; return t; }
// 3D value noise
const h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function n3(x, y, z) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t; const c = (i, j, k) => h3(xi + i, yi + j, zi + k);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w); }
const f3 = (x, y, z) => n3(x, y, z) * 0.55 + n3(x * 2.1, y * 2.1, z * 2.1) * 0.3 + n3(x * 4.3, y * 4.3, z * 4.3) * 0.15;
const world = new THREE.Scene(); world.fog = new THREE.FogExp2(0x070b1a, 0.02);
const bgU = { uA: { value: new THREE.Color(0x04060f) }, uB: { value: new THREE.Color(0x14123a) }, uC: { value: new THREE.Color(0x3a1650) }, uD: { value: new THREE.Color(0x0f4f66) } };
world.add(new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: bgU,
  vertexShader: `varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `varying vec3 vD; uniform vec3 uA,uB,uC,uD; void main(){ float h=vD.y*0.5+0.5; vec3 c=mix(uB,uA,smoothstep(0.3,0.95,h)); c=mix(c,uA,smoothstep(0.45,0.0,h)*0.7);
    c+=uC*pow(max(dot(vD,normalize(vec3(0.7,0.2,-0.6))),0.),4.)*0.7; c+=uD*pow(max(dot(vD,normalize(vec3(-0.7,0.1,-0.7))),0.),5.)*0.6; gl_FragColor=vec4(c,1.); }` })));
const wHemi = new THREE.HemisphereLight(0xc8d8ff, 0x201020, 0.6); world.add(wHemi);
const wKey = new THREE.DirectionalLight(0xfff0e6, 1.5); wKey.position.set(4, 6, 6); world.add(wKey);
const wRim = new THREE.DirectionalLight(0x3fd0e8, 1.3); wRim.position.set(-6, 2, -5); world.add(wRim);
const wRim2 = new THREE.DirectionalLight(0xb04aff, 0.8); wRim2.position.set(6, -2, -4); world.add(wRim2);
const bokeh = makePoints(700, () => [(rnd() - 0.5) * 60, (rnd() - 0.4) * 34, (rnd() - 0.5) * 60], () => 0.05 + Math.pow(rnd(), 3) * 0.35, () => { const b = 0.1 + rnd() * 0.22, k = rnd(); return k < 0.45 ? [b * 0.3, b * 0.85, b] : k < 0.75 ? [b, b * 0.7, b * 0.25] : [b * 0.7, b * 0.3, b]; }, true);
bokeh.frustumCulled = false; world.add(bokeh);

// ---------- brain ----------
const brain = new THREE.Group(); world.add(brain);
const brainMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, color: 0xffffff, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.4, transparent: true, opacity: 1, sheen: 0.15, sheenColor: new THREE.Color(0xffd0d0) });
function hemi(side) { const g = new THREE.SphereGeometry(1, 200, 150); const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let X = x * 0.86, Y = y * 0.8, Z = z * 1.25; if (side * X < 0) X = -side * 0.16 * Math.pow(Math.abs(x), 0.12);
    if (Y < -0.15) { Y *= lerp(1, 0.82, ss(-0.15, -0.8, y)); }
    const len = Math.hypot(x, y, z), nx = x / len, ny = y / len, nz = z / len;
    const w = f3(x * 1.3 + 7 * side, y * 1.3, z * 1.3); const v = f3(x * 2.6 + w * 1.8 + side * 3, y * 2.6 + w * 1.8, z * 2.6 - w * 1.8);
    const band = Math.abs(2 * ((v * 7) % 1) - 1); const gy = ss(0.05, 0.55, band); const d = 0.065 * gy - 0.02;
    p.setXYZ(i, X + (side * x < 0 ? 0 : nx * d) + side * 0.165, Y + ny * d + 0.05, Z + nz * d);
    const c = mix3([0.42, 0.2, 0.24], [0.9, 0.66, 0.66], gy); col.set(c, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return new THREE.Mesh(g, brainMat); }
const hemis = [hemi(-1), hemi(1)]; hemis.forEach(h => brain.add(h));
{ const cg = new THREE.SphereGeometry(0.55, 64, 48); const p = cg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const d = 0.025 * Math.abs(Math.sin(y * 40 + x * 3)); p.setXYZ(i, x * 1.35 * (1 + d), y * 0.7 * (1 + d), z * 0.85 * (1 + d)); } cg.computeVertexNormals();
  cg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(cg.attributes.position.count * 3).fill(0.75), 3)); const cb = new THREE.Mesh(cg, brainMat); cb.position.set(0, -0.62, -0.95); brain.add(cb);
  const stg = new THREE.CylinderGeometry(0.15, 0.1, 0.7, 24); stg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(stg.attributes.position.count * 3).fill(0.8), 3)); const st = new THREE.Mesh(stg, brainMat); st.position.set(0, -0.82, -0.4); st.rotation.x = 0.35; brain.add(st); }
// inner regions (glow)

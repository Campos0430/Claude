// «El último latido» — realistic 3D space film (three.js r170 + bloom), 1080×1920, 30 fps, 59.3 s. Picture keyed to the narration (words.json).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, DUR = 59.3, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);
const OX = document.getElementById('ov').getContext('2d');
const scene = new THREE.Scene(); scene.background = new THREE.Color('#000000');
const cam = new THREE.PerspectiveCamera(38, W / H, 0.05, 5000);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.5, 0.4, 1.1); composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------- heartbeat clock (same grid as the score; the period makes the film loop) ----------------
const P = DUR / 47, B0 = -0.35;
const steady = []; for (let k = -4; k < 50; k++) steady.push(B0 + k * P);
const inSteady = t => t < 6.1 || t >= 48.4;
const BEATS = steady.filter(b => inSteady(b)).concat([18.0, 19.2, 20.5]).sort((a, b) => a - b);
const LAUNCH = steady.filter(b => inSteady(b)).concat([21.0, 21.6, 22.2]).sort((a, b) => a - b);
const lubdub = dt => dt < 0 ? 0 : Math.exp(-dt * 8) + 0.6 * (dt > 0.22 ? Math.exp(-(dt - 0.22) * 9) : 0);
const pulseAt = t => { let p = 0; for (const b of BEATS) if (t >= b && t - b < 1.3) p = Math.max(p, lubdub(t - b)); return clamp(p); };
const LOOPPH = t => [Math.cos(TAU * t / DUR), Math.sin(TAU * t / DUR)];   // periodic "time" for surface noise: frame 59.3 == frame 0

// ---------------- GLSL noise ----------------
const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){ const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx); vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3))); }
float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*snoise(p); p*=2.03; a*=.5; } return s; }
`;

// ---------------- the star: boiling surface, limb darkening, a wedge that can be cut away ----------------
function starMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uPh: { value: new THREE.Vector2(1, 0) }, uHot: { value: new THREE.Color(3.2, 1.9, 0.9) }, uCool: { value: new THREE.Color(0.7, 0.12, 0.03) }, uPulse: { value: 0 }, uScale: { value: 2.2 }, uCut: { value: 0 }, uInner: { value: new THREE.Color(1.0, 0.38, 0.08) } },
    side: THREE.DoubleSide,
    vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vP = position; vec4 w = modelMatrix*vec4(position,1.); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: NOISE + `uniform vec2 uPh; uniform vec3 uHot, uCool, uInner; uniform float uPulse, uScale, uCut; varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 d = normalize(vP);
        if (uCut > 0.5 && d.x > 0.0 && d.z > 0.0) discard;                        // the cutaway wedge faces the camera
        vec3 q = d*uScale + vec3(uPh*0.6, 0.0);
        float g = fbm(q*1.0);  float c = 1.0 - abs(snoise(q*4.0 + g));          // large convection cells + fine granulation
        float n = 0.45 + 0.5*g + 0.35*c*c;
        float spots = smoothstep(0.55, 0.8, snoise(q*0.7 + 9.0)); n *= 1.0 - 0.45*spots;
        if (!gl_FrontFacing) { gl_FragColor = vec4(uInner*(0.6 + 0.4*n), 1.0); return; }   // inside the cut: hot interior
        float mu = clamp(dot(normalize(vN), vV), 0.0, 1.0);
        float limb = 0.22 + 0.78*pow(mu, 0.7);
        vec3 col = mix(uCool, uHot, clamp(n, 0.0, 1.2)) * limb * (1.0 + 0.6*uPulse);
        col += uHot*0.15*pow(1.0-mu, 3.0)*(1.0+uPulse);
        gl_FragColor = vec4(col, 1.0); }`,
  });
}
// halo / corona: camera-facing additive quad
function glowMaterial(col) {
  return new THREE.ShaderMaterial({ uniforms: { uCol: { value: new THREE.Color(col) }, uI: { value: 1 }, uR: { value: 0.33 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv*2.-1.; vec4 mv = modelViewMatrix*vec4(0.,0.,0.,1.); vec3 s = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), 1.); mv.xy += position.xy*s.xy; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uCol; uniform float uI, uR; varying vec2 vUv; void main(){ float r = length(vUv); float a = smoothstep(1.0, uR, r)*exp(-max(r-uR,0.)*3.0); gl_FragColor = vec4(uCol*a*uI, 1.0); }` });
}
function makeStar(R, hot, cool, scale = 2.2) {
  const g = new THREE.Group();
  const m = starMaterial(); m.uniforms.uHot.value.set(...hot); m.uniforms.uCool.value.set(...cool); m.uniforms.uScale.value = scale;
  const body = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 96), m); g.add(body);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowMaterial(new THREE.Color(hot[0] * .12, hot[1] * .09, hot[2] * .08))); halo.scale.set(R * 2.6, R * 2.6, 1); halo.renderOrder = 2; g.add(halo);
  return { g, body, halo, m };
}
// inner layers for the cutaway: hydrogen shell, helium shell (the one that flashes), carbon–oxygen core
function layer(R, col, emissive) { const m = starMaterial(); m.uniforms.uHot.value.set(...col); m.uniforms.uCool.value.set(col[0] * .45, col[1] * .4, col[2] * .4); m.uniforms.uInner.value.set(...emissive); m.uniforms.uCut.value = 1; m.uniforms.uScale.value = 3.0; return new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), m); }

// ---------------- particles: soft round sprites ----------------
function pointsMat(size, opacity = 1) {
  return new THREE.ShaderMaterial({ uniforms: { uSize: { value: size }, uOp: { value: opacity }, uPx: { value: H / (2 * Math.tan(THREE.MathUtils.degToRad(38) / 2)) }, uScale: { value: 1 }, uGrow: { value: 1 }, uTw: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    vertexShader: `attribute float aS; uniform float uSize, uPx, uScale, uGrow, uTw; varying vec3 vC; varying float vA;
      void main(){ vC = color; vec3 p = position*uScale; p.y *= uGrow; vec4 mv = modelViewMatrix*vec4(p,1.); gl_PointSize = max(1.5, uSize*aS*uPx/-mv.z); vA = 1.0 - uTw*0.5*(0.5+0.5*sin(aS*91.0 + p.x*30.0)); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uOp; varying vec3 vC; varying float vA; void main(){ vec2 d = gl_PointCoord*2.-1.; float r = dot(d,d); if (r>1.) discard; float a = exp(-r*3.0); gl_FragColor = vec4(vC*a*uOp*vA, 1.0); }` });
}
function pointCloud(n, fn, size, op = 1) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), s = new Float32Array(n);
  for (let i = 0; i < n; i++) { const r = fn(i); pos.set(r.p, i * 3); col.set(r.c, i * 3); s[i] = r.s ?? 1; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  const o = new THREE.Points(g, pointsMat(size, op)); o.frustumCulled = false; return o;
}
const gauss = R => { let u = 0; for (let i = 0; i < 4; i++) u += R(); return (u - 2) / 1.15; };
const randDir = R => { const z = R() * 2 - 1, a = R() * TAU, r = Math.sqrt(1 - z * z); return [Math.cos(a) * r, z, Math.sin(a) * r]; };

// ---------------- WORLD: deep sky ----------------
const SKY = (() => { const R = mulberry(3); return pointCloud(9000, () => { const d = randDir(R), r = 1500, k = R(); const c = k < .2 ? [0.7, 0.8, 1.3] : k < .5 ? [1.2, 1.1, 1.0] : k < .8 ? [1.3, 1.0, 0.7] : [1.3, 0.75, 0.55]; const b = Math.pow(R(), 6) * 1.6 + .1; return { p: [d[0] * r, d[1] * r, d[2] * r], c: c.map(v => v * b), s: 0.5 + R() * 1.2 }; }, 4.5); })();
scene.add(SKY);
// a faint background band (dusty milky way) for the star shots
const BAND = (() => { const R = mulberry(5); return pointCloud(14000, () => { const a = R() * TAU, h = gauss(R) * 0.09, r = 1400; const d = [Math.cos(a), h + 0.25 * Math.sin(a), Math.sin(a)]; const L = Math.hypot(...d); const k = R(); return { p: d.map(v => v / L * r), c: (k < .5 ? [0.55, 0.45, 0.6] : [0.7, 0.55, 0.45]).map(v => v * (0.05 + R() * .12)), s: 1 + R() * 2.5 }; }, 7, 0.5); })();
BAND.rotation.set(0.9, 0.3, 0.4); scene.add(BAND);

// the red giant (main star) at the origin, radius 1
const GIANT = makeStar(1, [1.15, 0.3, 0.05], [0.28, 0.02, 0.004], 2.0); scene.add(GIANT.g);
const LAYERS = new THREE.Group(); scene.add(LAYERS);
const L_H = layer(0.62, [1.3, 0.5, 0.12], [0.9, 0.32, 0.07]), L_HE = layer(0.36, [1.6, 1.0, 0.25], [1.4, 0.85, 0.2]), L_C = layer(0.16, [1.4, 1.45, 1.7], [1.5, 1.5, 1.8]); LAYERS.add(L_H, L_HE, L_C);
// expelled shells (reused, one per recent launch)
const SHELLS = []; { for (let k = 0; k < 4; k++) { const R = mulberry(20 + k); const o = pointCloud(5200, () => { const d = randDir(R), r = 1 + gauss(R) * 0.025; const n = 0.6 + 0.4 * Math.sin(d[0] * 9 + k) * Math.sin(d[1] * 7) ; const w = R(); return { p: d.map(v => v * r), c: (w < .7 ? [1.4, 0.45, 0.18] : [1.6, 0.9, 0.4]).map(v => v * 0.09 * (0.35 + 0.5 * n)), s: 0.7 + R() * 1.3 }; }, 0.03, 1); scene.add(o); SHELLS.push(o); } }
// THE shell found by ALMA: a thin molecular shell with spiral filaments inside (radius 1, scaled per shot)
const BIGSHELL = (() => { const R = mulberry(77); const N = 22000; return pointCloud(N, (i) => {
  if (i < 17000) { const d = randDir(R), r = 1 + gauss(R) * 0.015; const clump = 0.5 + 0.5 * Math.abs(Math.sin(d[0] * 13 + d[2] * 5) * Math.cos(d[1] * 11)); return { p: d.map(v => v * r), c: [1.5 * clump + .2, 0.42 * clump + .08, 0.12].map(v => v * 0.07), s: 0.8 + R() * 1.4 }; }
  const th = R() * 5 * Math.PI, r = 0.1 + th / (5 * Math.PI) * 0.85, arm = R() < .5 ? 0 : Math.PI; const a = th + arm + gauss(R) * 0.25; return { p: [Math.cos(a) * r + gauss(R) * .05, gauss(R) * 0.08, Math.sin(a) * r + gauss(R) * .05], c: [0.9, 0.3, 0.12].map(v => v * 0.035), s: 0.5 + R() * 0.8 };
}, 0.022, 1); })(); scene.add(BIGSHELL);
// the hourglass (bipolar) nebula: two lobes of gas, blue at the tips, pink near the waist
const LOBES = (() => { const R = mulberry(91); return pointCloud(26000, () => { const sgn = R() < .5 ? 1 : -1, u = Math.pow(R(), 0.8), shell = R() < .75; const rad = (0.05 + 0.62 * Math.sin(u * Math.PI) * Math.pow(u, 0.35)) * (shell ? 1 + gauss(R) * 0.05 : R()); const a = R() * TAU;
  const tip = u; const c = [lerp(1.5, 0.45, tip), lerp(0.45, 0.65, tip), lerp(0.9, 1.6, tip)].map(v => v * (shell ? 0.04 : 0.015)); return { p: [Math.cos(a) * rad, sgn * u * 1.3, Math.sin(a) * rad], c, s: 0.6 + R() * 1.2 }; }, 0.028, 1); })(); scene.add(LOBES);
// our Sun (yellow), for "como el Sol" and the ending
const SUN = makeStar(1, [1.3, 0.92, 0.26], [0.5, 0.2, 0.03], 3.0); scene.add(SUN.g);
const GHOST = (() => { const R = mulberry(13); return pointCloud(6000, () => { const d = randDir(R); return { p: d, c: [0.5, 0.25, 0.12].map(v => v * 0.15), s: 0.6 + R() }; }, 0.03, 1); })(); scene.add(GHOST);
// the Milky Way (seen from far above), at x = 600
const GAL_O = new THREE.Vector3(600, 0, 0);
const GALAXY = (() => { const R = mulberry(41); const g = pointCloud(70000, (i) => {
  const k = R(); let x, z, y, c;
  if (k < 0.16) { const r = Math.abs(gauss(R)) * 0.9; const a = R() * TAU; x = Math.cos(a) * r * 1.5; z = Math.sin(a) * r * 0.7; y = gauss(R) * 0.25; c = [1.5, 1.1, 0.7]; }
  else { const inArm = R() < 0.62, arm = Math.floor(R() * 4), u = Math.pow(R(), 0.8), r = 0.8 + u * 6.2, th = Math.log(r / 0.8) / 0.24 + arm * Math.PI / 2 + (inArm ? 0 : R() * TAU); const sp = (0.35 + 0.3 * u) * gauss(R); x = Math.cos(th) * r + sp * Math.sin(th); z = Math.sin(th) * r - sp * Math.cos(th); y = gauss(R) * 0.08; const yb = R(); c = yb < .25 ? [0.8, 0.9, 1.6] : yb < .3 ? [1.6, 0.5, 0.7] : [1.0, 0.95, 1.05]; }
  const b = (0.12 + Math.pow(R(), 3) * 0.9) * 0.07; return { p: [x, y, z], c: c.map(v => v * b), s: 0.6 + R() * 1.6 }; }, 0.07, 1);
  g.position.copy(GAL_O); return g; })(); scene.add(GALAXY);
const SUNPOS = new THREE.Vector3(600 + 2.6 * Math.cos(2.1), 0, 2.6 * Math.sin(2.1));                 // ~26 000 ly from the centre (1 unit ≈ 10 000 ly)
const STARPOS = SUNPOS.clone().add(new THREE.Vector3(Math.cos(2.1 + 0.6), 0, Math.sin(2.1 + 0.6)).multiplyScalar(1.2));   // 12 000 ly further out (schematic direction)
// ALMA on the Chajnantor plateau at dusk, at x = -600: sky dome, desert, volcano cones on the horizon, a row of 12-m antennas
const ALMA = new THREE.Group(); ALMA.position.set(-600, 0, 0); scene.add(ALMA);
{
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vD; void main(){ float h = vD.y; vec3 top = vec3(0.012,0.02,0.06), mid = vec3(0.09,0.07,0.16), hor = vec3(0.85,0.36,0.14);
      float az = max(0., dot(normalize(vec2(vD.x, vD.z)), normalize(vec2(0.6,-1.0))));
      vec3 c = mix(mix(hor*(0.45+0.8*az*az), mid, smoothstep(0.0, 0.14, h)), top, smoothstep(0.12, 0.6, h)); if (h < 0.0) c = vec3(0.03,0.02,0.02);
      gl_FragColor = vec4(c, 1.0); }` }));
  ALMA.add(sky);
  const g = new THREE.PlaneGeometry(600, 600, 240, 240); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  const cone = (x, z, cx, cz, h, r) => Math.max(0, h * (1 - Math.hypot(x - cx, z - cz) / r));
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let y = 0.05 * Math.sin(x * 0.9) * Math.cos(z * 0.7) + 0.02 * Math.sin(x * 3.1 + z * 2.3);
    y += cone(x, z, -60, -170, 46, 75) + cone(x, z, 30, -200, 38, 70) + cone(x, z, 120, -180, 30, 80) + cone(x, z, -150, -150, 22, 70); p.setY(i, y); }
  g.computeVertexNormals();
  ALMA.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#9a6a4e', roughness: 0.97, metalness: 0 })));
  const white = new THREE.MeshStandardMaterial({ color: '#f2f3f4', roughness: 0.42, metalness: 0.0 }), grey = new THREE.MeshStandardMaterial({ color: '#b8bcc2', roughness: 0.5, metalness: 0.0 });
  const dishW = white.clone(); dishW.side = THREE.DoubleSide;
  const prof = []; for (let k = 0; k <= 24; k++) { const r = k / 24 * 1.9; prof.push(new THREE.Vector2(r, r * r * 0.17)); }
  const dishG = new THREE.LatheGeometry(prof, 72);
  ALMA.userData.dishes = [];
  const SP = []; for (let i = 0; i < 11; i++) SP.push([-16 + i * 3.4 + Math.sin(i * 2.1) * 0.8, -4 - (i % 3) * 3.2 - Math.cos(i) * 0.6]);
  SP.forEach(([x, z], i) => {
    const ant = new THREE.Group(); ant.position.set(x, 0, z); ALMA.add(ant);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 2.4, 32), white); ped.position.y = 1.2; ant.add(ped);
    const yoke = new THREE.Group(); yoke.position.y = 2.55; ant.add(yoke);
    const turret = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.3), white); yoke.add(turret);
    for (const sx of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.4, 0.7), white); arm.position.set(sx * 1.15, 0.7, 0); yoke.add(arm); }
    const tilt = new THREE.Group(); tilt.position.y = 1.25; yoke.add(tilt);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.2, 1.4), white); cabin.position.y = -0.3; tilt.add(cabin);
    const dsh = new THREE.Mesh(dishG, dishW); dsh.position.y = 0.35; tilt.add(dsh);
    const sub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 20), grey); sub.position.y = 2.2; tilt.add(sub);
    for (let q = 0; q < 4; q++) { const a = q / 4 * TAU + 0.785, foot = new THREE.Vector3(Math.cos(a) * 1.35, 0.35 + 0.31, Math.sin(a) * 1.35), top = new THREE.Vector3(0, 2.15, 0);
      const len = foot.distanceTo(top), leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6), grey); leg.position.copy(foot).add(top).multiplyScalar(0.5); leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().sub(foot).normalize()); tilt.add(leg); }
    ALMA.userData.dishes.push({ yoke, tilt, i });
  });
  const sun = new THREE.DirectionalLight('#ffd6b4', 2.4); sun.position.set(30, 16, 45); ALMA.add(sun); sun.target.position.set(0, 0, -6); ALMA.add(sun.target);
  const sky2 = new THREE.HemisphereLight('#56628a', '#5a3424', 0.8); ALMA.add(sky2);
  const fill = new THREE.DirectionalLight('#8fa6d8', 0.6); fill.position.set(-30, 20, 40); ALMA.add(fill);
}
// a lit-only-for-ALMA trick: everything else in the scene is emissive/additive, so lights only matter there

// ---------------- camera keys per shot ----------------
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const tgt = new THREE.Vector3();
function look(px, py, pz, tx, ty, tz, fov = 38) { cam.position.set(px, py, pz); tgt.set(tx, ty, tz); cam.fov = fov; cam.up.set(0, 1, 0); cam.lookAt(tgt); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
const orb = (r, a, y, c = [0, 0, 0]) => [c[0] + Math.sin(a) * r, c[1] + y, c[2] + Math.cos(a) * r];
function camHook(t) { const [x, y, z] = orb(7.4 + 0.35 * Math.sin(TAU * t / DUR * 2), 0.35 + 0.18 * Math.sin(TAU * t / DUR), 0.9 + 0.25 * Math.sin(TAU * t / DUR * 3)); return [x, y, z, 0, -0.55, 0]; }

// ---------------- per frame ----------------
function hideAll() { for (const o of [GIANT.g, LAYERS, BIGSHELL, LOBES, SUN.g, GHOST, GALAXY, ALMA, BAND, ...SHELLS]) o.visible = false; }
function setStarPulse(S, pl) { S.m.uniforms.uPulse.value = pl; S.halo.material.uniforms.uI.value = 1 + 1.4 * pl; }
function shellsAt(t, Rs, gain = 1) { const live = LAUNCH.filter(L => t >= L && t - L < 3.2); SHELLS.forEach((o, i) => { const L = live[live.length - 1 - i]; if (L == null) { o.visible = false; return; } const age = t - L; o.visible = true;
  o.material.uniforms.uScale.value = Rs * (1.04 + age * 0.55); o.material.uniforms.uOp.value = gain * Math.pow(1 - age / 3.2, 1.6) * (0.4 + 0.6 * clamp(age * 4)); o.material.uniforms.uSize.value = 0.05 * Rs; o.rotation.y = L * 1.7; }); }
let STATE = {};
function update(t) {
  hideAll(); const ph = LOOPPH(t); for (const S of [GIANT, SUN]) S.m.uniforms.uPh.value.set(ph[0], ph[1]);
  for (const m of [L_H, L_HE, L_C]) m.material.uniforms.uPh.value.set(ph[0], ph[1]);
  SKY.visible = true; BAND.visible = true; bloom.strength = 0.5; renderer.toneMappingExposure = 1.0;
  const pl = pulseAt(t); STATE = { pl };
  GIANT.m.uniforms.uCut.value = 0; GIANT.g.scale.setScalar(1); GIANT.g.position.set(0, 0, 0); GIANT.g.rotation.set(0.2, t * 0.02, 0);
  if (t < 6.1 || t >= 48.4) {                                  // A / I / J: the beating giant
    GIANT.g.visible = true; const s = 1 + 0.035 * pl; GIANT.g.scale.setScalar(s); setStarPulse(GIANT, pl); shellsAt(t, 1, 1.0);
    let c = camHook(t);
    if (t >= 48.4 && t < 53.6) { const k = seg(t, 48.4, 53.6); c = [...orb(9.4 - 0.6 * k, 0.2 + 0.25 * k, 0.6), 0, 0.6, 0]; }
    if (t >= 53.6) { const k = eio(seg(t, 53.6, 57.5)), a = [...orb(8.8, 0.45, 0.6), 0, 0.6, 0], b = camHook(t - DUR); c = a.map((v, i) => lerp(v, b[i], k)); }
    look(...c);
  } else if (t < 10.2) {                                        // B: the Milky Way from above, Sun → star
    GALAXY.visible = true; SKY.visible = true; BAND.visible = false; bloom.strength = 0.7;
    const k = eio(seg(t, 6.1, 9.8)); const mid = SUNPOS.clone().lerp(STARPOS, 0.5);
    const c0 = GAL_O.clone().add(V3(0, 13, 6)), c1 = mid.clone().add(V3(0.6, 4.2, 2.6));
    const p = c0.clone().lerp(c1, k), tg = GAL_O.clone().lerp(mid, k);
    GALAXY.rotation.y = 0.02 * (t - 6.1); GALAXY.updateMatrixWorld();
    look(p.x, p.y, p.z, tg.x, tg.y, tg.z, 42);
  } else if (t < 15.7) {                                        // C: a Sun-like star swells into a red giant
    const g = eio(seg(t, 12.8, 14.9));
    if (g < 0.5) { SUN.g.visible = true; const s = lerp(0.32, 0.6, g * 2); SUN.g.scale.setScalar(s); setStarPulse(SUN, 0); }
    if (g > 0.3) { GIANT.g.visible = true; GIANT.g.scale.setScalar(lerp(0.5, 1, (g - 0.3) / 0.7)); setStarPulse(GIANT, 0); GIANT.halo.material.uniforms.uI.value = (g - 0.3) / 0.7 * 1.2; }
    if (g > 0.3 && g < 0.5) { SUN.halo.material.uniforms.uI.value = 1 - (g - 0.3) / 0.2; }
    const [x, y, z] = orb(lerp(4.6, 7.6, eio(seg(t, 12.6, 15.2))), lerp(-0.4, 0.35, seg(t, 10.2, 15.7)), 0.5); look(x, y, z, 0, -0.35, 0);
  } else if (t < 23.6) {                                        // D: inside — the helium shell flashes, shells thrown out
    GIANT.g.visible = true; LAYERS.visible = true; const ex = eio(seg(t, 15.8, 16.8));
    GIANT.m.uniforms.uCut.value = ex > 0.02 ? 1 : 0; setStarPulse(GIANT, pl * 0.4);
    GIANT.g.scale.setScalar(1 + 0.03 * pl); LAYERS.scale.setScalar(1 + 0.03 * pl); LAYERS.rotation.copy(GIANT.g.rotation);
    L_HE.material.uniforms.uPulse.value = pl * 2.5; L_HE.scale.setScalar(1 + 0.12 * pl); L_C.material.uniforms.uPulse.value = pl;
    bloom.strength = 0.5 + 0.8 * pl;
    if (t > 20.9) shellsAt(t, 1, 1.1);
    const [x, y, z] = orb(lerp(6.6, 9.4, eio(seg(t, 20.8, 23.0))), lerp(0.75, 1.1, seg(t, 15.7, 23.6)), 0.9); look(x, y, z, 0, -0.35, 0);
  } else if (t < 26.0) {                                        // E: ALMA, Chile, at night; the antennas slew and lock
    ALMA.visible = true; BAND.visible = false; SKY.visible = false; bloom.strength = 0.35;
    const sl = eio(seg(t, 23.8, 25.0));
    ALMA.userData.dishes.forEach(d => { d.yoke.rotation.y = lerp(-1.0, 0.35, sl) + d.i * 0.003; d.tilt.rotation.x = lerp(0.2, 0.7, sl); });
    const k = seg(t, 23.6, 26.0); look(-600 + lerp(-10, -4, k), lerp(2.0, 2.6, k), lerp(19, 16, k), -600 + lerp(-2, 1, k), 3.6, -8, 40); renderer.toneMappingExposure = 1.1;
  } else if (t < 37.9) {                                        // F: the shell found around the star (half a light-year), spiral filaments inside
    GIANT.g.visible = true; GIANT.g.scale.setScalar(0.09); setStarPulse(GIANT, 0); GIANT.halo.material.uniforms.uI.value = 1.6;
    BIGSHELL.visible = t > 29.4; const sk = eo(seg(t, 29.5, 30.7)); BIGSHELL.material.uniforms.uScale.value = lerp(0.2, 1, sk); BIGSHELL.material.uniforms.uOp.value = sk * (t > 35.7 ? 1.25 : 1);
    BIGSHELL.rotation.set(0.5, (t - 26) * 0.05, 0.15);
    const [x, y, z] = orb(lerp(7.0, 5.6, eio(seg(t, 26.0, 37.5))), 0.6 + (t - 26) * 0.03, 0.55); look(x, y, z, 0, -0.35, 0);
  } else if (t < 43.65) {                                       // G: the hourglass nebula opens
    GIANT.g.visible = true; GIANT.g.scale.setScalar(0.09); GIANT.halo.material.uniforms.uI.value = 2.2;
    BIGSHELL.visible = true; BIGSHELL.material.uniforms.uScale.value = 1; BIGSHELL.material.uniforms.uOp.value = 0.3; BIGSHELL.rotation.set(0.5, (t - 26) * 0.05, 0.15);
    LOBES.visible = true; const g = eio(seg(t, 39.9, 42.9)); LOBES.material.uniforms.uGrow.value = 0.3 + 0.7 * g; LOBES.material.uniforms.uScale.value = 0.35 + 0.45 * g; LOBES.material.uniforms.uOp.value = clamp(seg(t, 39.6, 40.4)) * (0.6 + 0.4 * g); LOBES.rotation.set(0.25, (t - 37.9) * 0.25, 0.3);
    const [x, y, z] = orb(lerp(6.0, 5.2, seg(t, 37.9, 43.65)), 1.2 + (t - 37.9) * 0.12, 0.25); look(x, y, z, 0, -0.2, 0);
  } else {                                                      // H: our Sun, and the outline of what it will become
    SUN.g.visible = true; SUN.g.scale.setScalar(0.38); setStarPulse(SUN, 0); SUN.g.rotation.y = t * 0.05;
    const g = eo(seg(t, 44.4, 45.8)); GHOST.visible = g > 0; GHOST.material.uniforms.uScale.value = lerp(0.5, 1.5, g); GHOST.material.uniforms.uOp.value = 0.8 * g;
    const [x, y, z] = orb(lerp(3.2, 3.8, seg(t, 43.65, 48.4)), (t - 43.65) * 0.1, 0.2); look(x, y, z, 0, 0.12, 0);
  }
}

// ---------------- overlay (documentary lower thirds) ----------------
const SUBS = await (await fetch('subs.json')).json();
await Promise.all(['800 40px Mont', '900 40px Mont', '600 40px Inter', '300 40px Raj', '500 40px Raj', '600 40px Raj'].map(f => document.fonts.load(f, 'Aaéñ¿ÚÍ0')));
const toScreen = v => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; };
function fadeIn(t, t0, d = 0.35) { return t0 < 0 ? 1 : ss(seg(t, t0, t0 + d)); }
function fadeOut(t, t1, d = 0.3) { return 1 - ss(seg(t, t1, t1 + d)); }
function typeOn(s, t, t0, cps = 28) { if (t0 < 0) return s; return s.slice(0, Math.floor(clamp((t - t0) * cps, 0, s.length))); }
function shadowText(x, s, px, py, font, col = '#fff', align = 'left', a = 1) { x.save(); x.globalAlpha = a; x.font = font; x.textAlign = align; x.textBaseline = 'alphabetic'; x.shadowColor = 'rgba(0,0,0,.75)'; x.shadowBlur = 18; x.fillStyle = col; x.fillText(s, px, py); x.restore(); }
const ACCC = '#ffb15c';
// title block: small kicker + big two-line title, left aligned with an accent rule
function title(x, t, t0, t1, kicker, l1, l2, o = {}) { if (t < t0 - 0.01 || t > t1 + 0.35) return; const a = fadeIn(t, t0) * fadeOut(t, t1); const y = o.y ?? 250, X = 80;
  x.save(); x.globalAlpha = a; x.fillStyle = ACCC; x.fillRect(X, y - 46, 70 * eo(t0 < 0 ? 1 : seg(t, t0, t0 + .5)), 5); x.restore();
  shadowText(x, typeOn(kicker, t, t0 < 0 ? -1 : t0, 40), X, y, '600 34px Inter', ACCC, 'left', a);
  let fs = o.size ?? 96; x.font = `900 ${fs}px Mont`; while (Math.max(x.measureText(l1).width, x.measureText(l2 || '').width) > W - 160 && fs > 50) { fs -= 4; x.font = `900 ${fs}px Mont`; }
  shadowText(x, l1, X, y + fs + 10, `900 ${fs}px Mont`, '#ffffff', 'left', a * fadeIn(t, t0 + 0.1));
  if (l2) shadowText(x, l2, X, y + 2 * fs + 16, `900 ${fs}px Mont`, '#ffffff', 'left', a * fadeIn(t, t0 + 0.25));
}
function label(x, t, t0, t1, s, px, py, o = {}) { if (t < t0 || t > t1 + 0.3) return; const a = fadeIn(t, t0, .25) * fadeOut(t, t1); const fs = o.size ?? 40;
  x.save(); x.font = `600 ${fs}px Inter`; const w = x.measureText(s).width; const X = o.align === 'center' ? px - w / 2 : px; x.globalAlpha = a * 0.55; x.fillStyle = '#000'; x.fillRect(X - 18, py - fs - 12, w + 36, fs + 30); x.globalAlpha = a; x.fillStyle = o.acc ? ACCC : '#fff'; x.fillRect(X - 18, py - fs - 12, 5, fs + 30); x.restore();
  shadowText(x, typeOn(s, t, t0, 40), X, py, `600 ${fs}px Inter`, o.acc ? ACCC : '#fff', 'left', a); }
function marker(x, p, s, a, side = 1, pulse = 0) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = '#fff'; x.lineWidth = 2.4; x.beginPath(); x.arc(p[0], p[1], 16 + 10 * pulse, 0, TAU); x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.arc(p[0], p[1], 4, 0, TAU); x.fill();
  x.beginPath(); x.moveTo(p[0] + side * 22, p[1]); x.lineTo(p[0] + side * 70, p[1] - 40); x.stroke(); x.restore(); shadowText(x, s, p[0] + side * 78, p[1] - 44, '600 34px Inter', '#fff', side > 0 ? 'left' : 'right', a); }
function subs(x, t) { const c = SUBS.find(s => t >= s.t0 - 0.05 && t < s.t1); if (!c) return; const a = c.t0 < .05 ? 1 : Math.min(seg(t, c.t0 - .05, c.t0 + .08), 1 - seg(t, c.t1 - .08, c.t1));
  let fs = 54; x.font = `800 ${fs}px Mont`; while (x.measureText(c.text).width > 960 && fs > 36) { fs -= 2; x.font = `800 ${fs}px Mont`; }
  x.save(); x.globalAlpha = a; x.textAlign = 'center'; x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = 'rgba(0,0,0,.85)'; x.strokeText(c.text, W / 2, 1720); x.fillStyle = '#fff'; x.fillText(c.text, W / 2, 1720); x.restore(); }
function scaleBar(x, t) { if (t < 30.75 || t > 37.9) return; const a = fadeOut(t, 37.6) * ss(seg(t, 30.75, 31.1)); const C = toScreen(V3(0, 0, 0)), R0 = cam.position.distanceTo(V3(0, 0, 0)); const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
  const L = toScreen(right.clone().multiplyScalar(-1)), Rr = toScreen(right.clone().multiplyScalar(1)); const y = Math.max(L[1], Rr[1]) + 420, k = eo(seg(t, 30.8, 31.5)), m = (L[0] + Rr[0]) / 2;
  x.save(); x.globalAlpha = a; x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.moveTo(m - (m - L[0]) * k, y); x.lineTo(m + (Rr[0] - m) * k, y); for (const px of [L[0], Rr[0]]) { x.moveTo(px, y - 16); x.lineTo(px, y + 16); } x.stroke(); x.restore();
  shadowText(x, 'medio año luz', m, y + 56, '600 40px Inter', '#fff', 'center', a * ss(seg(t, 31.2, 31.6))); }
function question(x, t) { if (t < 48.45 || t > 53.6) return; const a = fadeIn(t, 48.5) * fadeOut(t, 53.3);
  shadowText(x, '¿Las estrellas', W / 2, 360, '900 92px Mont', '#fff', 'center', a); shadowText(x, 'tienen latidos?', W / 2, 470, '900 104px Mont', ACCC, 'center', a * fadeIn(t, 49.3));
  for (const [s, cx, t0, hot] of [['SÍ', 330, 51.7, 52.5], ['NO', 750, 51.8, 52.6]]) { if (t < t0) continue; const b = a * fadeIn(t, t0, .2), on = t > hot && t < hot + 0.45;
    x.save(); x.globalAlpha = b; x.fillStyle = on ? ACCC : 'rgba(0,0,0,.55)'; x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.roundRect(cx - 130, 1290, 260, 130, 65); x.fill(); x.stroke(); x.restore(); shadowText(x, s, cx, 1382, '900 80px Mont', on ? '#000' : '#fff', 'center', b); } }
function overlay(t) {
  const x = OX; x.clearRect(0, 0, W, H);
  // A (frame 1) and J (it is written again for the loop)
  title(x, t, -1, 6.05, 'VISTO POR PRIMERA VEZ', 'El último latido', 'de una estrella');
  title(x, t, 57.2, 99, 'VISTO POR PRIMERA VEZ', 'El último latido', 'de una estrella');
  label(x, t, 4.5, 6.05, 'Congelado en gas', 80, 1480, { acc: true });
  // B
  if (t >= 6.1 && t < 10.2) { const a = fadeIn(t, 6.3) * fadeOut(t, 9.95), ps = toScreen(SUNPOS.clone().applyAxisAngle(V3(0, 1, 0), 0).sub(GAL_O).applyAxisAngle(V3(0, 1, 0), GALAXY.rotation.y).add(GAL_O)), pq = toScreen(STARPOS.clone().sub(GAL_O).applyAxisAngle(V3(0, 1, 0), GALAXY.rotation.y).add(GAL_O));
    marker(x, ps, 'Nosotros', a * fadeIn(t, 6.5), -1); const k = eo(seg(t, 6.9, 8.0)); x.save(); x.globalAlpha = a; x.setLineDash([16, 12]); x.lineDashOffset = -t * 50; x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.moveTo(ps[0], ps[1]); x.lineTo(lerp(ps[0], pq[0], k), lerp(ps[1], pq[1], k)); x.stroke(); x.restore();
    if (t > 8.0) marker(x, pq, 'IRAS 06530-0213', a * fadeIn(t, 8.0), 1, (t * 1.2) % 1);
    title(x, t, 6.6, 9.95, 'DISTANCIA', `${Math.max(1, Math.round(12 * eo(seg(t, 6.9, 8.0))))}.000 años luz`, '', { size: 92 });
    label(x, t, 8.4, 9.95, 'En la constelación del Unicornio', 80, 1440, { acc: true, size: 38 }); label(x, t, 9.0, 9.95, 'Esquema · sin escala', 80, 1530, { size: 28 }); }
  // C
  label(x, t, 10.4, 12.6, 'Una estrella como el Sol', 80, 330); label(x, t, 11.7, 12.7, 'al final de su vida…', 80, 420, { size: 34 });
  title(x, t, 14.2, 15.6, 'SE HINCHA Y SE CONVIERTE EN', 'Gigante roja', '');
  // D
  label(x, t, 15.8, 17.6, 'Por dentro', 80, 300);
  if (t > 16.6 && t < 23.6) { const a = fadeIn(t, 16.7) * fadeOut(t, 23.3); const p = toScreen(V3(0.25, 0.25, 0.25).applyEuler(GIANT.g.rotation)); x.save(); x.globalAlpha = a; x.strokeStyle = '#fff'; x.lineWidth = 2.4; x.beginPath(); x.arc(p[0], p[1], 8, 0, TAU); x.moveTo(p[0] + 8, p[1] - 6); x.lineTo(p[0] + 120, p[1] - 160); x.lineTo(W - 90, p[1] - 160); x.stroke(); x.restore(); shadowText(x, 'Capa de helio', W - 90, p[1] - 176, '600 36px Inter', ACCC, 'right', a); }
  title(x, t, 17.95, 23.4, 'SACUDIDAS', 'Pulsos térmicos', '', { size: 96 });
  label(x, t, 19.2, 23.4, 'Estallidos de fusión nuclear', 80, 470, { size: 38 });
  label(x, t, 21.0, 23.4, 'Lanzan capas de gas al espacio', 80, 1440, { acc: true });
  // E
  title(x, t, 23.7, 25.9, 'RADIOTELESCOPIO', 'ALMA', '', { size: 120 }); label(x, t, 24.7, 25.9, 'Desierto de Atacama, Chile', 80, 520, { size: 38 });
  // F
  label(x, t, 26.2, 29.4, 'Equipo liderado desde el JPL (NASA)', 80, 300, { size: 36 });
  title(x, t, 29.7, 32.3, 'ALREDEDOR DE LA ESTRELLA', 'Una cáscara', 'de gas', { size: 92 });
  title(x, t, 32.5, 35.5, 'EXPULSADA HACE', `~${(n => n >= 1000 ? Math.floor(n / 1000) + '.' + String(n % 1000).padStart(3, '0') : n)(Math.round(6500 * eo(seg(t, 32.7, 34.3))))} años`, '', { size: 96 });
  title(x, t, 35.75, 37.8, 'ES LA HUELLA DEL', 'Último pulso', '', { size: 104 });
  scaleBar(x, t); label(x, t, 30.0, 37.8, 'Ilustración · tamaños sin escala', W / 2, 1560, { size: 26, align: 'center' });
  // G
  title(x, t, 38.0, 41.1, 'EMPEZÓ HACE', `~${Math.round(700 * eo(seg(t, 38.4, 39.2)))} años`, '', { size: 100 });
  title(x, t, 41.3, 43.5, 'NEBULOSA CON FORMA DE', 'Reloj de arena', '', { size: 96 });
  // H
  title(x, t, 43.8, 48.3, 'Y PASARÁ POR ALGO PARECIDO', 'Nuestro Sol', '', { size: 104 });
  label(x, t, 45.9, 48.3, 'Dentro de miles de millones de años', 80, 1540, { acc: true, size: 38 });
  question(x, t);
  subs(x, t);
}
function renderFrame(t) { update(t); composer.render(); overlay(t); }
window.renderFrame = renderFrame; window.DUR = DUR;
renderFrame(0); window.READY = true;
// cover: the giant mid-beat, a shell flying off, the title, a scale value
window.renderCover = () => {
  update(0.05); GIANT.g.scale.setScalar(1.035); setStarPulse(GIANT, 1); look(...orb(6.6, 0.55, 0.5), 0, 0.95, 0); SHELLS[0].visible = true; SHELLS[0].material.uniforms.uScale.value = 1.45; SHELLS[0].material.uniforms.uOp.value = 0.9; SHELLS[0].material.uniforms.uSize.value = 0.045;
  composer.render(); const x = OX; x.clearRect(0, 0, W, H);
  const g = x.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, 'rgba(0,0,0,.65)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, 700);
  shadowText(x, 'SU ÚLTIMO', W / 2, 300, '900 150px Mont', '#fff', 'center'); shadowText(x, 'LATIDO', W / 2, 470, '900 190px Mont', ACCC, 'center');
  x.save(); x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.roundRect(W / 2 - 300, 1600, 600, 110, 55); x.fill(); x.restore(); shadowText(x, 'a 12.000 años luz', W / 2, 1675, '800 56px Mont', '#fff', 'center');
};

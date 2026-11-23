const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
const qScene = new THREE.Scene(); qScene.add(quad);
const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const QVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const IW = W * SS, IH = H * SS;
const mkRT = (type, filter) => new THREE.WebGLRenderTarget(IW, IH, { type, minFilter: filter, magFilter: filter, depthBuffer: true, generateMipmaps: false });
const rtA = mkRT(THREE.HalfFloatType, THREE.NearestFilter), rtL = mkRT(THREE.HalfFloatType, THREE.NearestFilter), rtD = mkRT(THREE.HalfFloatType, THREE.NearestFilter);
const rtR = mkRT(THREE.FloatType, THREE.NearestFilter);
const rtP1 = mkRT(THREE.UnsignedByteType, THREE.LinearFilter), rtP2 = mkRT(THREE.UnsignedByteType, THREE.LinearFilter), rtC = mkRT(THREE.UnsignedByteType, THREE.LinearFilter);
const focData = new Float32Array(32 * 4), focTex = new THREE.DataTexture(focData, 32, 1, THREE.RGBAFormat, THREE.FloatType);
focTex.minFilter = focTex.magFilter = THREE.NearestFilter;
const postMat = new THREE.ShaderMaterial({ vertexShader: QVS, fragmentShader: POST_FS,
  uniforms: { tA: { value: rtA.texture }, tL: { value: rtL.texture }, tD: { value: rtD.texture }, tR: { value: rtR.texture }, tFoc: { value: focTex },
    uRes: { value: new THREE.Vector2(IW, IH) }, uSS: { value: SS }, uTime: SHARED.uTime, uBoil: { value: 0 }, uRdT: { value: -100 }, uRdC: { value: new THREE.Vector2() }, uRdK: { value: 0 } } });
const compMat = new THREE.ShaderMaterial({ vertexShader: QVS, fragmentShader: COMP_FS,
  uniforms: { tV1: { value: rtP1.texture }, tV2: { value: rtP2.texture }, tTag: { value: tagT }, tInk: { value: inkT }, tCol: { value: colT },
    uIris: { value: new THREE.Vector4() }, uLabOff: { value: new THREE.Vector2() }, uLabS: { value: 1 }, uSS: { value: SS } } });
const downMat = new THREE.ShaderMaterial({ vertexShader: QVS, uniforms: { tP: { value: rtC.texture }, uPx: { value: new THREE.Vector2(1 / IW, 1 / IH) } },
  fragmentShader: `uniform sampler2D tP; uniform vec2 uPx; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tP, vUv).rgb*0.5 + 0.125*(texture2D(tP, vUv+vec2(uPx.x*1.5,0.)).rgb + texture2D(tP, vUv-vec2(uPx.x*1.5,0.)).rgb + texture2D(tP, vUv+vec2(0.,uPx.y*1.5)).rgb + texture2D(tP, vUv-vec2(0.,uPx.y*1.5)).rgb);
  gl_FragColor = vec4(c, 1.0); }` });
const copyMat = new THREE.ShaderMaterial({ vertexShader: QVS, uniforms: { tP: { value: rtC.texture } }, fragmentShader: `uniform sampler2D tP; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tP, vUv).rgb, 1.0); }` });
const MESHES = []; scene.traverse(o => { if (o.isMesh) MESHES.push(o); });
function pass(n, rt, clear) { SHARED.uPass.value = n; renderer.setRenderTarget(rt); renderer.setClearColor(new THREE.Color(clear[0], clear[1], clear[2]), clear[3]); renderer.clear(true, true, true); renderer.render(scene, camera); }
function renderView(v, out) {
  setCamera(v);
  const hide = v.hide || [];
  for (const o of MESHES) o.visible = !hide.includes(o.material.uniforms.uId.value) && (o !== MIC.swab || MIC.swabOn);
  focData.fill(1); for (const [k, f] of Object.entries(v.focus || {})) focData[+k * 4] = f; focTex.needsUpdate = true;
  const rd = v.redraw; postMat.uniforms.uRdT.value = rd ? rd.t : -100;
  if (rd) { postMat.uniforms.uRdC.value.set(rd.cx, H - rd.cy); postMat.uniforms.uRdK.value = rd.k; }
  pass(0, rtA, [0, 0, 0, 0]); pass(1, rtL, [1, 400, 0.5, 0.5]); pass(2, rtD, [Math.cos(0.64) * 0.5 + 0.5, Math.sin(0.64) * 0.5 + 0.5, 0, 0.6]); pass(3, rtR, [0, 0, -100, 0]);
  quad.material = postMat; renderer.setRenderTarget(out); renderer.render(qScene, qCam);
}
function labelTooth(v) {
  setCamera(v);
  const P0 = V(camera.position.x, camera.position.y, camera.position.z - 3), P1 = P0.clone().add(V(1, 1, 0));
  const a0 = P0.clone().project(refCam), b0 = P0.clone().project(camera), a1 = P1.clone().project(refCam), b1 = P1.clone().project(camera);
  const sc = (a1.x - a0.x) / (b1.x - b0.x);
  compMat.uniforms.uLabS.value = isFinite(sc) ? sc : 1;
  compMat.uniforms.uLabOff.value.set((a0.x * 0.5 + 0.5) * W - sc * (b0.x * 0.5 + 0.5) * W, (a0.y * 0.5 + 0.5) * H - sc * (b0.y * 0.5 + 0.5) * H);
}
function renderFilm(t) {
  const f = Math.round(t * FPS); BOIL = Math.floor(f / 2) % 3; postMat.uniforms.uBoil.value = BOIL;
  SHARED.uTime.value = t; SHARED.uWindT.value = Math.floor(t * 12) / 12;
  animate(t); MIC.swabOn = MIC.swab.visible;
  const vs = views(t);
  renderView(vs.main, rtP1);
  if (vs.inset) renderView(vs.inset, rtP2);
  const ir = vs.iris;
  compMat.uniforms.uIris.value.set(ir ? ir.cx : 0, ir ? ir.cy : 0, ir ? ir.r : 0, ir && ir.inner && vs.inset ? 1 : 0);
  drawOverlay(t, ir);
  labelTooth(vs.main);
  quad.material = compMat; renderer.setRenderTarget(SS > 1 ? rtC : null); renderer.render(qScene, qCam);
  if (SS > 1) { quad.material = downMat; renderer.setRenderTarget(null); renderer.render(qScene, qCam); }
  setCamera(vs.main);
}
window.DUR = TL.end;
window.renderFrame = (t) => { renderFilm(t); return true; };
window.TEXTS = (t) => { renderFilm(t); return TXT.map(x => ({ ...x })); };
(async () => {
  try { await document.fonts.load(`40px ${FONT}`, 'Jonathan ¿áéíóúñ'); } catch (e) { }
  SUBS = await (await fetch('subs.json')).json();
  buildLabels();
  renderFilm(0);
  window.READY = true;
})();
// cover: everything drawn, a close three-quarter of Jonathan, two big paper tags
window.renderCover = () => {
  BOIL = 0; SHARED.uTime.value = 100; SHARED.uWindT.value = 0; animate(8.0); MIC.swabOn = false;
  const v = VP(V(-0.06, 1.2, 3.7), V(-0.06, 1.2, 3.7), PLATE_IDS);
  renderView(v, rtP1);
  compMat.uniforms.uIris.value.set(0, 0, 0, 0);
  for (const c of [tg, ik, cl]) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); }
  const big = (s, x, y, size, rot, seed, col = '#000') => { const T = textLayout(s, size, seed); const pad = 40, w = T.tot + pad * 2, h = size * 1.3;
    for (const c of [tg, ik]) { c.save(); c.translate(x, y); c.rotate(rot); c.translate(-w / 2, 0); }
    tg.fillStyle = '#fff'; tg.beginPath(); tg.roundRect(0, -h / 2, w, h, 10); tg.fill();
    pline(ik, [[0, -h / 2], [w, -h / 2 + 2], [w + 2, h / 2], [0, h / 2 - 2], [0, -h / 2]], 1, 4, seed + 5, 0.85);
    textDraw(ik, T, pad, size * 0.36, 1, 1, col); ik.restore(); tg.restore(); };
  big('194 AÑOS', W / 2 - 10, 300, 190, -0.04, 7);
  big('Y VIVA', W / 2 + 40, 560, 170, 0.035, 9, 'rgb(150,60,20)');
  tagT.needsUpdate = true; inkT.needsUpdate = true; colT.needsUpdate = true;
  labelTooth(v);
  quad.material = compMat; renderer.setRenderTarget(SS > 1 ? rtC : null); renderer.render(qScene, qCam);
  if (SS > 1) { quad.material = downMat; renderer.setRenderTarget(null); renderer.render(qScene, qCam); }
  return true;
};

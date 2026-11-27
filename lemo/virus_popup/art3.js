// Paper-cut art for "Un virus apagó un gen": chimp & human busts, gene bulbs, retrovirus, scissors, organoids, neurons, puzzle piece, 8 % pie
import { mulberry, TAU } from './lib.js';
import { sh, blob, crescent, INK, rr } from './paper.js';
import { cut } from './art.js';

const LW = 9, LW2 = 5;
function eye(x, ex, ey, r) { x.beginPath(); x.ellipse(ex, ey, r * .62, r, 0, 0, TAU); x.fillStyle = INK; x.fill(); x.beginPath(); x.ellipse(ex - r * .2, ey - r * .4, r * .22, r * .3, 0, 0, TAU); x.fillStyle = '#fff'; x.fill(); }

// Chimpanzee bust, facing slightly right. hm = height
export function chimp(hm) {
  return cut(hm * .9, hm, (x, W, H) => {
    const FUR = '#5b3d2e', FURS = '#3f281d', FACE = '#e8c39e', FACES = '#c99c75';
    // shoulders
    const sho = () => { x.beginPath(); x.moveTo(W * .04, H); x.quadraticCurveTo(W * .08, H * .66, W * .5, H * .64); x.quadraticCurveTo(W * .92, H * .66, W * .96, H); x.closePath(); };
    crescent(x, sho, FURS, 30, 0, FUR); sho(); sh(x, null, LW);
    // ears
    for (const s of [-1, 1]) { x.beginPath(); x.ellipse(W * .5 + s * W * .36, H * .36, W * .1, H * .085, 0, 0, TAU); sh(x, FACE, LW); x.beginPath(); x.ellipse(W * .5 + s * W * .36, H * .36, W * .05, H * .045, 0, 0, TAU); x.fillStyle = FACES; x.fill(); }
    // head
    const hd = () => blob(x, W * .5, H * .34, W * .33, H * .3, .03, 4, 30);
    crescent(x, hd, FURS, 26, 20, FUR); hd(); sh(x, null, LW);
    // face mask (heart shape)
    const fc = () => { x.beginPath(); x.moveTo(W * .5, H * .2); x.bezierCurveTo(W * .3, H * .1, W * .2, H * .3, W * .3, H * .42); x.bezierCurveTo(W * .26, H * .55, W * .36, H * .6, W * .5, H * .6); x.bezierCurveTo(W * .64, H * .6, W * .74, H * .55, W * .7, H * .42); x.bezierCurveTo(W * .8, H * .3, W * .7, H * .1, W * .5, H * .2); x.closePath(); };
    crescent(x, fc, FACES, 18, 14, FACE); fc(); sh(x, null, LW2 + 1);
    // brow
    x.beginPath(); x.moveTo(W * .32, H * .3); x.quadraticCurveTo(W * .5, H * .24, W * .68, H * .3); x.lineWidth = LW2 + 1; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke();
    eye(x, W * .41, H * .345, H * .032); eye(x, W * .59, H * .345, H * .032);
    // muzzle
    const mz = () => { x.beginPath(); x.ellipse(W * .5, H * .5, W * .17, H * .09, 0, 0, TAU); };
    crescent(x, mz, FACES, 0, 12, '#f0d1b0'); mz(); sh(x, null, LW2 + 1);
    x.beginPath(); x.ellipse(W * .46, H * .46, 7, 5, 0, 0, TAU); x.ellipse(W * .54, H * .46, 7, 5, 0, 0, TAU); x.fillStyle = INK; x.fill();
    x.beginPath(); x.moveTo(W * .4, H * .53); x.quadraticCurveTo(W * .5, H * .57, W * .6, H * .53); x.lineWidth = LW2; x.stroke();
    x.beginPath(); x.ellipse(W * .33, H * .5, 22, 10, 0, 0, TAU); x.ellipse(W * .67, H * .5, 22, 10, 0, 0, TAU); x.fillStyle = 'rgba(230,120,110,.3)'; x.fill();
  });
}
// Human bust (child-book style), hm = height
export function human(hm) {
  return cut(hm * .86, hm, (x, W, H) => {
    const SK = '#f6cfa6', SKS = '#e0a97c', HAIR = '#3b2a22', SHIRT = '#3fa1de', SHIRTS = '#2a78b3';
    const sho = () => { x.beginPath(); x.moveTo(W * .05, H); x.quadraticCurveTo(W * .08, H * .68, W * .5, H * .66); x.quadraticCurveTo(W * .92, H * .68, W * .95, H); x.closePath(); };
    crescent(x, sho, SHIRTS, 30, 0, SHIRT); sho(); sh(x, null, LW);
    rr(x, W * .42, H * .55, W * .16, H * .14, 12); sh(x, SK, LW2 + 1);
    for (const s of [-1, 1]) { x.beginPath(); x.ellipse(W * .5 + s * W * .29, H * .37, W * .055, H * .06, 0, 0, TAU); sh(x, SK, LW2 + 1); }
    const hd = () => blob(x, W * .5, H * .35, W * .28, H * .26, .02, 8, 30);
    crescent(x, hd, SKS, 24, 18, SK); hd(); sh(x, null, LW);
    // hair
    const hr = () => { x.beginPath(); x.moveTo(W * .22, H * .36); x.bezierCurveTo(W * .18, H * .05, W * .82, H * .02, W * .79, H * .36); x.quadraticCurveTo(W * .7, H * .2, W * .55, H * .2); x.quadraticCurveTo(W * .45, H * .26, W * .3, H * .22); x.quadraticCurveTo(W * .25, H * .28, W * .22, H * .36); x.closePath(); };
    crescent(x, hr, '#22170f', 14, 10, HAIR); hr(); sh(x, null, LW2 + 1);
    eye(x, W * .41, H * .38, H * .03); eye(x, W * .59, H * .38, H * .03);
    x.beginPath(); x.moveTo(W * .5, H * .41); x.quadraticCurveTo(W * .47, H * .46, W * .5, H * .47); x.lineWidth = LW2; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke();
    x.beginPath(); x.moveTo(W * .42, H * .5); x.quadraticCurveTo(W * .5, H * .55, W * .58, H * .5); x.lineWidth = LW2 + 1; x.stroke();
    x.beginPath(); x.ellipse(W * .34, H * .47, 20, 10, 0, 0, TAU); x.ellipse(W * .66, H * .47, 20, 10, 0, 0, TAU); x.fillStyle = 'rgba(230,110,100,.32)'; x.fill();
  });
}
// Gene bulb: on = glowing yellow with rays, off = grey glass
export function geneBulb(hm, on) {
  return cut(hm * .9, hm, (x, W, H) => {
    const cx = W / 2, cy = H * .36, r = W * .3;
    if (on) { x.strokeStyle = '#ffcf3f'; x.lineCap = 'round'; for (let i = 0; i < 9; i++) { const a = -Math.PI * .95 + i / 8 * Math.PI * .9 - Math.PI * .05 + .02; x.lineWidth = 16; x.beginPath(); x.moveTo(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25); x.lineTo(cx + Math.cos(a) * r * 1.6, cy + Math.sin(a) * r * 1.6); x.strokeStyle = INK; x.lineWidth = 22; x.stroke(); x.strokeStyle = '#ffcf3f'; x.lineWidth = 12; x.stroke(); } }
    const g = () => { x.beginPath(); x.arc(cx, cy, r, Math.PI * .78, Math.PI * 2.22); x.lineTo(cx + r * .45, H * .74); x.lineTo(cx - r * .45, H * .74); x.closePath(); };
    if (on) crescent(x, g, '#f0b52a', 24, 18, '#ffe27a'); else crescent(x, g, '#9a9a9e', 24, 18, '#c9c9cc');
    g(); sh(x, null, LW);
    if (on) { x.beginPath(); x.ellipse(cx - r * .35, cy - r * .35, r * .16, r * .26, -.5, 0, TAU); x.fillStyle = 'rgba(255,255,255,.7)'; x.fill(); }
    rr(x, cx - r * .48, H * .74, r * .96, H * .22, 10); sh(x, '#b8b3a6', LW2 + 1);
    x.strokeStyle = INK; x.lineWidth = 4; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(cx - r * .48, H * (.74 + i * .055)); x.lineTo(cx + r * .48, H * (.74 + i * .055)); x.stroke(); }
    x.beginPath(); x.moveTo(cx - r * .25, H * .74); x.lineTo(cx - r * .18, cy + r * .2); x.lineTo(cx, cy + r * .4); x.lineTo(cx + r * .18, cy + r * .2); x.lineTo(cx + r * .25, H * .74); x.lineWidth = 6; x.strokeStyle = on ? '#c46a10' : '#555'; x.stroke();
  });
}
// Retrovirus: purple sphere with knobbed spikes and a little face-free core
export function virus(rm, seed = 3) {
  return cut(rm * 2.5, rm * 2.5, (x, W, H) => {
    const cx = W / 2, cy = H / 2, r = W * .3, R = mulberry(seed);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + R() * .2, c = Math.cos(a), s = Math.sin(a);
      x.beginPath(); x.moveTo(cx + c * r * .9, cy + s * r * .9); x.lineTo(cx + c * r * 1.38, cy + s * r * 1.38); x.lineWidth = 14; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke(); x.lineWidth = 7; x.strokeStyle = '#c99be8'; x.stroke();
      x.beginPath(); x.arc(cx + c * r * 1.45, cy + s * r * 1.45, r * .14, 0, TAU); sh(x, '#ff7aa8', LW2); }
    const b = () => blob(x, cx, cy, r, r, .05, seed, 24);
    crescent(x, b, '#6a3fa8', 26, 22, '#9b6ee0'); b(); sh(x, null, LW);
    const core = () => blob(x, cx, cy, r * .45, r * .45, .1, seed + 5, 12);
    crescent(x, core, '#c0392b', 8, 8, '#ff6a5a'); core(); sh(x, null, LW2);
    x.strokeStyle = '#fff4dc'; x.lineWidth = 6; x.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, px = cx - r * .3 + u * r * .6, py = cy + Math.sin(u * TAU * 1.5) * r * .12; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
    x.beginPath(); x.ellipse(cx - r * .45, cy - r * .5, r * .14, r * .22, -.6, 0, TAU); x.fillStyle = 'rgba(255,255,255,.4)'; x.fill();
  }, { ay: .5 });
}
export function scissors(wm) {
  return cut(wm, wm * .55, (x, W, H) => {
    for (const s of [-1, 1]) {
      x.save(); x.translate(W * .55, H * .5); x.rotate(s * .22);
      x.beginPath(); x.moveTo(0, -H * .06); x.lineTo(W * .45, -H * .02 * s); x.lineTo(0, H * .06); x.closePath(); sh(x, '#dfe6ea', LW2 + 1);
      x.beginPath(); x.moveTo(0, 0); x.lineTo(-W * .25, s * H * .12); x.lineWidth = 22; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke(); x.lineWidth = 12; x.strokeStyle = '#e8413a'; x.stroke();
      x.beginPath(); x.ellipse(-W * .36, s * H * .22, W * .12, H * .17, 0, 0, TAU); x.lineWidth = 26; x.strokeStyle = INK; x.stroke(); x.lineWidth = 15; x.strokeStyle = '#e8413a'; x.stroke();
      x.restore();
    }
    x.beginPath(); x.arc(W * .55, H * .5, 12, 0, TAU); sh(x, '#b8b3a6', 4);
  }, { ay: .5 });
}
// Brain organoid: a pink wrinkled ball
export function organoid(rm, seed) {
  return cut(rm * 2.2, rm * 2, (x, W, H) => {
    const b = () => blob(x, W / 2, H * .55, W * .44, H * .42, .08, seed, 14);
    crescent(x, b, '#e88aa0', 22, 18, '#ffb8c6'); b(); sh(x, null, LW);
    x.save(); b(); x.clip(); x.strokeStyle = 'rgba(160,60,90,.55)'; x.lineWidth = 6; x.lineCap = 'round'; const R = mulberry(seed);
    for (let i = 0; i < 9; i++) { const px = W * (.2 + R() * .6), py = H * (.25 + R() * .6); x.beginPath(); x.moveTo(px, py); x.bezierCurveTo(px + 30, py - 30, px + 50, py + 25, px + 80, py - 5); x.stroke(); } x.restore();
  });
}
// Neuron: star body + dendrites
export function neuron(rm, seed, col = '#ffcf3f') {
  return cut(rm * 3, rm * 3, (x, W, H) => {
    const cx = W / 2, cy = H / 2, R = mulberry(seed);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + R() * .5, l = W * (.3 + R() * .14);
      x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + Math.cos(a + .3) * l * .6, cy + Math.sin(a + .3) * l * .6, cx + Math.cos(a) * l, cy + Math.sin(a) * l);
      x.lineWidth = 16; x.strokeStyle = INK; x.lineCap = 'round'; x.stroke(); x.lineWidth = 8; x.strokeStyle = col; x.stroke(); }
    const b = () => blob(x, cx, cy, W * .13, W * .13, .1, seed, 8);
    crescent(x, b, '#e0a020', 8, 8, col); b(); sh(x, null, LW2 + 1);
    x.beginPath(); x.arc(cx, cy, W * .045, 0, TAU); x.fillStyle = '#b5651d'; x.fill();
  }, { ay: .5, border: 10 });
}
export function puzzle(wm, col = '#3fa1de', shade = '#2a78b3') {
  return cut(wm, wm, (x, W, H) => {
    const s = W * .72, o = W * .14, k = s * .18;
    const p = () => { x.beginPath(); x.moveTo(o, o + k);
      x.lineTo(o + s * .38, o + k); x.arc(o + s / 2, o + k, s * .13, Math.PI, 0); x.lineTo(o + s, o + k);
      x.lineTo(o + s, o + k + s * .38 - k); x.arc(o + s, o + k + s * .5 - k, s * .13, -Math.PI / 2, Math.PI / 2); x.lineTo(o + s, o + s);
      x.lineTo(o, o + s); x.lineTo(o, o + s * .62); x.arc(o, o + s * .5, s * .12, Math.PI / 2, -Math.PI / 2, true); x.closePath(); };
    crescent(x, p, shade, 22, 18, col); p(); sh(x, null, LW);
  }, { ay: .5 });
}
// 8 % pie: a paper disc with a purple 8 % wedge pulled out
export function pie(rm, part) {
  return cut(rm * 2.4, rm * 2.4, (x, W, H) => {
    const cx = W / 2, cy = H / 2, r = W * .4, a0 = -Math.PI / 2, a1 = a0 + .08 * TAU;
    if (part === 'rest') { x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, r, a1, a0 + TAU); x.closePath(); sh(x, '#f4e6c8', LW);
      x.strokeStyle = 'rgba(58,42,36,.25)'; x.lineWidth = 4; for (let i = 1; i < 12; i++) { const a = a1 + i / 12 * (TAU - .08 * TAU); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.stroke(); } }
    else { x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, r, a0, a1); x.closePath(); sh(x, '#9b6ee0', LW); }
  }, { ay: .5 });
}

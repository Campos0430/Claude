// Paper-cut art for "Jonathan": tortoise, egg, phone, bulb, X, swab, syringe, bacteria, chromosome, mitochondrion, rungs, marks
import { mulberry, TAU } from './lib.js';
import { cv, finishCut, sh, blob, smoothClosed, crescent, INK, rr } from './paper.js';
import { cut } from './art.js';

const LW = 9, LW2 = 5;

// Giant tortoise, side view facing right. wm = body length (metres)
export function tortoise(wm, o = {}) {
  return cut(wm, wm * .62, (x, W, H) => {
    const SH = o.shell || '#9a7442', SHS = o.shellS || '#71522c', SK = '#a89f88', SKS = '#857b65';
    const ground = H;
    // far legs (darker)
    const leg = (cx, w, h, col) => { x.beginPath(); x.moveTo(cx - w / 2, ground - h); x.lineTo(cx - w / 2 - 6, ground - 10); x.quadraticCurveTo(cx, ground + 8, cx + w / 2 + 6, ground - 10); x.lineTo(cx + w / 2, ground - h); x.closePath(); sh(x, col, LW2 + 1);
      for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(cx - w * .25 + i * w * .25, ground - 14, 9, Math.PI, 0); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); } };
    leg(W * .28, W * .1, H * .36, SKS); leg(W * .66, W * .1, H * .36, SKS);
    // neck + head (stretched forward and up)
    const neck = () => { x.beginPath(); x.moveTo(W * .7, H * .62); x.bezierCurveTo(W * .8, H * .55, W * .84, H * .32, W * .9, H * .28); x.lineTo(W * .93, H * .42); x.bezierCurveTo(W * .88, H * .48, W * .84, H * .66, W * .74, H * .74); x.closePath(); };
    crescent(x, neck, SKS, 0, -14, SK); neck(); sh(x, null, LW);
    x.strokeStyle = SKS; x.lineWidth = 5; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(W * (.78 + i * .03), H * (.5 - i * .05), 18, 3.6, 5.2); x.stroke(); }
    const head = () => blob(x, W * .93, H * .3, W * .07, H * .1, .03, 4, 28, -.2);
    crescent(x, head, SKS, 0, -16, SK); head(); sh(x, null, LW);
    x.beginPath(); x.moveTo(W * .955, H * .36); x.quadraticCurveTo(W * .985, H * .35, W * .995, H * .32); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
    // eye (friendly)
    x.beginPath(); x.ellipse(W * .935, H * .27, 11, 16, 0, 0, TAU); x.fillStyle = INK; x.fill();
    x.beginPath(); x.ellipse(W * .932, H * .257, 4, 6, 0, 0, TAU); x.fillStyle = '#fff'; x.fill();
    x.beginPath(); x.ellipse(W * .9, H * .34, 18, 9, 0, 0, TAU); x.fillStyle = 'rgba(230,120,110,.35)'; x.fill();
    // tail
    x.beginPath(); x.moveTo(W * .1, H * .66); x.quadraticCurveTo(W * .03, H * .72, W * .02, H * .78); x.quadraticCurveTo(W * .07, H * .74, W * .13, H * .72); x.closePath(); sh(x, SK, LW2);
    // shell dome
    const dome = () => { x.beginPath(); x.moveTo(W * .08, H * .74); x.bezierCurveTo(W * .08, H * .12, W * .3, H * .02, W * .44, H * .02); x.bezierCurveTo(W * .62, H * .02, W * .8, H * .14, W * .8, H * .74); x.quadraticCurveTo(W * .44, H * .8, W * .08, H * .74); x.closePath(); };
    crescent(x, dome, SHS, 44, 30, SH); dome(); sh(x, null, LW + 1);
    // scutes
    x.save(); dome(); x.clip(); x.strokeStyle = INK; x.lineWidth = LW2 + 1; x.lineJoin = 'round';
    const sc = [[.25, .3], [.44, .2], [.63, .3], [.18, .56], [.35, .52], [.53, .5], [.71, .56]];
    for (const [u, v] of sc) { x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5, r = W * .085; x.lineTo(W * u + Math.cos(a) * r, H * v + Math.sin(a) * r * 1.05); } x.closePath(); x.fillStyle = 'rgba(255,230,170,.22)'; x.fill(); x.stroke();
      x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5, r = W * .045; x.lineTo(W * u + Math.cos(a) * r, H * v + Math.sin(a) * r); } x.closePath(); x.lineWidth = 3; x.stroke(); x.lineWidth = LW2 + 1; }
    x.restore();
    // shell rim
    x.beginPath(); x.moveTo(W * .07, H * .72); x.quadraticCurveTo(W * .44, H * .84, W * .81, H * .72); x.lineTo(W * .8, H * .78); x.quadraticCurveTo(W * .44, H * .9, W * .08, H * .78); x.closePath(); sh(x, SHS, LW2 + 1);
    // near legs
    leg(W * .2, W * .12, H * .3, SK); leg(W * .6, W * .12, H * .3, SK);
    // highlight
    x.beginPath(); x.ellipse(W * .32, H * .16, W * .08, H * .035, -.35, 0, TAU); x.fillStyle = 'rgba(255,255,255,.28)'; x.fill();
  }, { ay: 1 });
}
export function egg(hm) {
  return cut(hm * .78, hm, (x, W, H) => {
    const e = () => { x.beginPath(); x.ellipse(W / 2, H * .55, W * .46, H * .45, 0, 0, TAU); };
    crescent(x, e, '#e3d9c2', 30, 24, '#fbf6ea'); e(); sh(x, null, LW);
    x.beginPath(); x.moveTo(W * .1, H * .45); for (let i = 1; i <= 8; i++) x.lineTo(W * (.1 + i * .1), H * (.45 + (i % 2 ? -.06 : .05))); x.lineWidth = LW2 + 1; x.strokeStyle = INK; x.stroke();
    const R = mulberry(3); for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(W * (.25 + R() * .5), H * (.6 + R() * .3), 10 + R() * 8, 0, TAU); x.fillStyle = 'rgba(160,140,110,.35)'; x.fill(); }
  });
}
export function phone(wm) {
  return cut(wm, wm * .8, (x, W, H) => {
    const base = () => { x.beginPath(); x.moveTo(W * .12, H); x.lineTo(W * .22, H * .42); x.lineTo(W * .78, H * .42); x.lineTo(W * .88, H); x.closePath(); };
    crescent(x, base, '#2b2b33', 30, 0, '#45434f'); base(); sh(x, null, LW);
    x.beginPath(); x.arc(W / 2, H * .7, W * .17, 0, TAU); sh(x, '#d9d2c0', LW2);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; x.beginPath(); x.arc(W / 2 + Math.cos(a) * W * .11, H * .7 + Math.sin(a) * W * .11, 8, 0, TAU); x.fillStyle = INK; x.fill(); }
    const hs = () => { x.beginPath(); x.moveTo(W * .05, H * .3); x.quadraticCurveTo(W * .5, H * .08, W * .95, H * .3); x.lineTo(W * .95, H * .1); x.quadraticCurveTo(W * .5, -H * .1, W * .05, H * .1); x.closePath(); };
    crescent(x, hs, '#2b2b33', 0, -16, '#4a4856'); hs(); sh(x, null, LW);
  });
}
export function bulb(hm) {
  return cut(hm * .6, hm, (x, W, H) => {
    const g = () => { x.beginPath(); x.arc(W / 2, H * .38, W * .45, Math.PI * .78, Math.PI * 2.22); x.lineTo(W * .64, H * .74); x.lineTo(W * .36, H * .74); x.closePath(); };
    crescent(x, g, '#f0c23a', 26, 20, '#ffe27a'); g(); sh(x, null, LW);
    rr(x, W * .33, H * .74, W * .34, H * .24, 10); sh(x, '#b8b3a6', LW2 + 1);
    x.strokeStyle = INK; x.lineWidth = 4; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(W * .33, H * (.74 + i * .06)); x.lineTo(W * .67, H * (.74 + i * .06)); x.stroke(); }
    x.beginPath(); x.moveTo(W * .42, H * .74); x.lineTo(W * .45, H * .45); x.lineTo(W * .5, H * .52); x.lineTo(W * .55, H * .45); x.lineTo(W * .58, H * .74); x.lineWidth = 5; x.stroke();
  });
}
export function redX(wm) {
  return cut(wm, wm, (x, W, H) => {
    x.lineCap = 'round'; x.lineWidth = W * .2; x.strokeStyle = INK;
    x.beginPath(); x.moveTo(W * .12, H * .12); x.lineTo(W * .88, H * .88); x.moveTo(W * .88, H * .12); x.lineTo(W * .12, H * .88); x.stroke();
    x.lineWidth = W * .13; x.strokeStyle = '#e8413a'; x.stroke();
  }, { ay: .5, border: 10 });
}
export function tick(wm, col = '#3cb85a') {
  return cut(wm, wm, (x, W, H) => {
    x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(W * .1, H * .55); x.lineTo(W * .4, H * .85); x.lineTo(W * .92, H * .12);
    x.lineWidth = W * .2; x.strokeStyle = INK; x.stroke(); x.lineWidth = W * .13; x.strokeStyle = col; x.stroke();
  }, { ay: .5, border: 10 });
}
export function swab(hm) {
  return cut(hm * .3, hm, (x, W, H) => {
    rr(x, W / 2 - 10, H * .2, 20, H * .8, 8); sh(x, '#f2ead8', LW2);
    const tip = () => blob(x, W / 2, H * .13, W * .4, H * .12, .12, 5);
    crescent(x, tip, '#e5ddd0', 14, 10, '#ffffff'); tip(); sh(x, null, LW);
  });
}
export function syringe(wm) {
  return cut(wm, wm * .3, (x, W, H) => {
    rr(x, W * .2, H * .25, W * .55, H * .5, 10); sh(x, '#e6f3f7', LW2 + 1);
    x.fillStyle = 'rgba(220,60,60,.6)'; x.fillRect(W * .45, H * .3, W * .28, H * .4);
    rr(x, W * .05, H * .38, W * .16, H * .24, 6); sh(x, '#c9c3b5', LW2); rr(x, 0, H * .2, W * .06, H * .6, 6); sh(x, '#c9c3b5', LW2);
    x.beginPath(); x.moveTo(W * .75, H * .5); x.lineTo(W, H * .5); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
  }, { ay: .5 });
}
export function bacterium(wm, seed) {
  return cut(wm, wm * .42, (x, W, H) => {
    const R = mulberry(seed);
    x.strokeStyle = INK; x.lineWidth = 4; for (let i = 0; i < 6; i++) { const px = W * (.15 + i * .14), s = i % 2 ? 1 : -1; x.beginPath(); x.moveTo(px, H * .5); x.quadraticCurveTo(px + 10, H * .5 + s * H * .4, px - 6, H * .5 + s * H * .5); x.stroke(); }
    const b = () => { x.beginPath(); x.roundRect(W * .05, H * .25, W * .9, H * .5, H * .25); };
    crescent(x, b, '#3f9e5a', 0, -14, '#7fd08a'); b(); sh(x, null, LW);
    for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(W * (.25 + R() * .5), H * (.4 + R() * .2), 8, 0, TAU); x.fillStyle = 'rgba(30,90,50,.4)'; x.fill(); }
    x.beginPath(); x.ellipse(W * .3, H * .48, 9, 13, 0, 0, TAU); x.ellipse(W * .4, H * .48, 9, 13, 0, 0, TAU); x.fillStyle = INK; x.fill();
  }, { ay: .5, border: 10 });
}
export function chromosome(hm) {
  return cut(hm * .7, hm, (x, W, H) => {
    const arm = (s) => { x.save(); x.translate(W / 2, H / 2); x.rotate(s * .45); const a = () => { x.beginPath(); x.roundRect(-W * .11, -H * .48, W * .22, H * .96, W * .11); }; crescent(x, a, '#7e62c4', 18, 0, '#a98ee8'); a(); sh(x, null, LW);
      for (const e of [-1, 1]) { x.beginPath(); x.ellipse(0, e * H * .43, W * .1, H * .055, 0, 0, TAU); sh(x, '#ffcf3f', LW2 + 1); }
      x.strokeStyle = 'rgba(70,40,120,.5)'; x.lineWidth = 5; for (let i = -3; i <= 3; i++) { if (i === 0) continue; x.beginPath(); x.moveTo(-W * .08, i * H * .1); x.lineTo(W * .08, i * H * .1 + 6); x.stroke(); }
      x.restore(); };
    arm(-1); arm(1);
    x.beginPath(); x.arc(W / 2, H / 2, W * .08, 0, TAU); sh(x, '#6a4fb0', LW2);
  }, { ay: 1 });
}
export function mito(wm) {
  return cut(wm, wm * .5, (x, W, H) => {
    const o = () => { x.beginPath(); x.roundRect(W * .02, H * .08, W * .96, H * .84, H * .42); };
    crescent(x, o, '#e0622c', 30, 24, '#ff9a52'); o(); sh(x, null, LW + 1);
    const i = () => { x.beginPath(); x.roundRect(W * .08, H * .2, W * .84, H * .6, H * .3); };
    crescent(x, i, '#2f6fb3', 0, 18, '#5aa0e0'); i(); sh(x, null, LW);
    x.strokeStyle = '#fff4dc'; x.lineWidth = 16; x.lineCap = 'round';
    for (let k = 0; k < 9; k++) { const px = W * (.16 + k * .085), up = k % 2 === 0; x.beginPath(); x.moveTo(px, up ? H * .22 : H * .78); x.lineTo(px, up ? H * .58 : H * .42); x.stroke(); }
    x.strokeStyle = INK; x.lineWidth = 4; for (let k = 0; k < 9; k++) { const px = W * (.16 + k * .085), up = k % 2 === 0; x.beginPath(); x.moveTo(px - 9, up ? H * .22 : H * .78); x.lineTo(px - 9, up ? H * .57 : H * .43); x.arc(px, up ? H * .57 : H * .43, 9, Math.PI, 0, !up); x.lineTo(px + 9, up ? H * .22 : H * .78); x.stroke(); }
  }, { ay: .5 });
}
// one DNA base pair (rung), two coloured halves
export function rung(wm, c1, c2) {
  return cut(wm, wm * .16, (x, W, H) => {
    rr(x, 0, 0, W / 2 + 2, H, H / 2); sh(x, c1, LW2 + 1); rr(x, W / 2 - 2, 0, W / 2 + 2, H, H / 2); sh(x, c2, LW2 + 1);
  }, { ay: .5, border: 8 });
}
export function mark(rm, col = '#ffb52e') {
  return cut(rm * 2, rm * 2, (x, W, H) => { const d = () => { x.beginPath(); x.arc(W / 2, H / 2, W * .46, 0, TAU); }; crescent(x, d, '#d98a1a', 8, 8, col); d(); sh(x, null, LW2 + 1); }, { ay: .5, border: 8 });
}
export function cellCard(wm, seed, col = '#ffb8c6', sh2 = '#f08ea3') {
  return cut(wm, wm * .85, (x, W, H) => {
    const c = () => blob(x, W / 2, H / 2, W * .47, H * .46, .1, seed, 7);
    crescent(x, c, sh2, 26, 20, col); c(); sh(x, null, LW);
    const n = () => blob(x, W * .48, H * .48, W * .16, H * .15, .06, seed + 3);
    crescent(x, n, '#7a4aa8', 10, 8, '#a978d4'); n(); sh(x, null, LW2 + 1);
  }, { ay: 1 });
}
export function magnifier(rm) {
  return cut(rm * 2.6, rm * 3.4, (x, W, H) => {
    rr(x, W / 2 - 18, rm * 2 * 5200 * .9, 36, H - rm * 2 * 5200 * .9, 10); sh(x, '#8d5a31', LW2 + 1);
    x.beginPath(); x.arc(W / 2, W / 2, W * .42, 0, TAU); x.fillStyle = 'rgba(200,235,255,.6)'; x.fill(); x.lineWidth = 26; x.strokeStyle = INK; x.stroke(); x.lineWidth = 16; x.strokeStyle = '#c9a04a'; x.stroke();
    x.beginPath(); x.arc(W * .4, W * .38, W * .14, 3.6, 4.6); x.lineWidth = 12; x.strokeStyle = '#fff'; x.lineCap = 'round'; x.stroke();
  });
}

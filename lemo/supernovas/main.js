import { render, setSubs, DUR, cover } from './film.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['300', '400', '500', '600'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
setSubs(await (await fetch('subs.json')).json());
window.DUR = DUR;
window.render = t => render(g, t);
window.cover = () => cover(g);
window.READY = true;

// node render.mjs stills t1 t2 ...  |  node render.mjs video FROM TO out.mp4
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process'; import { createRequire } from 'module';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.hdr': 'application/octet-stream', '.bin': 'application/octet-stream', '.gltf': 'model/gltf+json' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-compositing'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
const ss = process.env.SS || '1';
await p.goto(`http://localhost:${port}/index.html`);
try { await p.waitForFunction(() => window.READY, null, { timeout: 120000 }); } catch (e) { console.log('ERR', errs); process.exit(1); }
if (errs.length) console.log('ERR', errs.slice(0, 5));
const mode = process.argv[2];
fs.mkdirSync(ROOT + '/chk', { recursive: true });
if (mode === 'cover') { await p.evaluate(() => renderCover()); await p.screenshot({ path: `${ROOT}/${process.argv[3] || 'portada.png'}` }); await b.close(); srv.close(); process.exit(0); }
if (mode === 'stills') {
  for (const ts of process.argv.slice(3)) { const t0 = Date.now(); await p.evaluate(t => renderFrame(t), parseFloat(ts)); await p.screenshot({ path: `${ROOT}/chk/s_${ts}.jpg`, type: 'jpeg', quality: 88 }); console.log(ts, Date.now() - t0, 'ms'); }
  if (errs.length) console.log('ERR', errs.slice(0, 5));
  await b.close(); srv.close(); process.exit(0);
}
const FPS = 30, from = +process.argv[3], to = +process.argv[4], out = process.argv[5];
const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let i = from; i < to; i++) {
  await p.evaluate(t => renderFrame(t), i / FPS);
  const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 60 === 0) console.log(`frame ${i}/${to} ${((Date.now() - t0) / (i - from + 1)).toFixed(0)}ms/f`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); if (errs.length) console.log('ERR', errs.slice(0, 5)); await b.close(); srv.close(); console.log('done');

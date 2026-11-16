const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const words = JSON.parse(fs.readFileSync(__dirname + '/words.json', 'utf8'));
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files', '--disable-gpu-compositing'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/web/index.html');
  await p.waitForFunction(() => window.init);
  await p.evaluate(w => window.init(w), words);
  if (errs.length) console.log('ERR', errs.slice(0, 5));
  const mode = process.argv[2];
  if (mode === 'stills') {
    for (const ts of process.argv.slice(3)) { await p.evaluate(t => renderFrame(t), parseFloat(ts)); await p.screenshot({ path: `${__dirname}/chk/s_${ts}.jpg`, type: 'jpeg', quality: 90 }); }
    if (errs.length) console.log('ERR', errs.slice(0, 5));
    await b.close(); return;
  }
  const FPS = 30, N = Math.ceil(105.5 * FPS), from = +(process.argv[3] || 0), to = +(process.argv[4] || N), out = process.argv[5] || 'video3d.mp4';
  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = from; i < to; i++) {
    await p.evaluate(t => renderFrame(t), i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log(`frame ${i}/${to} ${((Date.now() - t0) / (i - from + 1)).toFixed(0)}ms/f`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); if (errs.length) console.log('ERR', errs.slice(0, 5)); await b.close(); console.log('done');
})();

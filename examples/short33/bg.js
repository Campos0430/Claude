const { chromium } = require('playwright'); const fs = require('fs');
const words = JSON.parse(fs.readFileSync(__dirname + '/../words.json', 'utf8'));
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files', '--disable-gpu-compositing'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/../web/index.html'); await p.waitForFunction(() => window.init); await p.evaluate(w => window.init(w), words);
  await p.evaluate(() => { ctx.clearRect(0, 0, W, H); hideAll(); mk.visible = desk.visible = book.visible = true; setMonkey(0.4, {}); setKeys(0.33, {}); head.rotation.set(0.05, 0.1, 0.05);
    book.position.set(1.2, 3.75, -0.9); book.rotation.set(0.05, -0.25, -0.13); book.scale.setScalar(0.8);
    look(cam, V(0.9, 2.6, 7.6), V(0.55, 3.15, 0.8), 40); R.render(world, cam); });
  await p.screenshot({ path: __dirname + '/bg.png' }); await b.close(); })();

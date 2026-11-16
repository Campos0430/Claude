const { chromium } = require('playwright'); const fs = require('fs');
const words = JSON.parse(fs.readFileSync(__dirname + '/../words.json', 'utf8'));
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files', '--disable-gpu-compositing'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/../web/index.html'); await p.waitForFunction(() => window.init); await p.evaluate(w => window.init(w), words);
  await p.evaluate(() => { ctx.clearRect(0, 0, W, H); hideAll(); mag.visible = true; mag.rotation.set(0.15, -0.35, Math.PI + 0.22); mag.scale.setScalar(1.25);
    look(cam, V(0, 0.3, 11), V(0, 1.75, 0), 40); R.render(world, cam); });
  await p.screenshot({ path: __dirname + '/bg.png' }); await b.close(); })();

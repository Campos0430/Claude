const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--disable-gpu'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('http://127.0.0.1:8642/index.html'); await p.waitForFunction(() => window.READY);
  await p.evaluate(() => window.cover()); await p.screenshot({ path: __dirname + '/portada.png' }); await b.close(); })();

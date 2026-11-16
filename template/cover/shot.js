const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+__dirname+'/cover.html');await p.waitForFunction(()=>window.done);await p.screenshot({path:__dirname+'/portada_tumba.png'});await b.close();})();

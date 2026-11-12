/** Optional browser QA. Install Playwright locally or select PLAYWRIGHT_MODULE.
 * Never uses the owner's browser profile or changes live student data. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const port=4211, origin=process.env.QA_URL || `http://127.0.0.1:${port}/`;
const server=process.env.QA_URL ? null : spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const reports=[],errors=[];
const capture=process.env.QA_SCREENSHOTS;
if(capture)fs.mkdirSync(capture,{recursive:true});
let browser;
try {
 for(let i=0;i<40;i++){try{if((await fetch(origin)).ok)break;}catch{}if(i===39)throw Error('Local server did not start');await pause(100);}
 browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 for(const [width,height] of [[320,740],[390,844],[768,1024],[820,1180],[1024,768],[1366,900]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<=1100,isMobile:width<600});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
  const fit=async label=>{const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,`${width} ${label}: document overflow ${overflow}px`);};
  for(const route of ['courses','home','practice','exam','drills','review','saved','progress','materials','settings','updates']){
   await page.goto(`${origin}?subject=pharmacology#${route}`);await page.locator('#main h1').waitFor();await fit(route);if(route==='updates'){assert.equal(await page.locator('.release-history>section').count(),5);assert.match(await page.locator('#release-latest').innerText(),/1\.3\.0/);}
  }
  if(width<=1100){
   const menu=page.locator('.menu-toggle');await menu.tap();assert.equal(await menu.getAttribute('aria-expanded'),'true');
   await page.locator('#study-navigation [data-go="materials"]').tap();assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#study-navigation').isVisible(),false);
  }
  await page.goto(`${origin}?subject=general-microbiology#memorize`);await page.locator('.bacteria-workspace').waitFor();await page.evaluate(()=>document.fonts.ready);await fit('bacteria');
  const layout=await page.locator('.bacteria-workspace').evaluate(e=>getComputedStyle(e).display);
  assert.equal(layout,width<=600?'flex':'grid');
  if(width<=600){
   const rail=page.locator('.bacteria-dir-list');assert.ok(await rail.evaluate(e=>e.scrollWidth>e.clientWidth));
   if(width===390){
    const client=await context.newCDPSession(page);await rail.scrollIntoViewIfNeeded();
    const box=await rail.boundingBox(),x=box.x+box.width-25,y=box.y+box.height/2;
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=8;i++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*22,y}]});await pause(16);}
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(150);
    assert.ok(await rail.evaluate(e=>e.scrollLeft>0),'real synthesized swipe moves directory');
    const before=await page.evaluate(()=>scrollY);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+80,y}]});
    for(let i=1;i<=8;i++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+80,y:y-i*18}]});await pause(16);}
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(150);
    assert.ok(await page.evaluate(()=>scrollY)>before,'vertical swipe across rail scrolls page');await client.detach();
   }else{await rail.evaluate(e=>e.scrollLeft=190);assert.ok(await rail.evaluate(e=>e.scrollLeft>0));}
  }
  const second=page.locator('[data-select-organism]').nth(1);
  if(await second.count()){if(width<=1100)await second.tap();else await second.click();}
  await fit('selected bacteria');
  if(capture&&[390,820,1366].includes(width))await page.screenshot({path:`${capture}/memorize-${width}.png`,fullPage:true});
  for(const tab of ['trees','matrices','heuristics']){
   const button=page.locator(`[data-memorize-tab="${tab}"]`);if(width<=1100)await button.tap();else await button.click();await fit(tab);
   if(tab==='matrices'){
    await page.locator('#occlusion-toggle').check();const cell=page.locator('.matrix-cell-toggle').first();if(width<=1100)await cell.tap();else await cell.click();assert.equal(await cell.getAttribute('aria-expanded'),'true');
    await page.locator('[data-hide-all-occluded]').click();assert.equal(await cell.getAttribute('aria-expanded'),'false');
    const wrap=page.locator('.matrix-table-wrap');if(await wrap.evaluate(e=>e.scrollWidth>e.clientWidth)){await wrap.evaluate(e=>e.scrollLeft=150);assert.ok(await wrap.evaluate(e=>e.scrollLeft>0));}
   }
  }
  await page.goto(`${origin}?subject=pharmacology#practice`);await page.locator('#start-session').waitFor();await page.locator('#session-count').fill('3');await page.locator('#start-session').click();await page.locator('.option').first().click();await page.locator('#feedback').waitFor();await page.locator('[data-language="ar"]').first().click();await fit('checked practice Arabic');
  const dock=await page.locator('.session-dock').boundingBox();assert.ok(dock.x>=-1&&dock.x+dock.width<=width+1&&dock.y+dock.height<=height+1,'dock fits viewport');
  if(width<=1100){const controls=await page.locator('.dock-buttons .button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));assert.ok(controls.every(h=>h>=44),'dock touch targets');}
  if(capture&&[390,820].includes(width))await page.screenshot({path:`${capture}/practice-${width}.png`,fullPage:true});
  await page.locator('.source-link').first().click();await page.waitForFunction(()=>document.querySelector('#source-host img')?.naturalWidth>0);
  if(width<=1100){assert.equal(await page.locator('.source-dialog[open]').count(),1);const dialog=await page.locator('.source-dialog').boundingBox();assert.ok(dialog.width<=width+1&&dialog.height<=height+1);}
  await page.locator('#source-next').click();await page.locator('#source-zoom').click();await page.locator('#source-zoom').click();
  if(width<=1100){await page.setViewportSize({width:height,height:width});await fit('source rotated');await page.setViewportSize({width,height});}
  await page.locator('#source-close').click();await page.locator('[data-action="save-exit"]').click();await page.reload();await page.locator('[data-resume]').first().click();assert.equal(await page.locator('.option:disabled').count(),5);await fit('resume');
  const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('study-atlas:v1:pharmacology:midterm')).attempts.length);assert.equal(history,1);
  reports.push({width,height,routes:11,memorizeTabs:4,navigation:true,source:true,practiceResume:true,overflow:0});await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,engine:'Chromium',input:'synthesized tap on touch contexts; viewport emulation; no physical Safari/device testing',results:reports},null,2));
}finally{await browser?.close();server?.kill();}

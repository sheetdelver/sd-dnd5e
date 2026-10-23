/** Inert offline browser harness. Public host HTTP is supplied by its owner;
 * no browser connection to Foundry or production origin. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {moduleRoot,option} from './toolchain.mjs';
export async function healthBrowser({args,core,out,request,state,editSource,writeCount}){
 const tools=option(args,'--browser-tools');if(!tools)return null;
 const {chromium}=createRequire(join(tools,'package.json'))('playwright'),{build}=createRequire(join(core,'package.json'))('esbuild');
 const bundle=await build({entryPoints:[join(moduleRoot,'tests/browser/skill-lifecycle.tsx')],bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',tsconfig:join(core,'tsconfig.json'),plugins:[{name:'sdk-seam',setup(b){b.onResolve({filter:/^@sheet-delver\/sdk(?:\/react)?$/},()=>({path:join(moduleRoot,'tests/browser/sdk-fixture.tsx')}));}}],define:{'process.env.NODE_ENV':'"development"'},logLevel:'silent'});
 const browser=await chromium.launch({headless:true,executablePath:option(args,'--chromium')}),results=[];let latestPage;
 try{for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];let loseResponse=false;
  latestPage=page;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.href==='http://health.invalid/')return route.fulfill({contentType:'text/html',body:'<html><body><div id="root" class="sdk-module--dnd5e"></div></body></html>'});
   if(u.origin==='http://health.invalid'&&u.pathname==='/api/modules/dnd5e/health/temporary'){
    const body=route.request().postDataJSON(),result=await request(body);
    if(loseResponse&&body.action==='execute'){loseResponse=false;return route.abort();}return route.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(result.payload)});
   }
   if(u.origin==='http://health.invalid'&&u.pathname==='/fixture/state')return route.fulfill({contentType:'application/json',body:JSON.stringify(await state(u.searchParams.has('unqualified')))});
   if(u.origin==='http://health.invalid'&&/^\/fonts\/[a-z-]+\/[A-Za-z-]+\.ttf$/.test(u.pathname)){const p=join(moduleRoot,'assets',u.pathname);if(existsSync(p))return route.fulfill({contentType:'font/ttf',body:readFileSync(p)});}return route.abort();
  });
  await page.goto('http://health.invalid/');const css=option(args,'--core-css');if(css)await page.addStyleTag({content:readFileSync(css,'utf8')});await page.addStyleTag({content:readFileSync(join(moduleRoot,'assets/dnd5e.css'),'utf8')});await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.evaluate(()=>{window.healthEvents=[];for(const event of ['pointerdown','pointerup','click','close','cancel'])document.addEventListener(event,e=>{const d=document.querySelector('dialog'),r=d?.getBoundingClientRect();window.healthEvents.push({event,target:e.target.tagName,text:e.target.textContent?.slice(0,50),x:e.clientX,y:e.clientY,viewport:[innerWidth,innerHeight],dialog:r?{x:r.x,y:r.y,right:r.right,bottom:r.bottom}:null});},true);});
  await page.evaluate(actor=>{
   window.skillFixture.sdk={currentUser:{id:'fixtureplayer'},moduleId:'dnd5e',worldId:'healthworld',isConnected:true,fetchWithAuth:(input,init)=>fetch(input,init),documents:{invalidate(){},async refresh(){const r=await fetch('/fixture/state');window.skillFixture.render((await r.json()).prepared);}}};window.skillFixture.render(actor);
  },(await state()).prepared);
  const initialWrites=writeCount(),target=width===390?12:20;
  await page.getByRole('button',{name:'Edit temp HP',exact:true}).click();
  await page.getByRole('dialog').click({position:{x:3,y:3}});assert.equal(await page.getByRole('dialog').count(),1,'Inside dialog frame is not a backdrop click');
  const input=page.getByRole('textbox',{name:'New temporary HP'});await input.fill('-1');assert.equal(await page.getByRole('button',{name:'Review change'}).isDisabled(),true);await input.fill(String(target));await page.getByRole('button',{name:'Review change'}).click();await page.getByText('Review saved; no write dispatched.').waitFor();assert.equal(writeCount(),initialWrites);
  await page.getByRole('button',{name:'Confirm replacement'}).click();await page.getByText('Confirmed: acknowledged and read back.').waitFor();await page.getByText('Current effective temporary HP: '+target+'.').waitFor();assert.equal(writeCount(),initialWrites+1);
  // An open native dialog is a viewport surface. A full-page capture temporarily
  // resizes Chromium's viewport and is not part of this interaction workflow.
  await page.screenshot({path:join(out,'health-confirmed-'+width+'.png')});await page.getByRole('button',{name:'Finish inspection'}).click();
  // Lost browser response AFTER the real route completes. Reopening/status never writes.
  await page.getByRole('button',{name:'Edit temp HP',exact:true}).click();await input.fill(String(target+1));await page.getByRole('button',{name:'Review change'}).click();await page.getByText('Review saved; no write dispatched.').waitFor();loseResponse=true;await page.getByRole('button',{name:'Confirm replacement'}).click();await page.getByRole('alert').filter({hasText:'outcome is unknown'}).waitFor();assert.equal(writeCount(),initialWrites+2);
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.evaluate(async()=>window.skillFixture.render((await(await fetch('/fixture/state?unqualified=1')).json()).prepared));
  assert.equal(await page.getByRole('button',{name:'Recover temp HP edit'}).count(),1,'Recovery inspection survives unqualified preparation');
  await page.getByRole('button',{name:'Recover temp HP edit'}).click();assert.equal(await page.getByRole('button',{name:'Confirm replacement'}).count(),0);await page.getByRole('button',{name:'Check status'}).click();await page.getByText('Confirmed: acknowledged and read back.').waitFor();await page.getByText('Current effective temporary HP: '+(target+1)+'.').waitFor();assert.equal(writeCount(),initialWrites+2);await page.getByRole('button',{name:'Finish inspection'}).click();
  // Earlier source changes and connection loss retire the review permanently.
  await page.getByRole('button',{name:'Edit temp HP',exact:true}).click();await input.fill(String(target+2));await page.getByRole('button',{name:'Review change'}).click();await page.getByText('Review saved; no write dispatched.').waitFor();await editSource();
  await page.evaluate(async()=>{await window.skillFixture.sdk.documents.refresh();});await page.getByText('This review has retired',{exact:false}).waitFor();assert.equal(await page.getByRole('button',{name:'Confirm replacement'}).isDisabled(),true);
  await page.evaluate(async()=>{window.skillFixture.sdk={...window.skillFixture.sdk,isConnected:false};const a=(await(await fetch('/fixture/state')).json()).prepared;window.skillFixture.render(a);});assert.equal(await page.getByRole('button',{name:'Confirm replacement'}).isDisabled(),true);
  await page.evaluate(async()=>{window.skillFixture.sdk={...window.skillFixture.sdk,isConnected:true};await window.skillFixture.sdk.documents.refresh();});assert.equal(await page.getByRole('button',{name:'Confirm replacement'}).isDisabled(),true);assert.equal(writeCount(),initialWrites+2);
  await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'Recover temp HP edit'}).click();await page.getByRole('button',{name:'Check status'}).click();await page.getByText('No write was dispatched. Start a fresh review.').waitFor();assert.equal(await page.getByRole('button',{name:'Confirm replacement'}).count(),0);await page.getByRole('button',{name:'Finish inspection'}).click();
  // A fresh intent can recover, using current server source rather than the old choice.
  await page.getByRole('button',{name:'Edit temp HP',exact:true}).click();await input.fill(String(target+3));await page.getByRole('button',{name:'Review change'}).click();await page.getByText('Review saved; no write dispatched.').waitFor();await page.getByRole('button',{name:'Confirm replacement'}).click();await page.getByText('Confirmed: acknowledged and read back.').waitFor();assert.equal(writeCount(),initialWrites+3);
  if(width===390){
   await page.getByRole('button',{name:'Finish inspection'}).click();
   await page.evaluate(heldAmount=>{const sdk=window.skillFixture.sdk,original=sdk.fetchWithAuth;sdk.fetchWithAuth=async(url,init)=>{const r=await original(url,init);if(JSON.parse(init.body).action==='review'&&JSON.parse(init.body).amount===heldAmount)await new Promise(resolve=>{window.releaseOldHealthReview=resolve;});return r;};},target+4);
   await page.getByRole('button',{name:'Edit temp HP',exact:true}).click();await input.fill(String(target+4));await page.getByRole('button',{name:'Review change'}).click();await page.waitForFunction(()=>typeof window.releaseOldHealthReview==='function');
   await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'Edit temp HP',exact:true}).click();await input.fill(String(target+5));await page.getByRole('button',{name:'Review change'}).click();await page.getByText('Review saved; no write dispatched.').waitFor();
   const remembered=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('dnd5e-temp-hp-v1')).map(k=>localStorage.getItem(k)));
   await page.evaluate(async()=>{window.releaseOldHealthReview();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
   assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('dnd5e-temp-hp-v1')).map(k=>localStorage.getItem(k))),remembered,'Late response from retired modal cannot replace current recovery identity');
   await page.getByRole('button',{name:'Confirm replacement'}).click();await page.getByText('Confirmed: acknowledged and read back.').waitFor();assert.equal(writeCount(),initialWrites+4);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);assert.deepEqual(errors,[]);results.push({width,reviewWrites:0,confirmed:true,lostResponseRecoveredWithoutReplay:true,unqualifiedInspection:true,sourceAndConnectionRetired:true,freshReviewRecovered:true,lateReviewIdentityPreserved:width===390?true:'covered at390',dispatches:width===390?4:3});writeFileSync(join(out,'mounted-events-'+width+'.json'),JSON.stringify(await page.evaluate(()=>window.healthEvents),null,2));await context.close();
 }}catch(cause){if(latestPage&&!latestPage.isClosed()){writeFileSync(join(out,'mounted-failure.txt'),await latestPage.locator('body').innerText());writeFileSync(join(out,'mounted-events-failure.json'),JSON.stringify(await latestPage.evaluate(()=>window.healthEvents),null,2));await latestPage.screenshot({path:join(out,'mounted-failure.png')});}throw cause;}finally{await browser.close();}
 writeFileSync(join(out,'mounted-health.json'),JSON.stringify({method:'Actual Sheet with SDK presentation/cache seam,real isolated public health route;synthetic backend. Not installed/native/operator acceptance.',results},null,2)+'\n');return results;
}

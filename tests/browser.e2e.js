import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import {LEVELS} from '../src/content/levels.js';
import {step,walkable,createEpisode,configuration} from '../src/sim/core.js';

const root=path.resolve(import.meta.dirname,'..');
const evidence=path.join(root,'evidence','browser-phase1');
fs.mkdirSync(evidence,{recursive:true});
const chapter2Evidence=path.join(root,'evidence','browser-chapter2');
fs.mkdirSync(chapter2Evidence,{recursive:true});
const chapter5Evidence=path.join(root,'evidence','browser-chapters3-5');
fs.mkdirSync(chapter5Evidence,{recursive:true});
const chapter8Evidence=path.join(root,'evidence','browser-chapters6-8');
fs.mkdirSync(chapter8Evidence,{recursive:true});
const finaleEvidence=path.join(root,'evidence','browser-chapters9-12');
fs.mkdirSync(finaleEvidence,{recursive:true});
const SOLUTIONS=Object.fromEntries(LEVELS.map(level=>[level.id,JSON.parse(fs.readFileSync(path.join(root,'production','solutions',`${level.id}.json`),'utf8'))]));

async function freePort(){
 return await new Promise((resolve,reject)=>{const server=net.createServer();server.unref();server.on('error',reject);server.listen(0,'127.0.0.1',()=>{const {port}=server.address();server.close(error=>error?reject(error):resolve(port));});});
}

async function serve(directory){
 const port=await freePort();
 const child=spawn(process.execPath,['scripts/serve.mjs',directory],{cwd:root,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
 let transcript='';child.stdout.on('data',chunk=>{transcript+=chunk;});child.stderr.on('data',chunk=>{transcript+=chunk;});
 await Promise.race([
  new Promise((resolve,reject)=>{const check=()=>transcript.includes('Echo Heist:')?resolve():child.exitCode!==null?reject(new Error(transcript||`Server exited ${child.exitCode}`)):setTimeout(check,20);check();}),
  delay(10000).then(()=>{throw new Error(`Timed out starting ${directory}: ${transcript}`);})
 ]);
 return {url:`http://127.0.0.1:${port}/`,async close(){if(child.exitCode===null)child.kill();await Promise.race([new Promise(resolve=>child.once('exit',resolve)),delay(3000)]);}};
}

function watch(page){
 const problems=[];
 page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
 page.on('console',message=>{if(message.type()==='error')problems.push(`console: ${message.text()}`);});
 page.on('requestfailed',request=>problems.push(`request: ${request.url()} ${request.failure()?.errorText??'failed'}`));
 page.on('response',response=>{if(response.status()>=400)problems.push(`http ${response.status()}: ${response.url()}`);});
 return problems;
}

async function readyForGame(page,title){
 await page.waitForFunction(()=>document.querySelector('canvas#patch-world')||document.querySelector('button[data-action="enter-mission"]'),null,{timeout:30000});
 const enter=page.locator('button[data-action="enter-mission"]');
 if(await enter.count()&&await enter.isVisible())await enter.click();
 await page.getByRole('heading',{name:title,exact:true}).waitFor();
 await page.locator('#patch-world').waitFor({state:'visible',timeout:15000});
 await page.locator('#patch-world').focus();
}

async function queueKeys(page,keys){
 await page.locator('#patch-world').focus();
 for(const key of keys)await page.keyboard.press(key);
}

function actorPath(state,actor,target){
 const start=state[actor],queue=[[start.x,start.y,[]]],seen=new Set([`${start.x},${start.y}`]);
 while(queue.length){const [x,y,path]=queue.shift();if(x===target.x&&y===target.y)return path;for(const action of [1,2,3,4]){const [dx,dy]=[[0,0],[0,-1],[1,0],[0,1],[-1,0]][action],nx=x+dx,ny=y+dy,key=`${nx},${ny}`;if(seen.has(key))continue;const probe={...state,[actor]:{...state[actor],x,y}};if(!walkable(probe,actor,nx,ny))continue;seen.add(key);queue.push([nx,ny,[...path,action]]);}}
 return null;
}
function safeEchoPath(initial,target){
 const key=state=>[state.echo.room??0,state.echo.x,state.echo.y,state.echoTick,state.echoSteps,state.echo.cargo??'-',...state.entities.filter(entity=>entity.kind==='echo-hunter').flatMap(entity=>[entity.x,entity.y,entity.direction]),...state.entities.filter(entity=>entity.required).map(entity=>entity.taken?'t':entity.delivered?'d':'0')].join(','),queue=[[initial,[]]],seen=new Set([key(initial)]);
 while(queue.length&&seen.size<30000){const [state,path]=queue.shift();if(state.echo.x===target.x&&state.echo.y===target.y&&(state.echo.room??0)===(target.room??0))return path;for(const action of [0,1,2,3,4]){const next=step(state,{echoAction:action}).state,id=key(next);if(next.failed||next.courierDone||seen.has(id))continue;seen.add(id);queue.push([next,[...path,action]]);}}
 return null;
}
async function recordEchoLesson(page){
 const hasProbe=await page.evaluate(()=>!!window.__echoTest),level=activeLevel(page),capabilityId=level.learning.capabilityPuzzle?.required;
 let state=hasProbe?await page.evaluate(()=>window.__echoTest.state):createEpisode(level,{practice:true,config:configuration(level,{...level.learning.defaults,capabilities:capabilityId?[capabilityId]:[]})}),item=state.entities.find(entity=>entity.field==='echo'&&entity.required&&!entity.taken&&!entity.delivered&&(entity.room??0)===(state.echo.room??0));assert.ok(item,'Demonstration has no required Echo cargo.');
 let actions=safeEchoPath(state,item);assert.ok(actions,'Demonstration cargo is unreachable without colliding with the Echo patrol.');
 if(hasProbe)for(const action of [...actions,5])await page.evaluate(command=>window.__echoTest.command(command),action);else await queueKeys(page,[...actions.map(action=>({1:'ArrowUp',2:'ArrowRight',3:'ArrowDown',4:'ArrowLeft'}[action])),'e']);
 if(hasProbe)state=await page.evaluate(()=>window.__echoTest.state);else{for(const action of [...actions,5])state=step(state,{echoAction:action}).state;}
 const socket=state.entities.find(entity=>entity.kind==='socket'&&entity.accepts===state.echo.cargo&&(entity.room??0)===(state.echo.room??0));assert.ok(socket,'Demonstration has no matching receiver.');actions=safeEchoPath(state,socket);assert.ok(actions,'Demonstration receiver is unreachable without colliding with the Echo patrol.');
 if(hasProbe)for(const action of [...actions,5])await page.evaluate(command=>window.__echoTest.command(command),action);else await queueKeys(page,[...actions.map(action=>({1:'ArrowUp',2:'ArrowRight',3:'ArrowDown',4:'ArrowLeft'}[action])),'e']);
 await page.getByRole('status').filter({hasText:'Successful lesson recorded'}).waitFor({timeout:20000});
}

const EXTRACT=['ArrowDown','ArrowDown','ArrowDown','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight'];
const L01=['ArrowRight','ArrowRight','e','ArrowDown','ArrowDown','e','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowDown','ArrowDown','ArrowDown','ArrowLeft'];

function activeLevel(page){const match=new URL(page.url()).hash.match(/#\/play\/(L\d+)/),level=LEVELS.find(candidate=>candidate.id===match?.[1]);assert.ok(level,`Could not resolve the active level from ${page.url()}`);return level;}
function patchPath(level,start,target,opened,blocked=[]){
 const room=start.room??0,grid=level.playfields?.patch?.[room]?.tiles??level.geometry.tiles;
 const closedGates=new Set(level.geometry.entities.filter(entity=>entity.kind==='gate'&&entity.blocksMovement===true&&(entity.field??'patch')==='patch'&&(entity.room??0)===room&&!opened.has(entity.id)).map(entity=>`${entity.x},${entity.y}`)),solid=new Set([...closedGates,...blocked]);
 const queue=[[start.x,start.y,[]]],seen=new Set([`${start.x},${start.y}`]);
 while(queue.length){const [x,y,path]=queue.shift();if(x===target.x&&y===target.y)return path;for(const [dx,dy,key] of [[0,-1,'ArrowUp'],[1,0,'ArrowRight'],[0,1,'ArrowDown'],[-1,0,'ArrowLeft']]){const nx=x+dx,ny=y+dy,tile=grid[ny]?.[nx],keyId=`${nx},${ny}`;if(!tile||tile==='#'||solid.has(keyId)||seen.has(keyId))continue;seen.add(keyId);queue.push([nx,ny,[...path,key]]);}}
 return null;
}
function patrolSafePath(initial,target){
 const key=state=>[state.patch.room??0,state.patch.x,state.patch.y,state.tick%6,...state.entities.filter(entity=>entity.kind==='sentry'&&(entity.room??0)===(state.patch.room??0)).flatMap(entity=>[entity.x,entity.y,entity.direction])].join(','),queue=[[initial,[]]],seen=new Set([key(initial)]);
 while(queue.length&&seen.size<20000){const [state,path]=queue.shift();if((state.patch.room??0)===(target.room??0)&&state.patch.x===target.x&&state.patch.y===target.y)return path;for(const action of [1,2,3,4]){const next=step(state,{patchAction:action}).state;if(next.patchStrikes>state.patchStrikes||next.failed)continue;const id=key(next);if(seen.has(id))continue;seen.add(id);queue.push([next,[...path,action]]);}}
 return null;
}
async function walkPatchTo(page,level,start,target,opened,{interact=true}={}){
 let position={room:start.room??0,...start};const hasProbe=await page.evaluate(()=>!!window.__echoTest);
 for(let moves=0;moves<4000&&!((position.room??0)===(target.room??0)&&position.x===target.x&&position.y===target.y);moves++){
  const live=hasProbe?await page.evaluate(()=>{const state=window.__echoTest.state,room=state.patch.room??0,blocked=[],danger=[],hasPatrol=state.entities.some(entity=>entity.kind==='sentry'&&(entity.room??0)===room);for(const entity of state.entities){if((entity.room??0)!==room||entity.field&&entity.field!=='patch')continue;if(entity.kind==='crate')blocked.push(`${entity.x},${entity.y}`);if(entity.kind==='sentry'){const current=`${entity.x},${entity.y}`;blocked.push(current);danger.push(current);if((state.tick+(entity.phase??0))%(entity.speed??2)===0){const axis=entity.axis==='y'?'y':'x',delta=entity.direction??1,min=entity.min??0,max=entity.max??0,next=entity[axis]+delta;if(next>=min&&next<=max)danger.push(axis==='x'?`${next},${entity.y}`:`${entity.x},${next}`);}}}return {patch:{...state.patch},open:state.entities.filter(entity=>(entity.kind==='gate'||entity.kind==='portal')&&entity.open).map(entity=>entity.id),blocked,danger,world:hasPatrol?state:null};}):null;
  if(live){position=live.patch;for(const id of live.open)opened.add(id);}
  if((position.room??0)===(target.room??0)&&position.x===target.x&&position.y===target.y)break;
  const room=position.room??0,roomTarget=room===(target.room??0)?target:level.geometry.entities.find(entity=>entity.kind==='portal'&&entity.field==='patch'&&(entity.room??0)===room&&entity.targetRoom===(room<(target.room??0)?room+1:room-1));
  assert.ok(roomTarget,`${level.id} has no portal from room ${room} toward room ${target.room??0}`);
  if(position.x===roomTarget.x&&position.y===roomTarget.y&&roomTarget.kind==='portal'){if(hasProbe)await page.evaluate(()=>window.__echoTest.command(5));else{await queueKeys(page,['e']);await delay(25);position={x:roomTarget.x,y:roomTarget.y,room:roomTarget.targetRoom};}continue;}
  const blocked=live?.blocked??level.geometry.entities.filter(entity=>entity.kind==='crate'&&(entity.room??0)===room).map(entity=>`${entity.x},${entity.y}`),path=patchPath(level,position,roomTarget,opened,blocked),directions={ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],ArrowLeft:[-1,0]};
  const safeActions=live?.world?patrolSafePath(live.world,{...roomTarget,room}):null;
  let key=safeActions?.length?{1:'ArrowUp',2:'ArrowRight',3:'ArrowDown',4:'ArrowLeft'}[safeActions[0]]:path?.[0],danger=new Set(live?.danger??blocked),planned=directions[key];if(!safeActions?.length&&planned&&danger.has(`${position.x+planned[0]},${position.y+planned[1]}`))key=null;
  if(!key&&live){const grid=level.playfields.patch[room].tiles,closed=new Set(level.geometry.entities.filter(entity=>entity.kind==='gate'&&entity.blocksMovement===true&&(entity.room??0)===room&&!opened.has(entity.id)).map(entity=>`${entity.x},${entity.y}`)),escape=[[0,1,'ArrowDown'],[-1,0,'ArrowLeft'],[1,0,'ArrowRight'],[0,-1,'ArrowUp']].find(([dx,dy])=>grid[position.y+dy]?.[position.x+dx]!== '#'&&!danger.has(`${position.x+dx},${position.y+dy}`)&&!closed.has(`${position.x+dx},${position.y+dy}`));key=escape?.[2];}
  assert.ok(key,`${level.id} Patch cannot reach ${target.id} from ${position.x},${position.y}`);const action={ArrowUp:1,ArrowRight:2,ArrowDown:3,ArrowLeft:4}[key];
  if(hasProbe){await page.evaluate(command=>window.__echoTest.command(command),action);if(new URL(page.url()).hash==='#/finale'){position={x:target.x,y:target.y,room:target.room??0};break;}}else{await queueKeys(page,[key]);await delay(25);if(key==='ArrowUp')position.y--;else if(key==='ArrowRight')position.x++;else if(key==='ArrowDown')position.y++;else position.x--;}
 }
 if(`${position.room??0},${position.x},${position.y}`!==`${target.room??0},${target.x},${target.y}`){const diagnostic=hasProbe?await page.evaluate(()=>({paused:document.querySelector('dialog[open]')!==null,dialog:document.querySelector('dialog[open] h2')?.textContent??null,failed:window.__echoTest?.state.failed,complete:window.__echoTest?.state.complete,cancelled:window.__echoTest?.state.cancelled,stage:window.__echoTest?.state.echoStage,activeDock:window.__echoTest?.state.activeDock,patch:window.__echoTest?.state.patch})):null;assert.equal(`${position.room??0},${position.x},${position.y}`,`${target.room??0},${target.x},${target.y}`,`${level.id} could not reach ${target.id}: ${JSON.stringify(diagnostic)}`);}
 if(interact){if(hasProbe)await page.evaluate(()=>window.__echoTest.command(5));else{await queueKeys(page,['e']);await delay(25);}}
 if(target.opens&&!target.opensAfterEcho)opened.add(target.opens);return {x:target.x,y:target.y,room:target.room??0};
}
const patchJourneys=new WeakMap();
async function prepareDock(page){
 const openDock=page.locator('dialog[open]');if(await openDock.count()&&await openDock.locator('button[data-action="practice"]').count())return openDock;
 const level=activeLevel(page),probe=await page.evaluate(()=>window.__echoTest?{stage:window.__echoTest.state.echoStage??0,tick:window.__echoTest.state.tick,activeDock:window.__echoTest.state.activeDock,patch:{...window.__echoTest.state.patch},capabilities:[...(window.__echoTest.state.capabilities??[])],open:window.__echoTest.state.entities.filter(entity=>(entity.kind==='gate'||entity.kind==='portal')&&entity.open).map(entity=>entity.id)}:null),hasProbe=!!probe;
 let journey=patchJourneys.get(page);if(!journey||journey.levelId!==level.id){journey={levelId:level.id,stage:0,position:{...level.actors.patchSpawn},opened:new Set(level.geometry.entities.filter(entity=>entity.kind==='gate'&&entity.open).map(entity=>entity.id)),nextRoute:0};patchJourneys.set(page,journey);}
 if(probe?.tick===0&&!probe.activeDock&&journey.nextRoute){journey={levelId:level.id,stage:0,position:{...level.actors.patchSpawn},opened:new Set(level.geometry.entities.filter(entity=>entity.kind==='gate'&&entity.open).map(entity=>entity.id)),nextRoute:0};patchJourneys.set(page,journey);}
 if(probe){journey.stage=probe.stage;journey.position=probe.patch;for(const id of probe.open)journey.opened.add(id);}
 const stages=level.task.echoStages??[],stage=stages[journey.stage],solution=SOLUTIONS[level.id],early=Number(level.id.slice(1))<=5,required=stage?.requiredCapability??level.task.requiredCapability,hasRequired=!!required&&probe?.capabilities.includes(required),route=solution?.patchRoute??level.task.patchRoute??['latch','receiverControl','practiceDock'],targetDock=stage?.dockId??'practiceDock',targetSocket=early&&!hasRequired?level.geometry.entities.find(entity=>entity.kind==='socket'&&entity.grantsCapability===required):null,targetId=targetSocket?.id??targetDock,targetIndex=early&&hasRequired?journey.nextRoute-1:targetSocket?route.indexOf(targetSocket.id):route.indexOf(targetDock);assert.ok(solution,`${level.id} is missing its executable solution program`);assert.equal(solution.echoRuns,stages.length||1,`${level.id} solution/run count drift`);assert.ok(targetIndex>=-1,`${level.id} route is missing ${targetId}`);
 const priorDock=journey.stage>0?stages[journey.stage-1]?.dockId:null,priorIndex=priorDock?route.indexOf(priorDock):-1,startIndex=Math.max(journey.nextRoute,priorIndex+1);
 for(let index=startIndex;index<=targetIndex;index++){
  const id=route[index],target=level.geometry.entities.find(entity=>entity.id===id);assert.ok(target,`${level.id} is missing ${id}`);
  if(!early&&id===targetDock&&required&&!probe?.capabilities.includes(required)){const cartridge=level.geometry.entities.find(entity=>entity.kind==='cartridge'&&entity.capabilityId===required);assert.ok(cartridge,`${level.id} is missing the required physical ${required} cartridge`);journey.position=await walkPatchTo(page,level,journey.position,cartridge,journey.opened);}
  journey.position=await walkPatchTo(page,level,journey.position,target,journey.opened);journey.nextRoute=index+1;
 }
 if(early){if(!hasProbe)await delay(6000);const tutorial=page.getByRole('dialog');if(await tutorial.count())await tutorial.getByRole('button',{name:/Open the repaired model/}).click();else await page.locator('.terminal-hotkey').click();}
 const dialog=page.getByRole('dialog');
 try{await dialog.locator('button[data-action="practice"]').waitFor({state:'visible',timeout:30000});}catch{const detail=await page.evaluate(()=>window.__echoTest?{stage:window.__echoTest.state.echoStage,activeDock:window.__echoTest.state.activeDock,capabilities:window.__echoTest.state.capabilities,patch:window.__echoTest.state.patch,required:window.__echoTest.state.level.task.echoStages?.[window.__echoTest.state.echoStage]?.requiredCapability,openDialog:!!document.querySelector('dialog[open]'),toast:document.querySelector('#toast')?.textContent}:{openDialog:!!document.querySelector('dialog[open]'),toast:document.querySelector('#toast')?.textContent,mission:document.querySelector('#mission-state')?.textContent});assert.fail(`${level.id} dock did not open: ${JSON.stringify(detail)}`);}
 return dialog;
}

async function extractPatch(page){
 const level=activeLevel(page),opened=new Set(level.geometry.entities.filter(entity=>entity.kind==='gate').map(entity=>entity.id)),probe=await page.evaluate(()=>window.__echoTest?.state?.patch??null),journey=patchJourneys.get(page);let position={...(probe??journey?.position??level.geometry.entities.find(entity=>entity.id==='practiceDock')??level.actors.patchSpawn)};
 for(const target of [...level.geometry.entities.filter(entity=>entity.kind==='core'&&!entity.echoCarry&&entity.requiresDelivery),level.geometry.entities.find(entity=>entity.id==='patchExit')])position=await walkPatchTo(page,level,position,target,opened,{interact:target.kind==='core'||target.kind==='exit-patch'});
}

async function practice(dialog,page){
 let meter='';for(let batch=0;batch<4;batch++){
  await dialog.getByRole('button',{name:'Train Echo',exact:true}).click();
  await page.waitForFunction(()=>{const button=document.querySelector('dialog[open] button[data-action="practice"]'),meter=document.querySelector('#dock-meter');return button&&!button.disabled&&!/^Stop /.test(button.textContent??'')&&/Last check:/.test(meter?.textContent??'');},null,{timeout:30000});
  meter=await page.locator('#dock-meter').innerText();if(/Last check: delivered/i.test(meter))break;
 }
 assert.match(meter,/Last check: delivered/i);assert.match(meter,/PRACTICE EPISODES SAVED/);
}

async function trainVisibleModel(page){
 const dialog=page.getByRole('dialog'),train=dialog.getByRole('button',{name:'Train Echo',exact:true});await train.click();
 await page.waitForFunction(()=>{const button=document.querySelector('dialog[open] button[data-action="practice"]'),meter=document.querySelector('#dock-meter');return button&&!button.disabled&&!/^Stop /.test(button.textContent??'')&&/Last check:/.test(meter?.textContent??'');},null,{timeout:30000});
 return dialog;
}

async function completeL01(page,{observeFailure=false}={}){
 const level=activeLevel(page),opened=new Set(),hasProbe=await page.evaluate(()=>!!window.__echoTest);let position={...level.actors.patchSpawn};
 const welcome=page.getByRole('dialog');if(await welcome.count())await welcome.getByRole('button',{name:'Look around first'}).click();
 if(observeFailure){await page.locator('.terminal-hotkey').click();let workbench=await trainVisibleModel(page);await workbench.getByRole('button',{name:/Run Echo|Run safe rehearsal/}).click();if(hasProbe)await page.evaluate(()=>{for(let tick=0;tick<100&&!document.querySelector('dialog[open]');tick++)window.__echoTest.command(0);});const retry=page.getByRole('dialog');await retry.getByRole('heading',{name:'Echo cannot move toward the cargo yet.'}).waitFor({timeout:20000});await retry.getByRole('button',{name:'Find the Relay cell'}).click();}
 const cell=level.geometry.entities.find(entity=>entity.id==='patchRelayCell1'),socket=level.geometry.entities.find(entity=>entity.id==='patchRelaySocket1'),exit=level.geometry.entities.find(entity=>entity.id==='patchExit');position=await walkPatchTo(page,level,position,cell,opened);position=await walkPatchTo(page,level,position,socket,opened);
 const repair=page.getByRole('dialog');await repair.getByRole('heading',{name:'The Socket changed Echo’s action space.'}).waitFor();await repair.getByRole('button',{name:'Open the repaired model'}).click();const workbench=await trainVisibleModel(page);await workbench.getByRole('button',{name:/Run Echo/}).click();
 if(hasProbe)await page.evaluate(()=>{for(let tick=0;tick<200&&!window.__echoTest.state.entities.find(entity=>entity.id==='exitGate').open;tick++)window.__echoTest.command(0);});else await page.locator('#mission-state').filter({hasText:'Echo delivered the fuse'}).waitFor({state:'attached',timeout:20000});
 opened.add('exitGate');await walkPatchTo(page,level,position,exit,opened);
}

async function expectClear(page,final=false,campaignFinal=false){
 if(campaignFinal){await page.waitForURL(/#\/finale$/,{timeout:20000});const ending=page.locator('.finale-screen');await ending.getByRole('heading',{name:'A city wakes.'}).waitFor({timeout:20000});return ending;}
 const dialog=page.getByRole('dialog');
 await dialog.getByRole('heading',{name:final?/lights up\.|Echoes at dawn\./:/A good little heist\./}).waitFor({timeout:20000});
 return dialog;
}

async function runLaterMission(page,{control=null,stageControls=[],core=false,final=false,skipInitialPractice=false}={}){
 const level=activeLevel(page),stages=level.task.echoStages?.length??1,startStage=await page.evaluate(()=>window.__echoTest?.state.echoStage??0);
 for(let stageIndex=startStage;stageIndex<stages;stageIndex++){
  let dock=await prepareDock(page),succeeded=false,lastResult=null;const hasProbe=await page.evaluate(()=>!!window.__echoTest);
  // The route choice now happens physically in Patch's maze. Legacy option
  // labels remain accepted by callers, but no abstract settings chip is clicked.
  const stageControl=stageControls[stageIndex]??(stageIndex===0?control:null);void stageControl;
  for(let attempt=0;attempt<4&&!succeeded;attempt++){
   const practiceButton=dock.locator('button[data-action="practice"]'),practiceReady=await practiceButton.count()===1&&await practiceButton.isEnabled();if(!practiceReady){const blocked=await page.evaluate(()=>window.__echoTest?{stage:window.__echoTest.state.echoStage,activeDock:window.__echoTest.state.activeDock,receiverReady:window.__echoTest.state.receiverReady,failed:window.__echoTest.state.failed,requirements:(window.__echoTest.state.level.task.echoStages?.[window.__echoTest.state.echoStage]?.requirements??[]).map(id=>({id,active:window.__echoTest.state.entities.find(entity=>entity.id===id)?.active})),dialog:document.querySelector('dialog[open] h2')?.textContent??null}:null);assert.fail(`${level.id} relay ${stageIndex+1} training was blocked: ${JSON.stringify(blocked)}`);}const deploy=dock.locator('button[data-action="deploy"]');await deploy.waitFor({state:'visible'});if(!(skipInitialPractice&&stageIndex===0&&attempt===0)){for(let batch=0;batch<8&&(batch===0&&Number(level.id.slice(1))<=5||!await deploy.isEnabled());batch++){await practiceButton.click();await page.waitForFunction(()=>{const button=document.querySelector('dialog[open] button[data-action="practice"]');return button&&!button.disabled&&!/^Stop /.test(button.textContent??'')&&/Last check:|MODEL:|EXPECTED RETURN|RECEIPTS|EPISODES|PLAYER-LABELED/.test(document.querySelector('#dock-meter')?.textContent??'');},null,{timeout:30000});}}const trainingResult=await page.evaluate(()=>window.__echoTest?{stats:window.__echoTest.stats,prepared:window.__echoTest.state.echoStagePrepared,stage:window.__echoTest.state.echoStage,controls:window.__echoTest.controls,capabilities:window.__echoTest.state.capabilities,requirements:(window.__echoTest.state.level.task.echoStages?.[window.__echoTest.state.echoStage]?.requirements??[]).map(id=>({id,active:window.__echoTest.state.entities.find(entity=>entity.id===id)?.active,powered:window.__echoTest.state.entities.find(entity=>entity.id===id)?.powered})),meter:document.querySelector('#dock-meter')?.textContent}:{meter:document.querySelector('#dock-meter')?.textContent,toast:document.querySelector('#toast')?.textContent});assert.equal(await deploy.isEnabled(),true,`${level.id} relay ${stageIndex+1} dispatch stayed locked after honest practice: ${JSON.stringify(trainingResult)}`);await deploy.click({timeout:30000});
   if(hasProbe){await page.evaluate(()=>{for(let step=0;step<300&&window.__echoTest.state.echoActive;step++)window.__echoTest.command(0);});lastResult=await page.evaluate(()=>({stage:window.__echoTest.state.echoStage,outcome:window.__echoTest.state.courierOutcome,failed:window.__echoTest.state.failed,echoActive:window.__echoTest.state.echoActive,echo:{...window.__echoTest.state.echo},config:{start:window.__echoTest.state.config.start,stageStart:window.__echoTest.state.config.stageStart,stagePhase:window.__echoTest.state.config.stagePhase},deployedControls:window.__echoTest.deployedControls,qEpisodes:window.__echoTest.q?.episodes,stats:window.__echoTest.stats,dialog:document.querySelector('dialog[open] h2')?.textContent??null,detail:document.querySelector('dialog[open] p')?.textContent??null}));succeeded=stageIndex<stages-1?lastResult.stage===stageIndex+1:lastResult.outcome==='delivered';}
   else{const expected=stageIndex<stages-1?`Echo relay ${stageIndex+2} of ${stages}: ready.`:`Echo relay ${stages} of ${stages}: delivered.`,success=page.locator('#mission-state').filter({hasText:expected}),retry=page.getByRole('dialog').getByRole('heading',{name:/Echo is back/});succeeded=await Promise.race([success.waitFor({state:'attached',timeout:30000}).then(()=>true),retry.waitFor({timeout:30000}).then(()=>false)]);lastResult=await page.evaluate(()=>({objective:document.querySelector('#mission-state')?.textContent??null,dialog:document.querySelector('dialog[open] h2')?.textContent??null,detail:document.querySelector('dialog[open] p')?.textContent??null,meter:document.querySelector('#dock-meter')?.textContent??null}));}
   if(!succeeded&&attempt<3){const retry=page.getByRole('dialog');await retry.getByRole('button',{name:/Tune and train again|Change Echo’s choice|Train or change Echo/}).click();dock=page.getByRole('dialog');await dock.locator('button[data-action="practice"]').waitFor({state:'visible',timeout:5000});}
  }
  assert.equal(succeeded,true,`${level.id} relay ${stageIndex+1} did not complete after real retraining: ${JSON.stringify(lastResult)}`);
  if(stageIndex<stages-1){if(hasProbe)await page.waitForFunction(expected=>window.__echoTest.state.echoStage===expected,stageIndex+1,{timeout:30000});else await page.locator('#mission-state').filter({hasText:/ROOM|Reach|Find|Activate/}).waitFor({state:'attached',timeout:30000});const journey=patchJourneys.get(page);journey.stage=stageIndex+1;const gate=level.task.echoStages[stageIndex].gateId;if(gate)journey.opened.add(gate);}
 }
 if(await page.evaluate(()=>!!window.__echoTest))await page.waitForFunction(()=>window.__echoTest.state.courierOutcome==='delivered',null,{timeout:30000});else await page.locator('#mission-state').filter({hasText:`Echo relay ${stages} of ${stages}: delivered.`}).waitFor({state:'attached',timeout:30000});
 await extractPatch(page);
 return expectClear(page,final,level.id==='L60');
}

test('Echo Heist twelve-district campaign works in real Chromium on source and lean subpath build',{timeout:720000},async t=>{
 const sourceServer=await serve('.');
 const buildServer=await serve('dist');
 let browser=null;
 t.after(async()=>{await browser?.close();await sourceServer.close();await buildServer.close();});
 browser=await chromium.launch({headless:true,channel:process.env.ECHO_BROWSER_CHANNEL??'chrome'});
 const scenario=(name,run)=>process.env.ECHO_BROWSER_ONLY&&!name.includes(process.env.ECHO_BROWSER_ONLY)?t.test(name,{skip:true},run):t.test(name,run);

 await scenario('source app: shell, settings, saves, all five missions, worker lifecycle, and responsive UI',async()=>{
  const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'no-preference'});
  const page=await context.newPage(),problems=watch(page);
  const appUrl=`${sourceServer.url}?test=1`;
  await page.goto(appUrl,{waitUntil:'load'});
  assert.equal(new URL(page.url()).hash,'#/');
  await page.getByRole('heading',{name:'A heist that teaches by letting you play.'}).waitFor();
  await page.getByRole('heading',{name:'One city. Two discarded robots.'}).waitFor();
  assert.equal(await page.locator('.landing-page img[src*="/landing/"]').count(),2);
  await page.screenshot({path:path.join(evidence,'source-landing.png'),fullPage:true});

  const enter=page.getByRole('button',{name:/Enter the city/});
  await enter.focus();
  assert.notEqual(await enter.evaluate(element=>getComputedStyle(element).outlineStyle),'none');
  await enter.hover();await delay(180);
  const hoverTransform=await enter.evaluate(element=>getComputedStyle(element).transform);
  assert.notEqual(hoverTransform,'none');
  const box=await enter.boundingBox();assert.ok(box);
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await delay(90);
  const pressTransform=await enter.evaluate(element=>getComputedStyle(element).transform);
  assert.notEqual(pressTransform,hoverTransform);
  await page.mouse.move(1,1);await page.mouse.up();
  await page.getByRole('button',{name:'Discover how Echo learns'}).click();
  await page.waitForFunction(()=>scrollY>innerHeight*.55);
  await page.evaluate(()=>scrollTo(0,0));
  await page.setViewportSize({width:375,height:812});
  await page.reload({waitUntil:'load'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
  await page.getByRole('heading',{name:/Teach a little robot/}).waitFor();
  await page.screenshot({path:path.join(evidence,'source-landing-narrow.png'),fullPage:false});
  await page.setViewportSize({width:1280,height:720});
  await enter.click();
  await page.getByRole('img',{name:/A City Wakes/}).waitFor();
  await page.waitForFunction(()=>window.__echoTest?.audio.context==='running');
  assert.equal(new URL(page.url()).hash,'#/menu');
  assert.equal(await page.locator('.menu-shell .brand-logo').count(),1);
  assert.equal(await page.locator('.menu-shell .menu-title-art').count(),0);
  assert.equal(await page.locator('.menu-shell .topbar .badge').count(),0);
  assert.match(await page.locator('.menu-shell .brand-logo').getAttribute('src'),/echo-heist-title-v1\.png/);
  assert.match(await page.locator('.menu-shell').evaluate(element=>getComputedStyle(element).backgroundImage),/scrapyard\.svg/);
  await page.screenshot({path:path.join(evidence,'source-menu.png'),fullPage:true});

  await page.getByRole('button',{name:/Settings/}).click();
  assert.equal(new URL(page.url()).hash,'#/settings');
  await page.getByLabel('Music volume').fill('0.2');
  await page.getByLabel('Sound effects volume').fill('0.3');
  await page.getByLabel('Mute all audio').check();
  await page.getByLabel('Reduced motion').check();
  assert.equal(await page.locator('[data-value-for="music"]').innerText(),'20%');
  await page.screenshot({path:path.join(evidence,'source-settings.png'),fullPage:true});
  await page.reload({waitUntil:'load'});
  assert.equal(await page.getByLabel('Music volume').inputValue(),'0.2');
  assert.equal(await page.getByLabel('Sound effects volume').inputValue(),'0.3');
  assert.equal(await page.getByLabel('Mute all audio').isChecked(),true);
  assert.equal(await page.getByLabel('Reduced motion').isChecked(),true);
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:/Choose district/}).waitFor();
  await page.waitForFunction(()=>window.__echoTest?.audio.loops===1);
  await delay(300);
  assert.ok((await page.evaluate(()=>window.__echoTest.audio.gains)).every(gain=>gain<0.01));

  await page.getByRole('button',{name:/Choose district/}).click();
  assert.equal(new URL(page.url()).hash,'#/districts');
  const cardBackgrounds=await page.locator('.district-card').evaluateAll(cards=>cards.map(card=>getComputedStyle(card).backgroundImage));
  assert.equal(new Set(cardBackgrounds).size,12);
  await page.screenshot({path:path.join(evidence,'source-map.png'),fullPage:true});
  await page.goBack();await page.getByRole('button',{name:/Choose district/}).waitFor();
  assert.equal(new URL(page.url()).hash,'#/menu');
  await page.goForward();await page.getByRole('button',{name:/District 01/}).waitFor();
  assert.equal(new URL(page.url()).hash,'#/districts');

  await page.getByRole('button',{name:/District 01/}).click();
  await page.getByRole('button',{name:/Mission L01/}).waitFor();
  assert.equal(new URL(page.url()).hash,'#/district/C01');
  assert.equal(await page.locator('.level-card svg, .level-card img').count(),0);
  await page.getByRole('button',{name:/Mission L01/}).click();
  await page.getByRole('heading',{name:/One spark/}).waitFor();
  await page.getByLabel('How to play').getByText('Train and run Echo anywhere').waitFor();
  await page.screenshot({path:path.join(evidence,'source-prologue.png'),fullPage:true});
  await page.getByRole('button',{name:/Wake the city/}).click();
  await readyForGame(page,'Cold Boot');
  await page.getByRole('dialog').getByRole('heading',{name:/Patch finds things/}).waitFor();
  assert.equal(await page.locator('.world-panel canvas').count(),2);
  assert.equal(await page.locator('.role-legend,.hint-strip').count(),0);
  assert.equal(await page.locator('.touch-controls button').count(),6);
  assert.equal(await page.getByRole('button',{name:'Open Echo model'}).count(),2);
  assert.equal(await page.getByRole('button',{name:/scan/i}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Mission briefing and icon guide'}).count(),0);
  assert.equal(await page.locator('.echo-status').count(),0);
  assert.match(await page.locator('.game').evaluate(element=>getComputedStyle(element,'::before').backgroundImage),/scrapyard\.svg/);
  await page.getByRole('dialog').getByRole('button',{name:'Look around first'}).click();
  await page.locator('.mechanic-pill').click();
  await page.getByRole('dialog').getByRole('heading',{name:/Repair Echo’s actions/}).waitFor();
  await page.screenshot({path:path.join(evidence,'source-icon-guide.png'),fullPage:true});
  await page.getByRole('dialog').getByRole('button',{name:'Back to the heist'}).click();
  await page.screenshot({path:path.join(evidence,'source-l01.png'),fullPage:true});
  await completeL01(page,{observeFailure:true});
  let clear=await expectClear(page);
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),['L01']);
  await clear.getByRole('button',{name:/Next mission/}).click();
  await readyForGame(page,'Shiny Distractions');
  await page.reload({waitUntil:'load'});
  await readyForGame(page,'Shiny Distractions');
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),['L01']);

  await page.getByRole('button',{name:'Pause game'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Mission map'}).click();
  await page.getByRole('button',{name:'Back to lift'}).click();
  await page.getByRole('button',{name:/Settings/}).click();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export save'}).click();
  const download=await downloadPromise,downloadPath=await download.path();
  assert.equal(download.suggestedFilename(),'echo-heist-save.json');
  const exported=fs.readFileSync(downloadPath);
  assert.deepEqual(JSON.parse(exported).completed,['L01']);
  await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
  await page.locator('#toast').filter({hasText:'previous save was not changed'}).waitFor();
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),['L01']);
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:/New game/}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Start a new game'}).click();
  await page.getByRole('button',{name:/Wake the city/}).click();
  await readyForGame(page,'Cold Boot');
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),[]);
  await page.goto(`${appUrl}#/settings`,{waitUntil:'load'});
  await page.locator('#import-file').setInputFiles({name:'echo-heist-save.json',mimeType:'application/json',buffer:exported});
  await page.locator('#toast').filter({hasText:'Save imported'}).waitFor();
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await readyForGame(page,'Shiny Distractions');
  await page.getByRole('button',{name:'Turn audio on'}).click();
  assert.equal(await page.getByRole('button',{name:'Mute audio'}).getAttribute('aria-pressed'),'false');

  await page.locator('#patch-world').press('r');
  const anywhereTerminal=page.getByRole('dialog');
  await anywhereTerminal.getByRole('button',{name:'Train Echo',exact:true}).waitFor();
  assert.equal(await anywhereTerminal.getByText(/Tabular Q-learning/).count(),0);
  assert.equal(await anywhereTerminal.getByText(/Practice budget/).count(),0);
  await anywhereTerminal.getByRole('button',{name:'How Echo learns'}).click();
  await anywhereTerminal.getByRole('heading',{name:/Q-learning/}).waitFor();
  for(const section of ['INPUT STATE / WHAT ECHO SEES','ACTION SPACE / WHAT ECHO CAN DO','POLICY / CURRENT STATE','TRAINING ALGORITHM','HYPERPARAMETERS'])await anywhereTerminal.getByText(section,{exact:true}).waitFor();
  assert.equal(await anywhereTerminal.getByText('CAPABILITY MISSING').count(),0);
  await page.screenshot({path:path.join(evidence,'source-echo-terminal.png'),fullPage:true});
  await anywhereTerminal.getByRole('button',{name:'Echo controls'}).click();
  assert.equal(await anywhereTerminal.locator('button[data-action="practice"]').isEnabled(),true);
  await anywhereTerminal.getByRole('button',{name:'Help for this run'}).click();
  for(const section of ['WHAT PATCH MUST FIND','RIGHT COMBINATION','WHY IT WORKS'])await anywhereTerminal.getByText(section,{exact:true}).waitFor();
  assert.match(await anywhereTerminal.locator('.solution-grid article').nth(1).innerText(),/The delivery/);
  await anywhereTerminal.getByRole('button',{name:'Back to Echo controls'}).click();
  assert.equal(await anywhereTerminal.getByRole('button',{name:/Run safe rehearsal/}).isEnabled(),false);
  await anywhereTerminal.getByRole('button',{name:'Train Echo',exact:true}).click();await page.waitForFunction(()=>{const train=document.querySelector('dialog[open] button[data-action="practice"]'),run=document.querySelector('dialog[open] button[data-action="deploy"]');return train&&!/^Stop /.test(train.textContent??'')&&run&&!run.disabled;},null,{timeout:30000});
  await anywhereTerminal.getByRole('button',{name:/Run safe rehearsal/}).click();
  assert.equal(await page.evaluate(()=>window.__echoTest.state.echoActive),true);
  await page.locator('.patch-panel.echo-running').waitFor();
  await page.evaluate(()=>{for(let step=0;step<300&&window.__echoTest.state.echoActive;step++)window.__echoTest.command(0);});
  const earlyRetry=page.getByRole('dialog');await earlyRetry.getByRole('heading',{name:/practice receiver|incomplete model/}).waitFor();
  await earlyRetry.getByRole('button',{name:'Inspect Echo'}).click();
  await page.keyboard.press('r');
  await anywhereTerminal.waitFor({state:'hidden'});

  let dock=await prepareDock(page);
  await dock.getByRole('button',{name:'The delivery',exact:true}).click();
  await dock.getByRole('button',{name:'Train Echo',exact:true}).click();
  await dock.getByRole('button',{name:'Stop training'}).click();
  await delay(400);
  assert.equal(await page.evaluate(()=>window.__echoTest.workerActive),false);
  assert.match(await page.locator('#dock-meter').innerText(),/NO NEW PRACTICE YET/);
  await practice(dock,page);
  const trainedQ=await page.evaluate(()=>JSON.stringify(window.__echoTest.q));
  await dock.getByRole('button',{name:'Close Echo model'}).click();
  await page.locator('#patch-world').press('r');
  await readyForGame(page,'Shiny Distractions');
  dock=await prepareDock(page);
  assert.match(await page.locator('#dock-meter').innerText(),/1,800 PRACTICE EPISODES SAVED/);
  const patchBeforeRun=await page.evaluate(()=>({...window.__echoTest.state.patch}));
  await dock.getByRole('button',{name:/Run Echo/}).click();
  assert.equal(await page.evaluate(()=>JSON.stringify(window.__echoTest.deployedQ)),trainedQ);
  await page.locator('.patch-panel.echo-running').waitFor();
  await page.keyboard.press('ArrowRight');await delay(300);
  assert.deepEqual(await page.evaluate(()=>({...window.__echoTest.state.patch})),patchBeforeRun);
  await page.evaluate(()=>{for(let step=0;step<300&&window.__echoTest.state.echoActive;step++)window.__echoTest.command(0);});
  assert.equal(await page.locator('.patch-panel.echo-running').count(),0);
  const patchAfterRun=await page.evaluate(()=>({...window.__echoTest.state.patch}));
  await page.evaluate(()=>{const before={...window.__echoTest.state.patch};for(const action of [1,2,3,4]){window.__echoTest.command(action);const now=window.__echoTest.state.patch;if(now.x!==before.x||now.y!==before.y||now.room!==before.room)break;}});
  assert.notDeepEqual(await page.evaluate(()=>({...window.__echoTest.state.patch})),patchAfterRun);
  await extractPatch(page);
  clear=await expectClear(page);
  assert.equal(await page.evaluate(()=>JSON.stringify(window.__echoTest.q)),trainedQ);
  await clear.getByRole('button',{name:/Next mission/}).click();
  await readyForGame(page,'The Long Way Round');
  const l03Isolation=await page.evaluate(()=>({controls:window.__echoTest.controls,q:window.__echoTest.q,deployed:window.__echoTest.deployedQ}));
  assert.equal(l03Isolation.controls.priority,'delivery');
  assert.equal(l03Isolation.deployed,null);
  assert.notEqual(JSON.stringify(l03Isolation.q),trainedQ);

  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});
  await page.getByRole('dialog').getByRole('heading',{name:'We will wait here.'}).waitFor();
  await page.getByRole('dialog').getByRole('button',{name:'Resume'}).click();
  dock=await prepareDock(page);
  await practice(dock,page);
  await dock.getByRole('button',{name:/Run Echo/}).click();
  await page.evaluate(()=>{for(let step=0;step<300&&window.__echoTest.state.echoActive;step++)window.__echoTest.command(0);});
  await extractPatch(page);
  clear=await expectClear(page);
  await clear.getByRole('button',{name:/Next mission/}).click();
  await readyForGame(page,'Curious Circuit');

  dock=await prepareDock(page);
  await practice(dock,page);
  await dock.getByRole('button',{name:/Run Echo/}).click();
  await page.evaluate(()=>{for(let step=0;step<300&&window.__echoTest.state.echoActive;step++)window.__echoTest.command(0);});
  await extractPatch(page);
  clear=await expectClear(page);
  await clear.getByRole('button',{name:/Next mission/}).click();
  await readyForGame(page,'Two Robots, One Exit');

  clear=await runLaterMission(page,{core:true,final:true});
  await clear.getByRole('button',{name:/Next mission/}).click();
  await readyForGame(page,'Same Place, Different Job');
  await page.getByRole('button',{name:'Pause game'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Mission map'}).click();
  await page.getByRole('button',{name:/District 01/}).click();
  await page.getByText('5 OF 5 MISSIONS COMPLETE').waitFor();
  await page.getByText(/DISTRICT RELAY ONLINE/).waitFor();
  await page.screenshot({path:path.join(evidence,'source-chapter-clear.png'),fullPage:true});
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),['L01','L02','L03','L04','L05']);

  await page.setViewportSize({width:375,height:812});
  await page.reload({waitUntil:'load'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
  assert.equal(await page.getByRole('button',{name:/Mission L05/}).isVisible(),true);
  await page.screenshot({path:path.join(evidence,'source-map-narrow.png'),fullPage:true});
  assert.deepEqual(problems,[]);
 await context.close();
 });

 await scenario('source app: L03 Echo failure returns only Echo to the dock',async()=>{
  const seed={schemaVersion:1,completed:['L01','L02'],currentLevel:'L03',cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
  const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value)),seed);
  const page=await context.newPage(),problems=watch(page);await page.goto(`${sourceServer.url}?test=1#/play/L03`,{waitUntil:'load'});await readyForGame(page,'The Long Way Round');
  const dock=await prepareDock(page);await dock.getByRole('button',{name:'Train Echo',exact:true}).click();await page.waitForFunction(()=>{const run=document.querySelector('button[data-action="deploy"]'),train=document.querySelector('button[data-action="practice"]');return !!run&&!run.disabled&&!!train&&!/^Stop /.test(train.textContent??'')&&/Last check:/.test(document.querySelector('#dock-meter')?.textContent??'');},null,{timeout:30000});
  const patchBefore=await page.evaluate(()=>({...window.__echoTest.state.patch}));await page.evaluate(()=>{for(const values of Object.values(window.__echoTest.q??{}))if(Array.isArray(values)){values.fill(-10);values[0]=100;}});const trained=await page.evaluate(()=>JSON.stringify(window.__echoTest.q));await dock.getByRole('button',{name:/Run Echo/}).click();
  await page.evaluate(()=>{for(let tick=0;tick<150&&!document.querySelector('dialog[open]');tick++)window.__echoTest.command(0);});
  const retry=page.getByRole('dialog');await retry.getByRole('heading',{name:'Echo is back at the start.'}).waitFor({timeout:20000});
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.state.patch),patchBefore);assert.equal(await page.evaluate(()=>window.__echoTest.state.failed),false);assert.equal(await page.evaluate(()=>window.__echoTest.state.courierOutcome),null);assert.equal(await page.evaluate(()=>JSON.stringify(window.__echoTest.q)),trained);
  await retry.getByRole('button',{name:'Train or change Echo'}).click();await page.getByRole('dialog').getByRole('heading',{name:'A little preparation.'}).waitFor();assert.deepEqual(problems,[]);await context.close();
 });

 await scenario('source app: district-first navigation, chapter themes, and all fifteen Chapter 3-5 missions',async()=>{
  const seed={schemaVersion:1,completed:Array.from({length:10},(_,i)=>`L${String(i+1).padStart(2,'0')}`),currentLevel:'L11',cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
  const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value)),seed);
  const page=await context.newPage(),problems=watch(page),appUrl=`${sourceServer.url}?test=1`;
  await page.goto(`${appUrl}#/menu`,{waitUntil:'load'});
  await page.locator('.menu-shell.theme-switchworks').waitFor();
  await page.screenshot({path:path.join(chapter5Evidence,'switchworks-menu.png'),fullPage:true});
  await page.getByRole('button',{name:/Choose district/}).click();
  assert.equal(await page.getByRole('button',{name:/District 03/}).isEnabled(),true);
  assert.equal(await page.getByRole('button',{name:/District 04/}).isEnabled(),false);
  await page.getByRole('button',{name:/District 03/}).click();
  await page.getByRole('button',{name:/Mission L11/}).click();
  await readyForGame(page,'Wrong Turn');

  const missions=[
   ['L11','Wrong Turn',{control:'Repair this junction'}],['L12','Chain Reaction',{}],['L13','Ripple Effect',{}],['L14','One Door Closed',{control:'Changed switchboard'}],['L15','The Switchmaster',{core:true,final:true}],
   ['L16','Return Receipt',{}],['L17','Midway Message',{}],['L18','One Lucky Delivery',{control:'Dependable stairs'}],['L19','Fading Footprints',{}],['L20','Blind Delivery',{core:true,final:true}],
   ['L21','Unmarked Alley',{}],['L22','Greedy Too Soon',{}],['L23','Edge Runner',{}],['L24','Perfect Plan, Imperfect Pilot',{}],['L25','Market Blackout',{core:true,final:true}]
  ];
  for(let index=0;index<missions.length;index++){
   const [id,title,options]=missions[index];
   if(index)await readyForGame(page,title);
   const clear=await runLaterMission(page,options);
   assert.ok((await page.evaluate(()=>window.__echoTest.save.completed)).includes(id));
   if(id==='L15'||id==='L20'){
    await clear.getByRole('button',{name:/Next mission/}).click();
    const nextTitle=id==='L15'?'Return Receipt':'Unmarked Alley';await readyForGame(page,nextTitle);
    await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('dialog').getByRole('button',{name:'Mission map'}).click();await page.getByRole('button',{name:'Back to lift'}).click();
    await page.locator(id==='L15'?'.menu-shell.theme-courier':'.menu-shell.theme-neon').waitFor();
    await page.screenshot({path:path.join(chapter5Evidence,id==='L15'?'courier-menu.png':'neon-menu.png'),fullPage:true});
    await page.getByRole('button',{name:'Continue',exact:true}).click();
   }else if(id==='L25'){await clear.getByRole('button',{name:/Next mission/}).click();await readyForGame(page,'Familiar Shape');await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('dialog').getByRole('button',{name:'Mission map'}).click();}
   else await clear.getByRole('button',{name:/Next mission/}).click();
  }
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),Array.from({length:25},(_,i)=>`L${String(i+1).padStart(2,'0')}`));
  await page.getByRole('button',{name:/District 05/}).click();await page.getByText('5 OF 5 MISSIONS COMPLETE').waitFor();
  await page.screenshot({path:path.join(chapter5Evidence,'five-districts-clear.png'),fullPage:true});
 assert.deepEqual(problems,[]);await context.close();
 });

 await scenario('source app: all fifteen Chapter 6-8 missions, advanced workers, saves, unlocks, and chapter themes',async()=>{
  const seed={schemaVersion:1,completed:Array.from({length:25},(_,i)=>`L${String(i+1).padStart(2,'0')}`),currentLevel:'L26',cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
  const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value)),seed);
  const page=await context.newPage(),problems=watch(page),appUrl=`${sourceServer.url}?test=1`;
  await page.goto(`${appUrl}#/menu`,{waitUntil:'load'});await page.locator('.menu-shell.theme-foundry').waitFor();await page.screenshot({path:path.join(chapter8Evidence,'foundry-menu.png'),fullPage:true});
  await page.getByRole('button',{name:/Choose district/}).click();assert.equal(await page.getByRole('button',{name:/District 06/}).isEnabled(),true);assert.equal(await page.getByRole('button',{name:/District 07/}).isEnabled(),false);
  await page.getByRole('button',{name:/District 06/}).click();await page.getByRole('button',{name:/Mission L26/}).click();await readyForGame(page,'Familiar Shape');
  const missions=[
   ['L26','Familiar Shape',{}],['L27','The Missing Detail',{}],['L28','Every Tile Is Not Special',{}],['L29','Tight Corners',{}],['L30','The Moving Warehouse',{core:true,final:true}],
   ['L31','Unknown Machine',{}],['L32','Ghost Shift',{}],['L33','Real or Rehearsed',{}],['L34','Outdated Map',{}],['L35','Dockside Switch',{core:true,final:true}],
   ['L36','Fork in the Sky',{}],['L37','Credit at the Exit',{}],['L38','Luck Is Not Skill',{}],['L39','Second Opinion',{}],['L40','Skybridge Extraction',{core:true,final:true}]
  ];
  for(let index=0;index<missions.length;index++){
   const [id,title,options]=missions[index];if(index)await readyForGame(page,title);const clear=await runLaterMission(page,options);assert.ok((await page.evaluate(()=>window.__echoTest.save.completed)).includes(id));
   if(id==='L30'||id==='L35'){
    await clear.getByRole('button',{name:/Next mission/}).click();const nextTitle=id==='L30'?'Unknown Machine':'Fork in the Sky';await readyForGame(page,nextTitle);await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('dialog').getByRole('button',{name:'Mission map'}).click();await page.getByRole('button',{name:'Back to lift'}).click();
    await page.locator(id==='L30'?'.menu-shell.theme-docks':'.menu-shell.theme-skybridge').waitFor();await page.screenshot({path:path.join(chapter8Evidence,id==='L30'?'docks-menu.png':'skybridge-menu.png'),fullPage:true});await page.getByRole('button',{name:'Continue',exact:true}).click();
   }else if(id==='L40'){await clear.getByRole('button',{name:/Next mission/}).click();await readyForGame(page,'Neural Upgrade');await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('dialog').getByRole('button',{name:'Mission map'}).click();}else await clear.getByRole('button',{name:/Next mission/}).click();
  }
 assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),Array.from({length:40},(_,i)=>`L${String(i+1).padStart(2,'0')}`));await page.getByRole('button',{name:/District 08/}).click();await page.getByText('5 OF 5 MISSIONS COMPLETE').waitFor();await page.screenshot({path:path.join(chapter8Evidence,'eight-districts-clear.png'),fullPage:true});assert.deepEqual(problems,[]);await context.close();
 });

 await scenario('source app: real DQN, player demonstrations, and the Eclipse Warden finale',async()=>{
  for(const item of [{id:'L41',title:'Neural Upgrade',completed:40,theme:'arcade',options:{}},{id:'L51',title:'Follow My Lead',completed:50,theme:'tower',imitation:true,options:{}},{id:'L60',title:'Grand Finale: Echoes at Dawn',completed:59,theme:'eclipse',options:{core:true,final:true,stageControls:['Uniform real replay','Latest transition only','Uniform real replay']}}]){
   const seed={schemaVersion:1,completed:Array.from({length:item.completed},(_,i)=>`L${String(i+1).padStart(2,'0')}`),currentLevel:item.id,cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
   const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value)),seed);const page=await context.newPage(),problems=watch(page),appUrl=`${sourceServer.url}?test=1`;
   await page.goto(`${appUrl}#/menu`,{waitUntil:'load'});await page.locator(`.menu-shell.theme-${item.theme}`).waitFor();await page.screenshot({path:path.join(finaleEvidence,`${item.id.toLowerCase()}-menu.png`),fullPage:true});await page.getByRole('button',{name:'Continue',exact:true}).click();await readyForGame(page,item.title);
   if(item.imitation){
    const dock=await prepareDock(page);await dock.getByRole('button',{name:'Record Echo lesson'}).click();await recordEchoLesson(page);await runLaterMission(page);const saved=await page.evaluate(()=>window.__echoTest.save.cartridges.L51);assert.equal(saved.snapshot.algorithm,'behavioral-cloning');assert.ok(saved.demonstrations.length>=4);
   }else{const clear=await runLaterMission(page,item.options);if(item.id==='L60'){
    await page.screenshot({path:path.join(finaleEvidence,'grand-finale.png'),fullPage:true});
    await clear.getByRole('button',{name:'Return to the city'}).click();
    await page.getByRole('button',{name:'Back to lift'}).click();
    await page.getByRole('button',{name:'Continue',exact:true}).click();
    await page.waitForURL(/#\/finale$/,{timeout:10000});
    await page.locator('.finale-screen').getByRole('heading',{name:'A city wakes.'}).waitFor();
   }assert.ok(await clear.isVisible());}
   assert.deepEqual(problems,[]);await context.close();
  }
 });

 await scenario('source app: Chapter 2 known-model evaluation, neural worker probe, and five mission clears',async()=>{
  const seed={schemaVersion:1,completed:['L01','L02','L03','L04','L05'],currentLevel:'L06',cartridges:{L06:{controls:{representation:'cargo'},capabilities:['sense-cargo'],contract:'{"content":"stale-l06"}'}},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
  const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value)),seed);
  const page=await context.newPage(),problems=watch(page),appUrl=`${sourceServer.url}?test=1`;
  await page.goto(`${appUrl}#/play/L06`,{waitUntil:'load'});await readyForGame(page,'Same Place, Different Job');
  const patchAtStart=await page.evaluate(()=>({...window.__echoTest.state.patch}));await page.locator('.terminal-hotkey').click();let rehearsal=page.getByRole('dialog');
  assert.equal(await rehearsal.getByRole('button',{name:'Train Echo',exact:true}).isEnabled(),true);assert.equal(await rehearsal.getByRole('button',{name:/Run safe rehearsal/}).isEnabled(),false);assert.equal(await rehearsal.getByRole('button',{name:'Position + cargo',exact:true}).isEnabled(),false);
  await rehearsal.getByRole('button',{name:'Train Echo',exact:true}).click();await page.waitForFunction(()=>{const train=document.querySelector('dialog[open] button[data-action="practice"]'),run=document.querySelector('dialog[open] button[data-action="deploy"]');return train&&!/^Stop /.test(train.textContent??'')&&run&&!run.disabled;},null,{timeout:30000});await rehearsal.getByRole('button',{name:/Run safe rehearsal/}).click();assert.equal(await page.evaluate(()=>window.__echoTest.state.previewEcho),true);await page.evaluate(()=>{for(let step=0;step<300&&!document.querySelector('dialog[open]');step++)window.__echoTest.command(0);});
  rehearsal=page.getByRole('dialog');await rehearsal.getByRole('heading',{name:/practice receiver|incomplete model/i}).waitFor({timeout:10000});const rehearsalResult=await page.evaluate(()=>({patch:{...window.__echoTest.state.patch},stage:window.__echoTest.state.echoStage,preview:window.__echoTest.state.previewEcho,portal:window.__echoTest.state.entities.find(entity=>entity.id==='patchPortal2')?.open}));assert.deepEqual(rehearsalResult.patch,patchAtStart);assert.equal(rehearsalResult.stage,0);assert.equal(!!rehearsalResult.preview,false);assert.equal(rehearsalResult.portal,false);await rehearsal.getByRole('button',{name:'Return to Patch'}).click();
  await page.screenshot({path:path.join(chapter2Evidence,'source-l06.png'),fullPage:true});

  const neural=await page.evaluate(async()=>{
   const run=mode=>new Promise((resolve,reject)=>{const worker=new Worker(new URL('./src/training/neural-worker.js',location.href),{type:'module'}),started=performance.now();let frames=0,active=true;const pulse=()=>{if(active){frames++;requestAnimationFrame(pulse);}};requestAnimationFrame(pulse);worker.onmessage=event=>{if(event.data.type==='complete'){active=false;worker.terminate();resolve({...event.data,wallMs:performance.now()-started,frames});}else if(event.data.type==='error'){active=false;worker.terminate();reject(new Error(event.data.message));}};worker.onerror=event=>reject(new Error(event.message));worker.postMessage({type:'probe',jobId:mode,mode,updates:mode==='dqn'?1200:500,seed:73001});});
   return {dqn:await run('dqn'),clone:await run('clone')};
  });
  assert.equal(neural.dqn.correct,neural.dqn.total);assert.equal(neural.clone.correct,neural.clone.total);assert.ok(neural.dqn.frames>1);assert.ok(neural.dqn.wallMs<5000);assert.ok(neural.clone.wallMs<5000);
  const cancelled=await page.evaluate(()=>new Promise((resolve,reject)=>{const worker=new Worker(new URL('./src/training/neural-worker.js',location.href),{type:'module'});let completed=false;worker.onmessage=event=>{if(event.data.type==='progress')worker.postMessage({type:'cancel',jobId:'cancel'});else if(event.data.type==='complete')completed=true;else if(event.data.type==='cancelled')setTimeout(()=>{worker.terminate();resolve({completed});},50);else if(event.data.type==='error')reject(new Error(event.data.message));};worker.onerror=event=>reject(new Error(event.message));worker.postMessage({type:'probe',jobId:'cancel',mode:'dqn',updates:100000,seed:73002});}));
  assert.equal(cancelled.completed,false);
  fs.writeFileSync(path.join(chapter2Evidence,'neural-probe.json'),JSON.stringify({environment:{browser:await browser.version(),viewport:'1280x720'},dqn:{workerElapsedMs:neural.dqn.elapsedMs,wallMs:neural.dqn.wallMs,animationFrames:neural.dqn.frames,updates:neural.dqn.updates,correct:neural.dqn.correct,total:neural.dqn.total},cloning:{workerElapsedMs:neural.clone.elapsedMs,wallMs:neural.clone.wallMs,animationFrames:neural.clone.frames,updates:neural.clone.updates,correct:neural.clone.correct,total:neural.clone.total},cancellation:cancelled,runtimeBytes:['src/agents/neural.js','src/training/neural-worker.js'].reduce((sum,file)=>sum+fs.statSync(path.join(root,file)).size,0),backend:'dependency-free plain JavaScript arrays; no tensor runtime'},null,2));

  let dock=await prepareDock(page);
  await dock.getByRole('button',{name:'Train Echo',exact:true}).click();await page.locator('#dock-meter').filter({hasText:'DELIVERY 100.0%'}).waitFor({timeout:10000});
  await page.screenshot({path:path.join(chapter2Evidence,'source-l06-evaluated.png'),fullPage:true});
  const evaluatedHash=await page.evaluate(()=>window.__echoTest.q.policyHash);await dock.getByRole('button',{name:/Run Echo/}).click();
  assert.equal(await page.evaluate(()=>window.__echoTest.deployedQ.policyHash),evaluatedHash);const firstRelay=await page.evaluate(()=>{for(let step=0;step<300&&window.__echoTest.state.echoActive;step++)window.__echoTest.command(0);return {stage:window.__echoTest.state.echoStage,outcome:window.__echoTest.state.courierOutcome,failed:window.__echoTest.state.failed,echo:{...window.__echoTest.state.echo},dialog:document.querySelector('dialog[open] h2')?.textContent??null};});assert.equal(firstRelay.stage,1,JSON.stringify(firstRelay));
  let clear=await runLaterMission(page);await clear.getByRole('button',{name:/Next mission/}).click();await readyForGame(page,'Slippery Service');

  clear=await runLaterMission(page,{control:'Upper bypass'});await clear.getByRole('button',{name:/Next mission/}).click();await readyForGame(page,'Ghost Routes');

  clear=await runLaterMission(page,{control:'Service tunnel'});await clear.getByRole('button',{name:/Next mission/}).click();await readyForGame(page,'What Lies Ahead');

  clear=await runLaterMission(page,{control:'North platform'});await clear.getByRole('button',{name:/Next mission/}).click();await readyForGame(page,'Last Train Out');

  clear=await runLaterMission(page,{control:'Service line',final:true});
  assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),Array.from({length:10},(_,i)=>`L${String(i+1).padStart(2,'0')}`));
  await clear.getByRole('button',{name:/Next mission/}).click();await readyForGame(page,'Wrong Turn');await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('dialog').getByRole('button',{name:'Mission map'}).click();await page.getByRole('button',{name:/District 02/}).click();await page.getByText('5 OF 5 MISSIONS COMPLETE').waitFor();
  await page.screenshot({path:path.join(chapter2Evidence,'source-chapter2-clear.png'),fullPage:true});assert.deepEqual(problems,[]);await context.close();
 });

 await scenario('source app: locked routes, unknown routes, and storage failure recover visibly',async()=>{
  const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage();
  await page.goto(`${sourceServer.url}?test=1#/play/L05`,{waitUntil:'load'});
  await page.getByRole('heading',{name:'Choose a district.'}).waitFor();
  assert.equal(new URL(page.url()).hash,'#/districts');
  await page.goto(`${sourceServer.url}?test=1#/not-a-route`,{waitUntil:'load'});
  await page.getByRole('button',{name:/Enter the city/}).waitFor();
  assert.equal(new URL(page.url()).hash,'#/');
  await context.close();

  const blocked=await browser.newContext({viewport:{width:1024,height:768}});
  await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('blocked','QuotaExceededError');};});
  const blockedPage=await blocked.newPage();
  await blockedPage.goto(`${sourceServer.url}?test=1`,{waitUntil:'load'});
  await blockedPage.getByRole('button',{name:/Enter the city/}).click();
  await blockedPage.getByRole('button',{name:/Start the heist/}).click();
  await blockedPage.getByRole('button',{name:/Wake the city/}).click();
  await readyForGame(blockedPage,'Cold Boot');
  await blockedPage.locator('#toast').filter({hasText:'Local saving is unavailable'}).waitFor();
  await blocked.close();
 });

 await scenario('source app: Backquote/Tilde advances and persists sequential preview progress',async()=>{
  const context=await browser.newContext({viewport:{width:1024,height:768}}),page=await context.newPage(),problems=watch(page);
  await page.goto(`${sourceServer.url}?test=1#/menu`,{waitUntil:'load'});await page.locator('.menu-shell.theme-scrapyard').waitFor();
  for(let count=0;count<5;count++)await page.keyboard.press('Backquote');
  await page.locator('.menu-shell.theme-transit').waitFor();assert.match(await page.locator('.menu-shell').evaluate(element=>getComputedStyle(element).backgroundImage),/transit\.svg/);assert.deepEqual(await page.evaluate(()=>window.__echoTest.save.completed),['L01','L02','L03','L04','L05']);assert.equal(await page.evaluate(()=>window.__echoTest.save.currentLevel),'L06');
  await page.reload({waitUntil:'load'});await page.locator('.menu-shell.theme-transit').waitFor();assert.deepEqual(JSON.parse(await page.evaluate(()=>localStorage.getItem('echo-heist-c01-v1'))).completed,['L01','L02','L03','L04','L05']);
  await page.keyboard.press('Shift+Backquote');assert.equal(await page.evaluate(()=>window.__echoTest.save.currentLevel),'L07');assert.deepEqual(problems,[]);await context.close();
 });

 await scenario('lean production build: /echo-heist/ assets, module worker, and persisted play',async()=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),problems=watch(page),resources=[];
  page.on('response',response=>resources.push(response.url()));
  const appUrl=`${buildServer.url}echo-heist/`;
  await page.goto(appUrl,{waitUntil:'load'});
  assert.equal(await page.evaluate(()=>('__echoTest' in window)),false);
  await page.getByRole('button',{name:/Enter the city/}).click();
  await page.getByRole('button',{name:/Choose district/}).click();
  await page.getByRole('button',{name:/District 01/}).click();
  await page.getByRole('button',{name:/Mission L01/}).click();
  await page.getByRole('button',{name:/Wake the city/}).click();
  await readyForGame(page,'Cold Boot');
  await page.getByRole('dialog').getByRole('button',{name:'Look around first'}).click();
  await page.screenshot({path:path.join(evidence,'production-subpath-l01.png'),fullPage:true});
  await completeL01(page);
  const clear=await expectClear(page);
  await clear.getByRole('button',{name:/Next mission/}).click();
  await readyForGame(page,'Shiny Distractions');
  const dock=await prepareDock(page);
  await dock.getByRole('button',{name:'The delivery',exact:true}).click();
  await practice(dock,page);
  await page.reload({waitUntil:'load'});
  await readyForGame(page,'Shiny Distractions');
  assert.ok(resources.filter(url=>url.startsWith(buildServer.url)).every(url=>new URL(url).pathname.startsWith('/echo-heist/')));
  assert.deepEqual(problems,[]);
 await context.close();
 });

 await scenario('lean production build: Chapter 2 policy worker and assets under /echo-heist/',async()=>{
  const seed={schemaVersion:1,completed:['L01','L02','L03','L04','L05'],currentLevel:'L06',cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
  const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value)),seed);
  const page=await context.newPage(),problems=watch(page),resources=[];page.on('response',response=>resources.push(response.url()));
  await page.goto(`${buildServer.url}echo-heist/#/play/L06`,{waitUntil:'load'});await readyForGame(page,'Same Place, Different Job');
  await runLaterMission(page,{control:'Position + cargo'});
  assert.ok(resources.filter(url=>url.startsWith(buildServer.url)).every(url=>new URL(url).pathname.startsWith('/echo-heist/')));assert.deepEqual(problems,[]);await context.close();
 });

 await scenario('lean production build: Chapter 3-5 planning, prediction, and control workers',async()=>{
  const cases=[
   {id:'L11',title:'Wrong Turn',completed:10,run:'Compute blueprint',control:'Repair this junction'},
   {id:'L16',title:'Return Receipt',completed:15,run:'Collect receipts'},
   {id:'L21',title:'Unmarked Alley',completed:20,run:'Practice'}
  ];
  for(const item of cases){
   const seed={schemaVersion:1,completed:Array.from({length:item.completed},(_,i)=>`L${String(i+1).padStart(2,'0')}`),currentLevel:item.id,cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
   const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>{if(!localStorage.getItem('echo-heist-c01-v1'))localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value));},seed);
   const page=await context.newPage(),problems=watch(page),resources=[];page.on('response',response=>resources.push(response.url()));
   await page.goto(`${buildServer.url}echo-heist/#/play/${item.id}`,{waitUntil:'load'});await readyForGame(page,item.title);
   await runLaterMission(page,{control:item.control});
   assert.ok(resources.filter(url=>url.startsWith(buildServer.url)).every(url=>new URL(url).pathname.startsWith('/echo-heist/')));assert.deepEqual(problems,[]);await context.close();
  }
 });

 await scenario('lean production build: Chapter 6-9 advanced module workers and persisted snapshots',async()=>{
  const cases=[
   {id:'L26',title:'Familiar Shape',completed:25},
   {id:'L31',title:'Unknown Machine',completed:30,persist:true},
   {id:'L36',title:'Fork in the Sky',completed:35},
   {id:'L41',title:'Neural Upgrade',completed:40,persist:true}
  ].filter(item=>!process.env.ECHO_BROWSER_LEVEL||item.id===process.env.ECHO_BROWSER_LEVEL);
  for(const item of cases){
   const seed={schemaVersion:1,completed:Array.from({length:item.completed},(_,i)=>`L${String(i+1).padStart(2,'0')}`),currentLevel:item.id,cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
   const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>{if(!localStorage.getItem('echo-heist-c01-v1'))localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value));},seed);
   const page=await context.newPage(),problems=watch(page),resources=[];page.on('response',response=>resources.push(response.url()));
   await page.goto(`${buildServer.url}echo-heist/#/play/${item.id}`,{waitUntil:'load'});await readyForGame(page,item.title);
   if(item.persist){let dock=await prepareDock(page);await dock.getByRole('button',{name:'Train Echo',exact:true}).click();await page.waitForFunction(()=>{const run=document.querySelector('button[data-action="deploy"]'),train=document.querySelector('button[data-action="practice"]');return !!run&&!run.disabled&&!!train&&!/^Stop /.test(train.textContent??'');},null,{timeout:30000});const savedBefore=await page.evaluate(id=>JSON.parse(localStorage.getItem('echo-heist-c01-v1')??'{}').cartridges?.[id],item.id);await page.reload({waitUntil:'load'});patchJourneys.delete(page);await readyForGame(page,item.title);const savedAfterStart=await page.evaluate(id=>JSON.parse(localStorage.getItem('echo-heist-c01-v1')??'{}').cartridges?.[id],item.id);dock=await prepareDock(page);const reloadState=await page.evaluate(id=>({saved:JSON.parse(localStorage.getItem('echo-heist-c01-v1')??'{}').cartridges?.[id],meter:document.querySelector('#dock-meter')?.textContent,status:document.querySelector('#mission-state')?.textContent}),item.id);assert.equal(await dock.getByRole('button',{name:/Run Echo/}).isEnabled(),true,`${item.id} lost its compatible frozen snapshot after reload: ${JSON.stringify({before:{preparedStage:savedBefore?.preparedStage,stats:savedBefore?.stats,snapshot:!!savedBefore?.snapshot},afterStart:{preparedStage:savedAfterStart?.preparedStage,stats:savedAfterStart?.stats,snapshot:!!savedAfterStart?.snapshot},reload:{preparedStage:reloadState.saved?.preparedStage,stats:reloadState.saved?.stats,snapshot:!!reloadState.saved?.snapshot,meter:reloadState.meter,status:reloadState.status}})}`);}
   await runLaterMission(page,{skipInitialPractice:item.persist});
   assert.ok(resources.filter(url=>url.startsWith(buildServer.url)).every(url=>new URL(url).pathname.startsWith('/echo-heist/')));assert.deepEqual(problems,[]);await context.close();
  }
 });

 await scenario('lean production build: player demonstration cloning persists below /echo-heist/',async()=>{
  const seed={schemaVersion:1,completed:Array.from({length:50},(_,i)=>`L${String(i+1).padStart(2,'0')}`),currentLevel:'L51',cartridges:{},settings:{music:.2,effects:.3,muted:true,reducedMotion:true},updatedAt:null};
  const context=await browser.newContext({viewport:{width:1280,height:720}});await context.addInitScript(value=>{if(!localStorage.getItem('echo-heist-c01-v1'))localStorage.setItem('echo-heist-c01-v1',JSON.stringify(value));},seed);const page=await context.newPage(),problems=watch(page),resources=[];page.on('response',response=>resources.push(response.url()));
  await page.goto(`${buildServer.url}echo-heist/#/play/L51`,{waitUntil:'load'});await readyForGame(page,'Follow My Lead');let dock=await prepareDock(page);await dock.getByRole('button',{name:'Record Echo lesson'}).click();await recordEchoLesson(page);await page.getByRole('dialog').getByRole('button',{name:'Train Echo'}).click();await page.waitForFunction(()=>{const run=document.querySelector('button[data-action="deploy"]'),train=document.querySelector('button[data-action="practice"]');return !!run&&!run.disabled&&!!train&&!/^Stop /.test(train.textContent??'');},null,{timeout:30000});await page.reload({waitUntil:'load'});patchJourneys.delete(page);await readyForGame(page,'Follow My Lead');dock=await prepareDock(page);assert.equal(await dock.getByRole('button',{name:/Run Echo/}).isEnabled(),true);assert.ok(resources.filter(url=>url.startsWith(buildServer.url)).every(url=>new URL(url).pathname.startsWith('/echo-heist/')));assert.deepEqual(problems,[]);await context.close();
 });
});

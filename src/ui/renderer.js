/** Replaceable native Canvas2D presentation adapter. Simulation never imports it. */
import {findEntity,patchInteractionHint} from '../sim/core.js?v=1.6.0';
const ROOT=new URL('../../public/assets/',import.meta.url);
const FACINGS=['','north','east','south','west'];
export class Renderer {
 constructor(patchCanvas,echoCanvas){this.canvases={patch:patchCanvas,echo:echoCanvas};this.canvas=patchCanvas;this.ctx=patchCanvas.getContext('2d');this.images={};this.atlases={};this.previous={};this.positions={};this.lastTick=-1;this.tickTime=0;this.levelId=null;this.ready=false;this.reducedMotion=false;this.clipState={};this.activeRoom=null;this.roomChangedAt=0;}
 async init(){
  const manifest=await (await fetch(new URL('asset-manifest.json',ROOT))).json();
  const paths=[...manifest.objects.map(a=>a.image),...manifest.tiles.map(n=>`tiles/${n}.png`),'characters/patch-atlas.png','characters/echo-atlas.png','characters/generated/sentry-strip.png','characters/generated/warden-strip.png','characters/generated/portal-strip.png','characters/generated/cartridge-strip.png'];
  await Promise.all(paths.map(async path=>{const image=new Image();image.src=new URL(path,ROOT).href;await image.decode();this.images[path]=image;}));
  for(const who of ['patch','echo'])this.atlases[who]=await (await fetch(new URL(`characters/${who}-atlas.json`,ROOT))).json();
  this.ready=true;
 }
 image(name,x,y,w,h=w,alpha=1){const img=this.images[name];if(!img)return;const c=this.ctx;c.save();c.globalAlpha=alpha;c.drawImage(img,x,y,w,h);c.restore();}
 text(s,x,y,size=16,color='#b8c7c8',align='left'){const c=this.ctx;c.font=`${size>=20?'600':'400'} ${size}px "Trebuchet MS", sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y);}
 round(x,y,w,h,r,fill,stroke=null){const c=this.ctx;c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 draw(s,time,{scanner=false,trace=[],training=false}={}){
  if(!this.ready||!s)return;this.prepareMotion(s,time);this.drawPanel(s,time,'patch',{scanner,trace,training});this.drawPanel(s,time,'echo',{scanner,trace,training});
 }
 prepareMotion(s,time){
  if(this.levelId!==s.level.id||s.tick<this.lastTick){this.previous={patch:{...s.patch},echo:{...s.echo}};this.positions={patch:{...s.patch},echo:{...s.echo}};this.lastTick=-1;this.levelId=s.level.id;this.activeRoom=null;}
  if(s.tick!==this.lastTick){this.previous={patch:this.positions.patch?.room===s.patch.room?this.positions.patch:{...s.patch},echo:this.positions.echo?.room===s.echo.room?this.positions.echo:{...s.echo}};this.tickTime=time;this.lastTick=s.tick;}
  const progress=this.reducedMotion?1:Math.min(1,(time-this.tickTime)/135),ease=1-(1-progress)**3;
  for(const who of ['patch','echo']){const p=this.previous[who]??s[who];this.positions[who]={x:p.x+(s[who].x-p.x)*ease,y:p.y+(s[who].y-p.y)*ease,room:s[who].room??0};}
 }
 camera(s,who){
  if(s.level.playfields)return {minX:0,minY:0,maxX:19,maxY:19,width:20,height:20,roomIndex:s[who].room??0};
  const W=s.level.geometry.width,H=s.level.geometry.height;
  if(who==='echo'){
   const cells=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(s.level.geometry.tiles[y][x]==='e')cells.push({x,y});
   if(cells.length){return this.expandCamera({minX:Math.min(...cells.map(cell=>cell.x))-1,maxX:Math.max(...cells.map(cell=>cell.x))+1,minY:Math.min(...cells.map(cell=>cell.y))-1,maxY:Math.max(...cells.map(cell=>cell.y))+1},W,H,9,7,s.echo);}
  }
  const roomIndex=(s.level.scene.patchRooms??[]).findIndex(room=>s.patch.x>=room.x&&s.patch.x<room.x+room.width&&s.patch.y>=room.y&&s.patch.y<room.y+room.height),room=s.level.scene.patchRooms?.[roomIndex];
  if(room)return {...this.expandCamera({minX:room.x-1,maxX:room.x+room.width,minY:room.y-1,maxY:room.y+room.height},W,H,8,8,s.patch),roomIndex};
  const cells=[],queue=[{x:s.patch.x,y:s.patch.y}],seen=new Set(),gateCells=new Set(s.entities.filter(entity=>entity.kind==='gate').map(entity=>`${entity.x},${entity.y}`));
  while(queue.length){const cell=queue.shift(),key=`${cell.x},${cell.y}`;if(seen.has(key)||gateCells.has(key)||s.level.geometry.tiles[cell.y]?.[cell.x]!=='p')continue;seen.add(key);cells.push(cell);for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]])queue.push({x:cell.x+dx,y:cell.y+dy});}
  if(cells.length)return {...this.expandCamera({minX:Math.min(...cells.map(cell=>cell.x))-1,maxX:Math.max(...cells.map(cell=>cell.x))+1,minY:Math.min(...cells.map(cell=>cell.y))-1,maxY:Math.max(...cells.map(cell=>cell.y))+1},W,H,6,5,s.patch),roomIndex};
  return {...this.expandCamera({minX:s.patch.x-3,maxX:s.patch.x+3,minY:s.patch.y-3,maxY:s.patch.y+3},W,H,7,7,s.patch),roomIndex};
 }
 expandCamera(camera,W,H,minWidth,minHeight,center){
  let {minX,maxX,minY,maxY}=camera;minX=Math.max(0,minX);minY=Math.max(0,minY);maxX=Math.min(W-1,maxX);maxY=Math.min(H-1,maxY);
  while(maxX-minX+1<Math.min(minWidth,W)){if(minX>0&&center.x-minX<=maxX-center.x)minX--;else if(maxX<W-1)maxX++;else if(minX>0)minX--;else break;}
  while(maxY-minY+1<Math.min(minHeight,H)){if(minY>0&&center.y-minY<=maxY-center.y)minY--;else if(maxY<H-1)maxY++;else if(minY>0)minY--;else break;}
  return {minX,maxX,minY,maxY,width:maxX-minX+1,height:maxY-minY+1};
 }
 entityBelongsTo(s,e,who){if(e.field)return e.field===who&&(e.room??0)===(s[who].room??0);const tile=s.level.geometry.tiles[e.y]?.[e.x];if(who==='patch')return e.patchOnly||tile==='p'||e.kind==='exit-patch'||e.kind==='core'&&!e.echoCarry;return !e.patchOnly&&(tile==='e'||e.kind==='boss'||e.kind==='exit-echo'||e.kind==='laser'||e.echoCarry);}
 drawPanel(s,time,who,{scanner,trace,training}){
  this.canvas=this.canvases[who];this.ctx=this.canvas.getContext('2d');const c=this.ctx,W=this.canvas.width,H=this.canvas.height;c.clearRect(0,0,W,H);
  const themes={scrapyard:{panel:'#16272f',line:'#776344',accent:'#ddbb87'},'transit-depot':{panel:'#152738',line:'#527a86',accent:'#8fd8df'},switchworks:{panel:'#2b2438',line:'#a77ac2',accent:'#e5bb72'},'courier-quarter':{panel:'#24373c',line:'#71a99c',accent:'#f0c689'},'neon-market':{panel:'#251d35',line:'#d461b4',accent:'#ff91d6'},'modular-foundry':{panel:'#32261f',line:'#ba824e',accent:'#ffc271'},'clockwork-docks':{panel:'#173039',line:'#5e9e9d',accent:'#91e4d4'},skybridge:{panel:'#1a2943',line:'#728ed1',accent:'#b8cbff'},'neural-arcade':{panel:'#21183f',line:'#6ef2dd',accent:'#f9e56c'},'storm-grid':{panel:'#102c42',line:'#5ed0ff',accent:'#d7f6ff'},'central-tower':{panel:'#30263d',line:'#e8c779',accent:'#fff0b1'},'eclipse-citadel':{panel:'#21102b',line:'#e3468d',accent:'#ffb65c'}},theme=themes[s.level.scene.theme]??themes.scrapyard,camera=this.camera(s,who),stageCount=s.level.task.echoStages?.length??1;
  if(who==='patch'&&camera.roomIndex!==this.activeRoom){if(this.activeRoom!==null)this.roomChangedAt=time;this.activeRoom=camera.roomIndex;}
  const map={x:5,y:5,w:W-10,h:H-10},t=Math.min(map.w/camera.width,map.h/camera.height),ox=map.x+(map.w-camera.width*t)/2-camera.minX*t,oy=map.y+(map.h-camera.height*t)/2-camera.minY*t,grid=s.level.playfields?.[who]?.[s[who].room??0]?.tiles??s.level.geometry.tiles;
  c.save();c.beginPath();c.rect(map.x,map.y,map.w,map.h);c.clip();
  for(let y=camera.minY;y<=camera.maxY;y++)for(let x=camera.minX;x<=camera.maxX;x++){
   const type=grid[y]?.[x]??'#',px=ox+x*t,py=oy+y*t,tile=type==='#'?'wall':who==='echo'?'echo-floor':['floor-a','floor-a','floor-b','floor-b','floor-c'][(x*13+y*7+(s[who].room??0)*3)%5];this.image(`tiles/${tile}.png`,px,py,t+.3);
   if(type!=='#'){c.fillStyle=who==='echo'?`${theme.accent}29`:'#ed9e4927';c.fillRect(px,py,t+.3,t+.3);c.strokeStyle=who==='echo'?'#72dce73b':'#eaa15835';c.strokeRect(px+.5,py+.5,t-1,t-1);if(who==='echo'&&(x+y)%3===0){c.fillStyle=`${theme.accent}55`;c.fillRect(px+t*.12,py+t*.47,t*.76,2);}}
   else if((x+y*2)%7===0){this.round(px+t*.25,py+t*.25,t*.5,t*.26,3,'#283a43');c.fillStyle='#738084';c.fillRect(px+t*.31,py+t*.33,t*.29,2);}
  }
  const visible=e=>e.x>=camera.minX&&e.x<=camera.maxX&&e.y>=camera.minY&&e.y<=camera.maxY&&this.entityBelongsTo(s,e,who),floors=s.entities.filter(e=>visible(e)&&(e.kind.startsWith('exit')||e.kind==='laser')),objects=s.entities.filter(e=>visible(e)&&!floors.includes(e)&&!e.taken&&!e.delivered&&(!e.requiresDelivery||s.courierOutcome==='delivered'));
  for(const e of floors)this.drawObject(s,e,ox,oy,t);
  if(who==='echo'&&scanner&&trace.length){c.save();c.strokeStyle='#73dee2aa';c.lineWidth=4;c.setLineDash([6,6]);c.beginPath();trace.forEach((p,i)=>{const x=ox+(p.x+.5)*t,y=oy+(p.y+.5)*t;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();c.restore();}
  const drawables=[...objects.map(e=>({kind:'object',y:e.y,e})),{kind:'actor',y:this.positions[who].y+.1,who}].sort((a,b)=>a.y-b.y);for(const d of drawables){if(d.kind==='object')this.drawObject(s,d.e,ox,oy,t);else this.drawActor(s,d.who,time,ox,oy,t,training);}
  if(who==='patch'){
   const hint=patchInteractionHint(s);
   if(hint){const x=ox+(hint.entity.x+.5)*t,y=oy+hint.entity.y*t-4;this.round(x-13,y-18,26,24,5,hint.possible?'#eec386':'#b83944',hint.possible?'#f9d9a8':'#ff7f82');this.text('E',x,y-1,15,hint.possible?'#25343a':'#fff','center');}
  }
  c.restore();
  if(who==='echo'&&s.level.task.horizonSteps!==null&&s.missionStarted&&!s.complete){const elapsed=s.level.task.horizonBasis==='mission'?s.missionSteps:s.echoSteps,remaining=Math.max(0,s.level.task.horizonSteps-elapsed);this.text(`RUN ENERGY ${remaining}`,W-30,H-25,11,remaining<8?'#f1a097':'#9edbe0','right');}
  if(who==='patch'&&time-this.roomChangedAt<520&&!this.reducedMotion){c.save();c.globalAlpha=1-(time-this.roomChangedAt)/520;c.strokeStyle='#ffc77b';c.lineWidth=8;c.strokeRect(23,67,W-46,H-90);c.restore();}
 }
 drawObject(s,e,ox,oy,t){
  if(e.kind==='boss'){this.drawBoss(s,e,ox,oy,t);return;}
  if(e.kind==='sentry'){this.drawSentry(e,ox,oy,t);return;}
  if(e.kind==='echo-hunter'){this.drawEchoHunter(s,e,ox,oy,t);return;}
  if(e.kind==='portal'||e.kind==='gate'&&e.portal){this.drawPortal(e,ox,oy,t);return;}
  if(e.kind==='cartridge'){this.drawStrip('characters/generated/cartridge-strip.png',e,ox,oy,t,e.locked?.3:Math.floor(performance.now()/180)%4,e.locked?.45:1);return;}
  let name=e.kind;
  if(name==='socket'&&(e.powered||s.receiverReady&&s.level.id!=='L01'))name='socket-on';
  if(name==='lever'&&e.active)name='lever-on';if(name==='gate'&&e.open)name='gate-open';
  if(name==='laser')name=e.activePhases.includes(s.echoTick%e.period)?'laser':'laser-off';
  const x=ox+e.x*t,y=oy+e.y*t;
  if(e.kind==='exit-echo'&&s.entities.some(o=>o.id==='receiver'))return;
  this.image(`objects/${name}.png`,x+t*.08,y+t*.06,t*.84);
  if(['dock','console'].includes(e.kind))this.text(e.kind==='dock'?(e.relay?e.stageIndex+1===(s.level.task.echoStages?.length??1)?'RELAY READY':`RELAY ${e.stageIndex+1}`:'ECHO RELAY'):'RECEIVER',x+t/2,y+t*.93,Math.max(10,t*.13),e.relay?'#87e1e2':'#a8babd','center');
  if(e.kind==='gate'&&e.accepts)this.text('TICKET',x+t/2,y+t*.93,Math.max(9,t*.11),'#9dd9dc','center');
  else if(e.kind==='gate'&&e.id==='exitGate')this.text(e.open?'EXIT OPEN':'EXIT LOCK',x+t/2,y+t*.93,Math.max(8,t*.1),e.open?'#8fe3be':'#ff8085','center');
  else if(e.kind==='gate'&&e.patchOnly)this.text('SECURITY',x+t/2,y+t*.93,Math.max(8,t*.1),'#ef9b72','center');
  if(e.kind==='exit-patch')this.text('PATCH',x+t/2,y+t*.97,11,'#f2c48a','center');
 }
 drawStrip(name,e,ox,oy,t,frame,alpha=1,scale=1){const image=this.images[name];if(!image)return;const sw=image.width/4,sh=image.height,x=ox+(e.x+.5)*t,y=oy+(e.y+.52)*t,size=t*scale;this.ctx.save();this.ctx.globalAlpha=alpha;this.ctx.drawImage(image,sw*(frame%4),0,sw,sh,x-size/2,y-size/2,size,size);this.ctx.restore();}
 drawPortal(e,ox,oy,t){
  this.drawStrip('characters/generated/portal-strip.png',e,ox,oy,t,e.open===false?0:Math.floor(performance.now()/150)%4,e.open===false?.45:1,1.18);
 }
 drawSentry(e,ox,oy,t){
  this.drawStrip('characters/generated/sentry-strip.png',e,ox,oy,t,Math.floor((performance.now()+(e.phase??0)*90)/160)%4,1,1.08);
 }
 drawEchoHunter(s,e,ox,oy,t){
  const live=!e.activePhases||e.activePhases.includes(s.echoTick%(e.period??4)),x=ox+(e.x+.5)*t,y=oy+(e.y+.52)*t;
  this.ctx.save();this.ctx.strokeStyle=live?'#ff6f7f':'#62d8dc';this.ctx.lineWidth=Math.max(2,t*.055);this.ctx.globalAlpha=live?.88:.42;this.ctx.beginPath();this.ctx.arc(x,y,t*.4,0,Math.PI*2);this.ctx.stroke();this.ctx.restore();
  this.drawStrip('characters/generated/sentry-strip.png',e,ox,oy,t,Math.floor((performance.now()+(e.phase??0)*90)/160)%4,live?1:.48,1.08);
 }
 drawBoss(s,e,ox,oy,t){
  const delivered=s.entities.filter(item=>item.required&&item.delivered&&(item.kind!=='core'||item.echoCarry)).length,remaining=Math.max(0,(e.stages??1)-delivered);this.drawStrip('characters/generated/warden-strip.png',e,ox,oy,t,remaining?Math.floor(performance.now()/220)%4:0,remaining?1:.55,1.75);
 }
 drawActor(s,who,time,ox,oy,t,training){
  const a=s[who],p=this.positions[who],moving=Math.abs(p.x-a.x)+Math.abs(p.y-a.y)>.015;
  let anim=moving?'walk':'idle';if(a.cargo)anim='carry';if(s.failed)anim='caught';if(s.complete)anim='celebrate';
  if(who==='echo'&&(!s.awake||training))anim='charge';
  if(s.events.some(e=>e.actor===who&&['pickup','delivery'].includes(e.type))&&time-this.tickTime<400)anim='interact';
  const name=`${anim}_${FACINGS[a.facing]}`,def=this.atlases[who].animations[name];
  if(this.clipState[who]?.name!==name)this.clipState[who]={name,start:time};
  const raw=Math.floor((def.loop?time:time-this.clipState[who].start)/1000*def.fps);
  const f=this.reducedMotion?0:def.loop?raw%def.frames.length:Math.min(raw,def.frames.length-1),frame=this.atlases[who].frames[def.frames[f]].frame;
  const scale=t/80,cx=ox+(p.x+.5)*t,cy=oy+(p.y+.64)*t;
  this.ctx.drawImage(this.images[`characters/${who}-atlas.png`],frame.x,frame.y,128,128,cx-64*scale,cy-106*scale,128*scale,128*scale);
  if(a.cargo){const cargo=findEntity(s,a.cargo);this.image(`objects/${cargo.kind}.png`,cx-t*.21,cy-t*.43,t*.42);}
  if(who==='echo'&&training){const mode=s.level.learning.mode,label=['policy-evaluation','policy-improvement','policy-iteration','value-iteration'].includes(mode)?'COMPUTING':mode==='prediction'?'RECORDING':'PRACTICING';this.text(label,cx,cy-t*1.15,12,'#91dadd','center');}
  else if(who==='echo'&&!s.awake)this.text('z z',cx,cy-t*1.05,17,'#92b8c4','center');
 }
}
